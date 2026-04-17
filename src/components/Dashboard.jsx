import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { scenesService } from '../services/api'
import SceneList from './SceneList'
import SceneForm from './SceneForm'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [scenes, setScenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [editingScene, setEditingScene] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    filmado: '',
    color: ''
  })

  // Cargar escenas
  useEffect(() => {
    loadScenes()
  }, [])

  // Limpiar mensajes después de 4 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const loadScenes = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await scenesService.getAll()
      setScenes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Error al cargar las escenas. Intenta de nuevo.')
      console.error('Error loading scenes:', err)
      setScenes([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingScene(null)
    setShowModal(true)
  }

  const handleEdit = (scene) => {
    setEditingScene(scene)
    setShowModal(true)
  }

  const handleDelete = async (id, titulo) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${titulo}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setError('')
      await scenesService.delete(id)
      setSuccess('Escena eliminada correctamente')
      loadScenes()
    } catch (err) {
      setError('Error al eliminar la escena. Intenta de nuevo.')
      console.error('Error deleting scene:', err)
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true)
      setError('')

      if (editingScene) {
        await scenesService.update(editingScene.id || editingScene._id, formData)
        setSuccess('Escena actualizada correctamente')
      } else {
        await scenesService.create(formData)
        setSuccess('Escena creada correctamente')
      }

      setShowModal(false)
      setEditingScene(null)
      loadScenes()
    } catch (err) {
      setError(err.message || 'Error al guardar la escena. Intenta de nuevo.')
      console.error('Error saving scene:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filtrar escenas según búsqueda y filtros
  const filteredScenes = scenes.filter(scene => {
    const searchMatch =
      scene.escena?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scene.titulo?.toLowerCase().includes(searchTerm.toLowerCase())

    const filmadoMatch =
      filters.filmado === '' || scene.filmado?.toString() === filters.filmado

    const colorMatch =
      filters.color === '' || scene.color === filters.color

    return searchMatch && filmadoMatch && colorMatch
  })

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Fueguito Admin</h1>
            <p style={styles.userInfo}>Bienvenido, {user?.username}</p>
          </div>
          <button className="secondary" onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Mensajes */}
        {error && (
          <div className="alert error">
            <span>✕</span>
            {error}
          </div>
        )}
        {success && (
          <div className="alert success">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* Título y botón */}
        <div style={styles.titleSection}>
          <h2>Gestión de Escenas</h2>
          <button className="primary" onClick={handleCreateNew}>
            + Nueva Escena
          </button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Buscar por escena o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filters.filmado}
            onChange={(e) => setFilters(prev => ({ ...prev, filmado: e.target.value }))}
          >
            <option value="">Todos los estados de filmación</option>
            <option value="true">Filmado</option>
            <option value="false">No filmado</option>
          </select>

          <select
            value={filters.color}
            onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
          >
            <option value="">Todos los colores</option>
            <option value="VERDE">VERDE</option>
            <option value="NARANJA">NARANJA</option>
            <option value="LILA">LILA</option>
            <option value="AMARILLO">AMARILLO</option>
            <option value="GRIS">GRIS</option>
            <option value="MARRON">MARRON</option>
            <option value="AZUL">AZUL</option>
            <option value="ROSA">ROSA</option>
          </select>

        </div>

        {/* Resumen */}
        {!loading && scenes.length > 0 && (
          <p style={styles.summary}>
            Mostrando {filteredScenes.length} de {scenes.length} escenas
          </p>
        )}

        {/* Lista de escenas */}
        <SceneList
          scenes={filteredScenes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </main>

      {/* Modal de formulario */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingScene ? 'Editar Escena' : 'Nueva Escena'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false)
                  setEditingScene(null)
                }}
                disabled={formLoading}
              >
                ×
              </button>
            </div>
            <SceneForm
              scene={editingScene}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false)
                setEditingScene(null)
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd',
    padding: '20px 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '24px',
    color: '#333',
    margin: '0'
  },
  userInfo: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0'
  },
  logoutBtn: {
    padding: '8px 16px'
  },
  titleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '4px'
  },
  summary: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '12px'
  }
}
