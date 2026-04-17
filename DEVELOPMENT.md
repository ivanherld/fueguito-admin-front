# Guía de Desarrollo - Fueguito Admin

## Setup Inicial (Primera Vez)

```bash
# 1. Navega a la carpeta del proyecto
cd fueguito-admin-front

# 2. Instala dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

El proyecto se abrirá automáticamente en `http://localhost:5173`

## Credenciales de Prueba

```
Usuario: admin26
Contraseña: LuFa_2026
```

## Flujo de Desarrollo

### 1. Crear una Escena Nueva

1. Haz login con las credenciales de prueba
2. Haz click en "+ Nueva Escena"
3. Completa el formulario:
   - **Escena**: Ej: "26A" (requerido)
   - **Título**: Ej: "Escena 26A"
   - **Filmado**: Toggle para indicar si fue filmado
   - **Descripción**: Texto descriptivo
   - **Color**: Selecciona rojo, monocromo u otro
   - **Fecha Aproximada**: Selecciona una fecha (opcional)
   - **Comentarios de Filmación**: Notas adicionales (opcional)
   - **Decorado**: Toggle para indicar si tiene decorado

### 2. Cargar Archivos

**Si Filmado = true (Escena Filmada):**
- Clip de Video: **REQUERIDO** (archivo de video)
- Thumbnail: Opcional (imagen de portada)
- Storyboard: Opcional (imagen del storyboard)
- Storyboard 2: Opcional (segundo storyboard)

**Si Filmado = false (Escena No Filmada):**
- Clip de Video: NO disponible
- Thumbnail: Opcional (imagen de portada)
- Storyboard: **REQUERIDO** (imagen del storyboard)
- Storyboard 2: Opcional (segundo storyboard)

**Límites:**
- Tamaño máximo por archivo: 50MB
- Formatos de video: mp4, webm, avi, mov, etc.
- Formatos de imagen: jpg, png, gif, webp, etc.

### 3. Editar una Escena

1. En el dashboard, haz click en "Editar" en la fila de la escena
2. El formulario se precargará con los datos actuales
3. Modifica lo que necesites
4. Haz click en "Guardar Escena"

### 4. Eliminar una Escena

1. En el dashboard, haz click en "Eliminar" en la fila de la escena
2. Confirma la eliminación en el diálogo
3. La escena se eliminará permanentemente

### 5. Filtrar y Buscar

**Búsqueda General:**
- Escribe en el buscador para filtrar por escena o título
- La búsqueda es en tiempo real

**Filtros Específicos:**
- **Filmado**: Muestra solo escenas filmadas o no filmadas
- **Color**: Filtra por color (rojo, monocromo, otro)
- **Decorado**: Muestra solo escenas con o sin decorado

## Estructura de Componentes

### `<Login />`
Pantalla de autenticación. Valida credenciales contra el backend.

### `<Dashboard />`
Página principal. Gestiona:
- Listado de escenas
- Modal de formulario
- Búsqueda y filtros
- Mensajes de éxito/error

### `<SceneList />`
Tabla con las escenas. Props:
- `scenes`: Array de escenas
- `loading`: Boolean de carga
- `onEdit`: Callback al editar
- `onDelete`: Callback al eliminar
- `onCreateNew`: Callback para nueva escena

### `<SceneForm />`
Formulario de creación/edición. Props:
- `scene`: Objeto de escena (null si es nueva)
- `onSubmit`: Callback al guardar
- `onCancel`: Callback al cancelar
- `loading`: Boolean de envío

### `<ProtectedRoute />`
Wrapper para rutas protegidas. Solo permite acceso si hay token.

## Servicio API (`src/services/api.js`)

El servicio de API maneja:

### Autenticación
```javascript
authService.login(username, password)
// Retorna: { token: "jwt_token" }
```

### Escenas
```javascript
scenesService.getAll(filters) // GET /api/clips
scenesService.getById(id)      // GET /api/clips/:id
scenesService.create(formData) // POST /api/clips
scenesService.update(id, formData) // PUT /api/clips/:id
scenesService.delete(id)       // DELETE /api/clips/:id
```

**Nota:** El token se agrega automáticamente a todos los headers.

## Context de Autenticación

Hook personalizado `useAuth()`:

```javascript
import { useAuth } from '../context/AuthContext'

function MiComponente() {
  const { user, token, loading, login, logout } = useAuth()
  
  // user: { username: "admin26" }
  // token: "jwt_token..."
  // loading: boolean
  // login: (username, token) => void
  // logout: () => void
}
```

## Debugging

### En el Navegador

1. Abre las DevTools (F12)
2. Sección "Application" → "Local Storage"
3. Verifica que `authToken` esté presente después de login
4. En "Network", verifica las peticiones HTTP
5. En "Console", revisa los logs

### localStorage

El token se guarda así:
```
authToken: "eyJhbGc..."
username: "admin26"
```

### Test Manual con cURL

```bash
# Login
curl -X POST https://api-node-ivanh.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin26","password":"LuFa_2026"}'

# Obtener escenas
curl -X GET https://api-node-ivanh.onrender.com/api/clips \
  -H "Authorization: Bearer <token>"

# Crear escena
curl -X POST https://api-node-ivanh.onrender.com/api/clips \
  -H "Authorization: Bearer <token>" \
  -F "escena=26A" \
  -F "filmado=true" \
  -F "clip=@video.mp4"
```

## Errores Comunes

### 401 Unauthorized
- El token expiró o es inválido
- Solución: Haz logout y login nuevamente

### 400 Bad Request
- Faltó un campo requerido
- Archivo demasiado grande
- Formato inválido
- Revisa la consola para detalles

### 500 Internal Server Error
- Error en el servidor backend
- Verifica que el backend está corriendo
- Comprueba la URL en `src/services/api.js`

### CORS Error
- El backend no permite peticiones desde tu origen
- Verifica que el backend tiene CORS habilitado
- Intenta desde una URL diferente

## Performance

- Los datos se cachean en React state
- Las operaciones son optimistas (UI actualiza inmediatamente)
- Los spinners indican operaciones en curso
- Límites: máximo 50MB por archivo

## Seguridad

- ✅ JWT almacenado en localStorage
- ✅ Token incluido en Authorization header
- ✅ Validación frontend de campos
- ✅ Manejo de errores 401 con logout automático
- ⚠️ No guardes tokens en URL o query params
- ⚠️ Siempre usa HTTPS en producción

## Scripts de npm

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## Extensiones Recomendadas para VS Code

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Thunder Client (para testing de API)

## Próximos Pasos

1. Instala dependencias: `npm install`
2. Inicia el servidor: `npm run dev`
3. Prueba con las credenciales de demo
4. Crea/edita/elimina escenas
5. Verifica que los archivos se suben correctamente
6. Deploy a producción cuando esté listo

¡Listo para empezar! 🚀
