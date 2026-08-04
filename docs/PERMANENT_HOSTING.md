# Permanent hosting (no temporary tunnels)

## Android APK (done)

- View: https://drive.google.com/file/d/1IlbtyFP3f6ZL-SlvsCzySYq9kCvohBu_/view?usp=sharing
- Direct: https://drive.google.com/uc?export=download&id=1IlbtyFP3f6ZL-SlvsCzySYq9kCvohBu_

## Why API/Web need cloud accounts

Drive can host an APK file. It cannot run Node.js or SQL Server.

| App | Permanent host |
|-----|----------------|
| Web | Vercel / Netlify (free) |
| API | Azure App Service / Render / Railway + **cloud SQL Server** |
| Database | Azure SQL Database (required because the app uses MSSQL) |

## Recommended permanent stack (free/trial)

1. **Azure SQL Database** (free/trial) — migrate/copy your `SecureStorageDB`
2. **Azure App Service** or **Render** — deploy `Backend/` with env vars from `.env.example`
3. **Vercel** — deploy `web/` with:
   ```env
   VITE_API_BASE_URL=https://YOUR-API-HOST/api
   ```
4. Rebuild APK with the same API URL, re-upload to Drive

## Deploy web (Vercel)

```bash
cd web
npx vercel login
npx vercel --prod
# set VITE_API_BASE_URL in Vercel project settings, then redeploy
```

## Deploy API (Azure outline)

See `Backend/DEPLOY.md` Option B.

Required env on the host:

- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_PORT`, `DB_NAME`
- `DB_ENCRYPT=true`, `DB_TRUST_CERT=false` (typical for Azure SQL)
- `AWS_*` S3 keys
- `CORS_ORIGINS=*` (or your Vercel domain)
