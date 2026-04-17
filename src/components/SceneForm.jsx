import React, { useState, useEffect } from 'react'
import { scenesService } from '../services/api'

const uploadWithProgress = async (file, url, onProgress) => {
  console.log('[upload] método: PUT')
  console.log('[upload] url:', url)
  console.log('[upload] content-type:', file.type)
  onProgress(0)
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  console.log('[upload] status:', response.status)
  if (!response.ok) throw new Error(`Error al subir: ${response.status}`)
  onProgress(100)
}

export default function SceneForm({
  scene = null,
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    escena: '',
    titulo: '',
    filmado: false,
    descripcion: '',
    color: '',
    fecha_aprox: '',
    comentarios_filmacion: '',
    decorado: ''
  })

  const [files, setFiles] = useState({
    clip: null,
    thumbnail: null,
    storyboard: null,
    storyboard2: null
  })

  const [existingFiles, setExistingFiles] = useState({
    clip: null,
    thumbnail: null,
    storyboard: null,
    storyboard2: null
  })

  const [filesToDelete, setFilesToDelete] = useState({
    clip: false,
    thumbnail: false,
    storyboard: false,
    storyboard2: false
  })

  const [errors, setErrors] = useState({})
  const [fileErrors, setFileErrors] = useState({})
  const [uploadProgress, setUploadProgress] = useState(null)

  useEffect(() => {
    if (scene) {
      setFormData({
        escena: scene.escena || '',
        titulo: scene.titulo || '',
        filmado: scene.filmado || false,
        descripcion: scene.descripcion || '',
        color: scene.color || '',
        fecha_aprox: scene.fecha_aprox || '',
        comentarios_filmacion: scene.comentarios_filmacion || '',
        decorado: scene.decorado || ''
      })
      setExistingFiles({
        clip: scene.url || null,
        thumbnail: scene.thumbnail || null,
        storyboard: scene.storyboard || null,
        storyboard2: scene.storyboard2 || null
      })
      setFilesToDelete({ clip: false, thumbnail: false, storyboard: false, storyboard2: false })
      setFiles({ clip: null, thumbnail: null, storyboard: null, storyboard2: null })
    }
  }, [scene])

  const getFilename = (url) => url ? decodeURIComponent(url.split('/').pop().split('?')[0]) : ''

  const handleRemoveFile = (name) => {
    setFilesToDelete(prev => ({ ...prev, [name]: true }))
    setFiles(prev => ({ ...prev, [name]: null }))
  }

  const handleCancelRemove = (name) => {
    setFilesToDelete(prev => ({ ...prev, [name]: false }))
    setFiles(prev => ({ ...prev, [name]: null }))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target
    if (fileList && fileList[0]) {
      const file = fileList[0]
      // Para imágenes: límite 200MB. Para video: sin límite (se sube directo a R2)
      const isVideo = name === 'clip'
      if (!isVideo && file.size > 200 * 1024 * 1024) {
        setFileErrors(prev => ({ ...prev, [name]: 'El archivo es demasiado grande (máx 200MB)' }))
        return
      }
      setFiles(prev => ({ ...prev, [name]: file }))
      setFileErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const isEditing = scene !== null

    // En creación: escena requerida para identificar la fila en Supabase
    if (!isEditing && !formData.escena.trim()) {
      newErrors.escena = 'La escena es requerida'
    }

    // En creación: archivos requeridos según estado de filmación
    // En edición: ya pueden existir archivos en la DB, no se requiere nuevo archivo
    if (!isEditing) {
      if (formData.filmado && !files.clip) {
        newErrors.clip = 'El clip es requerido cuando filmado = true'
      }
      if (!formData.filmado && !files.storyboard) {
        newErrors.storyboard = 'El storyboard es requerido cuando filmado = false'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // En modo edición con video: subir clip directo a R2 vía URL prefirmada
    let clipPublicUrl = null
    if (scene && files.clip) {
      try {
        setUploadProgress(0)
        const titulo = formData.titulo || scene.titulo
        const { uploadUrl, publicUrl } = await scenesService.getUploadUrl({
          titulo,
          filename: files.clip.name,
          contentType: files.clip.type,
          fileType: 'clip',
        })
        await uploadWithProgress(files.clip, uploadUrl, setUploadProgress)
        clipPublicUrl = publicUrl
        setUploadProgress(null)
      } catch (err) {
        setUploadProgress(null)
        setErrors(prev => ({ ...prev, clip: err.error || err.message || 'Error al subir el video' }))
        return
      }
    }

    // Crear FormData con campos de texto e imágenes
    const submitData = new FormData()

    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key])
      }
    })

    // Video: URL de texto (presigned flow en edición) o archivo (create/multipart)
    if (clipPublicUrl) {
      submitData.append('url', clipPublicUrl)
    } else if (files.clip) {
      submitData.append('clip', files.clip)
    } else if (filesToDelete.clip) {
      submitData.append('url', '')
    }

    if (files.thumbnail) {
      submitData.append('thumbnail', files.thumbnail)
    } else if (filesToDelete.thumbnail) {
      submitData.append('thumbnail', '')
    }

    if (files.storyboard) {
      submitData.append('storyboard', files.storyboard)
    } else if (filesToDelete.storyboard) {
      submitData.append('storyboard', '')
    }

    if (files.storyboard2) {
      submitData.append('storyboard2', files.storyboard2)
    } else if (filesToDelete.storyboard2) {
      submitData.append('storyboard2', '')
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>

      {/* Fila 1: Escena + Título */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="escena">Escena *</label>
          <input
            type="text"
            id="escena"
            name="escena"
            value={formData.escena}
            onChange={handleInputChange}
            placeholder="Ej: 26A"
            disabled={loading}
          />
          {errors.escena && <span style={styles.error}>{errors.escena}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            placeholder="Ej: Escena 26A"
            disabled={loading}
          />
        </div>
      </div>

      {/* Fila 2: Color + Fecha + Filmado */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <select
            id="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Selecciona un color</option>
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

        <div className="form-group">
          <label htmlFor="fecha_aprox">Fecha Aproximada</label>
          <input
            type="date"
            id="fecha_aprox"
            name="fecha_aprox"
            value={formData.fecha_aprox}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group" style={styles.checkboxGroup}>
          <label className="toggle">
            <input
              type="checkbox"
              name="filmado"
              checked={formData.filmado}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span>Filmado</span>
          </label>
        </div>
      </div>

      {/* Textareas apiladas */}
      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Descripción de la escena"
          disabled={loading}
          style={styles.textarea}
        />
      </div>

      <div className="form-group">
        <label htmlFor="comentarios_filmacion">Comentarios de Filmación</label>
        <textarea
          id="comentarios_filmacion"
          name="comentarios_filmacion"
          value={formData.comentarios_filmacion}
          onChange={handleInputChange}
          placeholder="Notas sobre la filmación"
          disabled={loading}
          style={styles.textarea}
        />
      </div>

      <div className="form-group">
        <label htmlFor="decorado">Decorado</label>
        <textarea
          id="decorado"
          name="decorado"
          value={formData.decorado}
          onChange={handleInputChange}
          placeholder="Descripción del decorado"
          disabled={loading}
          style={styles.textarea}
        />
      </div>

      {/* Archivos */}
      <div style={styles.filesSection}>
        <h3>Archivos</h3>

        {/* Clip de Video */}
        {formData.filmado && (
          <div className="form-group">
            <label>
              Clip de Video {!scene && '*'}
              {scene && <span style={styles.hint}> — se sube directo a R2</span>}
            </label>
            {existingFiles.clip && !filesToDelete.clip ? (
              <div style={styles.existingFile}>
                <span style={styles.existingFileName} title={existingFiles.clip}>
                  ✓ {getFilename(existingFiles.clip)}
                </span>
                <button type="button" style={styles.removeBtn} onClick={() => handleRemoveFile('clip')} disabled={loading}>
                  Quitar
                </button>
              </div>
            ) : filesToDelete.clip ? (
              <div>
                <div style={styles.deleteWarning}>
                  Se eliminará al guardar
                  <button type="button" style={styles.cancelRemoveBtn} onClick={() => handleCancelRemove('clip')} disabled={loading}>
                    Cancelar
                  </button>
                </div>
                <input type="file" name="clip" onChange={handleFileChange} accept="video/*"
                  disabled={loading || uploadProgress !== null} style={styles.fileInput} />
                {files.clip && <span style={styles.fileName}>✓ {files.clip.name} ({(files.clip.size / 1024 / 1024).toFixed(1)} MB)</span>}
              </div>
            ) : (
              <div>
                <input type="file" name="clip" onChange={handleFileChange} accept="video/*"
                  disabled={loading || uploadProgress !== null} style={styles.fileInput} />
                {files.clip && <span style={styles.fileName}>✓ {files.clip.name} ({(files.clip.size / 1024 / 1024).toFixed(1)} MB)</span>}
              </div>
            )}
            {uploadProgress !== null && (
              <div style={styles.progressWrapper}>
                <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
                <span style={styles.progressText}>Subiendo... {uploadProgress}%</span>
              </div>
            )}
            {errors.clip && <span style={styles.error}>{errors.clip}</span>}
            {fileErrors.clip && <span style={styles.error}>{fileErrors.clip}</span>}
          </div>
        )}

        {/* Thumbnail */}
        <div className="form-group">
          <label>Thumbnail (Imagen de Portada)</label>
          {existingFiles.thumbnail && !filesToDelete.thumbnail ? (
            <div style={styles.existingFile}>
              <span style={styles.existingFileName} title={existingFiles.thumbnail}>
                ✓ {getFilename(existingFiles.thumbnail)}
              </span>
              <button type="button" style={styles.removeBtn} onClick={() => handleRemoveFile('thumbnail')} disabled={loading}>
                Quitar
              </button>
            </div>
          ) : filesToDelete.thumbnail ? (
            <div>
              <div style={styles.deleteWarning}>
                Se eliminará al guardar
                <button type="button" style={styles.cancelRemoveBtn} onClick={() => handleCancelRemove('thumbnail')} disabled={loading}>
                  Cancelar
                </button>
              </div>
              <input type="file" name="thumbnail" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.thumbnail && <span style={styles.fileName}>✓ {files.thumbnail.name}</span>}
            </div>
          ) : (
            <div>
              <input type="file" name="thumbnail" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.thumbnail && <span style={styles.fileName}>✓ {files.thumbnail.name}</span>}
            </div>
          )}
          {fileErrors.thumbnail && <span style={styles.error}>{fileErrors.thumbnail}</span>}
        </div>

        {/* Storyboard */}
        <div className="form-group">
          <label>Storyboard {!scene && !formData.filmado && '*'}</label>
          {existingFiles.storyboard && !filesToDelete.storyboard ? (
            <div style={styles.existingFile}>
              <span style={styles.existingFileName} title={existingFiles.storyboard}>
                ✓ {getFilename(existingFiles.storyboard)}
              </span>
              <button type="button" style={styles.removeBtn} onClick={() => handleRemoveFile('storyboard')} disabled={loading}>
                Quitar
              </button>
            </div>
          ) : filesToDelete.storyboard ? (
            <div>
              <div style={styles.deleteWarning}>
                Se eliminará al guardar
                <button type="button" style={styles.cancelRemoveBtn} onClick={() => handleCancelRemove('storyboard')} disabled={loading}>
                  Cancelar
                </button>
              </div>
              <input type="file" name="storyboard" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.storyboard && <span style={styles.fileName}>✓ {files.storyboard.name}</span>}
            </div>
          ) : (
            <div>
              <input type="file" name="storyboard" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.storyboard && <span style={styles.fileName}>✓ {files.storyboard.name}</span>}
            </div>
          )}
          {errors.storyboard && <span style={styles.error}>{errors.storyboard}</span>}
          {fileErrors.storyboard && <span style={styles.error}>{fileErrors.storyboard}</span>}
        </div>

        {/* Storyboard 2 */}
        <div className="form-group">
          <label>Storyboard 2 (Opcional)</label>
          {existingFiles.storyboard2 && !filesToDelete.storyboard2 ? (
            <div style={styles.existingFile}>
              <span style={styles.existingFileName} title={existingFiles.storyboard2}>
                ✓ {getFilename(existingFiles.storyboard2)}
              </span>
              <button type="button" style={styles.removeBtn} onClick={() => handleRemoveFile('storyboard2')} disabled={loading}>
                Quitar
              </button>
            </div>
          ) : filesToDelete.storyboard2 ? (
            <div>
              <div style={styles.deleteWarning}>
                Se eliminará al guardar
                <button type="button" style={styles.cancelRemoveBtn} onClick={() => handleCancelRemove('storyboard2')} disabled={loading}>
                  Cancelar
                </button>
              </div>
              <input type="file" name="storyboard2" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.storyboard2 && <span style={styles.fileName}>✓ {files.storyboard2.name}</span>}
            </div>
          ) : (
            <div>
              <input type="file" name="storyboard2" onChange={handleFileChange} accept="image/*" disabled={loading} style={styles.fileInput} />
              {files.storyboard2 && <span style={styles.fileName}>✓ {files.storyboard2.name}</span>}
            </div>
          )}
          {fileErrors.storyboard2 && <span style={styles.error}>{fileErrors.storyboard2}</span>}
        </div>
      </div>

      <div className="modal-footer" style={styles.footer}>
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={loading || uploadProgress !== null}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="primary"
          disabled={loading || uploadProgress !== null}
        >
          {uploadProgress !== null ? `Subiendo video... ${uploadProgress}%` : loading ? 'Guardando...' : 'Guardar Escena'}
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  textarea: {
    minHeight: '90px',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-end',
    paddingBottom: '6px'
  },
  filesSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #ddd'
  },
  fileInput: {
    marginBottom: '8px'
  },
  existingFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    backgroundColor: '#e8f4fd',
    border: '1px solid #bee5eb',
    borderRadius: '4px',
    marginBottom: '6px'
  },
  existingFileName: {
    flex: 1,
    fontSize: '13px',
    color: '#1a6c8a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  removeBtn: {
    padding: '3px 10px',
    fontSize: '12px',
    backgroundColor: 'white',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    cursor: 'pointer',
    flexShrink: 0
  },
  deleteWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#856404',
    marginBottom: '6px'
  },
  cancelRemoveBtn: {
    padding: '3px 10px',
    fontSize: '12px',
    backgroundColor: 'white',
    color: '#6c757d',
    border: '1px solid #6c757d',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  fileName: {
    display: 'inline-block',
    marginLeft: '10px',
    padding: '4px 8px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontSize: '12px'
  },
  error: {
    display: 'block',
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px'
  },
  footer: {
    marginTop: '20px'
  },
  hint: {
    fontWeight: 'normal',
    fontSize: '11px',
    color: '#888'
  },
  progressWrapper: {
    marginTop: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    height: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    transition: 'width 0.2s ease',
    borderRadius: '4px'
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: '600',
    color: '#333'
  }
}
