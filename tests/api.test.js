import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp } from "../server/app.js";

test("Centre Sana API: bookings, authorization, content and persistence", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), "sana-test-"));
  const options = {
    dataDir,
    adminEmail: "test@sana.local",
    adminPassword: "Sana-test-password-987",
  };
  let { app, db } = createApp(options);
  let server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  let base = `http://127.0.0.1:${server.address().port}`;
  let cookie = "";
  async function request(url, method = "GET", body, authenticated = false) {
    const res = await fetch(base + "/api" + url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(authenticated ? { Cookie: cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json(), headers: res.headers };
  }
  t.after(async () => {
    await new Promise((r) => server.close(r));
    db.close();
    rmSync(dataDir, { recursive: true, force: true });
  });
  let bookingReference;
  await t.test("public services and access boundaries", async () => {
    assert.equal((await request("/services")).body.length, 12);
    assert.equal((await request("/admin/bookings")).status, 401);
    assert.equal(
      (await request("/admin/articles", "POST", { title: "no" })).status,
      401,
    );
    assert.equal(
      (
        await request("/auth/login", "POST", {
          email: options.adminEmail,
          password: "wrong",
        })
      ).status,
      401,
    );
    const result = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: {
        Origin: "https://malicious.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: options.adminEmail,
        password: options.adminPassword,
      }),
    });
    assert.equal(result.status, 403);
  });
  const booking = {
    parent_name: "أسرة اختبار",
    child_name: "طفل اختبار",
    phone: "06 12 34 56 78",
    birth_date: "2018-03-12",
    service_id: 1,
    message: "طلب تجريبي",
    consent: true,
  };
  await t.test("validates and persists appointment requests", async () => {
    assert.equal(
      (await request("/bookings", "POST", { ...booking, phone: "123" })).status,
      400,
    );
    assert.equal(
      (
        await request("/bookings", "POST", {
          ...booking,
          birth_date: "2018-02-31",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/bookings", "POST", {
          ...booking,
          birth_date: "2099-01-01",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/bookings", "POST", {
          ...booking,
          preferred_date: "2001-01-01",
        })
      ).status,
      400,
    );
    assert.equal(
      (await request("/bookings", "POST", { ...booking, service_id: 9999 }))
        .status,
      400,
    );
    assert.equal(
      (await request("/bookings", "POST", { ...booking, consent: false }))
        .status,
      400,
    );
    const valid = await request("/bookings", "POST", booking);
    assert.equal(valid.status, 201);
    assert.match(valid.body.reference, /^SNA-/);
    bookingReference = valid.body.reference;
  });
  await t.test(
    "session login, appointment details and status updates",
    async () => {
      const login = await request("/auth/login", "POST", {
        email: options.adminEmail,
        password: options.adminPassword,
      });
      assert.equal(login.status, 200);
      assert.match(login.headers.get("set-cookie"), /HttpOnly/);
      assert.match(login.headers.get("set-cookie"), /SameSite=Strict/);
      cookie = login.headers.get("set-cookie").split(";")[0];
      const list = (await request("/admin/bookings", "GET", undefined, true))
        .body;
      assert.equal(list.length, 1);
      assert.equal(list[0].reference, bookingReference);
      assert.equal(list[0].phone, "0612345678");
      assert.equal(
        (
          await request(
            "/admin/bookings/" + list[0].id,
            "PATCH",
            { status: "scheduled", notes: "confirmed" },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "/admin/bookings/" + list[0].id,
            "PATCH",
            { status: "invalid" },
            true,
          )
        ).status,
        400,
      );
      assert.equal(
        (await request("/admin/stats", "GET", undefined, true)).body.pending,
        0,
      );
    },
  );
  await t.test(
    "article drafts stay private; publishing and deleting work",
    async () => {
      const article = {
        title: "مقال اختبار",
        category: "اختبار",
        excerpt: "ملخص",
        body: "محتوى الاختبار",
        image: "/images/img2.jpeg",
        status: "draft",
      };
      assert.equal(
        (await request("/admin/articles", "POST", article, true)).status,
        200,
      );
      const all = (await request("/admin/articles", "GET", undefined, true))
        .body;
      const draft = all.find((a) => a.title === article.title);
      assert.equal((await request("/articles/" + draft.id)).status, 404);
      assert.equal(
        (await request("/articles")).body.some((a) => a.id === draft.id),
        false,
      );
      assert.equal(
        (
          await request(
            "/admin/articles/" + draft.id,
            "PUT",
            { ...article, status: "published" },
            true,
          )
        ).status,
        200,
      );
      assert.equal((await request("/articles/" + draft.id)).status, 200);
      assert.equal(
        (
          await request(
            "/admin/articles/" + draft.id,
            "PUT",
            { ...article, image: "https://bad.example/file.svg" },
            true,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "/admin/articles/" + draft.id,
            "DELETE",
            undefined,
            true,
          )
        ).status,
        200,
      );
      assert.equal((await request("/articles/" + draft.id)).status, 404);
    },
  );
  await t.test("service updates become visible publicly", async () => {
    const s = (await request("/services")).body[0];
    assert.equal(
      (
        await request(
          "/admin/services/" + s.id,
          "PUT",
          { ...s, name: "خدمة محدثة" },
          true,
        )
      ).status,
      200,
    );
    assert.equal((await request("/services")).body[0].name, "خدمة محدثة");
  });
  await t.test(
    "gallery accepts real images and rejects spoofed file types",
    async () => {
      const bad = new FormData();
      bad.set("title", "bad");
      bad.set("category", "centre");
      bad.set(
        "image",
        new Blob(["<svg><script>1</script></svg>"], { type: "image/png" }),
        "bad.png",
      );
      assert.equal(
        (
          await fetch(base + "/api/admin/gallery", {
            method: "POST",
            headers: { Cookie: cookie },
            body: bad,
          })
        ).status,
        400,
      );
      const good = new FormData();
      good.set("title", "اختبار الصورة");
      good.set("category", "centre");
      good.set(
        "image",
        new Blob([readFileSync("public/images/img2.jpeg")], {
          type: "image/jpeg",
        }),
        "centre.jpeg",
      );
      assert.equal(
        (
          await fetch(base + "/api/admin/gallery", {
            method: "POST",
            headers: { Cookie: cookie },
            body: good,
          })
        ).status,
        201,
      );
      const item = (await request("/gallery")).body.find(
        (i) => i.title === "اختبار الصورة",
      );
      assert.equal((await fetch(base + item.url)).status, 200);
      assert.equal(
        (await request("/admin/gallery/" + item.id, "DELETE", undefined, true))
          .status,
        200,
      );
      assert.equal(
        (await request("/gallery")).body.some((i) => i.id === item.id),
        false,
      );
    },
  );
  await t.test(
    "French content, bilingual editing and Arabic preservation",
    async () => {
      const arabic = (await request("/services")).body[1];
      const french = (await request("/services?locale=fr")).body[1];
      assert.equal(french.name, arabic.french);
      assert.ok(french.description.length > 20);
      assert.equal(/[\u0600-\u06ff]/.test(french.description), false);
      assert.equal(
        (await request("/services?lang=ar&locale=fr")).body[1].name,
        arabic.name,
      );
      const edited = {
        ...arabic,
        description_fr: "Description française modifiée",
      };
      assert.equal(
        (await request("/admin/services/" + arabic.id, "PUT", edited, true))
          .status,
        200,
      );
      assert.equal(
        (await request("/services?locale=fr")).body[1].description,
        edited.description_fr,
      );
      assert.equal(
        (await request("/services")).body[1].description,
        arabic.description,
      );
      const article = {
        title: "مقال بلغتين",
        category: "اختبار",
        excerpt: "ملخص بالعربية",
        body: "محتوى بالعربية",
        image: "/images/img2.jpeg",
        status: "published",
        title_fr: "Article bilingue",
        category_fr: "Test",
        excerpt_fr: "Résumé français",
        body_fr: "Contenu en français.",
      };
      assert.equal(
        (await request("/admin/articles", "POST", article, true)).status,
        200,
      );
      const created = (
        await request("/admin/articles", "GET", undefined, true)
      ).body.find((a) => a.title === article.title);
      assert.equal(
        (await request("/articles/" + created.id + "?locale=fr")).body.body,
        article.body_fr,
      );
      assert.equal(
        (await request("/articles/" + created.id)).body.body,
        article.body,
      );
      const { title_fr, category_fr, excerpt_fr, body_fr, ...legacyPayload } =
        article;
      await request(
        "/admin/articles/" + created.id,
        "PUT",
        { ...legacyPayload, excerpt: "ملخص محدث" },
        true,
      );
      assert.equal(
        (await request("/articles/" + created.id + "?locale=fr")).body.body,
        body_fr,
      );
      const legacy = { ...legacyPayload, title: "مقال بالعربية فقط" };
      await request("/admin/articles", "POST", legacy, true);
      const fallback = (await request("/articles?locale=fr")).body.find(
        (a) => a.title === legacy.title,
      );
      assert.equal(fallback.content_language, "ar");
      assert.equal(
        (await request("/gallery?locale=fr")).body.every(
          (i) => !/[\u0600-\u06ff]/.test(i.title),
        ),
        true,
      );
    },
  );
  await t.test(
    "data survives restart and logout invalidates the session",
    async () => {
      await new Promise((r) => server.close(r));
      db.close();
      ({ app, db } = createApp(options));
      server = app.listen(0, "127.0.0.1");
      await new Promise((r) => server.once("listening", r));
      base = `http://127.0.0.1:${server.address().port}`;
      assert.equal(
        (await request("/admin/bookings", "GET", undefined, true)).body[0]
          .reference,
        bookingReference,
      );
      assert.equal(
        (await request("/admin/bookings", "GET", undefined, true)).body[0]
          .status,
        "scheduled",
      );
      await request("/auth/logout", "POST", undefined, true);
      assert.equal(
        (await request("/admin/bookings", "GET", undefined, true)).status,
        401,
      );
    },
  );
});
