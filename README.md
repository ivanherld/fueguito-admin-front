# Fueguito Admin - Panel de Gestión de Escenas

Frontend React para gestionar clips de escenas cinematográficas. Interfaz limpia y funcional para administrar escenas, uploads de videos y storyboards.

## Características

- ✅ Autenticación JWT
- ✅ Gestión completa de escenas (CRUD)
- ✅ Upload de videos, thumbnails y storyboards
- ✅ Filtros y búsqueda avanzada
- ✅ Interfaz responsive y moderna
- ✅ Validación de formularios
- ✅ Manejo de errores y mensajes de confirmación
- ✅ Loading spinners durante operaciones

## Requisitos Previos

- Node.js 16+ 
- npm o yarn

## Instalación

1. **Clonar o descargar el proyecto**

```bash
cd fueguito-admin-front
```

2. **Instalar dependencias**

```bash
npm install
```

o con yarn:

```bash
yarn install
```

## Configuración

### Cambiar URL del Backend

Si tu backend está en una URL diferente (no es https://api-node-ivanh.onrender.com), edita [src/services/api.js](src/services/api.js):

```javascript
const BASE_URL = 'https://tu-url-aqui.com'
```

## Ejecutar en Desarrollo

```bash
npm run dev
```

El navegador debería abrirse automáticamente en `http://localhost:5173`

### Credenciales de Demo

- Usuario: `admin26`
- Contraseña: `LuFa_2026`

## Build para Producción

```bash
npm run build
```

Esto genera una carpeta `dist/` lista para deployar.

## Estructura del Proyecto

```
src/
├── components/
│   ├── Login.jsx              # Pantalla de login
│   ├── Dashboard.jsx          # Listado principal y gestión
│   ├── SceneForm.jsx          # Formulario de creación/edición
│   ├── SceneList.jsx          # Tabla de escenas
│   └── ProtectedRoute.jsx     # Rutas protegidas
├── context/
│   └── AuthContext.jsx        # Contexto y hook de autenticación
├── services/
│   └── api.js                 # Servicio Axios con interceptores
├── App.jsx                    # Configuración de rutas
├── main.jsx                   # Punto de entrada
├── index.css                  # Estilos globales
```

## Funcionalidades Principales

### 1. Login
- Ingresa credenciales
- El JWT se guarda en localStorage
- Redirección automática al dashboard

### 2. Dashboard
- Tabla con todas las escenas
- Buscador por escena/título
- Filtros: filmado, color, decorado
- Botones: Crear, Editar, Eliminar

### 3. Formulario de Escena
- Campo Escena (requerido)
- Campo Título (autollenado)
- Toggles: Filmado, Decorado
- Campos de texto: Descripción, Color, Fecha, Comentarios
- Upload condicional:
  - **Si Filmado=true**: Clip requerido, Storyboard opcional
  - **Si Filmado=false**: Storyboard requerido, Clip no disponible
- Upload opcional: Thumbnail, Storyboard2

### 4. Validaciones
- Campo Escena es obligatorio
- Clip requerido si Filmado=true
- Storyboard requerido si Filmado=false
- Límite de archivo: 50MB

## Stack Tecnológico

- **React 18** - UI Library
- **React Router v6** - Navegación
- **Axios** - HTTP Client
- **Context API** - Manejo de estado
- **Vite** - Build tool
- **CSS Modules** - Estilos

## Deploy

### Opción 1: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Opción 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Opción 3: GitHub Pages

1. Agrega a `vite.config.js`:
```javascript
base: '/fueguito-admin-front/'
```

2. Deploy:
```bash
npm run build
git add .
git commit -m "Deploy"
git push
```

## Troubleshooting

### Error 401 - No autorizado
- Verifica que el token esté guardado en localStorage
- Intenta hacer logout y login nuevamente

### Error al subir archivos
- Verifica el tamaño del archivo (máx 50MB)
- Comprueba que el servidor backend esté disponible

### CORS bloqueado
- Asegúrate que el backend permite peticiones desde tu dominio
- Verifica la URL del backend en `src/services/api.js`

## Variables de Entorno (Opcional)

Crea un archivo `.env.local` en la raíz:

```
VITE_API_URL=https://tu-url-backend.com
```

Luego actualiza `src/services/api.js`:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-node-ivanh.onrender.com'
```

## Mejoras Futuras

- [ ] Previsualización de videos/imágenes
- [ ] Exportar listado a CSV
- [ ] Drag-and-drop para archivos
- [ ] Sincronización en tiempo real
- [ ] Historial de cambios
- [ ] Edición en lote
- [ ] Temas oscuro/claro

## Licencia

Proyecto privado - Todos los derechos reservados

## Soporte

Para reportar issues o sugerencias, contacta al administrador del proyecto.
