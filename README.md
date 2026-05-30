# Momentum

Momentum is a personal tracking application built around three kinds of resource. It emphasizes neutrality and factual logging over judgment.

## Resources

- **Goals**: Things you gradually work towards over a recurring period — e.g. "Exercise 3 times a week" or "Play piano for 4 hours a month". Supports daily, weekly, monthly, and yearly periods, with count- or duration-based targets. Logging progress accumulates towards the target.
- **Tasks**: One-off checklist items you mark off when done. Carry a priority and can optionally have dates.
- **Streaks**: Things you want to _avoid_ doing — e.g. "Don't drink". You log a slip when you break the streak; Momentum just records what happened rather than guilt-tripping.

## Features

- **Progress Monitoring**: Visual progress bars and completion stats.
- **Neutral Design**: Focus on "what happened" rather than guilt.

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
