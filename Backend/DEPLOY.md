# Public backend deployment

The mobile APK must call a **public HTTPS API**. Because this project uses **Microsoft SQL Server**, pick one path below.

## Option A — Fastest for assignment (recommended if deadline is soon)

Keep Backend + SQL Server running on your PC and publish it with a tunnel:

### 1. Start backend locally
```bash
cd Backend
npm start
```

### 2. Expose port 5000 with Cloudflare Tunnel (free) or ngrok
```bash
# Cloudflare quick tunnel example:
cloudflared tunnel --url http://localhost:5000

# OR ngrok:
ngrok http 5000
```

You get a public URL like:
`https://something.trycloudflare.com`

API base for apps:
`https://something.trycloudflare.com/api`

### 3. Rebuild APK with that URL
In `mobile/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-TUNNEL-HOST/api
```

Then rebuild release APK (see mobile README).

**Note:** Free tunnel URLs change when restarted unless you reserve a domain.

---

## Option B — Real cloud deploy (longer)

1. Create **Azure SQL Database** (or host SQL Server publicly with firewall rules for the app host).
2. Deploy this Node API to **Azure App Service**, **Render**, or **Railway** using the Dockerfile.
3. Set all env vars from `.env.example` in the host dashboard (`DB_ENCRYPT=true` for Azure SQL).
4. Confirm `GET https://your-api-host/` returns `Secure Storage API Running`.
5. Rebuild mobile APK with:
   `EXPO_PUBLIC_API_BASE_URL=https://your-api-host/api`

S3 keys stay the same as local if the bucket allows your server IPs / is public-API accessible with those keys.
