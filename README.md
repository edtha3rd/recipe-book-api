### The Backend for Let's Feast recipe book 📑 webapp

## Stack

- Express
- Prisma
- Postgresql
  - Hosted on Supabase
- MongoDB (Session Store)
- Cloudinary (Object Store)
- PassportJS (Google OAuth 2.0)

## ENV Variables

- Prisma Config

  - DATABASE_URL
  - MONGO_URI

- Database variables

  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_DB

- Google API Keys

  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET

- Others

  - PORT=8008
  - SECRET

- Cloudinary Config

  - CLOUD_NAME
  - API_KEY
  - API_SECRET

- URIs
  - CLIENT_URL=http://localhost:3000
  - API=http://localhost:8008
