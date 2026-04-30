# Banana Math

A high-performance mental math practice platform focused on speed and simplicity.

## Project Roadmap

- **Stage 1**: Core arithmetic engine (client-side).
- **Stage 2**: Backend API for question delivery and scoring.
- **Stage 3**: Persistent database and global leaderboards.
- **Stage 4**: User authentication and detailed statistics.
- **Stage 5**: Launch.

For detailed information on the operational modes and local setup, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Run locally

Have a look at the .env.sample file and follow the steps in the link to create a .env.local

Local compiling

```
brew install npm
npm install next
npm run dev
```

Local compiling using docker

```
docker build . -t banana-math
docker run -d -p 3000:3000 banana-math
```

## Linting

Run `npm run lint` for manually linting or to configure VS Code for Auto-Linting on save follow these steps:

A. Install VS Code Extensions

- ESLint (by Microsoft)
- Prettier - Code formatter (by Prettier)

B. Modify VS Code Settings
You need to tell VS Code to use ESLint to fix your files whenever you save them.

- In VS Code, press Ctrl + Shift + P (or Cmd + Shift + P on Mac) to open the Command Palette.
- Type Preferences: Open User Settings (JSON) and press Enter.
- Add the following configuration to your settings.json file:

```
{
  // ... your other settings
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
  // ... your other settings
}
```
