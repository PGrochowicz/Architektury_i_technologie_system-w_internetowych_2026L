import os

import pyodbc


def get_db():
    conn = pyodbc.connect(os.environ["SQL_CONNECTION_STRING"])
    try:
        yield conn
    finally:
        conn.close()
