# Momentum

Momentum is a personal tracking application designed to help you build habits (Goals) and manage responsibilities (Tasks). It emphasizes neutrality and factual logging over judgment.

## Features

- **Goal Tracking**: Track recurring practices like "Practice piano" or "Read a book". Supports daily, weekly, monthly, and yearly periods.
- **Task Management**: Manage one-off responsibilities with priority levels.
- **Progress Monitoring**: Visual progress bars and completion stats.
- **Neutral Design**: Focus on "what happened" rather than streaks or guilt.

## Getting Started

### Prerequisites

- Node.js (v18+)
- A PostgreSQL database

### Environment Variables

Create a `.env.local` file in the root directory and add the following:

```bash
DATABASE_URL="postgres://user:password@host:port/database"
```

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up the database:

   ```bash
   pnpm run drizzle:migrate
   ```

3. Run the development server:
   ```bash
   pnpm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm run dev`: Starts the development server.
- `pnpm run build`: Builds the application for production.
- `pnpm run start`: Starts the production server.
- `pnpm run lint`: Runs ESLint.
- `pnpm run format`: Formats code using Prettier.
- `pnpm run better-auth:generate-schema`: Generates the Better Auth schema file.
- `pnpm run drizzle:generate`: Generates database migrations.
- `pnpm run drizzle:migrate`: Runs database migrations.
