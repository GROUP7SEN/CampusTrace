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
| Backend (BaaS) | Firebase (Firestore Database, Firebase Storage, Firebase Auth) |
| Database | Cloud Firestore (NoSQL Document Store) |
| Image handling | Firebase Storage (Direct client upload to Firebase bucket) |
| Auth | Firebase Auth / Local Storage Auth |
| Hosting | Firebase Hosting / Vercel / Netlify |
| Contact method | Contact email button shown directly on post cards (mailto link) |

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
       Dashboard / Feed
       (view/search items)
            │
   ┌────────┴────────┐
   v                  v
Report Lost Item   Report Found Item
   │                  │
   v                  v
Submit form        Submit form
(details)          (details + photo)
   │                  │
   v                  v
Saved to Firestore  Image to Firebase Storage -> Saved to Firestore
```

### 6.1 Landing Page
- Intro to CampusTrace, what it does, CTA to Register/Login.

### 6.2 Register Page / Login Page
- Fields: name, email, matric no.
- Tied to Firebase Auth / Local session details.
- On success → redirect to main portal dashboard.

### 6.3 Dashboard / Feed Page
- Displays active lost & found cards with real-time updates (`onSnapshot`).
- Search bar & category filter.
- Direct email contact button on each card.
- User management actions: Mark Resolved, Delete (for post owner).

### 6.4 Report Lost Item Form
- Form fields: title, description.
- Submits directly to Firestore `portal_items` collection (`type: 'missing'`).

### 6.5 Report Found Item Form
- Form fields: title, description, photo file upload.
- Uploads photo directly to Firebase Storage (`found_items/` folder), gets URL, and saves document in Firestore `portal_items` collection (`type: 'found'`).

## 7. Data Model (Cloud Firestore)

### Collection: `portal_items`
```json
{
  "id": "auto_generated_doc_id",
  "type": "missing | found",
  "title": "Black Backpack",
  "desc": "Contains notebook and ID card",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "userName": "Samkiel",
  "email": "samkiel@oau.edu.ng",
  "initials": "SA",
  "resolved": false,
  "statusText": "Missing Item | Found Item",
  "createdAt": "Firebase Timestamp"
}
```

## 8. Firebase Services & Architecture

- **Firebase Config**: Embedded in `script.js` client SDK.
- **Firestore DB**: Uses `db.collection('portal_items')` for real-time CRUD.
- **Firebase Storage**: Uses `storage.ref('found_items/')` for image handling.
- **Security Rules**: Configured in Firebase Console for `portal_items` collection and `found_items` bucket.

## 9. Non-Functional Requirements

- Responsive on mobile and desktop.
- Fast real-time feed updates via Firestore listeners (`onSnapshot`).
- Secure environment configuration and storage bucket access rules.

## 10. Out of Scope

- Real-time chat/messaging (email contact provided via `mailto:` links).
- Push notifications.
- Admin moderation panel.

