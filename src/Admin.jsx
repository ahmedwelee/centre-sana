import { useI18n, LanguageSwitcher } from "./i18n";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpLeft,
  CalendarDays,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { api, useData } from "./api";
const cats = {
  therapies: "الخدمات العلاجية",
  daycare: "الرعاية النهارية",
  activities: "الأنشطة والورشات",
};
const galleryCats = {
  centre: "فضاءات المركز",
  learning: "التعلم والمشاركة",
  activities: "الحركة والأنشطة",
};
const statuses = {
  new: "طلب جديد",
  contacted: "تم التواصل",
  scheduled: "تم تحديد الموعد",
  closed: "مغلق",
};
function Loading({ error, reload }) {
  const { t, language } = useI18n();
  return (
    <div className="status-box">
      {error ? (
        <>
          <p role="alert">{t(error.message)}</p>
          <button className="button small" onClick={reload}>
            {t("إعادة المحاولة")}
          </button>
        </>
      ) : (
        t("جارٍ التحميل…")
      )}
    </div>
  );
}
export default function Admin() {
  const { t, language } = useI18n();
  const [user, setUser] = useState(undefined),
    [tab, setTab] = useState("overview"),
    [notice, setNotice] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  const changed = (message) => {
    setNotice(message);
    setVersion((v) => v + 1);
  };
  async function logout() {
    try {
      await api("/auth/logout", {
        method: "POST",
      });
      setUser(null);
    } catch (e) {
      setNotice(e.message);
    }
  }
  if (user === undefined)
    return (
      <div className="admin-login">
        <Loading />
      </div>
    );
  if (!user) return <Login onLogin={setUser} />;
  const tabs = [
    ["overview", LayoutDashboard, t("نظرة عامة")],
    ["bookings", CalendarDays, t("طلبات المواعيد")],
    ["services", Settings2, t("الخدمات")],
    ["gallery", Images, t("معرض الصور")],
    ["articles", FileText, t("المقالات")],
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="brand">
          <img src="/images/logo.png" alt="" />
          <span>
            <strong>{t("مركز سنا.")}</strong>
            <small>{t("فضاء إدارة المركز")}</small>
          </span>
        </Link>
        <nav aria-label={t("قائمة الإدارة")}>
          {tabs.map(([key, Icon, label]) => (
            <button
              className={tab === key ? "active" : ""}
              key={key}
              onClick={() => {
                setTab(key);
                setNotice("");
              }}
            >
              <Icon size={19} />
              {t(label)}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <LanguageSwitcher />
          <Link to="/">
            {t("عرض الموقع")}
            <ExternalLink size={16} />
          </Link>
          <button onClick={logout}>
            <LogOut size={17} />
            {t("تسجيل الخروج")}
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header>
          <div>
            <span className="eyebrow">{t("أهلاً بكم في فضاء سنا")}</span>
            <h1>{t(tabs.find((t) => t[0] === tab)[2])}</h1>
          </div>
          <span className="admin-account" dir="ltr">
            {t(user.email)}
          </span>
        </header>
        {notice && (
          <div role="status" className="admin-notice">
            {t(notice)}
            <button
              onClick={() => setNotice("")}
              aria-label={t("إغلاق التنبيه")}
            >
              <X size={17} />
            </button>
          </div>
        )}
        {tab === "overview" && <Overview key={version} onTab={setTab} />}{" "}
        {tab === "bookings" && <Bookings onSaved={changed} />}{" "}
        {tab === "services" && <Services onSaved={changed} />}{" "}
        {tab === "gallery" && <Gallery onSaved={changed} />}{" "}
        {tab === "articles" && <Articles onSaved={changed} />}
      </div>
    </div>
  );
}
function Login({ onLogin }) {
  const { t, language } = useI18n();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onLogin(
        await api("/auth/login", {
          method: "POST",
          body: Object.fromEntries(new FormData(e.currentTarget)),
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-login">
      <form onSubmit={submit} className="login-card">
        <LanguageSwitcher />
        <img src="/images/logo.png" alt={t("مركز سنا")} />
        <span className="eyebrow">{t("فضاء الإدارة")}</span>
        <h1>{t("أهلاً بكم من جديد.")}</h1>
        <p>{t("سجّل الدخول لمتابعة المركز وطلبات الأسر.")}</p>
        <label>
          {t("البريد الإلكتروني")}
          <input
            name="email"
            type="email"
            autoComplete="username"
            dir="ltr"
            required
          />
        </label>
        <label>
          {t("كلمة المرور")}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            required
          />
        </label>
        {error && (
          <p role="alert" className="error-message">
            {t(error)}
          </p>
        )}
        <button className="button" disabled={busy}>
          {t(busy ? t("جارٍ تسجيل الدخول…") : t("تسجيل الدخول"))}
          <ArrowUpLeft size={18} />
        </button>
        <Link to="/" className="text-link">
          {t("العودة إلى الموقع")}
        </Link>
      </form>
    </div>
  );
}
function Overview({ onTab }) {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/admin/stats");
  if (!data) return <Loading error={error} reload={reload} />;
  return (
    <>
      <div className="stats-grid">
        {[
          [data.bookings, t("إجمالي الطلبات"), CalendarDays],
          [data.pending, t("طلبات بانتظار التواصل"), LayoutDashboard],
          [data.articles, t("مقالات منشورة"), FileText],
          [data.gallery, t("صور في المعرض"), Images],
        ].map(([n, label, Icon]) => (
          <div key={label}>
            <Icon size={23} />
            <strong>{t(n)}</strong>
            <span>{t(label)}</span>
          </div>
        ))}
      </div>
      <section className="admin-welcome">
        <span className="eyebrow">{t("كل طلب، بداية رحلة")}</span>
        <h2>{t("لنكن قريبين من الأسر.")}</h2>
        <p>
          {t("تابع طلبات المواعيد الجديدة وحدّث حالتها بعد التواصل مع الأسرة.")}
        </p>
        <button className="button" onClick={() => onTab("bookings")}>
          {t("عرض طلبات المواعيد")}
          <ArrowUpLeft size={18} />
        </button>
      </section>
    </>
  );
}
function Bookings({ onSaved }) {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/admin/bookings");
  const [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(null),
    [saving, setSaving] = useState(false),
    [err, setErr] = useState("");
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await api("/admin/bookings/" + selected.id, {
        method: "PATCH",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setSelected(null);
      reload();
      onSaved(t("تم تحديث الطلب."));
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (!data) return <Loading error={error} reload={reload} />;
  const rows = data.filter(
    (b) =>
      (filter === "all" || b.status === filter) &&
      [b.parent_name, b.child_name, b.phone, b.reference].some((v) =>
        v.includes(query),
      ),
  );
  return (
    <>
      <div className="admin-toolbar">
        <input
          aria-label={t("البحث في الطلبات")}
          placeholder={t("ابحث بالاسم، الهاتف أو المرجع…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={t("حالة الطلب")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{t("جميع الحالات")}</option>
          {Object.entries(statuses).map(([k, v]) => (
            <option value={k} key={k}>
              {t(v)}
            </option>
          ))}
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t("الأسرة")}</th>
              <th>{t("الخدمة")}</th>
              <th>{t("الهاتف")}</th>
              <th>{t("الحالة")}</th>
              <th>{t("التاريخ")}</th>
              <th>{t("التفاصيل")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{t(b.parent_name)}</strong>
                  <small>{t(b.child_name)}</small>
                </td>
                <td>{t(b.service_name)}</td>
                <td dir="ltr">{t(b.phone)}</td>
                <td>
                  <span className={"badge " + b.status}>
                    {t(statuses[b.status])}
                  </span>
                </td>
                <td>{t(b.created_at.slice(0, 10))}</td>
                <td>
                  <button
                    className="text-link"
                    onClick={() => {
                      setSelected(b);
                      setErr("");
                    }}
                  >
                    {t("عرض الطلب")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="empty-state">{t("لا توجد طلبات مطابقة.")}</p>
        )}
      </div>
      {selected && (
        <Modal
          title={t(t("طلب ") + selected.reference)}
          onClose={() => setSelected(null)}
        >
          <div className="booking-details">
            <p>
              <b>{t("ولي الأمر:")}</b> {t(selected.parent_name)}
            </p>
            <p>
              <b>{t("الطفل:")}</b> {t(selected.child_name)}
            </p>
            <p>
              <b>{t("تاريخ الازدياد:")}</b> {t(selected.birth_date)}
            </p>
            <p>
              <b>{t("الخدمة:")}</b> {t(selected.service_name)}
            </p>
            <p>
              <b>{t("التاريخ المفضل:")}</b>{" "}
              {t(selected.preferred_date || t("غير محدد"))}
            </p>
            <p>
              <b>{t("الرسالة:")}</b> {t(selected.message || t("لا توجد رسالة"))}
            </p>
            <a className="text-link" href={"tel:" + selected.phone}>
              {t("اتصل بالأسرة:")}
              <bdi>{t(selected.phone)}</bdi>
            </a>
          </div>
          <form onSubmit={save}>
            <label>
              {t("حالة الطلب")}
              <select name="status" defaultValue={selected.status}>
                {Object.entries(statuses).map(([k, v]) => (
                  <option key={k} value={k}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("ملاحظات داخلية")}
              <textarea
                name="notes"
                defaultValue={selected.notes}
                rows={3}
                maxLength={2000}
              />
            </label>
            {err && (
              <p role="alert" className="error-message">
                {t(err)}
              </p>
            )}
            <button className="button" disabled={saving}>
              <Save size={16} />{" "}
              {t(saving ? t("جارٍ الحفظ…") : t("حفظ التحديث"))}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Modal({ title, onClose, children }) {
  const { t, language } = useI18n();
  useEffect(() => {
    const focused = document.activeElement;
    const dialog = document.getElementById("admin-dialog");
    dialog.showModal();
    return () => {
      dialog.close();
      focused?.focus();
    };
  }, []);
  return (
    <dialog
      id="admin-dialog"
      className="admin-modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2>{t(title)}</h2>
        <button type="button" onClick={onClose} aria-label={t("إغلاق")}>
          <X />
        </button>
      </header>
      {t(children)}
    </dialog>
  );
}
function Services({ onSaved }) {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/services?lang=ar");
  const [edit, setEdit] = useState(null),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/admin/services/" + edit.id, {
        method: "PUT",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setEdit(null);
      reload();
      onSaved(t("تم تحديث الخدمة على الموقع."));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data) return <Loading error={error} reload={reload} />;
  return (
    <>
      <div className="admin-service-list">
        {data.map((s) => (
          <article key={s.id}>
            <div>
              <span className="eyebrow">{t(cats[s.category])}</span>
              <h3>{t(language === "fr" ? s.french || s.name : s.name)}</h3>
              <p>
                {t(
                  language === "fr"
                    ? s.description_fr || s.description
                    : s.description,
                )}
              </p>
            </div>
            <button
              className="button ghost small"
              onClick={() => {
                setEdit(s);
                setErr("");
              }}
            >
              <Pencil size={15} />
              {t("تعديل")}
            </button>
          </article>
        ))}
      </div>
      {edit && (
        <Modal title={t("تعديل الخدمة")} onClose={() => setEdit(null)}>
          <form onSubmit={save}>
            <label>
              {t("اسم الخدمة")}
              <input
                name="name"
                defaultValue={edit.name}
                required
                maxLength={300}
                dir="rtl"
              />
            </label>
            <label>
              {t("الاسم بالفرنسية")}
              <input
                name="french"
                defaultValue={edit.french}
                dir="ltr"
                maxLength={300}
              />
            </label>
            <label>
              {t("التصنيف")}
              <select name="category" defaultValue={edit.category}>
                {Object.entries(cats).map(([k, v]) => (
                  <option key={k} value={k}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("الوصف")}
              <textarea
                name="description"
                defaultValue={edit.description}
                rows={4}
                required
                maxLength={2000}
                dir="rtl"
              />
            </label>
            <label>
              {t("الوصف بالفرنسية")}
              <textarea
                name="description_fr"
                dir="ltr"
                defaultValue={edit.description_fr || ""}
                rows={4}
                maxLength={2000}
              />
            </label>
            {err && (
              <p className="error-message" role="alert">
                {t(err)}
              </p>
            )}
            <button className="button" disabled={busy}>
              <Save size={16} />
              {t(busy ? t("جارٍ الحفظ…") : t("حفظ الخدمة"))}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Gallery({ onSaved }) {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/gallery");
  const [add, setAdd] = useState(false),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/admin/gallery", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      setAdd(false);
      reload();
      onSaved(t("تمت إضافة الصورة إلى المعرض."));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!window.confirm(t("حذف هذه الصورة من المعرض؟"))) return;
    try {
      await api("/admin/gallery/" + id, {
        method: "DELETE",
      });
      reload();
      onSaved(t("تم حذف الصورة."));
    } catch (e) {
      onSaved(e.message);
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <p>{t("صور المركز والأنشطة المعروضة للزوار.")}</p>
        <button
          className="button"
          onClick={() => {
            setAdd(true);
            setErr("");
          }}
        >
          <Plus size={18} />
          {t("إضافة صورة")}
        </button>
      </div>
      {data ? (
        <div className="admin-gallery">
          {data.map((i) => (
            <article key={i.id}>
              <img src={i.url} alt={t(i.title)} />
              <div>
                <strong>{t(i.title)}</strong>
                <button
                  className="delete-button"
                  aria-label={t(t("حذف ") + i.title)}
                  onClick={() => remove(i.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Loading error={error} reload={reload} />
      )}{" "}
      {add && (
        <Modal title={t("إضافة صورة")} onClose={() => setAdd(false)}>
          <form onSubmit={save}>
            <label>
              {t("عنوان الصورة")}
              <input name="title" required maxLength={300} dir="rtl" />
            </label>
            <label>
              {t("عنوان الصورة بالفرنسية")}
              <input name="title_fr" dir="ltr" maxLength={300} />
            </label>
            <label>
              {t("التصنيف")}
              <select name="category">
                {Object.entries(galleryCats).map(([k, v]) => (
                  <option key={k} value={k}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("الصورة (JPG، PNG أو WebP — حتى 8 MB)")}
              <input
                name="image"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            {err && (
              <p className="error-message" role="alert">
                {t(err)}
              </p>
            )}
            <button className="button" disabled={busy}>
              {t(busy ? t("جارٍ الرفع…") : t("رفع الصورة"))}
              <Plus size={17} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function Articles({ onSaved }) {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/admin/articles"),
    images = useData("/gallery");
  const [edit, setEdit] = useState(null),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/admin/articles" + (edit.id ? "/" + edit.id : ""), {
        method: edit.id ? "PUT" : "POST",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setEdit(null);
      reload();
      onSaved(t("تم حفظ المقال."));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!window.confirm(t("حذف هذا المقال نهائياً؟"))) return;
    try {
      await api("/admin/articles/" + id, {
        method: "DELETE",
      });
      reload();
      onSaved(t("تم حذف المقال."));
    } catch (e) {
      onSaved(e.message);
    }
  }
  const imageChoices = [
    ...new Map(
      [
        {
          url: "/images/img2.jpeg",
          title: t("فضاء المركز"),
        },
        ...(images.data || []),
        ...(edit?.image
          ? [
              {
                url: edit.image,
                title: t("الصورة الحالية"),
              },
            ]
          : []),
      ].map((i) => [i.url, i]),
    ).values(),
  ];
  return (
    <>
      <div className="admin-toolbar">
        <p>{t("انشر أخبار المركز أو احفظ مقالاتك كمسودة.")}</p>
        <button
          className="button"
          onClick={() => {
            setEdit({
              status: "draft",
              image: "/images/img2.jpeg",
            });
            setErr("");
          }}
        >
          <Plus size={18} />
          {t("مقال جديد")}
        </button>
      </div>
      {data ? (
        <div className="admin-service-list">
          {data.map((a) => (
            <article key={a.id}>
              <div>
                <span
                  className={
                    "badge " + (a.status === "published" ? "scheduled" : "new")
                  }
                >
                  {t(a.status === "published" ? t("منشور") : t("مسودة"))}
                </span>
                <h3>
                  {t(language === "fr" ? a.title_fr || a.title : a.title)}
                </h3>
                <p>
                  {t(language === "fr" ? a.excerpt_fr || a.excerpt : a.excerpt)}
                </p>
              </div>
              <div className="row-actions">
                <button
                  className="button ghost small"
                  onClick={() => {
                    setEdit(a);
                    setErr("");
                  }}
                >
                  <Pencil size={15} />
                  {t("تعديل")}
                </button>
                <button
                  className="delete-button"
                  onClick={() => remove(a.id)}
                  aria-label={t(t("حذف ") + a.title)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Loading error={error} reload={reload} />
      )}{" "}
      {edit && (
        <Modal
          title={t(edit.id ? t("تعديل المقال") : t("مقال جديد"))}
          onClose={() => setEdit(null)}
        >
          <form onSubmit={save}>
            <label>
              {t("العنوان")}
              <input
                name="title"
                required
                defaultValue={edit.title || ""}
                maxLength={300}
                dir="rtl"
              />
            </label>
            <label>
              {t("التصنيف")}
              <input
                name="category"
                defaultValue={edit.category || "أخبار المركز"}
                maxLength={80}
                dir="rtl"
              />
            </label>
            <label>
              {t("ملخص قصير")}
              <textarea
                name="excerpt"
                defaultValue={edit.excerpt || ""}
                rows={2}
                maxLength={500}
                dir="rtl"
              />
            </label>
            <label>
              {t("المحتوى")}
              <textarea
                name="body"
                defaultValue={edit.body || ""}
                required
                rows={8}
                maxLength={30000}
                dir="rtl"
              />
            </label>
            <FrenchArticleFields edit={edit} />
            <label>
              {t("صورة الغلاف")}
              <select name="image" defaultValue={edit.image}>
                {imageChoices.map((i) => (
                  <option key={i.url} value={i.url}>
                    {t(i.title)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("حالة النشر")}
              <select name="status" defaultValue={edit.status}>
                <option value="draft">{t("مسودة")}</option>
                <option value="published">{t("منشور")}</option>
              </select>
            </label>
            {err && (
              <p className="error-message" role="alert">
                {t(err)}
              </p>
            )}
            <button className="button" disabled={busy}>
              <Save size={17} />
              {t(busy ? t("جارٍ الحفظ…") : t("حفظ المقال"))}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function FrenchArticleFields({ edit }) {
  const { t } = useI18n();
  return (
    <fieldset className="translation-fields">
      <legend>{t("النسخة الفرنسية")}</legend>
      <p>
        {t(
          "أضف العنوان والمحتوى لإظهار النسخة الفرنسية. عند غيابها، تُعرض النسخة العربية.",
        )}
      </p>
      <label>
        {t("العنوان بالفرنسية")}
        <input
          name="title_fr"
          dir="ltr"
          defaultValue={edit.title_fr || ""}
          maxLength={300}
        />
      </label>
      <label>
        {t("التصنيف بالفرنسية")}
        <input
          name="category_fr"
          dir="ltr"
          defaultValue={edit.category_fr || ""}
          maxLength={80}
        />
      </label>
      <label>
        {t("الملخص بالفرنسية")}
        <textarea
          name="excerpt_fr"
          dir="ltr"
          defaultValue={edit.excerpt_fr || ""}
          rows={2}
          maxLength={500}
        />
      </label>
      <label>
        {t("المحتوى بالفرنسية")}
        <textarea
          name="body_fr"
          dir="ltr"
          defaultValue={edit.body_fr || ""}
          rows={8}
          maxLength={30000}
        />
      </label>
    </fieldset>
  );
}
