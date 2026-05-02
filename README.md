# Banana Math

**v1.0.0** | [numerify.me](https://numerify.me)

Mental math practice app

## Features

- Timed and fixed-length arithmetic sessions
- Addition, subtraction, multiplication, and division practice
- Easy, Medium, and Hard question pools
- Guest play with local session history
- Supabase auth, profiles, attempts, and leaderboard data
- Mock mode for frontend work without a running database

## Requirements

- Node.js 20+
- npm
- Docker, for local Supabase
- Supabase CLI, run with `npx supabase`

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` for whichever mode you use. The default `npm run dev` path does not need Supabase credentials.

## Development

```bash
npm run dev        # UI-only mock mode
npm run db:start   # start local Supabase
npm run dev:db     # app + local Supabase
npm run dev:cloud  # app + cloud Supabase
```

More details live in [DEVELOPMENT.md](./DEVELOPMENT.md).

## Database

```bash
npm run db:reset           # reset local Supabase from migrations
npm run db:schema          # reset local schema without seed.sql
npm run db:generate:easy   # write Easy questions to scripts/question-gen/output
npm run db:seed            # upload Easy questions to local Supabase
npm run db:seed:all        # generate and upload Easy, Medium, Hard to cloud
```

Production uploads use `SUPABASE_URL_PROD` and `SUPABASE_SERVICE_KEY_PROD`.

## Quality Checks

```bash
npm run lint
npm run format:check
npm run typecheck
npm test -- --run
npm run build
```

`npm run ci` runs the full check set.

## Docker

```bash
docker build . -t banana-math
docker run -p 3000:3000 banana-math
```
