# Banana-Math Question System

A modular system for generating and uploading math questions to Supabase (Local or Production).

## Structure

- `index.js`: Main entry point and dispatcher.
- `generators/`: Specific question generation logic.
  - `arithmetic.js`: Handles +, -, *, /.
- `db/`: Database operations.
  - `uploader.js`: Handles bulk upserts to Supabase.
- `output/`: Generated JSON files.

## Usage

### 1. Generate Questions

Generate questions for different difficulty levels:

```bash
npm run db:generate:easy   # 1-digit +/-
npm run db:generate:medium # 2-digit +/-/*//
npm run db:generate:hard   # 3-digit +/-/*//
```

You can also run manually for more control:
```bash
node scripts/question-gen/index.js generate --difficulty=Easy --ops=addition --allow-negatives=true
```

### 2. Upload to Database

The system targets your local Supabase by default (using `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`).

```bash
npm run db:seed        # Upload Easy questions to local
npm run db:seed:medium # Upload Medium questions to local
```

#### Targeting Production
To target production, ensure you have `SUPABASE_URL_PROD` and `SUPABASE_SERVICE_KEY_PROD` in your `.env.local`, then run:

```bash
npm run db:seed:prod -- scripts/question-gen/output/questions_easy.json
```

## Rules & Difficulty

- **Easy**: Operands 0-9.
- **Medium**: Operands 0-99.
- **Hard**: Operands 0-999.
- **No Negatives**: By default, subtraction ensures `a >= b`.
- **Integers Only**: Decimal support coming soon.
