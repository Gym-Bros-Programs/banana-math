# Banana Math Development

## Operational Modes
The application supports four operational modes to facilitate development without constant database reliance. These are controlled via `.env.local`.

1. **UI Only**: Set `NEXT_PUBLIC_MOCK_DB=true` and `NEXT_PUBLIC_MOCK_AUTH=true`. No Supabase calls are made; everything runs locally.
2. **Fake Auth**: Set `NEXT_PUBLIC_MOCK_AUTH=true`. Uses a real database but bypasses the login flow with a dummy user.
3. **Full Local**: No mock flags. Connects to your local or cloud Supabase instance with full authentication.
4. **Production**: Standard deployment configuration.

## Database Resilience
Database interactions use an automatic fallback system. If the Supabase project is unreachable or credentials are missing, the system defaults to the local arithmetic generator (`lib/questions/arithmetic-generator.ts`) to ensure the game remains playable.

## Session Management
- **Guests**: Progress is stored in `localStorage` (up to 3 sessions).
- **Authenticated Users**: Progress is synced to the Supabase `sessions` table.
- **Migration**: Guest data is intended to be merged upon first login (Stage 4).
