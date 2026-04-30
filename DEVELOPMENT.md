# Banana Math Development

## Operational Modes

The application supports four operational modes to facilitate development without constant database reliance. These are controlled via `.env.local`.

1. **UI Only** (`npm run dev`): Set `NEXT_PUBLIC_MOCK_DB=true` and `NEXT_PUBLIC_MOCK_AUTH=true`. No Supabase calls; everything runs locally.
2. **Fake Auth** (default `.env.local`): Set `NEXT_PUBLIC_MOCK_AUTH=true`. Real local DB, dummy user bypasses login.
3. **Full Local** (`npm run dev:db`): No mock flags. Connects to local Supabase (Docker). Requires `npx supabase start`.
4. **Cloud** (`npm run dev:cloud`): No mock flags. Connects to cloud Supabase using `NEXT_PUBLIC_SUPABASE_CLOUD_URL` and `NEXT_PUBLIC_SUPABASE_CLOUD_ANON_KEY` from `.env.local`. Real auth enabled.
5. **Production**: Standard deployment configuration.

## Question Generation

Questions are pre-generated and seeded into the database per difficulty tier. Each operation is capped at **20,000 questions** — if the full combination space exceeds that, a random sample is taken.

### Operand ranges by difficulty

| Difficulty | Add / Sub operands | Mul / Div operand pairs           |
| ---------- | ------------------ | --------------------------------- |
| Easy       | 0–9                | 1d×1d (0–9 × 0–9)                 |
| Medium     | 10–99              | 1d×2d, 2d×1d, 2d×2d               |
| Hard       | 100–999            | 1d×3d, 3d×1d, 2d×3d, 3d×2d, 3d×3d |

**Both directions** are always generated for multiplication and division — `5 × 123` and `123 × 5` are separate questions. For division, each mul pair `(a, b)` produces two questions: `(a×b) ÷ b = a` and `(a×b) ÷ a = b`.

Subtraction excludes negative results (only `a ≥ b` pairs kept). Division excludes zero operands.

### Seed commands

```bash
npm run db:generate:easy    # generate Easy questions locally
npm run db:seed:prod        # upload Easy to cloud
npm run db:generate:medium
npm run db:seed:medium:prod
npm run db:generate:hard
npm run db:seed:hard:prod
```

To wipe all questions from cloud DB: `DELETE FROM questions;` in Supabase SQL editor. This sets `question_id` to NULL on existing session_answers (preserving session scores) rather than deleting them.

## Database Resilience

Database interactions use an automatic fallback system. If the Supabase project is unreachable or credentials are missing, the system defaults to the local arithmetic generator (`lib/questions/arithmetic-generator.ts`) to ensure the game remains playable.

## Session Management

- **Guests**: Progress is stored in `localStorage` (up to 3 sessions).
- **Authenticated Users**: Progress is synced to the Supabase `sessions` table.
- **Migration**: Guest data is intended to be merged upon first login (Stage 4).
