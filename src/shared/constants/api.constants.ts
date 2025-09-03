export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
//export const API_BASE_URL = "https://api-particular.itcooper.mx/api/v1";

export const API_ENDPOINTS = {
  ESTUDIANTES: `${API_BASE_URL}/estudiantes`,
  USUARIOS: `${API_BASE_URL}/usuarios`,
  AUTH: `${API_BASE_URL}/auth`,
  USER: `${API_BASE_URL}/user`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  usuarios: {
    getAll: `${API_BASE_URL}/usuarios`,
    getById: (id: number) => `${API_BASE_URL}/usuarios/${id}`,
    create: `${API_BASE_URL}/usuarios`,
    update: (id: number) => `${API_BASE_URL}/usuarios/${id}`,
    search: `${API_BASE_URL}/usuarios/search`,
  },
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
    historyPayments: (id: number) =>
      `${API_BASE_URL}/adeudos/historial/pagos/${id}`,
  },
  pagos: {
    getAll: `${API_BASE_URL}/pagos`,
    search: `${API_BASE_URL}/pagos/search`,
    getById: (id: number) => `${API_BASE_URL}/pagos/${id}`,
    adeudos: {
      create: `${API_BASE_URL}/pagos/adeudos`,
      update: (id: number) => `${API_BASE_URL}/pagos/adeudos/${id}`,
    },
    requeridos: {
      create: `${API_BASE_URL}/pagos/requeridos`,
      update: (id: number) => `${API_BASE_URL}/pagos/requeridos/${id}`,
    },
  },
  estudiantes: {
    pagos: {
      getAll: `${API_BASE_URL}/pagos`,
      getByEstudiante: (id: number) =>
        `${API_BASE_URL}/estudiantes/${id}/pagos`,
    },
  },
  ciclosEscolares: {
    getAll: `${API_BASE_URL}/ciclos-escolares`,
    getById: (id: number) => `${API_BASE_URL}/ciclos-escolares/${id}`,
    create: `${API_BASE_URL}/ciclos-escolares`,
    update: (id: number) => `${API_BASE_URL}/ciclos-escolares/${id}`,
  },
} as const;
