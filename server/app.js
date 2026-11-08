import {
  serviceDescriptions,
  galleryTitles,
  frenchArticles,
} from "./french-content.js";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { services, gallery, articles } from "./seed.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const text = (v, max = 300) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const fail = (res, message, status = 400) =>
  res.status(status).json({ error: message });
const categories = ["therapies", "daycare", "activities"];
const galleryCategories = ["learning", "centre", "activities"];
const validDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export function createApp({
  dataDir = process.env.DATA_DIR || path.join(root, ".data"),
  adminEmail = process.env.ADMIN_EMAIL || "admin@centresana.ma",
  adminPassword = process.env.ADMIN_PASSWORD,
} = {}) {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const uploadDir = path.join(dataDir, "uploads");
  mkdirSync(uploadDir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path.join(dataDir, "sana.sqlite"));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, email TEXT UNIQUE, salt TEXT, password TEXT);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY, name TEXT NOT NULL, french TEXT, category TEXT, description TEXT, icon TEXT);
    CREATE TABLE IF NOT EXISTS gallery (id INTEGER PRIMARY KEY, title TEXT, category TEXT, url TEXT);
    CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY, title TEXT, category TEXT, excerpt TEXT, body TEXT, image TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, reference TEXT UNIQUE, parent_name TEXT, phone TEXT, child_name TEXT, birth_date TEXT, service_id INTEGER, service_name TEXT, preferred_date TEXT, message TEXT, status TEXT DEFAULT 'new', notes TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
  `);
  if (!db.prepare("SELECT id FROM admins LIMIT 1").get()) {
    if (!adminPassword || adminPassword.length < 12)
      throw new Error(
        "Set ADMIN_PASSWORD (at least 12 characters) in .env before starting.",
      );
    const salt = randomBytes(16).toString("hex");
    db.prepare("INSERT INTO admins(email,salt,password) VALUES(?,?,?)").run(
      adminEmail,
      salt,
      scryptSync(adminPassword, salt, 64).toString("hex"),
    );
  }
  if (!db.prepare("SELECT value FROM meta WHERE key='seeded'").get()) {
    db.exec("BEGIN");
    try {
      for (const row of services)
        db.prepare(
          "INSERT INTO services(name,french,category,description,icon) VALUES(?,?,?,?,?)",
        ).run(...row);
      for (const row of gallery)
        db.prepare("INSERT INTO gallery(title,category,url) VALUES(?,?,?)").run(
          row.title,
          row.category,
          row.url,
        );
      for (const row of articles)
        db.prepare(
          "INSERT INTO articles(title,category,excerpt,body,image,status) VALUES(?,?,?,?,?,?)",
        ).run(
          row.title,
          row.category,
          row.excerpt,
          row.body,
          row.image,
          row.status,
        );
      db.prepare("INSERT INTO meta VALUES('seeded','1')").run();
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  // Add bilingual content without replacing existing Arabic data.
  const bilingualColumns = {
    services: ["description_fr"],
    gallery: ["title_fr"],
    articles: ["title_fr", "category_fr", "excerpt_fr", "body_fr"],
  };
  for (const [table, columns] of Object.entries(bilingualColumns)) {
    const existing = new Set(
      db
        .prepare(`PRAGMA table_info(${table})`)
        .all()
        .map((c) => c.name),
    );
    for (const column of columns)
      if (!existing.has(column))
        db.exec(
          `ALTER TABLE ${table} ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`,
        );
  }
  if (
    !db.prepare("SELECT value FROM meta WHERE key='french-content-v1'").get()
  ) {
    db.exec("BEGIN");
    try {
      services.forEach((service, i) =>
        db
          .prepare(
            "UPDATE services SET description_fr=? WHERE name=? AND description=? AND description_fr=''",
          )
          .run(serviceDescriptions[i], service[0], service[3]),
      );
      gallery.forEach((item, i) =>
        db
          .prepare(
            "UPDATE gallery SET title_fr=? WHERE title=? AND url=? AND title_fr=''",
          )
          .run(galleryTitles[i], item.title, item.url),
      );
      articles.forEach((item, i) => {
        const fr = frenchArticles[i];
        db.prepare(
          "UPDATE articles SET title_fr=?,category_fr=?,excerpt_fr=?,body_fr=? WHERE title=? AND body=? AND body_fr=''",
        ).run(
          fr.title,
          fr.category,
          fr.excerpt,
          fr.body,
          item.title,
          item.body,
        );
      });
      db.prepare("INSERT INTO meta VALUES('french-content-v1','1')").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  const isFrench = (req) => (req.query.lang || req.query.locale) === "fr";
  const localizedService = (row, req) =>
    isFrench(req)
      ? {
          ...row,
          name: row.french || row.name,
          description: row.description_fr || row.description,
        }
      : row;
  const localizedGallery = (row, req) =>
    isFrench(req) ? { ...row, title: row.title_fr || row.title } : row;
  const localizedArticle = (row, req) =>
    isFrench(req) && row.title_fr && row.body_fr
      ? {
          ...row,
          title: row.title_fr,
          category: row.category_fr || row.category,
          excerpt: row.excerpt_fr || "",
          body: row.body_fr,
          content_language: "fr",
        }
      : { ...row, content_language: "ar" };
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "img-src": ["'self'", "data:", "blob:"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "font-src": ["'self'"],
          "script-src": ["'self'"],
          "upgrade-insecure-requests": null,
        },
      },
      strictTransportSecurity:
        process.env.NODE_ENV === "production" ? undefined : false,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      const allowed = process.env.APP_ORIGIN
        ? [process.env.APP_ORIGIN]
        : [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:4301",
            "http://localhost:4301",
          ];
      if (!allowed.includes(req.headers.origin))
        return fail(res, "مصدر الطلب غير مسموح.", 403);
    }
    next();
  });
  app.use(
    "/uploads",
    express.static(uploadDir, { dotfiles: "deny", maxAge: "1d" }),
  );
  const session = (req) => {
    const token = (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("sana_session="))
      ?.slice(13);
    return (
      token &&
      db
        .prepare("SELECT token FROM sessions WHERE token=? AND expires>?")
        .get(hash(token), Date.now())
    );
  };
  const requireAdmin = (req, res, next) =>
    session(req) ? next() : fail(res, "يرجى تسجيل الدخول.", 401);
  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api",
    maxAge: 8 * 60 * 60 * 1000,
  };
  const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: { error: "محاولات كثيرة. يرجى المحاولة لاحقاً." },
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.post("/api/auth/login", authLimit, (req, res) => {
    const admin = db
      .prepare("SELECT * FROM admins WHERE email=?")
      .get(text(req.body.email));
    const entered = scryptSync(
      text(req.body.password, 500),
      admin?.salt || "sana-dummy-salt",
      64,
    );
    if (!admin || !timingSafeEqual(entered, Buffer.from(admin.password, "hex")))
      return fail(res, "البريد الإلكتروني أو كلمة المرور غير صحيحة.", 401);
    const token = randomBytes(32).toString("hex");
    db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
    db.prepare("INSERT INTO sessions VALUES(?,?)").run(
      hash(token),
      Date.now() + cookieOptions.maxAge,
    );
    res
      .cookie("sana_session", token, cookieOptions)
      .json({ email: admin.email });
  });
  app.get("/api/auth/me", requireAdmin, (req, res) =>
    res.json({ email: adminEmail }),
  );
  app.post("/api/auth/logout", (req, res) => {
    const current = session(req);
    if (current)
      db.prepare("DELETE FROM sessions WHERE token=?").run(current.token);
    res
      .clearCookie("sana_session", { ...cookieOptions, maxAge: undefined })
      .json({ ok: true });
  });
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.get("/api/services", (req, res) =>
    res.json(
      db
        .prepare("SELECT * FROM services ORDER BY id")
        .all()
        .map((row) => localizedService(row, req)),
    ),
  );
  app.get("/api/gallery", (req, res) =>
    res.json(
      db
        .prepare("SELECT * FROM gallery ORDER BY id DESC")
        .all()
        .map((row) => localizedGallery(row, req)),
    ),
  );
  app.get("/api/articles", (req, res) =>
    res.json(
      db
        .prepare(
          "SELECT * FROM articles WHERE status='published' ORDER BY id DESC",
        )
        .all()
        .map((row) => localizedArticle(row, req)),
    ),
  );
  app.get("/api/articles/:id", (req, res) => {
    const row = db
      .prepare("SELECT * FROM articles WHERE id=? AND status='published'")
      .get(req.params.id);
    row
      ? res.json(localizedArticle(row, req))
      : fail(res, "المقال غير موجود.", 404);
  });
  app.post(
    "/api/bookings",
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 20,
      message: { error: "يرجى الانتظار قبل إرسال طلب جديد." },
    }),
    (req, res) => {
      const b = req.body,
        parent = text(b.parent_name, 150),
        phone = text(b.phone, 30).replace(/[\s()-]/g, ""),
        child = text(b.child_name, 150),
        birth = text(b.birth_date, 10),
        preferred = text(b.preferred_date, 10),
        today = new Date().toISOString().slice(0, 10);
      if (parent.length < 3 || child.length < 2)
        return fail(res, "يرجى إدخال اسم ولي الأمر واسم الطفل.");
      if (!/^(0|\+212)[5-7]\d{8}$/.test(phone))
        return fail(res, "يرجى إدخال رقم هاتف مغربي صالح.");
      if (!validDate(birth) || birth > today || birth < "1900-01-01")
        return fail(res, "يرجى إدخال تاريخ ازدياد صالح.");
      if (preferred && (!validDate(preferred) || preferred < today))
        return fail(res, "يرجى اختيار تاريخ موعد قادم.");
      if (b.consent !== true)
        return fail(res, "يرجى الموافقة على التواصل بخصوص الطلب.");
      const service = db
        .prepare("SELECT * FROM services WHERE id=?")
        .get(Number(b.service_id) || 0);
      if (!service) return fail(res, "يرجى اختيار الخدمة المطلوبة.");
      const reference = "SNA-" + randomBytes(5).toString("hex").toUpperCase();
      db.prepare(
        "INSERT INTO bookings(reference,parent_name,phone,child_name,birth_date,service_id,service_name,preferred_date,message) VALUES(?,?,?,?,?,?,?,?,?)",
      ).run(
        reference,
        parent,
        phone,
        child,
        birth,
        service.id,
        service.name,
        preferred,
        text(b.message, 2000),
      );
      res.status(201).json({ reference });
    },
  );
  app.use("/api/admin", requireAdmin);
  app.get("/api/admin/stats", (req, res) =>
    res.json({
      bookings: db.prepare("SELECT count(*) AS n FROM bookings").get().n,
      pending: db
        .prepare("SELECT count(*) AS n FROM bookings WHERE status='new'")
        .get().n,
      articles: db
        .prepare("SELECT count(*) AS n FROM articles WHERE status='published'")
        .get().n,
      gallery: db.prepare("SELECT count(*) AS n FROM gallery").get().n,
    }),
  );
  app.get("/api/admin/bookings", (req, res) =>
    res.json(db.prepare("SELECT * FROM bookings ORDER BY id DESC").all()),
  );
  app.patch("/api/admin/bookings/:id", (req, res) => {
    if (!["new", "contacted", "scheduled", "closed"].includes(req.body.status))
      return fail(res, "حالة غير صالحة.");
    const result = db
      .prepare("UPDATE bookings SET status=?,notes=? WHERE id=?")
      .run(req.body.status, text(req.body.notes, 2000), req.params.id);
    result.changes
      ? res.json({ ok: true })
      : fail(res, "الطلب غير موجود.", 404);
  });
  app.get("/api/admin/articles", (req, res) =>
    res.json(db.prepare("SELECT * FROM articles ORDER BY id DESC").all()),
  );
  const validImage = (value) =>
    (/^\/images\/[\w.-]+$/.test(value) &&
      existsSync(path.join(root, "public", value))) ||
    (/^\/uploads\/[a-f0-9]+\.(jpg|png|webp)$/.test(value) &&
      existsSync(path.join(dataDir, value)));
  const saveArticle = (req, res) => {
    const b = req.body,
      title = text(b.title),
      body = text(b.body, 30000),
      image = text(b.image) || "/images/img2.jpeg";
    if (
      !title ||
      !body ||
      !["draft", "published"].includes(b.status) ||
      !validImage(image)
    )
      return fail(res, "يرجى إدخال عنوان ومحتوى وصورة صالحة.");
    const previous = req.params.id
      ? db.prepare("SELECT * FROM articles WHERE id=?").get(req.params.id)
      : null;
    const translatedFields = [
      "title_fr",
      "category_fr",
      "excerpt_fr",
      "body_fr",
    ].map((key) =>
      text(
        b[key] ?? previous?.[key] ?? "",
        key === "body_fr"
          ? 30000
          : key === "excerpt_fr"
            ? 500
            : key === "category_fr"
              ? 80
              : 300,
      ),
    );
    const values = [
      title,
      text(b.category, 80) || "أخبار المركز",
      text(b.excerpt, 500),
      body,
      image,
      b.status,
      ...translatedFields,
    ];
    if (req.params.id) {
      const result = db
        .prepare(
          "UPDATE articles SET title=?,category=?,excerpt=?,body=?,image=?,status=?,title_fr=?,category_fr=?,excerpt_fr=?,body_fr=? WHERE id=?",
        )
        .run(...values, req.params.id);
      if (!result.changes) return fail(res, "المقال غير موجود.", 404);
    } else
      db.prepare(
        "INSERT INTO articles(title,category,excerpt,body,image,status,title_fr,category_fr,excerpt_fr,body_fr) VALUES(?,?,?,?,?,?,?,?,?,?)",
      ).run(...values);
    res.json({ ok: true });
  };
  app.post("/api/admin/articles", saveArticle);
  app.put("/api/admin/articles/:id", saveArticle);
  app.delete("/api/admin/articles/:id", (req, res) => {
    db.prepare("DELETE FROM articles WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });
  app.put("/api/admin/services/:id", (req, res) => {
    const b = req.body;
    if (
      !text(b.name) ||
      !text(b.description, 2000) ||
      !categories.includes(b.category)
    )
      return fail(res, "يرجى استكمال بيانات الخدمة.");
    const result = db
      .prepare(
        "UPDATE services SET name=?,french=?,category=?,description=?,description_fr=COALESCE(?,description_fr) WHERE id=?",
      )
      .run(
        text(b.name),
        text(b.french),
        b.category,
        text(b.description, 2000),
        b.description_fr === undefined ? null : text(b.description_fr, 2000),
        req.params.id,
      );
    result.changes
      ? res.json({ ok: true })
      : fail(res, "الخدمة غير موجودة.", 404);
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  });
  app.post("/api/admin/gallery", upload.single("image"), (req, res) => {
    const file = req.file,
      title = text(req.body.title),
      category = text(req.body.category);
    if (!file || !title || !galleryCategories.includes(category))
      return fail(res, "يرجى اختيار صورة وعنوان وتصنيف.");
    const b = file.buffer;
    const ext = b.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
      ? "jpg"
      : b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "png"
        : b.toString("ascii", 0, 4) === "RIFF" &&
            b.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (!ext) return fail(res, "الصور المسموحة: JPG وPNG وWebP.");
    const filename = randomBytes(16).toString("hex") + "." + ext;
    writeFileSync(path.join(uploadDir, filename), b);
    db.prepare(
      "INSERT INTO gallery(title,category,url,title_fr) VALUES(?,?,?,?)",
    ).run(title, category, "/uploads/" + filename, text(req.body.title_fr));
    res.status(201).json({ ok: true });
  });
  app.delete("/api/admin/gallery/:id", (req, res) => {
    const row = db
      .prepare("SELECT * FROM gallery WHERE id=?")
      .get(req.params.id);
    if (!row) return fail(res, "الصورة غير موجودة.", 404);
    db.prepare("DELETE FROM gallery WHERE id=?").run(req.params.id);
    // Keep an uploaded image if it is also used as an article cover.
    if (
      row.url.startsWith("/uploads/") &&
      !db.prepare("SELECT id FROM articles WHERE image=?").get(row.url)
    ) {
      const file = path.join(uploadDir, path.basename(row.url));
      if (existsSync(file)) unlinkSync(file);
    }
    res.json({ ok: true });
  });
  app.use("/api", (req, res) => fail(res, "المسار غير موجود.", 404));
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (req, res) => {
    const index = path.join(root, "dist/index.html");
    if (existsSync(index)) res.sendFile(index);
    else
      res
        .status(404)
        .send(
          "Start the frontend with npm run dev, or run npm run build first.",
        );
  });
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError)
      return fail(res, "تعذر رفع الصورة. الحد الأقصى 8 ميغابايت.");
    if (err.status === 400 || err.status === 413)
      return fail(res, "بيانات الطلب غير صالحة.", err.status);
    console.error(err.message);
    fail(res, "حدث خطأ. يرجى المحاولة لاحقاً.", 500);
  });
  return { app, db };
}
