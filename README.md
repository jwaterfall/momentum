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
   npm install
   ```

2. Set up the database schema:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint.
- `npm run format`: Formats code using Prettier.
