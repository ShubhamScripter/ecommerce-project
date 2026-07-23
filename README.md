# Stride — Premium Shoe eCommerce

Production-ready shoe eCommerce platform with customer storefront, admin dashboard, and REST API.

## Project Structure

```
ecommerce-project/
├── backend/     # Node.js + Express + MongoDB API
├── frontend/    # Customer storefront (React + Vite + Tailwind)
└── admin/       # Admin dashboard (React + Vite + Tailwind)
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and Cloudinary credentials
npm run seed
npm run dev
```

API: `http://localhost:5000`

### 2. Customer Storefront

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

### 3. Admin Panel

```bash
cd admin
npm install
npm run dev
```

Admin: `http://localhost:5174`

## Default Credentials (after seed)

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | admin@shoestore.com    | Admin@123456   |
| Customer | customer@shoestore.com | Customer@123   |

## Features

### Customer Website
- Home (hero, featured, new arrivals, best sellers, brands, reviews, newsletter)
- Shop with filters, sorting, instant search
- Product details with image zoom, sizes, colors
- Cart, coupons, checkout
- Profile, orders, wishlist, addresses
- Auth: register, login, forgot/reset password
- Dark mode, responsive design

### Admin Panel
- Dashboard analytics
- Product CRUD with multi-image upload, drag-drop, reorder
- Category & brand management
- Order status updates + invoice download
- User block/unblock
- Coupons, banners, reviews, settings

### Security
- JWT + bcrypt
- Helmet, CORS, rate limiting
- Mongo sanitization, input validation
- Secure HTTP-only cookies

## Environment Variables

See `backend/.env.example` for all required variables.

## Deployment

### Backend
- Deploy to Render / Railway / AWS
- Set `NODE_ENV=production`
- Use MongoDB Atlas
- Configure Cloudinary production keys
- Set strong `JWT_SECRET`

### Frontend & Admin
```bash
cd frontend && npm run build
cd admin && npm run build
```
Serve `dist/` via Vercel, Netlify, or Nginx. Set `VITE_API_URL` to your API URL.

## Tech Stack

React · Vite · Tailwind · Axios · React Router · Node · Express · MongoDB · Mongoose · JWT · Cloudinary
