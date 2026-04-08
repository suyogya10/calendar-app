# Calendar App

This is a modern mobile-first progressive web application.

## Architecture

- **Frontend**: Next.js (located in the `/frontend` directory)
- **Backend**: Laravel API (located in the `/backend` directory)
- **Database**: MySQL (configured in the backend)

## Branching Strategy

The repository contains two main working branches to allow independent development:
- `frontend`: Use this branch for all frontend Next.js work.
- `backend`: Use this branch for all backend Laravel API work.

## Getting Started

### Frontend
1. \`cd frontend\`
2. \`npm install\`
3. \`npm run dev\`

### Backend
1. \`cd backend\`
2. \`composer install\`
3. Setup your \`.env\` file (copied from \`.env.example\`) with MySQL connection details.
4. \`php artisan serve\`

Enjoy building!
