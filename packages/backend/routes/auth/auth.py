import os
import time
from urllib.parse import urlencode

import httpx
import jwt
import pyodbc
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, ConfigDict

from routes.helpers.db import get_db

GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
BACKEND_URL = os.environ["BACKEND_URL"]
FRONTEND_URL = os.environ["FRONTEND_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7

router = APIRouter(prefix="/auth", tags=["Authentication"])

AUTH_COOKIE_NAME = "token"
COOKIE_AGE = JWT_EXPIRATION_HOURS * 3600
REDIRECT_URI = f"{BACKEND_URL.rstrip('/')}/api/auth/google/callback"
FE_CALLBACK = f"{FRONTEND_URL.rstrip('/')}/auth/callback"
USER_ROLE_ID = 2


class CurrentUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sub: str
    email: str | None = None
    name: str | None = None
    user_id: int
    roles: list[str] = []
    previousLoginAt: str | None = None


def getUserFromCookie(request: Request) -> CurrentUser | None:
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        return None
    try:
        return CurrentUser(**jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM]))
    except Exception:
        return None


def requireAdmin(cu: CurrentUser | None) -> None:
    if not cu:
        raise HTTPException(status_code=401, detail="Authentication required")
    if "Admin" not in (cu.roles or []):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/google")
def googleLogin():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="GOOGLE_CLIENT_ID missing")
    encodedUrl = urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{encodedUrl}", status_code=302)


@router.get("/google/callback")
async def googleCallback(
    code: str | None = None,
    error: str | None = None,
    db: pyodbc.Connection = Depends(get_db),
):
    if error:
        return RedirectResponse(f"{FE_CALLBACK}?error={error}", status_code=302)
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    if not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="GOOGLE_CLIENT_SECRET missing")

    async with httpx.AsyncClient() as client:
        tr = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI, "grant_type": "authorization_code",
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        if tr.status_code != 200:
            raise HTTPException(status_code=400, detail="Token exchange failed")
        at = tr.json().get("access_token")
        if not at:
            raise HTTPException(status_code=400, detail="No access token")
        ur = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {at}"})

    if ur.status_code != 200:
        raise HTTPException(status_code=400, detail="Userinfo failed")
    ud = ur.json()
    gid, email, name = str(ud.get("id") or ""), ud.get("email"), ud.get("name")

    try:
        cursor = db.cursor()
        cursor.execute("SELECT Id, IsActive, LastLoginAt FROM Users WHERE GoogleSub = ?", (gid,))
        row = cursor.fetchone()
        previous_login = None
        if row:
            uid = int(row[0])
            if row[1] is not None and not row[1]:
                return RedirectResponse(f"{FE_CALLBACK}?error=account_disabled", status_code=302)
            previous_login = row[2].isoformat() if row[2] else None
            cursor.execute(
                "UPDATE Users SET Email = ?, DisplayName = ?, LastLoginAt = SYSDATETIME() WHERE Id = ?",
                (email or "", name, uid),
            )
        else:
            cursor.execute(
                "INSERT INTO Users (GoogleSub, Email, DisplayName, IsActive) OUTPUT INSERTED.Id VALUES (?, ?, ?, 1)",
                (gid, email or "", name),
            )
            r2 = cursor.fetchone()
            if not r2:
                raise HTTPException(status_code=500, detail="Failed to create user")
            uid = int(r2[0])
            cursor.execute("INSERT INTO UserRoles (UserId, RoleId) VALUES (?, ?)", (uid, USER_ROLE_ID))

        cursor.execute(
            "SELECT r.Name FROM Roles r INNER JOIN UserRoles ur ON ur.RoleId = r.Id WHERE ur.UserId = ?",
            (uid,),
        )
        roles = [str(x[0]) for x in cursor.fetchall()]
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    token = jwt.encode({
        "sub": gid, "email": email, "name": name,
        "user_id": uid, "roles": roles,
        "previousLoginAt": previous_login,
        "exp": int(time.time()) + COOKIE_AGE,
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)
    resp = RedirectResponse(FE_CALLBACK, status_code=302)
    resp.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        secure=True,
        httponly=True,
        samesite="None",
        max_age=COOKIE_AGE,
        path="/")
    return resp


@router.post("/logout")
def logout():
    resp = JSONResponse(content="Logged out")
    resp.delete_cookie(AUTH_COOKIE_NAME, path="/")
    return resp


@router.get("/me")
def getMe(request: Request):
    u = getUserFromCookie(request)
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": u.user_id, "sub": u.sub, "email": u.email, "name": u.name, "roles": u.roles}


@router.get("/admin/users")
def getAdminUsers(
    request: Request,
    db: pyodbc.Connection = Depends(get_db),
):
    requireAdmin(getUserFromCookie(request))
    try:
        cursor = db.cursor()
        cursor.execute(
            """SELECT u.Id, u.Email, u.DisplayName, u.IsActive,
            (SELECT COUNT(*) FROM Photos p WHERE p.CreatedByUserId = u.Id) AS PhotoCount
            FROM Users u ORDER BY u.DisplayName, u.Email, u.Id"""
        )
        return [
            {"id": r[0], "email": r[1] or "", "displayName": r[2] or "",
             "isActive": bool(r[3]), "photoCount": r[4] or 0}
            for r in cursor.fetchall()
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def setUserActive(user_id: int, active: bool, request: Request, db: pyodbc.Connection):
    u = getUserFromCookie(request)
    requireAdmin(u)
    if u and not active and user_id == u.user_id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE Users SET IsActive = ? WHERE Id = ?", (1 if active else 0, user_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return "Successfully changed user status"


@router.post("/admin/users/{user_id}/ban")
def banUser(user_id: int, request: Request, db: pyodbc.Connection = Depends(get_db)):
    return setUserActive(user_id, False, request, db)


@router.post("/admin/users/{user_id}/unban")
def unbanUser(user_id: int, request: Request, db: pyodbc.Connection = Depends(get_db)):
    return setUserActive(user_id, True, request, db)
