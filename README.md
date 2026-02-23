## Telegram Mini App – Digital Tools Shop

Production-ready Telegram Mini App (WebApp) for selling digital tools with KHQR (Bakong) payments and Supabase backend.

### Tech Stack

- **Frontend**: HTML5, CSS3 (modern dark theme), Vanilla JS, Telegram WebApp SDK
- **Backend**: Node.js, Express, Supabase (PostgreSQL), JWT, Axios
- **Payments**: KHQR (Bakong)
- **Hosting**: Render

### Local Setup

1. Clone this project into `c:\test` (or your preferred directory).
2. Create `backend/.env` based on `backend/.env.example`:
   - Set `TELEGRAM_BOT_TOKEN` to your bot token.
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project.
   - Set `KHQR_MERCHANT_ID`, `KHQR_WALLET_ID`, `KHQR_SECRET_KEY`, `KHQR_ENDPOINT`.
   - Set `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
3. In Supabase SQL editor, run `supabase-schema.sql` from the project root.
4. Install dependencies and start server:

   ```bash
   npm install
   npm start
   ```

5. The app will run on `http://localhost:3000`.

### Telegram WebApp Setup

1. In BotFather, configure your bot’s WebApp URL to your deployed Render URL (for example `https://your-render-app.onrender.com`).
2. In your bot code, send a button using `web_app` keyboard type with the same WebApp URL to open this mini app inside Telegram.

### Render Deployment

1. Create a new Web Service on Render and connect this repo.
2. Build command:

   ```bash
   npm install
   ```

3. Start command:

   ```bash
   npm start
   ```

4. Set environment variables in Render:
   - `PORT` (Render will also provide this)
   - `NODE_ENV=production`
   - `TELEGRAM_BOT_TOKEN=...`
   - `JWT_SECRET=...`
   - `ADMIN_USERNAME=...`
   - `ADMIN_PASSWORD=...`
   - `SUPABASE_URL=https://hybsbsjpeoxxjilizoiy.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=...` (service-role key from Supabase)
   - `KHQR_MERCHANT_ID=Ebr8qXA9YknjHaNQNzZzQNwcBsia1FMn`
   - `KHQR_WALLET_ID=chheak_narat@bkrt`
   - `KHQR_SECRET_KEY=...`
   - `KHQR_ENDPOINT=https://khqr.cc/api/payment/request/Ebr8qXA9YknjHaNQNzZzQNwcBsia1FMn`

5. Deploy; use the Render URL as your Telegram WebApp URL in BotFather.

### Security Notes

- All secrets live only in environment variables (`.env` locally and Render env vars).
- Admin routes are JWT protected with `role=admin`.
- Telegram WebApp users are authenticated via `initData` HMAC verification using `TELEGRAM_BOT_TOKEN`.
- Payment confirmation endpoint is admin-protected; you can extend it to use KHQR webhooks.

