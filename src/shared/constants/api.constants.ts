export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const API_ENDPOINTS = {
  ESTUDIANTES: `${API_BASE_URL}/estudiantes`,
  USUARIOS: `${API_BASE_URL}/usuarios`,
  PAGOS: `${API_BASE_URL}/pagos`,
  AUTH: `${API_BASE_URL}/auth`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
} as const;
