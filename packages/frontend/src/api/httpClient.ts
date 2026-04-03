import axios from 'axios'

export const API_BASE = '/api'
export const MINIO_BASE = process.env.REACT_APP_MINIO_URL

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  withCredentials: true,
  validateStatus: () => true,
})
