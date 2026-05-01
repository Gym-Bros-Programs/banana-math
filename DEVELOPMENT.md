# Banana Math Development

## Run Modes

Use these scripts instead of editing flags by hand:

| Mode           | Command                                   | Database               | Auth                   |
| -------------- | ----------------------------------------- | ---------------------- | ---------------------- |
| UI only        | `npm run dev`                             | Mock data              | Mock user              |
| Local Supabase | `npm run db:start`, then `npm run dev:db` | Local Supabase         | Local auth             |
| Cloud Supabase | `npm run dev:cloud`                       | Cloud Supabase         | Cloud auth             |
| Production     | `npm run build && npm run start`          | Configured environment | Configured environment |

`npm run dev:cloud` reads `NEXT_PUBLIC_SUPABASE_CLOUD_URL` and `NEXT_PUBLIC_SUPABASE_CLOUD_ANON_KEY`, then exposes them to the app as the standard Supabase public URL and anon key. It also enables Google auth locally so you can test the cloud Supabase OAuth flow from `http://localhost:3000`.

## Environment

Start from `.env.example`:

```bash
cp .env.example .env.local
```

Local Supabase normally uses:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key from npx supabase status>
SUPABASE_SERVICE_KEY=<local service role key from npx supabase status>
```

Cloud uploads use:

```env
SUPABASE_URL_PROD=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY_PROD=<cloud service role key>
```

## Question Generation

Questions are generated into JSON files under `scripts/question-gen/output` and uploaded with the service role key.

Each operation is capped at 20,000 questions. If a generated pool is larger, the generator samples 20,000 rows.

| Difficulty | Add / Sub operands | Mul / Div operand pairs                     |
| ---------- | ------------------ | ------------------------------------------- |
| Easy       | 0-9                | 1d x 1d                                     |
| Medium     | 10-99              | 1d x 2d, 2d x 1d, 2d x 2d                   |
| Hard       | 100-999            | 1d x 3d, 3d x 1d, 2d x 3d, 3d x 2d, 3d x 3d |

Commands:

```bash
npm run db:generate:easy
npm run db:generate:medium
npm run db:generate:hard

npm run db:seed
npm run db:seed:medium
npm run db:seed:hard
```

Cloud commands:

```bash
npm run db:seed:prod
npm run db:seed:medium:prod
npm run db:seed:hard:prod
npm run db:seed:all
```

## Database Reset

Local schema comes from `supabase/migrations`.

```bash
npm run db:reset
npm run db:schema
```

To remove cloud questions while preserving completed session rows, run this in the Supabase SQL editor:

```sql
DELETE FROM questions;
```

The `session_answers.question_id` foreign key uses `ON DELETE SET NULL`.

## Fallbacks

If Supabase is unavailable or credentials are missing, the app falls back to `lib/questions/arithmetic-generator.ts` so practice sessions still work.

Guest sessions are stored in `localStorage`. Signed-in sessions sync to Supabase.
