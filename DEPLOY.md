# Deploy Body Compass (Vercel + MongoDB Atlas)

Run all git commands INSIDE the `port-able-track` folder (the one that has `client/`, `server/`, `.gitignore`).

## 0. Replace files
Copy the files from this patch over your project (same paths):
- server/api/index.js (new)
- server/vercel.json (new)
- server/src/config/db.js (replaced)
- server/src/server.js (replaced)

Check locally: `cd server`, `npm test` (11 tests pass), `npm run dev`.

## 1. MongoDB Atlas
1. mongodb.com/atlas -> create a free M0 cluster.
2. Database Access -> Add user (letters/numbers only in the password).
3. Network Access -> Add IP -> Allow access from anywhere (0.0.0.0/0).
4. Connect -> Drivers -> copy the string and put the DB name before the `?`:
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/BMi_records?retryWrites=true&w=majority

## 2. GitHub
```
cd port-able-track
git init
git add .
git status        # make sure NO .env file is listed
git commit -m "Body Compass ready to deploy"
git branch -M main
git remote add origin https://github.com/YOURNAME/YOURREPO.git
git push -u origin main
```

## 3. Vercel: server project
- Add New -> Project -> pick the repo -> Root Directory: `server`
- Environment Variables:
  - MONGO_URI = your Atlas string
  - (optional) ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD are only needed by the local admin script
- Deploy, then open https://YOUR-SERVER.vercel.app/api/health  -> {"status":"ok"}
  (this works even without a DB. Test https://YOUR-SERVER.vercel.app/api/bmi-records to confirm the DB works.)

## 4. Vercel: client project
- Add New -> Project -> same repo -> Root Directory: `client` (Framework: Vite)
- Environment Variable:
  - VITE_API_URL = https://YOUR-SERVER.vercel.app/api      (must END with /api)
- Deploy. After changing any env var you must Redeploy.

## 5. Test on the live link
Register -> login -> calculate BMI -> history -> delete -> log an activity -> refresh -> check data in Atlas.

## Troubleshooting
- 500 "Database connection failed": wrong MONGO_URI, or Atlas Network Access not 0.0.0.0/0. See Vercel -> Deployments -> Logs.
- Page still calls localhost: VITE_API_URL missing or client not redeployed.
- 404 on /api/...: server Root Directory is not `server`.
