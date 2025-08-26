export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const API_ENDPOINTS = {
  ESTUDIANTES: `${API_BASE_URL}/estudiantes`,
  USUARIOS: `${API_BASE_URL}/usuarios`,
  PAGOS: `${API_BASE_URL}/pagos`,
  AUTH: `${API_BASE_URL}/auth`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  conceptos: {
    getAll: `${API_BASE_URL}/conceptos`,
    getById: (id: number) => `${API_BASE_URL}/conceptos/${id}`,
    create: `${API_BASE_URL}/conceptos`,
    update: (id: number) => `${API_BASE_URL}/conceptos/${id}`,
    delete: (id: number) => `${API_BASE_URL}/conceptos/${id}`,
    search: `${API_BASE_URL}/conceptos/search`,
  },
  adeudos: {
    getAll: `${API_BASE_URL}/adeudos`,
    getById: (id: number) => `${API_BASE_URL}/adeudos/${id}`,
    create: `${API_BASE_URL}/adeudos`,
    update: (id: number) => `${API_BASE_URL}/adeudos/${id}`,
    search: `${API_BASE_URL}/adeudos/search`,
  },
  pagos: {
    getAll: `${API_BASE_URL}/pagos`,
    getById: (id: number) => `${API_BASE_URL}/pagos/${id}`,
    create: `${API_BASE_URL}/pagos`,
    update: (id: number) => `${API_BASE_URL}/pagos/${id}`,
    search: `${API_BASE_URL}/pagos/search`,
  },
} as const;
