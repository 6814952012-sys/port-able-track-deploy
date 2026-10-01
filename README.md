# Port-able Track

BMI tracking web application using React, Tailwind CSS, Node.js, Express, and MongoDB.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Install

From the project root:

```powershell
npm run install:all
```

Copy the environment templates before starting:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

Update `server/.env` if MongoDB is not using the default local connection.

To create or promote an administrator, set these variables in `server/.env` and run the command once:

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
```

```powershell
npm --prefix server run admin:create
```

## Run

Open two terminals in the project root:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

- Frontend: http://localhost:5175
- API health check: http://localhost:5000/api/health

## Build

```powershell
npm run build
```

## BMI API

Calculate BMI and receive exercise guidance without saving a record:

```http
POST /api/bmi-recommendations/calculate
Content-Type: application/json

{"weight":70,"height":175}
```

Or request guidance for an existing BMI:

```http
GET /api/bmi-recommendations?bmi=22.9
```

The response includes the BMI category, exercise suggestions, safety disclaimer, and links to WHO and CDC references. BMI is a screening measure and should not replace advice from a healthcare professional.

Administrators sign in normally, then receive the `admin` role and can edit user names, emails, and roles from the Admin Control panel. Admin-only API requests use the signed-in user's `x-user-id` session header and are checked again by the server.