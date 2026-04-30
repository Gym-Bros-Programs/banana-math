# Question Generator

Generates arithmetic question pools and uploads them to Supabase.

## Files

- `index.js`: command dispatcher
- `generators/arithmetic.js`: arithmetic pool generator
- `db/uploader.js`: Supabase bulk uploader
- `output/`: generated JSON files

## Generate

```bash
npm run db:generate:easy
npm run db:generate:medium
npm run db:generate:hard
```

Manual use:

```bash
node scripts/question-gen/index.js generate --difficulty=Easy --ops=addition,subtraction --dry-run
node scripts/question-gen/index.js generate --difficulty=Medium --ops=addition,subtraction,multiplication,division
```

## Upload

Local Supabase:

```bash
npm run db:seed
npm run db:seed:medium
npm run db:seed:hard
```

Cloud Supabase:

```bash
npm run db:seed:prod
npm run db:seed:medium:prod
npm run db:seed:hard:prod
```

Required `.env.local` keys:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_KEY=

SUPABASE_URL_PROD=
SUPABASE_SERVICE_KEY_PROD=
```

## Rules

- Easy: 0-9 add/sub operands, 1-digit multiply/divide pairs
- Medium: 10-99 add/sub operands, 1d/2d multiply/divide pairs
- Hard: 100-999 add/sub operands, up to 3d/3d multiply/divide pairs
- Subtraction excludes negative answers unless `--allow-negatives=true`
- Division is generated from multiplication pairs so answers are integers
- Each operation is capped at 20,000 questions
