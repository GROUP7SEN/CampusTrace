# PRD — CampusTrace: Campus Lost and Found System

**Course:** SEN106/216 — Introduction to Web Technologies
**Group:** 7 (Part 2)
**Lead:** Samkiel (@samkiell) | **Co-lead:** Abba (@abbasthelittlemonstee)
**Internal deadline:** 10th | **Official defence:** 11th

## 1. Overview

CampusTrace is a web platform that lets students report lost items, post found items, search existing listings with filters, and connect with the relevant person to recover or return an item.

## 2. Problem Statement

Students currently have no centralized way to report or search for lost/found items on campus, relying on scattered word-of-mouth, group chats, or physical notice boards. This leads to items going unclaimed and slow, unreliable recovery.

## 3. Objectives

- Let students report a lost item with details and a photo.
- Let students post a found item with details and a photo.
- Allow browsing/searching listings with filters (category, date, location).
- Allow a user to contact the poster of a matching item.
- Provide basic authentication so listings are tied to real accounts.

## 4. Target Users

Students and staff on campus who have lost an item, found an item, or want to search for a lost/found item.

## 5. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | MongoDB |
| Image handling | Cloudinary (hosted image URLs, no local file storage) |
| Auth | JWT |
| Hosting | TBD (e.g. Render/Railway for backend, Vercel/Netlify for frontend if split, or both together on Render) |
| Contact method | Contact info shown directly on item detail page (no in-app messaging) |

## 6. Page Map & User Flow

```
Landing Page
   │
   ├──> Register
   │        │
   │        └──> Login
   │
   └──> Login
            │
            v
       Dashboard
       (choose an action)
            │
   ┌────────┴────────┐
   v                  v
Report Lost Item   Find / Search Page
   │                  │
   v                  v
Submit form        Search + filters
(details+photo)     │
   │                 v
   v            Item Detail / Contact Page
Saved to MongoDB
```

### 6.1 Landing Page
- Intro to CampusTrace, what it does, CTA to Register/Login.

### 6.2 Register Page
- Fields: name, email/matric no, password (confirm password).
- Client-side validation before submit.

### 6.3 Login Page
- Fields: email, password.
- On success → redirect to Dashboard.

### 6.4 Dashboard
- Two primary actions: **Report Lost Item** or **Find/Search Item**.
- Optionally shows the user's own recent posts.

### 6.5 Report Lost Item Page
- Form fields: item name, category, description, date lost, location lost, photo upload, contact info.
- Submits to backend → saved in MongoDB as a "lost" listing.

### 6.6 Found Item Page
*(same shape as Report Lost — reuse the form component with a "found" type flag)*
- Form fields: item name, category, description, date found, location found, photo upload, contact info.

### 6.7 Find / Search Page
- Search bar + filters: category, date range, location, status (lost/found).
- Displays a grid/list of matching listings (photo, name, short description, date).

### 6.8 Item Detail / Contact Page
- Full listing detail + photo.
- Contact button/info to reach the poster (email/phone or in-app message, TBD based on time left).

## 7. Frontend Page Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing Page | Public |
| `/register` | Register | Public |
| `/login` | Login | Public |
| `/dashboard` | Dashboard (choose Report or Find) | Auth required |
| `/report/lost` | Report Lost Item form | Auth required |
| `/report/found` | Report Found Item form | Auth required |
| `/find` | Search/Find page with filters | Auth required (or public, TBD) |
| `/items/:id` | Item Detail / Contact page | Auth required (or public, TBD) |
| `/my-posts` | User's own listings (optional, if time allows) | Auth required |

## 8. Data Model (MongoDB)

**User**
```
{
  _id, name, email, matricNo, passwordHash, createdAt
}
```

**Item**
```
{
  _id,
  userId,          // ref to User who posted
  type,            // "lost" | "found"
  itemName,
  category,
  description,
  location,
  date,
  photoUrl,
  status,          // "open" | "resolved"
  createdAt
}
```

## 9. Backend API Routes

### Auth

| Method | Route | Purpose | Auth? |
|---|---|---|---|
| POST | `/api/auth/register` | Create account (name, email, matricNo, password) | No |
| POST | `/api/auth/login` | Log in, returns JWT | No |
| GET | `/api/auth/me` | Get current logged-in user's profile | Yes |

### Items (Lost/Found listings)

| Method | Route | Purpose | Auth? |
|---|---|---|---|
| POST | `/api/items` | Create a lost or found listing (with Cloudinary photo URL) | Yes |
| GET | `/api/items` | List/search items — query params: `type` (lost/found), `category`, `location`, `dateFrom`, `dateTo`, `q` (keyword) | No |
| GET | `/api/items/:id` | Get single item detail | No |
| PATCH | `/api/items/:id` | Update item (e.g. edit details) | Yes (owner only) |
| PATCH | `/api/items/:id/status` | Mark item as resolved/open | Yes (owner only) |
| DELETE | `/api/items/:id` | Delete a listing | Yes (owner only) |

### Uploads

| Method | Route | Purpose | Auth? |
|---|---|---|---|
| POST | `/api/upload` | Upload image, returns Cloudinary URL (called before/with item creation) | Yes |

### Users (optional, if time allows)

| Method | Route | Purpose | Auth? |
|---|---|---|---|
| GET | `/api/users/:id/items` | Get all listings posted by a specific user | Yes |

## 10. Non-Functional Requirements

- Responsive on mobile and desktop.
- Basic security: hash passwords (bcrypt), JWT auth on protected routes, validate/sanitize input server-side, don't trust client-side validation alone.
- Usable navigation — clear path from any page back to Dashboard.
- Environment variables (Mongo URI, JWT secret, Cloudinary keys) kept out of the repo via `.env` + `.gitignore`.

## 11. Out of Scope (for now, unless time allows)

- Real-time chat/messaging (contact info shown instead).
- Push notifications.
- Admin moderation panel.
- "My Posts" page (nice-to-have if time permits).

## 12. Remaining Open Decisions

- [ ] Hosting platform for backend + frontend (e.g. Render/Railway + Vercel/Netlify)
- [ ] Whether `/find` and `/items/:id` require login or are public
