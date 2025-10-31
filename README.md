# Eitaa NoteBook MiniApp

A secure notebook experience that runs seamlessly inside the Eitaa WebApp mini program environment. The project is split into a Laravel 12 API backend (`backend/`) and a React + Vite + Tailwind SPA frontend (`frontend/`). The application supports automatic authentication through the Eitaa WebApp SDK as well as a classic email / password fallback when the SDK is not available.

## Features

- ✅ **MiniApp ready**: React SPA initialises the official [`eitaa-web-app.js`](https://developer.eitaa.com/eitaa-web-app.js) SDK, calls `ready()`/`expand()`, mirrors the active theme, listens to viewport changes, and exposes a close button.
- 🔐 **Dual authentication**: Verifies `initData` hashes through `https://eitaayar.ir/api/app/verify` (rate-limit aware) and falls back to email / password auth.
- 🗂️ **Dynamic notes**: Supports `text`, `credential`, and `todo` note types with encrypted credential passwords and future-friendly JSON schemas.
- 🏷️ **Personal tagging**: Users manage their own tags and can filter notes by type, tags, or search query.
- 🌓 **Adaptive UI**: RTL Persian layout, Tailwind dark mode classes, and automatic palette updates from `themeParams`.

## Project structure

```
backend/   # Laravel 12 API (Sanctum, Policies, Eitaa login endpoint, note/tag resources)
frontend/  # React 18 SPA (Vite, Tailwind, hooks for Eitaa SDK, note management UI)
```

## Backend setup (Laravel 12)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure database + SANCTUM + EITAA_APP_TOKEN + FRONTEND_URL inside .env
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

**Important environment keys**

- `APP_URL` and `FRONTEND_URL` must both be HTTPS in production.
- `EITAA_APP_TOKEN` is provided by the Eitaa Yar panel.
- `EITAA_VERIFY_ENDPOINT` defaults to `https://eitaayar.ir/api/app/verify`.

The API surface:

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| POST   | `/api/auth/eitaa-login`     | Verify hash + issue Sanctum token   |
| POST   | `/api/auth/login`           | Email/username + password login     |
| POST   | `/api/auth/register`        | Classic registration                |
| GET    | `/api/notes`                | List notes (supports `type`, `tags`, `search`) |
| POST   | `/api/notes`                | Create note with dynamic validation |
| GET    | `/api/notes/{id}`           | Fetch note (add `?reveal=1` to decrypt credentials) |
| PUT    | `/api/notes/{id}`           | Update note                         |
| DELETE | `/api/notes/{id}`           | Delete note                         |
| GET    | `/api/tags`                 | List user tags                      |
| POST   | `/api/tags`                 | Create a new tag                    |

## Frontend setup (React + Vite)

```bash
cd frontend
npm install
npm run dev -- --host
```

Environment variables are read with the `VITE_` prefix. By default the SPA calls `http://localhost:8000/api`. Override this by creating a `.env` file in `frontend/` and defining `VITE_API_BASE_URL`.

The SPA is a classic router-based single page app with:

- `/login`: detects the SDK and performs automatic Eitaa login when possible, otherwise shows the fallback form.
- `/notes`: authenticated area with filtering, tag management, modal-based create/update, masked credentials, and clipboard helpers.

## MiniApp debugging checklist

1. Build and deploy both backend and frontend under HTTPS domains that match the URLs registered in the Eitaa developer panel.
2. Ensure the frontend HTML keeps the `<script src="https://developer.eitaa.com/eitaa-web-app.js"></script>` tag – **do not bundle it locally**.
3. Use Android `chrome://inspect#devices` or the desktop WebView devtools to debug layout, theme events, and viewport changes.
4. Watch backend logs for `429` errors from the verify endpoint – the code retries once and surfaces user-friendly messages if the limit is hit.

## Testing outside Eitaa

- The login page logs whether the Eitaa SDK is detected. When absent, it automatically enables the classic auth path.
- Credential notes expose a “show / hide” toggle that triggers `GET /api/notes/{id}?reveal=1` to fetch decrypted data on demand. Passwords stay encrypted at rest and masked in list responses.

## License

MIT
