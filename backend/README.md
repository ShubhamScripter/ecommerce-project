# Shoe eCommerce Backend API

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Cloudinary credentials
npm run seed
npm run dev
```

API runs at `http://localhost:5000`

## Default Credentials (after seed)

| Role     | Email                    | Password       |
|----------|--------------------------|----------------|
| Admin    | admin@shoestore.com      | Admin@123456   |
| Customer | customer@shoestore.com   | Customer@123   |

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET  /api/auth/me`
- `POST /api/auth/forgot-password`
- `PUT  /api/auth/reset-password/:token`

### Customer
- `GET  /api/home`
- `GET  /api/products`
- `GET  /api/products/:slug`
- `GET  /api/cart` (auth)
- `POST /api/orders` (auth)
- ...and more

### Admin
- `GET  /api/admin/dashboard`
- `CRUD /api/admin/products`
- `CRUD /api/admin/categories`
- `CRUD /api/admin/brands`
- `CRUD /api/admin/orders`
- `CRUD /api/admin/users`
- `CRUD /api/admin/coupons`
- `CRUD /api/admin/banners`
- `CRUD /api/admin/reviews`
- `GET/PUT /api/admin/settings`
