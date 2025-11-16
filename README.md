# Today I Helped

Track daily good deeds and inspire others through community sharing

**Tech Stack:** Next.js 16 • TypeScript • Tailwind CSS 4 • Prisma ORM • PostgreSQL 17

## About

Today I Helped is a platform that encourages daily acts of kindness through gamification and community sharing. Users complete daily challenges across four categories, share their good deeds, and support each other through a clap system.

### Key Features

- **Daily Challenges**: Fresh prompts each day across four categories
  - 🧑 PEOPLE - Help individuals
  - 🐾 ANIMALS - Care for animals
  - 🌱 ENVIRONMENT - Protect nature
  - 🏘️ COMMUNITY - Build community
- **Clap System**: Support others' good deeds with claps
- **Streaks**: Track consecutive days of helping
- **Auto-Generated Usernames**: Frictionless onboarding with memorable names
- **Trust-First Approach**: No verification required - we believe in human goodness

## Current Status

✅ **Database**: PostgreSQL 17 in Docker
✅ **Schema**: All models created
🚧 **Server Actions**: Phase 2/4 - User Actions (in progress)
🔜 **UI Components**
🔜 **Integration**

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- Docker (for PostgreSQL)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start PostgreSQL:
```bash
docker compose up -d
```

4. Push database schema:
```bash
npx prisma db push
```

5. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

This project uses PostgreSQL with Docker for development.

### Start the database

```bash
docker compose up -d
```

### Stop the database

```bash
docker compose down
```

### Reset the database (deletes all data)

```bash
docker compose down -v
```

### View database logs

```bash
docker compose logs -f postgres
```

### Create tables

```bash
npx prisma db push
```

### Open Prisma Studio (database GUI)

```bash
npx prisma studio
```

## Project Structure

```
today-i-helped/
├── app/                    # Next.js app directory
│   ├── actions/           # Server Actions
│   └── ...                # Pages and layouts
├── prisma/                # Database schema
│   └── schema.prisma
├── components/            # React components
└── lib/                   # Utilities and Prisma client
```

## Development Workflow

For detailed development guidelines, see [DEVELOPMENT.md](./DEVELOPMENT.md)
