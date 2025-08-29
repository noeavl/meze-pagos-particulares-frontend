export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
// export const API_BASE_URL = 'https://api-particular.itcooper.mx/api/v1';

export const API_ENDPOINTS = {
  ESTUDIANTES: `${API_BASE_URL}/estudiantes`,
  USUARIOS: `${API_BASE_URL}/usuarios`,
  PAGOS: `${API_BASE_URL}/pago-adeudos`,
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
    generate: `${API_BASE_URL}/adeudos/generar`,
    update: (id: number) => `${API_BASE_URL}/adeudos/${id}`,
    search: `${API_BASE_URL}/adeudos/search`,
  },
  pagos: {
    adeudos: {
      getAll: `${API_BASE_URL}/pagos/adeudos`,
      getById: (id: number) => `${API_BASE_URL}/pago/adeudos/${id}`,
      create: `${API_BASE_URL}/pagos/adeudos`,
      update: (id: number) => `${API_BASE_URL}/pagos/adeudos/${id}`,
      search: `${API_BASE_URL}/pagos/adeudos/search`,
    },
    requeridos: {
      getAll: `${API_BASE_URL}/pagos/requeridos`,
      getById: (id: number) => `${API_BASE_URL}/pagos/requeridos/${id}`,
      create: `${API_BASE_URL}/pagos/requeridos`,
      update: (id: number) => `${API_BASE_URL}/pagos/requeridos/${id}`,
      search: `${API_BASE_URL}/pagos/requeridos/search`,
    },
  },
} as const;
