import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filename = path.join(
  process.env.DATA_DIR || path.join(root, ".data"),
  "sana.sqlite",
);
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 12)
  throw new Error("Set ADMIN_PASSWORD to at least 12 characters in .env.");
if (!existsSync(filename))
  throw new Error("Start the application once to create its database.");
const db = new DatabaseSync(filename);
const salt = randomBytes(16).toString("hex");
const email = process.env.ADMIN_EMAIL || "admin@centresana.ma";
db.exec("BEGIN");
try {
  const result = db
    .prepare("UPDATE admins SET salt=?,password=? WHERE email=?")
    .run(salt, scryptSync(password, salt, 64).toString("hex"), email);
  if (!result.changes)
    throw new Error("Administrator email was not found in this database.");
  db.prepare("DELETE FROM sessions").run();
  db.exec("COMMIT");
  console.log(
    "Administrator password updated; existing sessions have been signed out.",
  );
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
