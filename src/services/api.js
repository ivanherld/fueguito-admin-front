import axios from 'axios'

const BASE_URL = 'http://localhost:3000'

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Agregar interceptor para incluir token en todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Agregar interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar almacenamiento
      localStorage.removeItem('authToken')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicio de Autenticación
export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}

// Servicio de Escenas
export const scenesService = {
  // Obtener todas las escenas
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.filmado !== undefined) params.append('filmado', filters.filmado)
      if (filters.color) params.append('color', filters.color)
      if (filters.decorado !== undefined) params.append('decorado', filters.decorado)

      const response = await apiClient.get('/api/clips', { params })
      return response.data.clips || []
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Obtener una escena por ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/clips/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Crear nueva escena
  create: async (formData) => {
    try {
      const response = await apiClient.post('/api/clips', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Actualizar escena (multipart)
  update: async (id, formData) => {
    try {
      const response = await apiClient.patch(`/api/clips/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Obtener URL prefirmada para subida directa a R2
  getUploadUrl: async ({ titulo, filename, contentType, fileType = 'clip' }) => {
    try {
      const response = await apiClient.post('/api/clips/upload-url', {
        titulo,
        filename,
        contentType,
        fileType,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Eliminar escena
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/clips/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}

export default apiClient
