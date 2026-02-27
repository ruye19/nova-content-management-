## Nova CMS – MERN + MySQL assessment project

This project is a small Content Management System built with **React**, **Node/Express**, and **MySQL** to match the Elisoft Solution PLC intern assessment brief.

### Tech stack

- **Frontend**: React 18, React Router, React Quill (WYSIWYG), Tailwind CSS, Vite.
- **Backend**: Node.js, Express, MySQL (via `mysql2/promise`), JWT authentication, Multer for media uploads.
- **Database**: MySQL schema defined in `backend/database/schema.sql`.

### Core features mapped to the brief

- **Dashboard administration**
  - `Dashboard` page shows an overview of content (drafts vs published) and a table of recent entries.
  - `Media library` page manages uploaded images and videos.
  - `Admin` page (admin-only) shows system stats and user activity.
  - `Menus` page (admin-only) manages navigation menus (header/footer/etc.).
- **Pages / posts / banners / menus**
  - **Pages & posts**: handled via the `Contents` table and the `Dashboard` + `Content editor` screens.
  - **Banners**: can be modeled as content entries that embed images/videos from the media library (via the rich editor and “Insert media”).
  - **Menus**: dedicated Menus feature:
    - Backend: `Menus` table (name, location, items JSON) and `/api/menus` admin-only CRUD.
    - Frontend: `Menus` page under the dashboard (admin-only), where you can add/edit/delete menus and their items.
- **CRUD functionality**
  - Contents (`/api/content`): create, list, get, update, delete.
  - Media (`/api/media`): upload, list, delete (delete restricted to admins).
  - Menus (`/api/menus`): create, list, get, update, delete (admin-only).
- **Visual editor (WYSIWYG)**
  - `RichEditor` uses React Quill with headings, formatting, lists, alignment, links, and images.
  - The editor can embed media from the library directly into the content body.
- **Media library**
  - Upload images and videos (stored in MySQL as LONGBLOB), preview them, and (for admins) delete them.
  - Media can be inserted into content from the editor.
- **Role-based access**
  - Users table stores a `role` (`admin` or `user`).
  - Backend middlewares:
    - `verifyToken` protects authenticated routes.
    - `isAdmin` restricts admin routes (`/api/admin`, `/api/media` delete, `/api/menus`).
  - Frontend:
    - `AuthContext` stores the logged-in user and JWT.
    - `ProtectedRoute` guards authenticated routes and can require specific roles (e.g. admin).

### Running the project locally

1. **Clone & install**
   - Backend:
     - `cd backend`
     - `npm install`
   - Frontend:
     - `cd frontend`
     - `npm install`

2. **Database setup**
   - Create a MySQL database (for example `mern_cms_db`).
   - Update `backend/.env` with your MySQL credentials:
     - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`.
   - Run the schema:
     - Execute `backend/database/schema.sql` against your database (e.g. via MySQL client).

3. **Seed an admin user**
   - From `backend`:
     - `npm run seed`
   - This creates an admin account (defaults can be overridden with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME` in `.env`).

4. **Start the servers**
   - Backend:
     - `cd backend`
     - `npm run dev` (or `npm start` for production)
   - Frontend:
     - `cd frontend`
     - `npm run dev`
   - By default the API runs on `http://localhost:5000/api` and the frontend on `http://localhost:5173`.

### Authentication & roles

- **Register**: create a standard user account from the Signup screen.
- **Login**: authenticate, receive a JWT, and access the dashboard.
- **Admin**:
  - Use the seeded admin credentials to access:
    - `Admin` overview (users, stats, activity).
    - `Menus` management.
    - Media deletion actions.

### Hosting notes

- The backend can be deployed to any Node-friendly host (e.g. Render, Railway, etc.) with a managed MySQL instance.
- The frontend can be built with `npm run build` and deployed to a static host (e.g. Netlify, Vercel), pointing `VITE_API_URL` to the live backend URL.

