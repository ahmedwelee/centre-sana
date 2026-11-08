import { useI18n, LanguageSwitcher } from "./i18n";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpLeft,
  ArrowLeft,
  ArrowRight,
  Heart,
  Sprout,
  Users,
  BookOpen,
  Puzzle,
  MessageCircle,
  Brain,
  Activity,
  HandHeart,
  House,
  Palette,
  Leaf,
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  Check,
  Plus,
  Minus,
  CalendarDays,
  ShieldCheck,
  ArrowDown,
  Expand,
  CheckCircle2,
  Search,
  ChevronLeft,
} from "lucide-react";
import { api, useData } from "./api";
import Admin from "./Admin";
export const categories = {
  all: "جميع الخدمات",
  therapies: "الخدمات العلاجية",
  daycare: "الرعاية النهارية",
  activities: "الأنشطة والورشات",
};
export const galleryCategories = {
  all: "كل الصور",
  centre: "فضاءات المركز",
  learning: "التعلم والمشاركة",
  activities: "الحركة والأنشطة",
};
const icons = {
  message: MessageCircle,
  brain: Brain,
  activity: Activity,
  hand: HandHeart,
  book: BookOpen,
  puzzle: Puzzle,
  home: House,
  palette: Palette,
  leaf: Leaf,
};
const team = [
  ["img8.jpeg", "ذة. إلهام والان", "مديرة ومؤسسة المركز"],
  ["img5.jpeg", "د. محمد موفق", "أخصائي نفسي"],
  ["img6.jpeg", "د. رشيد بهميدن", "أخصائي تقويم النطق"],
  ["img7.jpeg", "د. وائل عبد اللوي", "أخصائي نفسي حركي"],
  ["img9.jpeg", "د. أمينة الشكراوي", "أخصائية علاج وظيفي"],
  ["img11.jpeg", "ذة. بوشرى كيوري", "أخصائية تربية خاصة"],
  ["img10.jpeg", "ذة. حليمة موجود", "مشرفة برامج ABA"],
  ["img12.jpeg", "ذة. رجاء لهطاطر", "أخصائية تربية خاصة"],
  ["img13.jpeg", "د. عفاف حفيظ", "أخصائية تغذية"],
];
export function Status({ error, reload }) {
  const { t, language } = useI18n();
  return (
    <div className="status-box" role={error ? "alert" : "status"}>
      {error ? (
        <>
          <p>{t(error.message)}</p>
          <button className="button small" onClick={reload}>
            {t("إعادة المحاولة")}
          </button>
        </>
      ) : (
        <>
          <span className="spinner" />
          {t("جارٍ التحميل…")}
        </>
      )}
    </div>
  );
}
export function PageIntro({ eyebrow, title, description }) {
  const { t, language } = useI18n();
  return (
    <div className="page-intro container">
      <nav className="breadcrumbs" aria-label={t("مسار الصفحة")}>
        <Link to="/">{t("الرئيسية")}</Link>
        <ChevronLeft size={13} />
        <span>{t(eyebrow)}</span>
      </nav>
      <span className="eyebrow">
        <span />
        {t(eyebrow)}
      </span>
      <h1>{t(title)}</h1>
      <p>{t(description)}</p>
    </div>
  );
}
function Logo() {
  const { t, language } = useI18n();
  return (
    <Link className="brand" to="/" aria-label={t("مركز سنا — الرئيسية")}>
      <img src="/images/logo.png" alt="" />
      <span>
        <strong>{t("مركز سنا")}</strong>
        <small lang="fr">CENTRE SANA PLURIDISCIPLINAIRE</small>
      </span>
    </Link>
  );
}
function ScrollTop() {
  const { t, language } = useI18n();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles = {
      "/": t("الرعاية والتأهيل بالقنيطرة"),
      "/about": t("عن المركز"),
      "/services": t("خدماتنا"),
      "/gallery": t("حياة المركز"),
      "/articles": t("المقالات"),
      "/contact": t("طلب موعد"),
      "/admin": t("إدارة المركز"),
    };
    document.title = `${titles[pathname] || t("مركز سنا")} | ${t("مركز سنا")}`;
    const metaDescription=document.querySelector('meta[name="description"]');
    if(metaDescription)metaDescription.content=language==='fr'?'Centre Sana Pluridisciplinaire à Kénitra. Services thérapeutiques et éducatifs, orthophonie, accueil de jour et accompagnement des enfants et de leurs familles.':'مركز سنا متعدد التخصصات بالقنيطرة. خدمات علاجية وتربوية، تقويم النطق، رعاية نهارية ومواكبة الأطفال وأسرهم.';

  }, [pathname, language]);
  return null;
}
function Layout() {
  const { t, language } = useI18n();
  const [menu, setMenu] = useState(false),
    location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = [
    ["/", t("الرئيسية")],
    ["/about", t("عن المركز")],
    ["/services", t("خدماتنا")],
    ["/gallery", t("حياة المركز")],
    ["/articles", t("المقالات")],
    ["/contact", t("التواصل")],
  ];
  return (
    <>
      <a href="#main" className="skip-link">
        {t("انتقل إلى المحتوى")}
      </a>
      <div className="topbar">
        <div className="container">
          <span>
            <MapPin size={13} />
            {t(
              "\u0627\u0644\u0642\u0646\u064A\u0637\u0631\u0629\u060C \u0627\u0644\u0645\u063A\u0631\u0628",
            )}
            {t(" ")}
            <span className="top-divider">|</span>
            <span className="opening-hours">
              <Clock size={13} />
              {t(
                "\u0627\u0644\u0625\u062B\u0646\u064A\u0646 \u2013 \u0627\u0644\u062C\u0645\u0639\u0629: 9:00 \u2013 16:00",
              )}
            </span>
          </span>
          <div className="utility-tools">
            <a href="tel:+212663777313">
              <Phone size={13} />
              <bdi>06 63 77 73 13</bdi>
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container nav-row">
          <Logo />
          <nav
            className={menu ? "nav-links open" : "nav-links"}
            aria-label={t("القائمة الرئيسية")}
            id="main-navigation"
          >
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {t(label)}
              </NavLink>
            ))}
          </nav>

          <Link to="/contact" className="button nav-cta">
            {t("احجز موعداً")}
            <ArrowUpLeft size={17} />
          </Link>
          <button
            className="menu-button"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="main-navigation"
            aria-label={t(menu ? t("إغلاق القائمة") : t("فتح القائمة"))}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <div className="container footer-grid">
          <div>
            <Logo />
            <p>
              {t("نرافق كل طفل نحو إمكانياته،")}
              <br />
              {t("ونمشي مع أسرته خطوة بخطوة.")}
            </p>
            <span className="footer-french">
              Centre Sana Pluridisciplinaire
            </span>
          </div>
          <div>
            <h3>{t("اكتشف سنا")}</h3>
            <Link to="/about">{t("عن المركز وفريقنا")}</Link>
            <Link to="/services">{t("خدماتنا وبرامجنا")}</Link>
            <Link to="/gallery">{t("حياة المركز")}</Link>
            <Link to="/articles">{t("المقالات والمستجدات")}</Link>
          </div>
          <div>
            <h3>{t("يسعدنا تواصلكم")}</h3>
            <a href="tel:+212663777313">
              <Phone size={16} />
              <bdi>06 63 77 73 13</bdi>
            </a>
            <span>
              <MapPin size={16} />
              {t("القنيطرة، المملكة المغربية")}
            </span>
            <span>
              <Clock size={16} />
              {t("الإثنين – الجمعة، 9:00 – 16:00")}
            </span>
            <a
              href="https://wa.me/212663777313"
              target="_blank"
              rel="noreferrer"
            >
              {t("تحدث معنا عبر واتساب")}
              <ArrowUpLeft size={16} />
            </a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {t(new Date().getFullYear())}
            {t("مركز سنا متعدد التخصصات. جميع الحقوق محفوظة.")}
          </span>
          <Link to="/admin">{t("فضاء الإدارة")}</Link>
        </div>
      </footer>
      <a
        className="whatsapp"
        href="https://wa.me/212663777313"
        target="_blank"
        rel="noreferrer"
        aria-label={t("تواصل عبر واتساب")}
      >
        <MessageCircle size={24} />
      </a>
    </>
  );
}
function SectionHeading({ tag, title, description, to, label }) {
  const { t, language } = useI18n();
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">
          <span />
          {t(tag)}
        </span>
        <h2>{t(title)}</h2>
        {description && <p>{t(description)}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {t(label)}
          <ArrowLeft size={18} />
        </Link>
      )}
    </div>
  );
}
function ServiceCard({ service, index = 0 }) {
  const { t, language } = useI18n();
  const Icon = icons[service.icon] || Heart;
  return (
    <article className={`service-card tone-${index % 4}`}>
      <div className="service-top">
        <span className="service-icon">
          <Icon size={25} strokeWidth={1.5} />
        </span>
        <span className="service-number">
          {t(String(index + 1).padStart(2, "0"))}
        </span>
      </div>
      <span className="french-label" lang="fr">
        {t(service.french)}
      </span>
      <h3>{t(service.name)}</h3>
      <p>{t(service.description)}</p>
      <Link
        to={"/contact?service=" + service.id}
        aria-label={t(t("طلب موعد: ") + service.name)}
      >
        {t("طلب موعد لهذه الخدمة")}{" "}
        <span>
          <ArrowUpLeft size={19} />
        </span>
      </Link>
    </article>
  );
}
function CTA() {
  const { t, language } = useI18n();
  return (
    <section className="container cta-section">
      <div className="cta-icon">
        <CalendarDays size={36} strokeWidth={1.4} />
      </div>
      <div>
        <span className="eyebrow light">{t("التواصل والمواعيد")}</span>
        <h2>{t("نبدأ بفهم احتياجات طفلكم.")}</h2>
        <p>{t("احجزوا لقاءً أولياً مع فريق المركز لمناقشة المسار المناسب.")}</p>
      </div>
      <div className="cta-actions">
        <Link className="button cream" to="/contact">
          {t("طلب موعد")}
          <ArrowUpLeft size={18} />
        </Link>
        <a href="tel:+212663777313">
          <Phone size={16} />
          <bdi>06 63 77 73 13</bdi>
        </a>
      </div>
    </section>
  );
}
function TeamGrid({ preview = false }) {
  const { t, language } = useI18n();
  const members = preview ? team.slice(0, 4) : team;
  return (
    <div className={"team-grid " + (preview ? "team-preview" : "")}>
      {members.map(([photo, name, role]) => (
        <article key={name}>
          <div className="team-image">
            <img src={"/images/" + photo} alt={t(name)} loading="lazy" />
          </div>
          <div className="team-info">
            <span className="team-rule" />
            <h3>{t(name)}</h3>
            <p>{t(role)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
function Home() {
  const { t, language } = useI18n();
  const { data: services, error, reload } = useData("/services");
  return (
    <>
      <section className="hero container" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="eyebrow">
            <span />
            {t("مركز سنا متعدد التخصصات · القنيطرة")}
          </span>
          <h1 id="hero-heading">
            {t("رعاية متخصصة.")}
            <br />
            <span>{t("اهتمام بكل طفل.")}</span>
          </h1>
          <p>
            {t(
              "خدمات علاجية وتربوية متكاملة للأطفال والشباب، يقدمها فريق متعدد التخصصات، بشراكة مستمرة مع الأسرة.",
            )}
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/contact">
              {t("طلب موعد أولي")}
              <ArrowUpLeft size={19} />
            </Link>
            <Link className="button ghost" to="/services">
              {t("تعرف على خدماتنا")}
              <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="hero-assurance">
            <ShieldCheck size={22} />
            <div>
              <strong>{t("مواكبة فردية، ضمن رؤية متكاملة")}</strong>
              <span>
                {t("تقييم الاحتياجات · برنامج مخصص · متابعة مع الأسرة")}
              </span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src="/images/img2.jpeg"
            alt={t("فضاء التعلم والتأهيل في مركز سنا بالقنيطرة")}
            fetchPriority="high"
          />
          <span className="hero-image-label" lang="fr">
            CENTRE SANA — KÉNITRA
          </span>
          <Link className="hero-caption" to="/gallery">
            <div>
              <span>{t("فضاءات المركز")}</span>
              <strong>{t("بيئة مهيأة للتعلم والتطور")}</strong>
            </div>
            <span className="round-arrow">
              <ArrowUpLeft size={21} />
            </span>
          </Link>
        </div>
      </section>
      <section className="pillars container" aria-label={t("محاور المواكبة")}>
        <div className="pillars-inner">
          {[
            [Heart, t("الدعم النفسي"), t("مواكبة الطفل والأسرة")],
            [Activity, t("التأهيل"), t("تنمية المهارات والاستقلالية")],
            [BookOpen, t("التعلم"), t("برامج تراعي احتياجات الطفل")],
            [Users, t("الدمج"), t("المشاركة في الحياة اليومية")],
          ].map(([Icon, title, body]) => (
            <div key={title}>
              <Icon size={25} strokeWidth={1.5} />
              <div>
                <h3>{t(title)}</h3>
                <p>{t(body)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          tag={t("خدمات المركز")}
          title={t("تخصصات متكاملة حول احتياجات طفلكم.")}
          description={t(
            "نحدد مسار المواكبة بعد التقييم، وفق احتياجات كل حالة وأهداف الأسرة.",
          )}
          to="/services"
          label={t("استعرض جميع الخدمات")}
        />
        {services ? (
          <div className="services-grid home-services">
            {services.slice(0, 3).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        ) : (
          <Status error={error} reload={reload} />
        )}
        <div className="program-links">
          <Link to="/services?category=daycare">
            <House size={25} />
            <div>
              <strong>{t("الرعاية النهارية")}</strong>
              <span>{t("دوام كامل أو جزئي حسب الحاجة")}</span>
            </div>
            <ArrowUpLeft size={20} />
          </Link>
          <Link to="/services?category=activities">
            <Palette size={25} />
            <div>
              <strong>{t("الأنشطة والورشات")}</strong>
              <span>{t("التعبير، الحركة ومهارات الحياة اليومية")}</span>
            </div>
            <ArrowUpLeft size={20} />
          </Link>
        </div>
      </section>
      <section className="about-preview">
        <div className="container about-grid">
          <div className="about-photo">
            <img
              src="/images/img4.jpeg"
              alt={t("نشاط تعليمي جماعي في مركز سنا")}
              loading="lazy"
            />
            <div className="photo-tag">
              <span>{t("من داخل المركز")}</span>
              <strong>{t("التعلم بالمشاركة والتجربة")}</strong>
            </div>
          </div>
          <div className="about-copy">
            <span className="eyebrow">
              <span />
              {t("منهجنا في المواكبة")}
            </span>
            <h2>
              {t("الطفل في صميم الرعاية.")}
              <br />
              {t("والأسرة شريك في المسار.")}
            </h2>
            <p>
              {t(
                "يجمع مركز سنا بالقنيطرة الرعاية النفسية والتأهيل والتربية الخاصة في فضاء واحد. يعمل فريقنا على فهم احتياجات الطفل، وبناء برنامج يراعي قدراته ووتيرة تطوره.",
              )}
            </p>
            <div className="check-list">
              {[
                t("تقييم أولي لتحديد الاحتياجات والأولويات"),
                t("برنامج فردي يجمع التخصصات المناسبة"),
                t("متابعة منتظمة وتواصل مباشر مع الأسرة"),
              ].map((item) => (
                <span key={item}>
                  <Check size={16} />
                  {t(item)}
                </span>
              ))}
            </div>
            <Link className="text-link" to="/about">
              {t("تعرف على المركز")}
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          tag={t("فريق سنا")}
          title={t("خبرات متعددة. عمل مشترك.")}
          description={t(
            "تعرفوا على المختصين الذين يرافقون الأطفال وأسرهم في المركز.",
          )}
          to="/about"
          label={t("تعرف على الفريق")}
        />
        <TeamGrid preview />
      </section>
      <section className="journey-section">
        <div className="container">
          <SectionHeading
            tag={t("مسار الاستقبال والمواكبة")}
            title={t("خطوات واضحة، من التواصل إلى المتابعة.")}
          />
          <div className="journey">
            {[
              [
                "01",
                t("التواصل واللقاء الأول"),
                t("نستمع إليكم ونتعرف على احتياجات طفلكم وتوقعاتكم."),
              ],
              [
                "02",
                t("التقييم والبرنامج الفردي"),
                t("يحدد الفريق مع الأسرة أهداف المواكبة والخدمات المناسبة."),
              ],
              [
                "03",
                t("المواكبة والمتابعة"),
                t("نعمل على البرنامج ونناقش تطوره معكم بانتظام."),
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span>{t(n)}</span>
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(body)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="gallery-preview container section">
        <SectionHeading
          tag={t("حياة المركز")}
          title={t("فضاءات للتأهيل والتعلم والمشاركة.")}
          to="/gallery"
          label={t("زيارة معرض الصور")}
        />
        <div className="preview-photos">
          {[
            ["img2.jpeg", t("فضاء التعلم")],
            ["img1.jpeg", t("التأهيل والأنشطة الحركية")],
            ["img4.jpeg", t("التعلم والمشاركة")],
          ].map(([image, title]) => (
            <Link key={image} to="/gallery">
              <img src={"/images/" + image} alt={t(title)} loading="lazy" />
              <span>
                {t(title)}
                <ArrowUpLeft size={20} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
function FAQ() {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(null);
  const items = [
    [
      t("كيف يمكنني حجز موعد؟"),
      t(
        "يمكنكم تعبئة طلب الموعد أو الاتصال على 06 63 77 73 13. يتواصل معكم فريق المركز لتأكيد اليوم والساعة المناسبين.",
      ),
    ],
    [
      t("هل يقدم المركز رعاية نهارية؟"),
      t(
        "نعم، يقدم المركز رعاية نهارية بدوام كامل من التاسعة صباحاً إلى الرابعة مساءً، أو بدوام جزئي حسب الحاجة. تواصلوا معنا لمعرفة البرنامج المناسب.",
      ),
    ],
    [
      t("هل تشارك الأسرة في المتابعة؟"),
      t(
        "الأسرة شريك أساسي في رحلة الطفل. يحرص الفريق على التواصل معكم ومناقشة مسار المواكبة والاحتياجات بانتظام.",
      ),
    ],
    [
      t("أين يوجد المركز؟"),
      t(
        "يوجد مركز سنا في القنيطرة، المملكة المغربية. اتصلوا بنا أو تواصلوا عبر واتساب للحصول على تفاصيل الوصول.",
      ),
    ],
  ];
  return (
    <section className="section container faq-section">
      <div>
        <span className="eyebrow">
          <span />
          {t("نجيب عن أسئلتكم")}
        </span>
        <h2>
          {t("لنأخذ الخطوة الأولى")}
          <br />
          {t("بكل اطمئنان.")}
        </h2>
        <Link to="/contact" className="text-link">
          {t("لديك سؤال آخر؟ تواصل معنا")}
          <ArrowLeft size={17} />
        </Link>
      </div>
      <div className="faq-list">
        {items.map(([q, a], i) => (
          <div className={"faq-item " + (open === i ? "expanded" : "")} key={q}>
            <h3>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={"faq-" + i}
              >
                {t(q)}
                {open === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
            </h3>
            <div id={"faq-" + i} hidden={open !== i}>
              <p>{t(a)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Services() {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/services");
  const [params, setParams] = useSearchParams();
  const selected = params.get("category");
  const filter = Object.hasOwn(categories, selected) ? selected : "all";
  const setFilter = (value) =>
    setParams(
      value === "all"
        ? {}
        : {
            category: value,
          },
      {
        replace: true,
      },
    );
  const [search, setSearch] = useState("");
  const matches = (item) =>
    (filter === "all" || item.category === filter) &&
    (item.name + " " + item.french + " " + item.description)
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase());
  return (
    <>
      <PageIntro
        eyebrow={t("رعاية متكاملة")}
        title={t("خدمات علاجية وتربوية متكاملة.")}
        description={t(
          "من التقييم والمواكبة إلى التعلم والحياة اليومية، نعمل معاً لبناء مسار يناسب طفلكم.",
        )}
      />
      <section className="container page-section">
        <div className="services-toolbar">
          <label className="service-search">
            <Search size={18} />
            <input
              type="search"
              aria-label={t("البحث عن خدمة")}
              placeholder={t("ابحث عن خدمة أو تخصص…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <p className="result-count" aria-live="polite">
            {t(
              data ? `${data.filter(matches).length} خدمة` : t("جارٍ التحميل…"),
            )}
          </p>
        </div>
        <div className="filters" aria-label={t("تصفية الخدمات")}>
          {Object.entries(categories).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key ? "active" : ""}
              aria-pressed={filter === key}
            >
              {t(value)}
            </button>
          ))}
        </div>
        {data ? (
          <div className="services-grid">
            {!data.some(matches) && (
              <div className="empty-state">
                <Search size={28} />
                <h3>{t("لا توجد خدمات مطابقة")}</h3>
                <p>{t("جرب كلمة أخرى أو استعرض جميع التخصصات.")}</p>
                <button
                  className="button ghost"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  {t("عرض جميع الخدمات")}
                </button>
              </div>
            )}
            {data.filter(matches).map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        ) : (
          <Status error={error} reload={reload} />
        )}
        <div className="info-strip">
          <HandHeart />
          <p>
            {t("لست متأكداً من الخدمة المناسبة؟")}{" "}
            <strong>{t("نحن هنا لمساعدتك في الخطوة الأولى.")}</strong>
          </p>
          <Link to="/contact" className="text-link">
            {t("تواصل معنا")}
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>
      <CTA />
    </>
  );
}
function About() {
  const { t, language } = useI18n();
  return (
    <>
      <PageIntro
        eyebrow={t("تعرفوا على سنا")}
        title={t("مركز سنا متعدد التخصصات.")}
        description={t(
          "مركز سنا متعدد التخصصات، فضاء للرعاية والتعلم والدمج في القنيطرة.",
        )}
      />
      <section className="container about-grid page-section">
        <div className="about-photo">
          <img
            src="/images/img3.jpeg"
            alt={t("مدخل مركز سنا متعدد التخصصات")}
          />
        </div>
        <div className="about-copy">
          <span className="eyebrow">
            <span />
            {t("رسالتنا")}
          </span>
          <h2>
            {t("كل طفل يستحق")}
            <br />
            {t("أن يجد طريقه.")}
          </h2>
          <p>
            {t(
              "نرافق الأطفال والشباب من ذوي الاحتياجات الخاصة، من خلال خدمات علاجية وتربوية وأنشطة متنوعة في بيئة آمنة وداعمة.",
            )}
          </p>
          <p>
            {t(
              "يجمع فريقنا تخصصات متعددة للعمل مع الأسرة، ووضع خطة فردية تراعي قدرات الطفل واحتياجاته ووتيرة تطوره.",
            )}
          </p>
          <div className="values-row">
            <span>
              <Heart />
              {t("رعاية إنسانية")}
            </span>
            <span>
              <Users />
              {t("شراكة مع الأسرة")}
            </span>
            <span>
              <Sprout />
              {t("نمو مستمر")}
            </span>
          </div>
        </div>
      </section>
      <section className="soft-section">
        <div className="container section">
          <SectionHeading
            tag={t("احتياجات نرافقها")}
            title={t("اهتمام يتسع للاختلاف.")}
            description={t(
              "مواكبة متخصصة تُحدد بعد التعرف على احتياجات كل حالة.",
            )}
          />
          <div className="conditions">
            {[
              t("اضطراب طيف التوحد"),
              t("الإعاقة الذهنية"),
              t("فرط الحركة وتشتت الانتباه"),
              t("صعوبات التعلم والتواصل"),
              t("اضطرابات السلوك والحركة"),
            ].map((s) => (
              <div key={s}>
                <Check size={17} />
                {t(s)}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          tag={t("فريق المركز")}
          title={t("فريق متعدد التخصصات.")}
          description={t("تعرفوا على فريق المركز الذي يرافق الأطفال وأسرهم.")}
        />
        <TeamGrid />
      </section>
      <CTA />
    </>
  );
}
function Gallery() {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/gallery");
  const [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState(null);
  const dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const close = () => {
    setSelected(null);
    trigger.current?.focus();
  };
  return (
    <>
      <PageIntro
        eyebrow={t("حياة المركز")}
        title={t("فضاءات المركز وأنشطته.")}
        description={t(
          "لمحات من فضاءاتنا ولحظات التعلم والمشاركة داخل مركز سنا.",
        )}
      />
      <section className="container page-section">
        <div className="filters" aria-label={t("تصفية الصور")}>
          {Object.entries(galleryCategories).map(([key, value]) => (
            <button
              key={key}
              aria-pressed={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {t(value)}
            </button>
          ))}
        </div>
        {data ? (
          <div className="gallery-grid">
            {data
              .filter((i) => filter === "all" || i.category === filter)
              .map((i) => (
                <button
                  key={i.id}
                  className="gallery-item"
                  onClick={(e) => {
                    trigger.current = e.currentTarget;
                    setSelected(i);
                  }}
                >
                  <img src={i.url} alt={t(i.title)} loading="lazy" />
                  <span>
                    <span>
                      {t(i.title)}
                      <small>{t(galleryCategories[i.category])}</small>
                    </span>
                    <Expand size={19} />
                  </span>
                </button>
              ))}
            {!data.filter((i) => filter === "all" || i.category === filter)
              .length && (
              <p className="empty-state">
                {t("لا توجد صور في هذا التصنيف بعد.")}
              </p>
            )}
          </div>
        ) : (
          <Status error={error} reload={reload} />
        )}
      </section>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={t(selected?.title || t("معرض الصور"))}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {selected && (
          <>
            <button
              className="close-dialog"
              onClick={close}
              aria-label={t("إغلاق الصورة")}
            >
              <X />
            </button>
            <img src={selected.url} alt={t(selected.title)} />
            <p>{t(selected.title)}</p>
          </>
        )}
      </dialog>
      <CTA />
    </>
  );
}
function Articles() {
  const { t, language } = useI18n();
  const { data, error, reload } = useData("/articles");
  return (
    <>
      <PageIntro
        eyebrow={t("مساحة للتواصل")}
        title={t("مقالات ومستجدات المركز.")}
        description={t(
          "تعرفوا أكثر على المركز، وطريقة المواكبة، والحياة اليومية في سنا.",
        )}
      />
      <section className="container page-section">
        {data ? (
          <div className="article-grid">
            {data.map((a) => (
              <article className="article-card" key={a.id}>
                <Link to={"/articles/" + a.id}>
                  <img src={a.image} alt="" loading="lazy" />
                  <div>
                    <span className="eyebrow">{t(a.category)}</span>
                    <h2>{t(a.title)}</h2>
                    <p>{t(a.excerpt)}</p>
                    <span className="text-link">
                      {t("اقرأ المزيد")}
                      <ArrowLeft size={18} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
            {!data.length && (
              <p className="empty-state">
                {t("ترقبوا مستجدات المركز قريباً.")}
              </p>
            )}
          </div>
        ) : (
          <Status error={error} reload={reload} />
        )}
      </section>
      <CTA />
    </>
  );
}
function Article() {
  const { t, language } = useI18n();
  const { id } = useParams();
  const { data, error, reload } = useData("/articles/" + id);
  if (!data)
    return (
      <div className="container page-section">
        <Status error={error} reload={reload} />
        <Link to="/articles" className="text-link">
          {t("العودة إلى المقالات")}
        </Link>
      </div>
    );
  return (
    <article className="container article-detail">
      <Link className="text-link" to="/articles">
        <ArrowRight size={17} />
        {t("جميع المقالات")}
      </Link>
      <span className="eyebrow">{t(data.category)}</span>
      <h1
        lang={data.content_language}
        dir={data.content_language === "ar" ? "rtl" : "ltr"}
      >
        {t(data.title)}
      </h1>
      <p className="article-lead">{t(data.excerpt)}</p>
      <img src={data.image} alt={t(data.title)} />
      {language === "fr" && data.content_language !== "fr" && (
        <p className="translation-notice">
          {t("هذا المقال متاح بالعربية حالياً.")}
        </p>
      )}
      <div
        className="article-body"
        lang={data.content_language}
        dir={data.content_language === "ar" ? "rtl" : "ltr"}
      >
        {data.body
          .split("\n")
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{t(p)}</p>
          ))}
      </div>
      <Link className="button" to="/contact">
        {t("تواصل مع المركز")}
        <ArrowUpLeft size={18} />
      </Link>
    </article>
  );
}
function Contact() {
  const { t, language } = useI18n();
  const [params] = useSearchParams();
  const { data: services, error: loadError, reload } = useData("/services");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  const success = useRef(null);
  useEffect(() => {
    if (reference) {
      success.current?.focus();
      success.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [reference]);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.consent = body.consent === "on";
    setError("");
    setBusy(true);
    try {
      const result = await api("/bookings", {
        method: "POST",
        body,
      });
      setReference(result.reference);
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow={t("نحن هنا من أجلكم")}
        title={t("تواصلوا معنا واطلبوا موعداً.")}
        description={t(
          "أخبرونا عن احتياجاتكم، وسيتواصل معكم فريق المركز لتنسيق اللقاء الأول.",
        )}
      />
      <section className="container contact-grid page-section">
        <aside>
          <div className="contact-card">
            <span className="service-icon">
              <MessageCircle size={27} />
            </span>
            <h2>{t("يسعدنا أن نستمع إليكم.")}</h2>
            <p>
              {t(
                "للاستفسار عن الخدمات أو حجز موعد، اختاروا الطريقة الأنسب لكم.",
              )}
            </p>
            <a href="tel:+212663777313">
              <Phone />
              <div>
                <small>{t("اتصل بنا")}</small>
                <strong dir="ltr">06 63 77 73 13</strong>
              </div>
              <ArrowUpLeft size={18} />
            </a>
            <div className="contact-detail">
              <MapPin />
              <div>
                <small>{t("تجدوننا في")}</small>
                <strong>{t("القنيطرة، المملكة المغربية")}</strong>
                <span>{t("تواصلوا معنا للحصول على تفاصيل الوصول.")}</span>
              </div>
            </div>
            <div className="contact-detail">
              <Clock />
              <div>
                <small>{t("أوقات الاستقبال")}</small>
                <strong>{t("الإثنين – الجمعة")}</strong>
                <span>{t("من 9:00 صباحاً إلى 4:00 مساءً")}</span>
              </div>
            </div>
            <a
              className="button ghost"
              href="https://wa.me/212663777313"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              {t("تواصل عبر واتساب")} <ArrowUpLeft size={18} />
            </a>
          </div>
          <p className="privacy-note">
            <ShieldCheck size={18} />
            {t("معلوماتكم مخصصة لمتابعة طلبكم من طرف إدارة المركز.")}
          </p>
        </aside>
        {reference ? (
          <div className="booking-success" tabIndex={-1} ref={success}>
            <CheckCircle2 size={58} />
            <span className="eyebrow">{t("تم استلام طلبكم")}</span>
            <h2>{t("تم تسجيل طلب الموعد بنجاح.")}</h2>
            <p>
              {t(
                "سيتواصل معكم فريق المركز لتحديد موعد مناسب. الموعد غير مؤكد إلى حين التواصل معكم.",
              )}
            </p>
            <div className="reference">
              {t("مرجع طلبكم")}
              <strong dir="ltr">{t(reference)}</strong>
            </div>
            <button className="button" onClick={() => setReference("")}>
              {t("إرسال طلب آخر")}
            </button>
            <Link className="text-link" to="/">
              {t("العودة إلى الرئيسية")}
              <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <form className="booking-form" onSubmit={submit}>
            <div className="form-heading">
              <span className="eyebrow">{t("استمارة التواصل")}</span>
              <h2>{t("طلب موعد")}</h2>
              <p>{t("الحقول المعلّمة بـ * مطلوبة.")}</p>
            </div>
            <div className="form-grid">
              <h3 className="form-section-title">
                <span>01</span>
                {t("بيانات الأسرة والمستفيد")}
              </h3>
              <label>
                {t("اسم ولي الأمر *")}
                <input
                  name="parent_name"
                  autoComplete="name"
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder={t("الاسم الكامل لولي الأمر")}
                />
              </label>
              <label>
                {t("رقم الهاتف *")}
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  dir="ltr"
                  required
                  pattern="[+0-9 ()-]{10,20}"
                  maxLength={20}
                  placeholder="06 00 00 00 00"
                />
              </label>
              <label>
                {t("اسم الطفل أو المستفيد *")}
                <input
                  name="child_name"
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder={t("الاسم والنسب")}
                />
              </label>
              <label>
                {t("تاريخ الازدياد *")}
                <input
                  name="birth_date"
                  type="date"
                  required
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <h3 className="form-section-title">
                <span>02</span>
                {t("تفاصيل الموعد")}
              </h3>
              <label>
                {t("الخدمة المطلوبة *")}
                {services ? (
                  <select
                    name="service_id"
                    defaultValue={params.get("service") || ""}
                    required
                  >
                    <option value="" disabled>
                      {t("اختر الخدمة")}
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {t(s.name)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Status error={loadError} reload={reload} />
                )}
              </label>
              <label>
                {t("التاريخ المفضل")}
                <span className="optional">{t("(اختياري)")}</span>
                <input
                  name="preferred_date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label className="full-width">
                {t("رسالة للفريق")}
                <span className="optional">{t("(اختياري)")}</span>
                <textarea
                  name="message"
                  rows={4}
                  maxLength={2000}
                  placeholder={t("شاركنا ما تود أن نعرفه قبل اللقاء…")}
                />
              </label>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" name="consent" required />
              <span>
                {t(
                  "أوافق على استخدام هذه المعلومات للتواصل معي بخصوص طلب الموعد. *",
                )}
              </span>
            </label>
            {error && (
              <p className="error-message" role="alert">
                {t(error)}
              </p>
            )}
            <button
              className="button submit-button"
              disabled={busy || !services}
              type="submit"
            >
              {t(busy ? t("جارٍ إرسال الطلب…") : t("إرسال طلب الموعد"))}
              <ArrowUpLeft size={18} />
            </button>
            <p className="form-note">
              {t("هذا طلب أولي. يؤكد فريق المركز الموعد معكم عبر الهاتف.")}
            </p>
          </form>
        )}
      </section>
    </>
  );
}
function NotFound() {
  const { t, language } = useI18n();
  return (
    <div className="container not-found">
      <span className="eyebrow">404</span>
      <h1>{t("يبدو أن الطريق تغيّر.")}</h1>
      <p>{t("هذه الصفحة غير موجودة. يمكنكم العودة إلى البداية.")}</p>
      <Link to="/" className="button">
        {t("العودة إلى الرئيسية")}
        <ArrowLeft size={18} />
      </Link>
    </div>
  );
}
export default function App() {
  const { t, language } = useI18n();
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:id" element={<Article />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/*" element={<Admin />} />
      </Routes>
    </>
  );
}
