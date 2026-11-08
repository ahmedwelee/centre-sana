import { test, expect } from "@playwright/test";

test("public pages, filters, gallery, FAQ, mobile navigation and layout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("رعاية متخصصة");
  await expect(page.locator(".service-card")).toHaveCount(3);
  await page.getByRole("button", { name: "كيف يمكنني حجز موعد؟" }).click();
  await expect(page.locator("#faq-0")).toBeVisible();
  await page.goto("/services");
  await page
    .getByRole("searchbox", { name: "البحث عن خدمة" })
    .fill("Orthophonie");
  await expect(page.locator(".service-card")).toHaveCount(1);
  await page
    .getByRole("searchbox", { name: "البحث عن خدمة" })
    .fill("no matching service");
  await expect(
    page.getByRole("heading", { name: "لا توجد خدمات مطابقة" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "عرض جميع الخدمات", exact: true })
    .click();
  await expect(page.locator(".service-card")).toHaveCount(12);
  await page
    .getByRole("button", { name: "الرعاية النهارية", exact: true })
    .click();
  await expect(page.locator(".service-card")).toHaveCount(1);
  await page.locator(".service-card a").click();
  await expect(page.locator("select[name=service_id]")).toHaveValue("9");
  await page.goto("/gallery");
  await page
    .getByRole("button", { name: "فضاءات المركز", exact: true })
    .click();
  await expect(page.locator(".gallery-item")).toHaveCount(2);
  await page.locator(".gallery-item").first().click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.goto("/articles");
  await page.locator(".article-card a").first().click();
  await expect(page.locator(".article-body")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/about",
    "/services",
    "/gallery",
    "/articles",
    "/contact",
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.src),
        ),
    ).toEqual([]);
  }
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  await page
    .getByRole("navigation", { name: "القائمة الرئيسية" })
    .getByRole("link", { name: "خدماتنا" })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("appointment reaches admin, can be updated, and articles can be published", async ({
  page,
}) => {
  await page.goto("/contact?service=1");
  await page.locator("[name=parent_name]").fill("أسرة تجربة المتصفح");
  await page.locator("[name=phone]").fill("0612345678");
  await page.locator("[name=child_name]").fill("طفل تجريبي");
  await page.locator("[name=birth_date]").fill("2018-04-20");
  await page.locator("[name=message]").fill("طلب اختبار آلي");
  await page.locator("[name=consent]").check();
  await page.getByRole("button", { name: "إرسال طلب الموعد" }).click();
  await expect(page.locator(".reference strong")).toContainText("SNA-");
  const reference = await page.locator(".reference strong").textContent();
  await page.goto("/admin");
  await page.locator("[name=email]").fill("browser@sana.local");
  await page.locator("[name=password]").fill("Sana-browser-test-123!");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.locator(".stats-grid")).toBeVisible();
  await page
    .getByRole("button", { name: "طلبات المواعيد", exact: true })
    .click();
  await page.getByRole("textbox", { name: "البحث في الطلبات" }).fill(reference);
  await page.getByRole("button", { name: "عرض الطلب", exact: true }).click();
  await page.locator("[name=status]").selectOption("contacted");
  await page.locator("[name=notes]").fill("تم التواصل في اختبار المتصفح");
  await page.getByRole("button", { name: "حفظ التحديث" }).click();
  await expect(page.locator("tbody .badge")).toHaveText("تم التواصل");
  await page.getByRole("button", { name: "المقالات", exact: true }).click();
  await page.getByRole("button", { name: "مقال جديد", exact: true }).click();
  const title = "مقال اختبار " + Date.now();
  await page.locator("[name=title]").fill(title);
  await page.locator("[name=excerpt]").fill("مقال منشور عبر لوحة الإدارة");
  await page
    .locator("[name=body]")
    .fill("محتوى تجريبي للتحقق من نشر المقالات.");
  await page.locator("[name=status]").selectOption("published");
  await page.getByRole("button", { name: "حفظ المقال" }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.goto("/articles");
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.goto("/admin");
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "تسجيل الدخول", exact: true }),
  ).toBeVisible();
});

test("French language, preference persistence, responsive layouts and bilingual admin editing", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Français", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("h1")).toContainText("Chaque enfant compte");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.goto("/services");
  await page
    .getByRole("searchbox", { name: "Rechercher un service" })
    .fill("Orthophonie");
  await expect(page.locator(".service-card")).toHaveCount(1);
  await page.locator(".service-card a").click();
  await page.locator("[name=parent_name]").fill("Famille test français");
  await page.locator("[name=child_name]").fill("Enfant test");
  await page.locator("[name=birth_date]").fill("2018-04-20");
  await page.locator("[name=phone]").fill("0512345678");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.locator("[name=parent_name]")).toHaveValue(
    "Famille test français",
  );
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "Français", exact: true }).click();
  await expect(page.locator("[name=service_id]")).toHaveValue("1");
  await page.locator("[name=consent]").check();
  await page
    .getByRole("button", { name: "Envoyer la demande", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Votre demande a bien été enregistrée.",
    }),
  ).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/services",
      "/about",
      "/gallery",
      "/contact",
      "/admin",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBeTruthy();
    }
  }
  await page.locator("[name=email]").fill("browser@sana.local");
  await page.locator("[name=password]").fill("wrong");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "L’adresse e-mail ou le mot de passe est incorrect.",
  );
  await page.locator("[name=password]").fill("Sana-browser-test-123!");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Vue d’ensemble", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await page
    .getByRole("button", { name: "Modifier", exact: true })
    .first()
    .click();
  const originalArabic = await page.locator("textarea[name=description]").inputValue();
  await page
    .locator("[name=description_fr]")
    .fill("Accompagnement personnalisé en français.");
  await page
    .getByRole("button", { name: "Enregistrer le service", exact: true })
    .click();
  await expect(
    page.getByText("Accompagnement personnalisé en français.", { exact: true }),
  ).toBeVisible();
  const service = await page.request.get("/api/services?locale=fr");
  expect((await service.json())[0].description).toBe(
    "Accompagnement personnalisé en français.",
  );
  const raw = await page.request.get("/api/services");
  expect((await raw.json())[0].description).toBe(originalArabic);
  await page.getByRole("button", { name: "Articles", exact: true }).click();
  await page
    .getByRole("button", { name: "Nouvel article", exact: true })
    .click();
  const title = "Article français " + Date.now();
  await page.locator("[name=title]").fill("مقال اختبار ثنائي اللغة");
  await page.locator("[name=body]").fill("محتوى المقال بالعربية");
  await page.locator("[name=title_fr]").fill(title);
  await page
    .locator("[name=body_fr]")
    .fill("Un article disponible en français.");
  await page.locator("[name=status]").selectOption("published");
  await page
    .getByRole("button", { name: "Enregistrer l’article", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.goto("/articles");
  await page.getByRole("heading", { name: title, exact: true }).click();
  await expect(page.locator(".article-body")).toContainText(
    "Un article disponible en français.",
  );
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.locator(".article-body")).toContainText(
    "محتوى المقال بالعربية",
  );
  expect(errors).toEqual([]);
});
