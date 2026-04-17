# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No linting, formatting, or test commands are configured.

## Architecture

React 18 SPA admin dashboard for managing film scenes/clips. Stack: React Router v6, Axios, Context API, plain CSS, Vite.

**Three-layer structure:**
- `src/services/api.js` — Axios instance with base URL + JWT interceptors; all API calls go here
- `src/context/AuthContext.jsx` — Global auth state (user, token, login/logout); persisted to `localStorage`
- `src/components/` — Page-level components (`Dashboard`, `Login`) and shared UI (`SceneForm`, `SceneList`, `ProtectedRoute`)

**Routing** (`App.jsx`): `/` redirects to `/login` or `/dashboard` based on auth state; `ProtectedRoute` wraps authenticated pages.

## API

Base URL is hardcoded in `src/services/api.js`: `https://api-node-ivanh.onrender.com`

- Auth: `POST /auth/login` → JWT stored as `authToken` in localStorage
- Scenes CRUD: `GET|POST /api/clips`, `GET|PUT|DELETE /api/clips/:id`
- File uploads use `multipart/form-data` (FormData)
- Request interceptor adds `Authorization: Bearer {token}`; response interceptor auto-logouts on 401

## Key Domain Concepts

Each "scene" (clip) has a `filmado` boolean that controls which fields appear:
- `filmado=true` → video clip upload required
- `filmado=false` → storyboard image required

Scenes also have `color` (boolean) and `decorado` (boolean) fields used for filtering.

File upload limits: 50MB per file. Accepted types: video for clips, images for thumbnails/storyboards.
