require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/user.model");

async function createAdmin() {
  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD first");
  if (ADMIN_PASSWORD.length < 6) throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready: ${user.username}`);
  process.exit(0);
}

createAdmin().catch((error) => { console.error(error.message); process.exit(1); });