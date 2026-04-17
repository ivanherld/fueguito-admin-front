import React from 'react'

export default function SceneList({
  scenes,
  loading,
  onEdit,
  onDelete,
  onCreateNew
}) {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!scenes || scenes.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No hay escenas registradas</p>
        <button className="primary" onClick={onCreateNew}>
          Crear Primera Escena
        </button>
      </div>
    )
  }

  return (
    <div style={styles.tableWrapper}>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Filmado</th>
            <th>Color</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((scene) => (
            <tr key={scene.id || scene._id}>
              <td style={styles.cellBold}>{scene.orden ?? scene.id}</td>
              <td>{scene.titulo || '-'}</td>
              <td>
                <span className={`badge ${scene.filmado ? 'success' : 'danger'}`}>
                  {scene.filmado ? 'Sí' : 'No'}
                </span>
              </td>
              <td>{scene.color || '-'}</td>
              <td>{scene.fecha_aprox || '-'}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="secondary"
                    onClick={() => onEdit(scene)}
                    style={styles.smallBtn}
                  >
                    Editar
                  </button>
                  <button
                    className="danger"
                    onClick={() => onDelete(scene.id || scene._id, scene.titulo || scene.escena)}
                    style={styles.smallBtn}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  tableWrapper: {
    overflowX: 'auto'
  },
  cellBold: {
    fontWeight: '600'
  },
  smallBtn: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '4px',
    color: '#666'
  }
}
