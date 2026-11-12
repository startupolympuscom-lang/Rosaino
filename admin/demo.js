'use strict';
const KEY = 'rosaino_operations_workspace_v1';
try {
  if (!localStorage.getItem(KEY) && localStorage.getItem('rosaino-operations-demo-v1')) {
    localStorage.setItem(KEY, localStorage.getItem('rosaino-operations-demo-v1'));
  }
} catch {}
const SESSION_KEY = 'rosaino_admin_session';
const SAAS_LANG_KEY = 'rosaino_saas_lang';

const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (v, l = currentLang) => {
  const curr = l === 'ar' ? 'د.م.' : 'MAD';
  const formatted = new Intl.NumberFormat(l === 'en' ? 'en-US' : 'fr-MA', { maximumFractionDigits: 0 }).format(v);
  return l === 'ar' ? `${formatted} ${curr}` : `${formatted} ${curr}`;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

let currentLang = localStorage.getItem(SAAS_LANG_KEY) || 'fr';

const I18N = {
  fr: {
    flag: 'FR',
    name: 'Français',
    dir: 'ltr',
    overview: 'Vue d\'ensemble',
    guide: 'Guide de la plateforme',
    orders: 'Commandes & Prospects',
    analytics: 'Analytique',
    calls: 'Centre d\'appels',
    routing: 'Routage des prospects',
    shipping: 'Expédition & Colis',
    carriers: 'Transporteurs',
    products: 'Produits & Stock',
    store: 'Connexion boutique',
    cms: 'CMS Page Produit',
    suppliers: 'Fournisseurs & Bons',
    finance: 'Comptabilité COD',
    reconciliation: 'Audit Transporteurs',
    reports: 'Rapports & ROAS',
    stores: 'Boutiques & Médias',
    integrations: 'Intégrations & Supabase',
    team: 'Équipe & Rôles',
    security: 'Sécurité & audit',
    settings: 'Paramètres',
    back_to_store: 'Retour à la boutique ↗',
    sign_out: 'Déconnexion',
    switch_role: 'Changer de rôle',
    preview_landing: 'Aperçu Page Produit ↗',
    save_cms: 'Enregistrer le CMS',
    save_success: 'Modifications du CMS enregistrées !',
    drag_drop_title: 'Constructeur Glisser-Déposer & Sections',
    drag_drop_hint: 'Glissez les poignées pour réordonner les blocs, cliquez sur l\'œil pour afficher/masquer.',
    upload_image: 'Téléverser une image',
    upload_hint: 'Glissez-déposez une image ou cliquez pour parcourir',
    presets: 'Préréglages de conversion',
    device_desktop: 'Bureau',
    device_mobile: 'Mobile',
    device_tablet: 'Tablette',
    target_language: 'Langue de la page produit :',
    auto_translate: 'Charger les textes en',
    live_preview: 'Aperçu en direct (Temps Réel)',
    open_public: 'Ouvrir en plein écran ↗'
  },
  en: {
    flag: 'EN',
    name: 'English',
    dir: 'ltr',
    overview: 'Overview',
    guide: 'Platform guide',
    orders: 'Leads & Orders',
    analytics: 'Analytics',
    calls: 'Call Center',
    routing: 'Lead Routing',
    shipping: 'Shipping & Labels',
    carriers: 'Carriers',
    products: 'Products & Stock',
    store: 'Store connection',
    cms: 'Landing Page CMS',
    suppliers: 'Suppliers & POs',
    finance: 'Finance Ledger',
    reconciliation: 'Courier Audit',
    reports: 'Reports & ROAS',
    stores: 'Stores & Media',
    integrations: 'Integrations & Supabase',
    team: 'Team & RBAC',
    security: 'Security & audit',
    settings: 'Settings',
    back_to_store: 'Back to storefront ↗',
    sign_out: 'Sign out',
    switch_role: 'Switch role',
    preview_landing: 'Preview Landing Page ↗',
    save_cms: 'Save Landing CMS',
    save_success: 'Landing Page CMS saved! Public page updated.',
    drag_drop_title: 'Drag & Drop Section Builder',
    drag_drop_hint: 'Drag the grip handles to reorder blocks, click the eye to show/hide sections.',
    upload_image: 'Upload Image File',
    upload_hint: 'Drag & drop your product picture here, or click to browse',
    presets: 'Conversion Presets',
    device_desktop: 'Desktop',
    device_mobile: 'Mobile',
    device_tablet: 'Tablet',
    target_language: 'Product Landing Language:',
    auto_translate: 'Load copy in',
    live_preview: 'Live Interactive Preview',
    open_public: 'Open Full Screen ↗'
  },
  ar: {
    flag: 'AR',
    name: 'العربية',
    dir: 'rtl',
    overview: 'نظرة عامة',
    guide: 'دليل المنصة',
    orders: 'الطلبيات والعملاء',
    analytics: 'التحليلات',
    calls: 'مركز الاتصال والتأكيد',
    routing: 'توزيع الطلبيات',
    shipping: 'الشحن والتوصيل',
    carriers: 'شركات التوصيل',
    products: 'المنتجات والمخزون',
    store: 'ربط المتجر',
    cms: 'نظام صفحات الهبوط (CMS)',
    suppliers: 'الموردون وفواتير الشراء',
    finance: 'المحاسبة وتحصيل COD',
    reconciliation: 'تدقيق شركات التوصيل',
    reports: 'التقارير والعائد الإعلاني',
    stores: 'المتجر والوسائط',
    integrations: 'الربط وقاعدة البيانات',
    team: 'فريق العمل والصلاحيات',
    security: 'الأمان وسجل التدقيق',
    settings: 'الإعدادات',
    back_to_store: 'العودة للمتجر ↗',
    sign_out: 'تسجيل الخروج',
    switch_role: 'تبديل الدور',
    preview_landing: 'معاينة صفحة المنتج ↗',
    save_cms: 'حفظ صفحة الهبوط',
    save_success: 'تم حفظ تعديلات صفحة الهبوط بنجاح!',
    drag_drop_title: 'محرر السحب والإفلات وتنسيق الأقسام',
    drag_drop_hint: 'اسحب المقبض لإعادة ترتيب الأقسام، واضغط على أيقونة العين لإظهار أو إخفاء أي قسم.',
    upload_image: 'رفع صورة المنتج مباشرة',
    upload_hint: 'اسحب وأفلت صورة المنتج هنا، أو اضغط للاختيار من جهازك',
    presets: 'قوالب جاهزة للتحويل السريع',
    device_desktop: 'كمبيوتر',
    device_mobile: 'هاتف',
    device_tablet: 'لوحي',
    target_language: 'لغة صفحة المنتج المعلنة:',
    auto_translate: 'توليد النصوص والترجمة إلى',
    live_preview: 'المعاينة التفاعلية المباشرة',
    open_public: 'فتح في نافذة كاملة ↗'
  }
};

function t(k) {
  return I18N[currentLang]?.[k] || I18N.fr[k] || I18N.en[k] || k;
}

function switchLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem(SAAS_LANG_KEY, lang);
  document.documentElement.dir = I18N[lang].dir;
  document.documentElement.lang = lang;

  const flagEl = $('#current-lang-flag');
  const labelEl = $('#current-lang-label');
  if (flagEl) flagEl.textContent = I18N[lang].flag;
  if (labelEl) labelEl.textContent = I18N[lang].name;

  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const wrap = $('#lang-selector-wrap');
  if (wrap) wrap.classList.remove('open');

  toast(`${t('target_language')} ${I18N[lang].name} (${I18N[lang].flag})`);
  render();
}

// Initial language setup on document load
try {
  document.documentElement.dir = I18N[currentLang]?.dir || 'ltr';
  document.documentElement.lang = currentLang;
} catch {}

let previewDevice = 'desktop';
let visualEditMode = true;
let draggedSectionId = null;
let draggedCodFieldId = null;
let expandedSections = new Set(['hero_media', 'pricing_bundles', 'cod_checkout']);
let expandedCodFields = new Set(['f_name', 'f_phone', 'f_city']);

const DEFAULT_COD_FIELDS = [
  { id: 'f_name', key: 'name', label: 'Nom complet', placeholder: 'ex. Fatima Zahra Bennani', type: 'text', required: true, enabled: true },
  { id: 'f_phone', key: 'phone', label: 'Numéro de téléphone marocain', placeholder: '06 12 34 56 78', type: 'tel', required: true, enabled: true, help: 'Notre agent vous appelle pour valider la livraison.' },
  { id: 'f_city', key: 'city', label: 'Ville', type: 'select', required: true, enabled: true, options: 'Casablanca, Rabat, Marrakech, Tanger, Fès, Meknès, Agadir, Kénitra, Tétouan, Oujda, Mohammédia, El Jadida, Autre ville au Maroc' },
  { id: 'f_address', key: 'address', label: 'Adresse de livraison & quartier', placeholder: 'Rue, numéro de porte, quartier ou repère', type: 'textarea', required: true, enabled: true },
  { id: 'f_notes', key: 'notes', label: 'Instructions de livraison (Optionnel)', placeholder: 'ex. Appeler avant d\'arriver, laisser au concierge', type: 'text', required: false, enabled: true },
  { id: 'f_whatsapp', key: 'whatsapp', label: 'Numéro WhatsApp (si différent)', placeholder: '06 .. .. .. ..', type: 'tel', required: false, enabled: false },
  { id: 'f_phone2', key: 'phone2', label: 'Deuxième numéro de téléphone', placeholder: '06 / 07 .. .. .. ..', type: 'tel', required: false, enabled: false },
  { id: 'f_delivery_time', key: 'delivery_time', label: 'Créneau horaire de livraison préféré', type: 'select', required: false, enabled: false, options: 'Matin (09h-13h), Après-midi (14h-19h), N\'importe quand / Flexible' }
];

const CMS_SECTION_DEFS = {
  announcement: {
    icon: '📢',
    title: { fr: 'Barre d\'Annonce Supérieure', en: 'Top Announcement Bar', ar: 'شريط الإعلانات العلوي' },
    desc: { fr: 'Message d\'accroche et offre spéciale tout en haut', en: 'Header top marquee & special promo notice', ar: 'رسالة العرض الخاص في أعلى الصفحة' }
  },
  hero_media: {
    icon: '🖼️',
    title: { fr: 'Images du Produit & Galerie (Upload)', en: 'Product Media & Image Upload', ar: 'صور المنتج والتحميل المباشر' },
    desc: { fr: 'Téléversez vos photos par glisser-déposer sans lien externe', en: 'Drag & drop image upload without external links', ar: 'رفع الصور بالسحب والإفلات بدون روابط خارجية' }
  },
  hook_and_copy: {
    icon: '✨',
    title: { fr: 'Titre d\'Accroche & Description (SEO)', en: 'Headline & Value Proposition (SEO)', ar: 'عنوان الجذب والوصف الرئيسي' },
    desc: { fr: 'Titre de page, accroche principale et sous-titre rassurant', en: 'Browser page title, primary hook and reassuring subtext', ar: 'عنوان المتصفح، الجملة التسويقية والوصف' }
  },
  pricing_bundles: {
    icon: '🏷️',
    title: { fr: 'Tableau des Prix & Packs Quantités', en: 'Pricing Table & Quantity Bundles', ar: 'جدول الأسعار وباقات الكمية' },
    desc: { fr: 'Packs 1, 2 et 3 pièces pour augmenter le panier moyen (AOV)', en: 'Single, Duo, and Family bundles to maximize average order value', ar: 'عروض القطعة والقطعتين و3 قطع لمضاعفة المبيعات' }
  },
  urgency_bar: {
    icon: '⏱️',
    title: { fr: 'Urgence & Compte à Rebours Flash', en: 'Urgency Timer & Stock Scarcity Bar', ar: 'شريط الاستعجال والعد التنازلي' },
    desc: { fr: 'Déclencheurs psychologiques de rareté et avis clients', en: 'Countdown clock and units-left alert to drive instant orders', ar: 'مؤقت العرض المحدود والكمية المتبقية' }
  },
  cod_checkout: {
    icon: '📝',
    title: { fr: 'Formulaire Commande COD Express & Champs', en: 'Express COD Checkout Form & Fields Builder', ar: 'نموذج الطلب السريع (COD) وإعداد الحقول' },
    desc: { fr: 'Personnalisation des champs, ordre par glisser-déposer et bouton WhatsApp', en: 'Customizable form fields, drag-and-drop order, and COD button text', ar: 'تخصيص وترتيب حقول النموذج بالسحب وزر الواتساب' }
  },
  features: {
    icon: '🌟',
    title: { fr: 'Points Forts & Avantages Clés', en: 'Feature Highlights & Benefits', ar: 'المميزات ونقاط القوة' },
    desc: { fr: 'Blocs d\'avantages personnalisables avec icônes et descriptions', en: 'Custom benefit cards with icons, add/remove, and reordering', ar: 'بطاقات مميزات المنتج وأيقوناتها القابلة للتعديل والإضافة' }
  },
  reviews: {
    icon: '⭐',
    title: { fr: 'Témoignages & Avis Clients Vérifiés', en: 'Verified Customer Testimonials', ar: 'آراء وتقييمات العملاء' },
    desc: { fr: 'Preuve sociale avec nom, ville marocaine et commentaire', en: 'Social proof from Moroccan buyers with city and stars', ar: 'تقييمات المشترين المغاربة مع المدينة والنجوم' }
  },
  faqs: {
    icon: '❓',
    title: { fr: 'Questions Fréquentes (FAQ Paiement)', en: 'Cash on Delivery FAQs', ar: 'الأسئلة الشائعة حول الدفع والتوصيل' },
    desc: { fr: 'Levée des doutes sur l\'inspection, la livraison et le cash', en: 'Overcome buyer doubts about parcel inspection and cash terms', ar: 'إجابات على أسئلة المعاينة وسرعة التوصيل' }
  }
};

const CMS_TEMPLATES = {
  fr: p => {
    const price = Number(p.price) || 390;
    const regularPrice = Math.round(price * 1.35 / 10) * 10;
    return {
      language: 'fr',
      pageTitle: `${p.name} — Boutique Officielle Rosaino`,
      headline: `Découvrez l'élégance et la qualité de ${p.name}`,
      subtitle: p.desc || 'Matériaux nobles, finitions artisanales et confort tactile livrés directement à votre porte partout au Maroc.',
      announcement: '⚡ Offre Spéciale Ramadan & Aïd · Livraison Express Gratuite Partout au Maroc · Paiement 100% à la Livraison (COD)',
      badgeText: `🔥 OFFRE LIMITÉE - ÉCONOMISEZ ${regularPrice - price} MAD`,
      heroImage: p.image || '/assets/collection.png',
      secondaryImage: '/assets/pattern.png',
      galleryImage3: '/assets/ribbon.png',
      galleryImages: [p.image || '/assets/collection.png', '/assets/pattern.png', '/assets/ribbon.png'],
      pricingTableEnabled: true,
      checkoutHeadline: 'Finalisez Votre Commande ci-dessous',
      checkoutSubtitle: 'Payez en espèces au livreur à votre porte dès réception.',
      submitButtonText: 'CONFIRMER LA COMMANDE (PAIEMENT À LA LIVRAISON) ➔',
      supportPhone: '212600000000',
      tiers: [
        { qty: 1, title: '1 Pièce (Pack Solo)', price: price, originalPrice: regularPrice, badge: 'Offre Standard', savings: `Économisez ${regularPrice - price} MAD` },
        { qty: 2, title: '2 Pièces (Pack Duo)', price: Math.round(price * 1.75 / 10) * 10, originalPrice: regularPrice * 2, badge: 'LE PLUS POPULAIRE 🔥', savings: `Économisez ${regularPrice * 2 - Math.round(price * 1.75 / 10) * 10} MAD` },
        { qty: 3, title: '3 Pièces (Pack Famille + Cadeau)', price: Math.round(price * 2.35 / 10) * 10, originalPrice: regularPrice * 3, badge: 'MEILLEURE VALEUR 🏆 + Cadeau Offert', savings: `Économisez ${regularPrice * 3 - Math.round(price * 2.35 / 10) * 10} MAD` }
      ],
      features: [
        { title: 'Confection Artisanale', desc: 'Fabriqué à partir de matériaux rigoureusement sélectionnés pour durer dans le temps.' },
        { title: 'Livraison Express au Maroc', desc: 'Expédition soignée à domicile en 24 à 48 heures dans toutes les villes du Royaume.' },
        { title: 'Zéro Risque · Paiement à la Livraison', desc: 'Aucune carte bancaire requise en ligne. Inspectez votre colis avant de régler.' },
        { title: 'Échange Garanti 14 Jours', desc: 'Assistance client dédiée sur WhatsApp disponible pour tout échange ou question.' }
      ],
      urgencyEnabled: true,
      countdownHours: 5,
      stockLeft: Math.min(12, Math.max(3, p.stock || 8)),
      rating: '4.9',
      reviewCount: 184,
      reviews: [
        { name: 'Kenza Alaoui', city: 'Casablanca', rating: 5, comment: 'Commandé hier matin et reçu aujourd’hui à Maarif ! Conforme à la description, qualité superbe et le livreur a appelé avant.' },
        { name: 'Youssef El Amrani', city: 'Rabat', rating: 5, comment: `Très satisfait du ${p.name}. Emballage soigné et le paiement en espèces à la livraison donne une totale tranquillité d’esprit.` }
      ],
      faqs: [
        { q: 'Comment fonctionne le paiement à la livraison (COD) ?', a: 'Vous remplissez simplement votre nom, téléphone et adresse ci-dessus. Notre agent vous appelle pour confirmer, et vous réglez en espèces au livreur dès réception de votre colis.' },
        { q: 'Puis-je ouvrir et inspecter le colis avant de payer ?', a: 'Oui, absolument ! Nous vous encourageons à vérifier le contenu et l’état du produit avant de remettre le montant au coursier.' },
        { q: 'Quels sont les délais de livraison ?', a: 'La livraison à Casablanca, Rabat, Marrakech, Tanger et Fès prend 24 à 48h. Les autres villes sont livrées sous 48 à 72h.' }
      ],
      codFields: JSON.parse(JSON.stringify(DEFAULT_COD_FIELDS))
    };
  },
  en: p => {
    const price = Number(p.price) || 390;
    const regularPrice = Math.round(price * 1.35 / 10) * 10;
    return {
      language: 'en',
      pageTitle: `${p.name} — Rosaino Official Store`,
      headline: `Experience the craft of ${p.name}`,
      subtitle: p.desc || 'Premium materials, quiet silhouettes, and tactile comfort delivered directly to your doorstep in Morocco.',
      announcement: '⚡ Special Ramadan & Eid Offer · Free Shipping Across Morocco · 100% Cash on Delivery',
      badgeText: `🔥 LIMITED OFFER - SAVE ${regularPrice - price} MAD`,
      heroImage: p.image || '/assets/collection.png',
      secondaryImage: '/assets/pattern.png',
      galleryImage3: '/assets/ribbon.png',
      galleryImages: [p.image || '/assets/collection.png', '/assets/pattern.png', '/assets/ribbon.png'],
      pricingTableEnabled: true,
      checkoutHeadline: 'Complete Your Order Below',
      checkoutSubtitle: 'Pay with Cash to the courier at your doorstep upon arrival.',
      submitButtonText: 'CONFIRM CASH ON DELIVERY ORDER ➔',
      supportPhone: '212600000000',
      tiers: [
        { qty: 1, title: '1 Piece (Single Pack)', price: price, originalPrice: regularPrice, badge: 'Standard Offer', savings: `Save ${regularPrice - price} MAD` },
        { qty: 2, title: '2 Pieces (Duo Pack)', price: Math.round(price * 1.75 / 10) * 10, originalPrice: regularPrice * 2, badge: 'MOST POPULAR 🔥', savings: `Save ${regularPrice * 2 - Math.round(price * 1.75 / 10) * 10} MAD` },
        { qty: 3, title: '3 Pieces (Family Pack + Gift)', price: Math.round(price * 2.35 / 10) * 10, originalPrice: regularPrice * 3, badge: 'BEST VALUE 🏆 + Free Gift', savings: `Save ${regularPrice * 3 - Math.round(price * 2.35 / 10) * 10} MAD` }
      ],
      features: [
        { title: 'Artisan Craftsmanship', desc: 'Constructed from carefully selected, honest materials built to last.' },
        { title: 'Express Moroccan Delivery', desc: 'Doorstep dispatch in 24 to 48 hours to all Moroccan cities via trusted couriers.' },
        { title: 'Zero Risk · Pay Upon Arrival', desc: 'No online cards required. Inspect your parcel before handing cash to the driver.' },
        { title: '14-Day Hassle-Free Exchange', desc: 'Dedicated WhatsApp customer support team standing by for any sizing or swap needs.' }
      ],
      urgencyEnabled: true,
      countdownHours: 5,
      stockLeft: Math.min(12, Math.max(3, p.stock || 8)),
      rating: '4.9',
      reviewCount: 184,
      reviews: [
        { name: 'Kenza Alaoui', city: 'Casablanca', rating: 5, comment: 'Ordered yesterday morning and received it today in Maarif! Exactly as described, high quality finish and driver called before arrival.' },
        { name: 'Youssef El Amrani', city: 'Rabat', rating: 5, comment: `Very pleased with the ${p.name}. Packaging was neat, and paying cash on delivery gave total peace of mind.` }
      ],
      faqs: [
        { q: 'How does Cash on Delivery (COD) work?', a: 'You simply place your order by filling your name, phone, and city above. Our confirmation agent calls to confirm, and you pay cash to the courier when they hand you the package.' },
        { q: 'Can I open and check the box before paying?', a: 'Yes! We encourage all customers to inspect the contents and verify the condition before paying the courier.' },
        { q: 'How fast is delivery to my city?', a: 'Deliveries to Casablanca, Rabat, Marrakech, Tangier, and Fès take 24–48 hours. Other cities take 48–72 hours.' }
      ],
      codFields: [
        { id: 'f_name', key: 'name', label: 'Full Name', placeholder: 'e.g. Fatima Zahra Bennani', type: 'text', required: true, enabled: true },
        { id: 'f_phone', key: 'phone', label: 'Moroccan Phone Number', placeholder: '06 12 34 56 78', type: 'tel', required: true, enabled: true, help: 'Our agent calls to verify delivery.' },
        { id: 'f_city', key: 'city', label: 'City', type: 'select', required: true, enabled: true, options: 'Casablanca, Rabat, Marrakech, Tangier, Fès, Meknès, Agadir, Kenitra, Tetouan, Oujda, Mohammedia, El Jadida, Other City' },
        { id: 'f_address', key: 'address', label: 'Delivery Address & Neighborhood', placeholder: 'Street, door number, neighborhood or landmark', type: 'textarea', required: true, enabled: true },
        { id: 'f_notes', key: 'notes', label: 'Delivery Instructions (Optional)', placeholder: 'e.g. Call before arrival, leave with concierge', type: 'text', required: false, enabled: true },
        { id: 'f_whatsapp', key: 'whatsapp', label: 'WhatsApp Number (if different)', placeholder: '06 .. .. .. ..', type: 'tel', required: false, enabled: false },
        { id: 'f_phone2', key: 'phone2', label: 'Second Phone Number', placeholder: '06 / 07 .. .. .. ..', type: 'tel', required: false, enabled: false },
        { id: 'f_delivery_time', key: 'delivery_time', label: 'Preferred Delivery Time Slot', type: 'select', required: false, enabled: false, options: 'Morning (09am-01pm), Afternoon (02pm-07pm), Flexible / Anytime' }
      ]
    };
  },
  ar: p => {
    const price = Number(p.price) || 390;
    const regularPrice = Math.round(price * 1.35 / 10) * 10;
    return {
      language: 'ar',
      pageTitle: `${p.name} — المتجر الرسمي لروزينو`,
      headline: `اكتشف الجودة والفخامة اليومية مع ${p.name}`,
      subtitle: p.desc || 'خامات أصلية وتصميم مريح وعصري، يصلكم مباشرة إلى باب منزلكم في أي مدينة بالمغرب مع ضمان المعاينة.',
      announcement: '⚡ عرض خاص بمناسبة رمضان والعيد · توصيل سريع لجميع مدن المغرب · الدفع عند الاستلام 100%',
      badgeText: `🔥 عرض محدود - وفر ${regularPrice - price} درهم`,
      heroImage: p.image || '/assets/collection.png',
      secondaryImage: '/assets/pattern.png',
      galleryImage3: '/assets/ribbon.png',
      galleryImages: [p.image || '/assets/collection.png', '/assets/pattern.png', '/assets/ribbon.png'],
      pricingTableEnabled: true,
      checkoutHeadline: 'أدخل معلوماتك لتأكيد الطلب الآن',
      checkoutSubtitle: 'الدفع نقداً عند استلام طلبيتك من موزع الشحن عند باب منزلك.',
      submitButtonText: 'تأكيد الطلب والدفع عند الاستلام ➔',
      supportPhone: '212600000000',
      tiers: [
        { qty: 1, title: 'قطعة واحدة (الباقة الفردية)', price: price, originalPrice: regularPrice, badge: 'العرض الأساسي', savings: `توفير ${regularPrice - price} درهم` },
        { qty: 2, title: 'قطعتين (باقة التوفير المزدوجة)', price: Math.round(price * 1.75 / 10) * 10, originalPrice: regularPrice * 2, badge: 'الأكثر طلباً 🔥', savings: `توفير ${regularPrice * 2 - Math.round(price * 1.75 / 10) * 10} درهم` },
        { qty: 3, title: '3 قطع (باقة العائلة + هدية مجانية)', price: Math.round(price * 2.35 / 10) * 10, originalPrice: regularPrice * 3, badge: 'أفضل قيمة 🏆 + هدية مجانية', savings: `توفير ${regularPrice * 3 - Math.round(price * 2.35 / 10) * 10} درهم` }
      ],
      features: [
        { title: 'جودة حرفية استثنائية', desc: 'مصنوع من خامات ممتازة مختارة بعناية لتدوم وتوفر راحة فائقة.' },
        { title: 'توصيل سريع بالمغرب', desc: 'شحن إلى باب المنزل خلال 24 إلى 48 ساعة في جميع المدن المغربية.' },
        { title: 'بدون مخاطرة · الدفع عند الاستلام', desc: 'لا داعي للأداء بالبطاقة البنكية، افتح طردك وعاينه قبل الدفع للموزع.' },
        { title: 'ضمان الاستبدال 14 يوماً', desc: 'فريق دعم العملاء متواجد دائماً على واتساب للإجابة عن كل استفساراتكم.' }
      ],
      urgencyEnabled: true,
      countdownHours: 5,
      stockLeft: Math.min(12, Math.max(3, p.stock || 8)),
      rating: '4.9',
      reviewCount: 184,
      reviews: [
        { name: 'كنزة العلوي', city: 'الدار البيضاء', rating: 5, comment: 'طلبته أمس في الصباح واستلمته اليوم في المعاريف! جودة ممتازة تماماً كالوصف والموزع اتصل قبل المجيء.' },
        { name: 'يوسف العمراني', city: 'الرباط', rating: 5, comment: `منتج رائع جداً ${p.name}. التغليف متقن والدفع عند الاستلام يعطي راحة بال واطمئنان كبيرين.` }
      ],
      faqs: [
        { q: 'كيف يتم الدفع عند الاستلام (COD)؟', a: 'تقوم فقط بإدخال اسمك ورقم هاتفك ومدينتك في الأعلى، وسيتصل بك فريقنا لتأكيد العنوان، ثم تؤدي المبلغ نقداً للموزع عند استلام الطرد.' },
        { q: 'هل يمكنني فتح الطرد ومعاينته قبل الدفع؟', a: 'نعم بالتأكيد! نحن نضمن لك حق فتح الطرد والتأكد من سلامة المنتج ومطابقته قبل تسليم المبلغ للموزع.' },
        { q: 'ما هي مدة التوصيل لمدينتي؟', a: 'التوصيل للدار البيضاء، الرباط، مراكش، طنجة وفاس يستغرق 24 إلى 48 ساعة. باقي المدن المغربية بين 48 و72 ساعة.' }
      ],
      codFields: [
        { id: 'f_name', key: 'name', label: 'الاسم الكامل', placeholder: 'مثال: فاطمة الزهراء بناني', type: 'text', required: true, enabled: true },
        { id: 'f_phone', key: 'phone', label: 'رقم الهاتف المغربي', placeholder: '06 12 34 56 78', type: 'tel', required: true, enabled: true, help: 'سيتصل بك موظف التأكيد قبل إرسال الشحنة.' },
        { id: 'f_city', key: 'city', label: 'المدينة', type: 'select', required: true, enabled: true, options: 'الدار البيضاء, الرباط, مراكش, طنجة, فاس, مكناس, أكادير, القنيطرة, تطوان, وجدة, المحمدية, الجديدة, مدينة أخرى' },
        { id: 'f_address', key: 'address', label: 'عنوان التوصيل والحي', placeholder: 'الشارع، رقم الباب، اسم الحي أو معلم قريب', type: 'textarea', required: true, enabled: true },
        { id: 'f_notes', key: 'notes', label: 'ملاحظات التوصيل (اختياري)', placeholder: 'مثال: الاتصال قبل الوصول بنصف ساعة', type: 'text', required: false, enabled: true },
        { id: 'f_whatsapp', key: 'whatsapp', label: 'رقم الواتساب (إذا كان مختلفاً)', placeholder: '06 .. .. .. ..', type: 'tel', required: false, enabled: false },
        { id: 'f_phone2', key: 'phone2', label: 'رقم هاتف ثانٍ للتأكيد', placeholder: '06 / 07 .. .. .. ..', type: 'tel', required: false, enabled: false },
        { id: 'f_delivery_time', key: 'delivery_time', label: 'التوقيت المفضل للتسليم', type: 'select', required: false, enabled: false, options: 'الفترة الصباحية (09h-13h), بعد الزوال (14h-19h), في أي وقت / مرن' }
      ]
    };
  }
};

const statuses = ['New', 'Callback', 'Confirmed', 'In transit', 'Delivered', 'Returned', 'Cancelled', 'Spam'];

const DEFAULT_ROLES = {
  'Super Admin': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers', 'finance', 'reconciliation', 'reports', 'stores', 'integrations', 'team', 'audit', 'rbac_manage', 'settings'],
  'Admin': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers', 'finance', 'reconciliation', 'reports', 'stores', 'integrations', 'team', 'audit', 'settings'],
  'Operations manager': ['overview', 'orders', 'calls', 'routing', 'shipping', 'products', 'cms', 'suppliers', 'reconciliation', 'stores'],
  'Confirmation agent': ['calls'],
  'Finance viewer': ['overview', 'finance', 'reconciliation', 'reports']
};

const ALL_PERMISSIONS = [
  { id: 'overview', name: 'Overview', desc: 'Executive dashboard, KPI cards and daily charts' },
  { id: 'orders', name: 'Leads & Orders', desc: 'View, filter, edit status, import/export CSV' },
  { id: 'calls', name: 'Call Center', desc: 'Confirmation queues, call timer and call logging' },
  { id: 'routing', name: 'Lead Routing', desc: 'Configure matching rules and lead assignment' },
  { id: 'shipping', name: 'Shipping', desc: 'Dispatch orders, generate labels, record delivery/return' },
  { id: 'products', name: 'Products & Stock', desc: 'Add/edit products and adjust inventory levels' },
  { id: 'cms', name: 'Product Landing CMS', desc: 'Customize product landing pages, pricing tables, media, and generate ad links' },
  { id: 'suppliers', name: 'Suppliers & POs', desc: 'Manage suppliers, POs, and true landed costs' },
  { id: 'finance', name: 'Finance Ledger', desc: 'Track COD revenue, product costs, record expenses' },
  { id: 'reconciliation', name: 'Courier Audit', desc: 'Audit courier COD cash remittances, overdue funds & fee disputes' },
  { id: 'reports', name: 'Reports & ROAS', desc: 'Product performance and ad creative attribution' },
  { id: 'stores', name: 'Stores & Media', desc: 'Storefront channels, landing pages, brand assets' },
  { id: 'integrations', name: 'Integrations & Supabase', desc: 'Supabase cloud database and platform connectors' },
  { id: 'team', name: 'Team & RBAC', desc: 'View team members and operational availability' },
  { id: 'audit', name: 'Security & Audit', desc: 'View sign-in history and the audit trail of admin changes' },
  { id: 'rbac_manage', name: 'Users & RBAC Control', desc: 'Create/disable users, reset passwords, and edit role permissions' },
  { id: 'settings', name: 'Settings', desc: 'Workspace preferences and demo controls' }
];

const seed = () => ({
  products: [
    { id: 'p1', name: 'Wireless Headphones', sku: 'ROS-TECH-01', category: 'Electronics', price: 490, cost: 200, stock: 90, supplier: 'Atlas Trading', desc: 'A softer soundtrack for your day. A clean, over-ear silhouette in a warm neutral finish.', x: 7.05, y: 96.2, type: 'product' },
    { id: 'p2', name: 'Everyday Tote', sku: 'ROS-FASH-02', category: 'Fashion', price: 240, cost: 72, stock: 145, supplier: 'Casablanca Textiles', desc: 'Your daily carry, with a little Rosaino colour. A roomy tote featuring our signature flowing ribbon.', x: 31.8, y: 96.2, type: 'product' },
    { id: 'p3', name: 'Ceramic Table Lamp', sku: 'ROS-HOME-03', category: 'Home & Living', price: 390, cost: 162, stock: 12, supplier: 'Atlas Trading', desc: 'A warm corner starts here. A sculptural ceramic silhouette to bring a little calm to your space.', x: 56.45, y: 96.2, type: 'product' },
    { id: 'p4', name: 'Insulated Bottle', sku: 'ROS-LIFE-04', category: 'Sports & Outdoors', price: 220, cost: 80, stock: 68, supplier: 'Atlas Trading', desc: 'A companion for your everyday adventures. Rosaino midnight, finished with our colourful ribbon icon.', x: 81.05, y: 96.2, type: 'product' },
    { id: 'p5', name: 'Daily Care Edit', sku: 'ROS-CARE-05', category: 'Beauty & Care', price: 320, cost: 130, stock: 9, supplier: 'Care Collective', desc: 'An introduction to everyday care, with a coordinated collection for your daily routine.', x: 58.4, y: 65.3, type: 'category' },
    { id: 'p6', name: 'Little Discoveries Set', sku: 'ROS-KIDS-06', category: 'Kids & Toys', price: 290, cost: 100, stock: 44, supplier: 'Care Collective', desc: 'A playful collection of soft textures and colourful shapes for a world of little discoveries.', x: 93.3, y: 65.3, type: 'category' }
  ],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  currentUser: { id: 'usr_superadmin', name: 'Rosaino Super Admin', email: 'superadmin@rosaino.com', role: 'Super Admin' },
  agents: [
    { id: 'usr_superadmin', name: 'Rosaino Super Admin', email: 'superadmin@rosaino.com', role: 'Super Admin', status: 'Available' },
    { id: 'usr_admin', name: 'Operations Admin', email: 'admin@rosaino.com', role: 'Admin', status: 'Available' },
    { id: 'usr_ops', name: 'Lina Benali', email: 'operations@rosaino.com', role: 'Operations manager', status: 'Paused' },
    { id: 'usr_agent', name: 'Sara Amrani', email: 'agent@rosaino.com', role: 'Confirmation agent', status: 'Available' },
    { id: 'usr_finance', name: 'Tariq Mansouri', email: 'finance@rosaino.com', role: 'Finance viewer', status: 'Available' }
  ],
  orders: Array.from({ length: 36 }, (_, i) => {
    const p = [['p1', 490, 200], ['p2', 240, 72], ['p3', 390, 162], ['p4', 220, 80], ['p5', 320, 130], ['p6', 290, 100]][i % 6];
    const stat = ['Delivered', 'Delivered', 'Confirmed', 'New', 'In transit', 'Callback', 'Returned', 'New', 'Confirmed'][i % 9];
    const campaigns = [
      { campaign: 'Meta_WarmNeutral_Headphones', creative: 'vid_neutral_aesthetic_v1', source: 'Meta Ads' },
      { campaign: 'TikTok_DailyCarry_Tote', creative: 'tote_lifestyle_transition', source: 'TikTok Ads' },
      { campaign: 'Meta_MinimalHome_Decor', creative: 'lamp_night_glow_img', source: 'Meta Ads' },
      { campaign: 'Storefront_Direct', creative: 'organic_browse', source: 'Storefront' }
    ][i % 4];

    return {
      id: 'RS-' + (1024 + i),
      customer: ['Amal Benani', 'Karim Alami', 'Nadia Tazi', 'Omar Idrissi', 'Salma Mansour', 'Adam Chraibi'][i % 6],
      phone: '06' + (10 + (i % 6) * 11) + '203040',
      city: ['Casablanca', 'Rabat', 'Meknès', 'Marrakech', 'Fès', 'Tangier'][i % 6],
      address: `${10 + i * 2} Boulevard Al Massira, Apt ${i + 1}`,
      product: p[0],
      quantity: 1,
      amount: p[1],
      cost: p[2],
      status: stat,
      agent: i % 2 ? 'usr_agent' : 'usr_admin',
      source: campaigns.source,
      campaign: campaigns.campaign,
      creative: campaigns.creative,
      carrier: ['Digylog', 'OzoneExpress', 'AMEEX'][i % 3],
      date: '2026-09-' + String(22 + (i % 7)).padStart(2, '0'),
      notes: [],
      callback: '',
      shipping: 35,
      stockDeducted: ['In transit', 'Delivered', 'Returned'].includes(stat),
      remittanceStatus: stat === 'Delivered' ? (i % 3 === 0 ? 'Remitted' : i % 3 === 1 ? 'Pending' : 'Overdue') : 'N/A',
      remittanceRef: stat === 'Delivered' && i % 3 === 0 ? `VIR-2026-${['DIGY', 'OZONE', 'AMEEX'][i % 3]}-${840 + i}` : '',
      remittedDate: stat === 'Delivered' && i % 3 === 0 ? '2026-09-25' : '',
      courierFeeCharged: (stat === 'Delivered' && i % 3 === 2) ? 45 : 35,
      discrepancyNote: (stat === 'Delivered' && i % 3 === 2) ? 'Carrier billed 45 MAD (+10 MAD overcharge against agreed 35 MAD tariff)' : ''
    };
  }),
  suppliers: [
    { id: 's1', name: 'Atlas Trading', contact: 'atlas@example.test', city: 'Casablanca', lead: 5 },
    { id: 's2', name: 'Casablanca Textiles', contact: 'textiles@example.test', city: 'Casablanca', lead: 7 },
    { id: 's3', name: 'Care Collective', contact: 'care@example.test', city: 'Rabat', lead: 4 }
  ],
  purchaseOrders: [
    {
      id: 'PO-2026-01',
      poNumber: 'PO-2026-01',
      supplierId: 's1',
      supplierName: 'Atlas Trading',
      productId: 'p1',
      productName: 'Wireless Headphones',
      quantity: 150,
      factoryPricePerUnit: 140,
      freightShipping: 4500,
      customsDuty: 3200,
      localHandling: 1300,
      landedCostPerUnit: 200,
      sellingPrice: 490,
      expectedMarginPercent: 59.2,
      status: 'Received',
      orderDate: '2026-09-10',
      receivedDate: '2026-09-22',
      notes: 'Cleared customs with full packaging inspection.'
    },
    {
      id: 'PO-2026-02',
      poNumber: 'PO-2026-02',
      supplierId: 's2',
      supplierName: 'Casablanca Textiles',
      productId: 'p2',
      productName: 'Everyday Tote',
      quantity: 200,
      factoryPricePerUnit: 52,
      freightShipping: 1800,
      customsDuty: 1400,
      localHandling: 800,
      landedCostPerUnit: 72,
      sellingPrice: 240,
      expectedMarginPercent: 70.0,
      status: 'Received',
      orderDate: '2026-09-12',
      receivedDate: '2026-09-24',
      notes: 'Reinforced stitching and Rosaino ribbon embroidery.'
    },
    {
      id: 'PO-2026-03',
      poNumber: 'PO-2026-03',
      supplierId: 's1',
      supplierName: 'Atlas Trading',
      productId: 'p3',
      productName: 'Ceramic Table Lamp',
      quantity: 80,
      factoryPricePerUnit: 110,
      freightShipping: 2400,
      customsDuty: 1200,
      localHandling: 600,
      landedCostPerUnit: 162.5,
      sellingPrice: 390,
      expectedMarginPercent: 58.3,
      status: 'In Transit',
      orderDate: '2026-09-22',
      expectedDate: '2026-10-04',
      receivedDate: null,
      notes: 'Sculptural ceramic batch currently in freight container.'
    }
  ],
  blacklistedPhones: ['0699001122', '0600112233'],
  expenses: [
    { id: 'e1', name: 'Meta campaign · September', amount: 1250, category: 'Advertising' },
    { id: 'e2', name: 'Packaging supplies', amount: 320, category: 'Operations' }
  ],
  calls: [],
  activity: [],
  rules: [],
  connections: { 'Supabase': true },
  settings: { company: 'Rosaino', currency: 'MAD', region: 'Morocco' },
  pages: [
    { id: 'lp1', name: 'Everyday discoveries', channel: 'Storefront', status: 'Active' },
    { id: 'lp2', name: 'Home essentials', channel: 'Meta Ads', status: 'Draft' }
  ]
});

let db;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) db = JSON.parse(raw);
  if (!db || !Array.isArray(db.orders) || !Array.isArray(db.products)) db = seed();
  if (!db.roles) db.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
  if (!db.currentUser) db.currentUser = { id: 'usr_superadmin', name: 'Rosaino Super Admin', email: 'superadmin@rosaino.com', role: 'Super Admin' };
  if (!db.purchaseOrders) db.purchaseOrders = seed().purchaseOrders;
  if (!db.blacklistedPhones) db.blacklistedPhones = ['0699001122', '0600112233'];
  db.connections['Supabase'] = true;

  // Ensure reconciliation and cms permissions are present in roles
  ['Super Admin', 'Admin', 'Operations manager', 'Finance viewer'].forEach(r => {
    if (db.roles[r] && !db.roles[r].includes('reconciliation')) {
      db.roles[r].push('reconciliation');
    }
    if (db.roles[r] && r !== 'Finance viewer' && !db.roles[r].includes('cms')) {
      db.roles[r].push('cms');
    }
  });

  if (!db.cmsPages) db.cmsPages = {};

  // Ensure delivered orders have remittance status
  db.orders.forEach((o, i) => {
    if (o.status === 'Delivered' && !o.remittanceStatus) {
      o.remittanceStatus = i % 3 === 0 ? 'Remitted' : i % 3 === 1 ? 'Pending' : 'Overdue';
      o.remittanceRef = o.remittanceStatus === 'Remitted' ? `VIR-2026-${['DIGY', 'OZONE', 'AMEEX'][i % 3]}-${840 + i}` : '';
      o.remittedDate = o.remittanceStatus === 'Remitted' ? '2026-09-25' : '';
      o.courierFeeCharged = (i % 3 === 2) ? 45 : 35;
      o.discrepancyNote = (i % 3 === 2) ? 'Carrier billed 45 MAD (+10 MAD overcharge against agreed 35 MAD tariff)' : '';
    }
  });
} catch {
  db = seed();
}

let page = 'overview';
let search = '';
let filter = 'All';
let selectedAgent = 'usr_agent';
let activeCall = null;
let timer = null;
let supabaseStatus = { connected: true, mode: 'checking' };
let remittanceFilter = 'all';
let activeCmsProductId = 'p1';
let utmPlatform = 'meta';
let utmCampaign = 'Meta_Scale_Offer';
let utmContent = 'vid_hook_v1';

function getNavIcon(id) {
  const s = 'width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  switch (id) {
    case 'analytics': return `<svg ${s}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;
    case 'overview': return `<svg ${s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
    case 'orders': return `<svg ${s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    case 'calls': return `<svg ${s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    case 'routing': return `<svg ${s}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
    case 'carriers': return `<svg ${s}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>`;
    case 'shipping': return `<svg ${s}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
    case 'products': return `<svg ${s}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
    case 'cms': return `<svg ${s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`;
    case 'suppliers': return `<svg ${s}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
    case 'finance': return `<svg ${s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    case 'reconciliation': return `<svg ${s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    case 'reports': return `<svg ${s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
    case 'stores': return `<svg ${s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'store': return `<svg ${s}><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v7h14v-7"/><path d="M10 20v-4h4v4"/></svg>`;
    case 'integrations': return `<svg ${s}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
    case 'guide': return `<svg ${s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    case 'security': return `<svg ${s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
    case 'team': return `<svg ${s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case 'settings': return `<svg ${s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    default: return `<svg ${s}><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

// Rosaino sells through its own online store, connected with an API key
// (Store connection). The built-in storefront and its editors are retired.
const STOREFRONT_ENABLED = false;
const STOREFRONT_PAGES = ['cms', 'stores'];

const pages = [
  ['overview', 'overview', 'Overview', 'overview'],
  ['guide', 'guide', 'Platform guide', ''], // open to every role
  ['store', 'store', 'Store connection', 'integrations'],
  ['orders', 'orders', 'Leads & orders', 'orders'],
  ['analytics', 'analytics', 'Analytics', 'reports'],
  ['calls', 'calls', 'Call center', 'calls'],
  ['routing', 'routing', 'Lead routing', 'routing'],
  ['shipping', 'shipping', 'Shipping & Labels', 'shipping'],
  ['carriers', 'carriers', 'Carriers', 'shipping'],
  ['products', 'products', 'Products & stock', 'products'],
  ['cms', 'cms', 'Landing Page CMS', 'cms'],
  ['suppliers', 'suppliers', 'Suppliers & POs', 'suppliers'],
  ['finance', 'finance', 'Finance', 'finance'],
  ['reconciliation', 'reconciliation', 'Courier Remittance Audit', 'reconciliation'],
  ['reports', 'reports', 'Reports & ROAS', 'reports'],
  ['stores', 'stores', 'Stores & media', 'stores'],
  ['integrations', 'integrations', 'Integrations & Supabase', 'integrations'],
  ['team', 'team', 'Team & RBAC', 'team'],
  ['security', 'security', 'Security & audit', 'audit'],
  ['settings', 'settings', 'Settings', 'settings']
];

function persist() {
  try {
    // Other tabs get a 'storage' event from the browser. Not re-dispatched here:
    // reloading db in this tab would swap out objects code is still editing.
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    toast('Browser storage is unavailable; changes last until this page closes.');
  }
  scheduleServerSync();
}

// Server sync: orders and landing pages changed in this browser are sent to
// the server (and its database), so every teammate and customer sees them.
let synced = null; // last version the server has: { orders: Map, cms: Map }
let syncTimer = null;

function markSynced(orders, pages, workspace = {}) {
  synced = {
    orders: new Map(orders.map(o => [String(o.id), JSON.stringify(o)])),
    cms: new Map(Object.entries(pages).map(([id, c]) => [id, JSON.stringify(c)])),
    workspace: new Map(Object.entries(workspace).map(([name, items]) => [name, JSON.stringify(items)]))
  };
}

// Lists shared with the whole team (kept on the server): name -> permission to change.
const WORKSPACE_LISTS = { suppliers: 'suppliers', expenses: 'finance', rules: 'routing' };

// Sample records the portal ships with, removed once a real database is connected.
const SAMPLE_RECORDS = {
  suppliers: s => ['s1', 's2', 's3'].includes(s.id) && /@example\.test$/.test(s.contact || ''),
  expenses: e => (e.id === 'e1' && e.name === 'Meta campaign · September') || (e.id === 'e2' && e.name === 'Packaging supplies'),
  pages: pg => ['lp1', 'lp2'].includes(pg.id)
};

function scheduleServerSync() {
  if (!synced || !getSession()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushChanges, 400);
}

// New orders (e.g. from the online store) and teammates' changes, without
// reloading. Orders with changes not yet sent from this browser are left as they are.
async function pullOrders({ announce = false } = {}) {
  if (!synced || !getSession()) return 0;
  let list;
  try { list = await api('/api/orders'); } catch { return 0; }
  if (!Array.isArray(list)) return 0;
  let added = 0;
  let changed = false;
  for (const raw of list) {
    const o = { notes: [], ...raw };
    const id = String(o.id);
    const json = JSON.stringify(o);
    const i = db.orders.findIndex(x => String(x.id) === id);
    if (i < 0) {
      db.orders.unshift(o);
      added++;
    } else {
      const local = JSON.stringify(db.orders[i]);
      if (local !== synced.orders.get(id) || local === json) continue; // local edit pending, or nothing new
      db.orders[i] = o;
    }
    synced.orders.set(id, json);
    changed = true;
  }
  if (changed) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
    const el = document.activeElement;
    const typing = el && el.closest?.('#content') && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    if (!$('#modal')?.open && !typing) render();
  }
  if (announce && added) toast(`${added} new order${added > 1 ? 's' : ''} received`);
  return added;
}
setInterval(() => { if (document.visibilityState === 'visible') pullOrders({ announce: true }); }, 45000);

// The server sent a confirmed order to the carrier on its own.
function receivedAutoDispatch(o, r) {
  const s = r.shipment;
  Object.assign(o, { status: r.order?.status || 'In transit', stockDeducted: !!r.order?.stockDeducted, carrier: s.carrierName, trackingNumber: s.trackingNumber });
  if (o.stockDeducted) orderLines(o).forEach(l => { const p = product(l.product); if (p) p.stock -= l.quantity; });
  shipmentList = [s, ...(shipmentList || []).filter(x => x.orderId !== s.orderId)];
  synced.orders.set(String(o.id), JSON.stringify(o));
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  render();
  toast(`${o.id} sent to ${s.carrierName} · tracking ${s.trackingNumber}`);
}

// Only the fields this browser changed, so a teammate's edits to other
// fields of the same order are kept.
function changedFields(before, after) {
  return Object.fromEntries(Object.keys(after)
    .filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
    .map(k => [k, after[k]]));
}

async function pushChanges() {
  const jobs = [];
  const send = (map, id, json, request) => {
    const before = map.get(id);
    map.set(id, json);
    jobs.push(request(before).catch(err => {
      if (before === undefined) map.delete(id); else map.set(id, before); // retry with the next change
      throw err;
    }));
  };
  db.orders.forEach(o => {
    const id = String(o.id);
    const json = JSON.stringify(o);
    if (synced.orders.get(id) === json) return;
    send(synced.orders, id, json, before => before === undefined
      ? api('/api/orders', 'POST', o)
      : api(`/api/orders/${encodeURIComponent(id)}`, 'PATCH', changedFields(JSON.parse(before), o)).then(r => {
        // The server keeps stock; take its figure.
        (r.products || (r.product ? [r.product] : [])).forEach(sp => {
          const p = db.products.find(x => String(x.id) === String(sp.id));
          if (p) p.stock = sp.stock;
        });
        if (r.shipment) receivedAutoDispatch(o, r);
        if (r.dispatchError) {
          o.notes = r.order?.notes || o.notes;
          synced.orders.set(id, JSON.stringify(o));
          toast(`${o.id} confirmed, but not sent to the carrier: ${r.dispatchError}`);
        }
      }));
  });
  Object.entries(WORKSPACE_LISTS).forEach(([name, perm]) => {
    if (!hasPermission(perm) || !Array.isArray(db[name])) return;
    const json = JSON.stringify(db[name]);
    if (synced.workspace.get(name) === json) return;
    send(synced.workspace, name, json, () => api(`/api/workspace/${name}`, 'PUT', { items: db[name] }));
  });
  if (hasPermission('cms')) {
    Object.entries(db.cmsPages || {}).forEach(([id, c]) => {
      const json = JSON.stringify(c);
      if (synced.cms.get(id) === json) return;
      send(synced.cms, id, json, () => api(`/api/cms/${encodeURIComponent(id)}`, 'POST', c));
    });
  }
  const failed = (await Promise.allSettled(jobs)).find(r => r.status === 'rejected');
  if (failed) toast(`Not saved to the server: ${failed.reason.message}`);
}

function log(text) {
  db.activity.unshift({ text, date: new Date().toISOString() });
  db.activity = db.activity.slice(0, 100);
  persist();
}

function toast(text) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3300);
}

function badge(s) {
  return `<span class="badge ${esc(String(s).toLowerCase().replaceAll(' ', '-'))}">${esc(s)}</span>`;
}

// Simple Auth: signed server session + server-enforced permissions
let previewRole = null; // Super Admin "view as role" preview (UI only; the server keeps enforcing real permissions)
let serverUsers = null;
let auditEntries = null;

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session.user) return null;
    if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// Adopt the session payload returned by /api/auth/login, /me and change-password.
function applySession(data, keepToken) {
  const prev = getSession();
  const session = {
    token: data.token || keepToken || prev?.token,
    expiresAt: data.expiresAt || prev?.expiresAt,
    user: data.user,
    permissions: data.permissions || []
  };
  setSession(session);
  db.currentUser = session.user;
  if (data.roles) db.roles = data.roles;
  return session;
}

// Attach the session token to every same-origin API call and handle expiry.
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  const isApi = url.startsWith('/api/') || url.startsWith(location.origin + '/api/');
  const session = isApi ? getSession() : null;
  if (session) {
    const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
    if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${session.token}`);
    init = { ...init, headers };
  }
  const res = await nativeFetch(input, init);
  if (isApi && res.status === 401 && session && !url.includes('/api/auth/login')) {
    handleSessionExpired();
  }
  return res;
};

// JSON helper for admin API calls that should surface server errors.
async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function handleSessionExpired() {
  if (!getSession() && $('#login-screen')?.style.display === 'flex') return;
  clearSession();
  previewRole = null;
  try { $('#modal').open && $('#modal').close(); } catch {}
  checkAuth();
  const errorMsg = $('#login-error-msg');
  if (errorMsg) {
    errorMsg.textContent = 'Your session has ended. Please sign in again.';
    errorMsg.style.display = 'block';
  }
}

async function signOut(everywhere = false) {
  try {
    await api(everywhere ? '/api/auth/logout-all' : '/api/auth/logout', 'POST', {});
  } catch {}
  clearSession();
  previewRole = null;
  serverUsers = null;
  auditEntries = null;
  try { $('#modal').open && $('#modal').close(); } catch {}
  checkAuth();
  toast(everywhere ? 'Signed out on all devices.' : 'Signed out successfully.');
}

function checkAuth() {
  const session = getSession();
  const loginScreen = $('#login-screen');
  const sidebar = $('#sidebar');
  const main = $('main');

  if (!session) {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'none';
    if (main) main.style.display = 'none';
    setTimeout(() => $('#login-email')?.focus(), 0);
    return false;
  }

  // User is authenticated
  db.currentUser = session.user;
  if (loginScreen) loginScreen.style.display = 'none';
  if (sidebar) sidebar.style.display = 'flex';
  if (main) main.style.display = 'block';

  // Update profile in sidebar
  const sideNameEl = $('#sidebar-user-name');
  if (sideNameEl) sideNameEl.textContent = db.currentUser.name;
  const sideRoleEl = $('#sidebar-user-role');
  if (sideRoleEl) sideRoleEl.textContent = previewRole ? `Previewing: ${previewRole}` : db.currentUser.role;
  const avatarEl = $('#profile-avatar');
  if (avatarEl) avatarEl.textContent = db.currentUser.avatar || db.currentUser.name.slice(0, 2).toUpperCase();

  return true;
}

// Refresh the signed-in user, roles and team from the server.
async function refreshSession() {
  if (!getSession()) return false;
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return false;
    applySession(await res.json());
    await loadUsers();
    return true;
  } catch {
    return false; // offline: keep the cached session until the server says otherwise
  }
}

// Sync the team roster from the server while keeping local call-center availability.
async function loadUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return;
    serverUsers = await res.json();
    db.agents = serverUsers.map(u => ({
      ...u,
      status: db.agents.find(a => a.id === u.id)?.status || 'Available'
    }));
    persist();
  } catch {}
}

const effectiveRole = () => previewRole || db.currentUser?.role;

// RBAC Permission Checking
function hasPermission(perm) {
  if (!db.currentUser) return false;
  const role = effectiveRole();
  if (role === 'Super Admin') return true;
  const rolePerms = db.roles?.[role] || [];
  return rolePerms.includes(perm);
}

// True only for the real signed-in account (ignores role preview).
function isRealSuperAdmin() {
  return db.currentUser?.role === 'Super Admin' || (db.roles?.[db.currentUser?.role] || []).includes('rbac_manage');
}

function checkAction(perm, actionLabel) {
  if (!hasPermission(perm)) {
    toast(`Access denied: "${actionLabel || perm}" requires "${perm}" permission for role ${effectiveRole()}.`);
    return false;
  }
  return true;
}

const product = id => db.products.find(p => String(p.id) === String(id));
const agent = id => db.agents.find(a => a.id === id);
// The products and quantities an order holds: a bag order lists each item.
const orderLines = o => Array.isArray(o.items) && o.items.length
  ? o.items.map(i => ({ product: i.product, quantity: Number(i.quantity) || 1 }))
  : [{ product: o.product, quantity: Number(o.quantity) || 1 }];
const parcelText = o => orderLines(o).map(l => `${l.quantity} × ${product(l.product)?.name || l.product}`).join(', ');
const reserved = id => db.orders.filter(o => o.status === 'Confirmed')
  .reduce((s, o) => s + orderLines(o).filter(l => String(l.product) === String(id)).reduce((a, l) => a + l.quantity, 0), 0);
const sum = (list, key) => list.reduce((s, o) => s + Number(o[key] || 0), 0);

function cleanPhone(p) {
  return String(p || '').replace(/[^0-9]/g, '');
}

// Customer Trust & Risk Intelligence
function getTrustInfo(phone, orderId) {
  const cPhone = cleanPhone(phone);
  const isBlacklisted = (db.blacklistedPhones || []).some(bp => cleanPhone(bp) === cPhone);

  if (isBlacklisted) {
    return {
      type: 'risk',
      badge: '<span class="trust-pill risk" title="Blacklisted / High Return Risk">Blacklisted</span>',
      label: 'Blacklisted Serial Refuser',
      score: 10,
      isRisk: true
    };
  }

  const past = db.orders.filter(o => cleanPhone(o.phone) === cPhone && o.id !== orderId);
  if (past.length === 0) {
    return {
      type: 'new',
      badge: '<span class="trust-pill new" title="First Time Buyer">New</span>',
      label: 'First-time Customer',
      score: 60,
      isRisk: false
    };
  }

  const delivered = past.filter(o => o.status === 'Delivered').length;
  const returned = past.filter(o => o.status === 'Returned').length;

  if (returned >= 2) {
    return {
      type: 'risk',
      badge: `<span class="trust-pill risk" title="Refused ${returned} past parcels">Risk (${returned} Returns)</span>`,
      label: `Serial Refuser (${returned} past returns)`,
      score: 20,
      isRisk: true
    };
  }

  if (delivered >= 2 && returned === 0) {
    return {
      type: 'vip',
      badge: `<span class="trust-pill vip" title="VIP Buyer (${delivered} delivered)">VIP (${delivered})</span>`,
      label: `VIP Verified Customer (${delivered} Delivered)`,
      score: 95,
      isVIP: true
    };
  }

  return {
    type: 'standard',
    badge: `<span class="trust-pill new" title="${past.length} past orders">${past.length} Orders</span>`,
    label: `Standard Customer (${past.length} previous orders)`,
    score: 65
  };
}

// A duplicate is a second open order for the same phone and product;
// past delivered or returned orders are repeat purchases, not duplicates.
const CLOSED_STATUSES = ['Delivered', 'Returned', 'Cancelled', 'Spam'];
function checkDuplicateOrder(order) {
  if (CLOSED_STATUSES.includes(order.status)) return false;
  const cPhone = cleanPhone(order.phone);
  return db.orders.some(o =>
    o.id !== order.id &&
    cleanPhone(o.phone) === cPhone &&
    String(o.product) === String(order.product) &&
    !CLOSED_STATUSES.includes(o.status)
  );
}

function title(name, desc, actions = '') {
  return `
    <div class="page-title">
      <div>
        <div class="eyebrow">ROSAINO OPERATIONS · ${esc(effectiveRole()).toUpperCase()}</div>
        <h1>${name}</h1>
        <p>${desc}</p>
      </div>
      <div class="actions">${actions}</div>
    </div>
  `;
}

function metric(label, value, note) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.length ? rows.join('') : `<tr><td colspan="${headers.length}" class="empty">No records match this view.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

// Upgraded Order Table with Customer Trust Badges and WhatsApp Actions
function orderTable(list) {
  return table(
    ['Order / Customer', 'Product / Channel', 'City', 'Amount', 'Trust Score', 'Status', 'Actions'],
    list.map(o => {
      const trust = getTrustInfo(o.phone, o.id);
      const isDup = checkDuplicateOrder(o);
      const p = product(o.product);

      return `
        <tr>
          <td>
            <b>${esc(o.id)}</b>
            <small>${esc(o.customer)} · ${esc(o.phone)}</small>
            ${isDup ? '<span class="trust-pill duplicate" title="Duplicate lead detected with same phone & product">Duplicate</span>' : ''}
          </td>
          <td>
            ${esc(p?.name || o.product)}
            <small>${o.quantity} unit(s) · ${esc(o.source)}</small>
          </td>
          <td>${esc(o.city)}</td>
          <td><b>${money(o.amount)}</b></td>
          <td>${trust.badge}</td>
          <td>${badge(o.status)}</td>
          <td><div class="row-actions">
            ${hasPermission('calls') && ['New', 'Callback'].includes(o.status) ? callButtons(o, true) : ''}
            <button data-action="order" data-id="${esc(o.id)}">Details</button>
            <button data-action="awb" data-id="${esc(o.id)}" title="Print shipping label">Label</button>
          </div></td>
        </tr>
      `;
    })
  );
}

function bars(items, total) {
  return items.map(([label, n, color]) => `
    <div class="bar-row">
      <span>${esc(label)}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${total ? Math.max(0, Math.min(100, (n / total) * 100)) : 0}%;background:${color || '#147d86'}"></div>
      </div>
      <b>${n}</b>
    </div>
  `).join('');
}

function previewBanner() {
  if (!previewRole) return '';
  return `
    <div class="panel" style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff4dc;border-color:#f3d48e;padding:14px 18px;">
      <span>Previewing the workspace as <b>${esc(previewRole)}</b>. Your account keeps its own permissions.</span>
      <button data-action="exit-preview">Exit preview</button>
    </div>
  `;
}

function accessDeniedView(pageName, reqPerm) {
  return `
    <div class="panel empty" style="padding:48px 24px;text-align:center;">
      <h2>Access Restricted</h2>
      <p class="info" style="max-width:480px;margin:0 auto 16px;">
        Your role <strong>${esc(effectiveRole())}</strong> does not have the <code>${esc(reqPerm)}</code> permission required to view <strong>${esc(pageName)}</strong>. Ask a Super Admin to grant access.
      </p>
      <div style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
        ${previewRole ? '<button class="primary" data-action="exit-preview">Exit role preview</button>' : ''}
        <button data-action="sign-out">Sign in as a different user</button>
      </div>
    </div>
  `;
}

// 1. Overview
// Setup checklist for administrators: what is connected and what is left.
let setupStatus = null;

function setupChecklist() {
  if (!hasPermission('integrations') && !isRealSuperAdmin()) return '';
  if (!setupStatus) {
    api('/api/setup-status').then(st => { setupStatus = st; if (page === 'overview') render(); }).catch(() => {});
    return '';
  }
  const items = [
    [setupStatus.carriers > 0, 'Connect a carrier', 'Orders are sent to them when you dispatch, and deliveries update by themselves.', '#carriers', 'Add carrier'],
    [setupStatus.store?.received > 0, 'Connect your online store', setupStatus.store?.keys ? 'Your API key is ready; orders appear as soon as your store sends the first one.' : 'Create an API key and add it to your Shopify, YouCan or WooCommerce store so its orders arrive here.', '#store', setupStatus.store?.keys ? 'Open' : 'Create key'],
    [setupStatus.database, 'Database connected', setupStatus.databaseError ? `Not working: ${esc(setupStatus.databaseError)}` : 'Orders, products, accounts, carriers and calls are saved in Supabase (DATABASE_URL in Vercel).', '', ''],
    [setupStatus.team > 1, 'Invite your team', 'Give agents and managers their own login with only the pages they need.', '#team', 'Add member']
  ];
  const left = items.filter(i => !i[0]).length;
  if (!left) return '';
  return `
    <div class="panel">
      <div class="panel-head"><div><h2>Finish setting up</h2><p>${items.length - left} of ${items.length} done</p></div></div>
      <ul class="checklist">
        ${items.map(([done, name, desc, href, cta]) => `
          <li class="${done ? 'done' : ''}">
            <span class="tick" aria-hidden="true">${done ? '✓' : ''}</span>
            <div><b>${name}</b><br><small>${desc}</small></div>
            ${!done && href ? `<a href="${href}">${cta} →</a>` : ''}
          </li>`).join('')}
      </ul>
    </div>
  `;
}

function overview() {
  const delivered = db.orders.filter(o => o.status === 'Delivered');
  const pending = db.orders.filter(o => ['New', 'Callback'].includes(o.status));
  const transit = db.orders.filter(o => o.status === 'In transit');

  return title(
    'Overview',
    'Today at a glance: orders, confirmations, deliveries and cash collected.',
    `<span class="pill">${db.orders.length} total orders · MAD</span><button class="primary" data-action="new-order">＋ New order</button>`
  ) + `
    ${setupChecklist()}
    <div class="metrics">
      ${metric('Collected revenue', money(sum(delivered, 'amount')), 'Delivered orders · cash on delivery')}
      ${metric('Total orders', db.orders.length, 'Across all acquisition channels')}
      ${metric('Awaiting confirmation', pending.length, 'New leads and scheduled callbacks')}
      ${metric('On the way', transit.length, 'Orders currently in transit')}
    </div>
    <div class="grid">
      <div class="panel">
        <div class="panel-head">
          <div><h2>Revenue at a glance</h2><p>Delivered order value · MAD</p></div>
          <span class="pill">Recent trend</span>
        </div>
        <div class="chart">
          ${Array.from({ length: 7 }, (_, i) => {
            const v = sum(delivered.filter(o => o.date === '2026-09-' + (22 + i)), 'amount');
            const max = Math.max(1, ...Array.from({ length: 7 }, (_, j) => sum(delivered.filter(o => o.date === '2026-09-' + (22 + j)), 'amount')));
            return `
              <div class="chart-col">
                <div class="chart-bar" style="height:${(v / max) * 145}px" title="${money(v)}"></div>
                <small>Sep ${22 + i}</small>
              </div>
            `;
          }).join('')}
        </div>
        <p class="chart-caption">Figures update live as storefront customers checkout and orders are processed.</p>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div><h2>Order pipeline</h2><p>Where your orders stand right now</p></div>
        </div>
        ${bars(['New', 'Confirmed', 'In transit', 'Delivered', 'Returned'].map((s, i) => [s, db.orders.filter(o => o.status === s).length, ['#f3b94e', '#74c8b6', '#77aac8', '#147d86', '#f27665'][i]]), db.orders.length)}
      </div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <div><h2>Orders that need you</h2><p>Start with new leads and callbacks</p></div>
        <a href="#orders">View all orders ↗</a>
      </div>
      ${orderTable(pending.slice(0, 5))}
    </div>
  `;
}

// 2. Orders
function orders() {
  const duplicates = db.orders.filter(checkDuplicateOrder);
  return title(
    'Leads & orders',
    'Customer verification, risk scores, duplicate detection, and live tracking.',
    `<button data-action="import">Import CSV</button><button data-action="export">Export CSV</button><button class="primary" data-action="new-order">＋ New order</button>`
  ) + `
    ${duplicates.length ? `
      <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong style="color:#b45309;">Possible duplicates:</strong>
          <span style="font-size:13px;color:#78350f;"> ${duplicates.length} open order(s) share a phone number and product with another open order.</span>
        </div>
        <button data-action="filter-duplicates" style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">Show duplicates</button>
      </div>
    ` : ''}
    <div class="panel">
      <div class="toolbar">
        <input id="search" aria-label="Search orders" placeholder="Search customer, order, phone, city, campaign…" value="${esc(search)}">
        <select id="filter" aria-label="Order status">${['All', ...statuses].map(s => `<option ${s === filter ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
      <div id="order-results">${orderResults()}</div>
    </div>
  `;
}

function orderResults() {
  return orderTable(
    db.orders.filter(o =>
      (filter === 'All' || filter === o.status) &&
      [o.id, o.customer, o.phone, o.city, product(o.product)?.name, o.source, o.campaign].join(' ').toLowerCase().includes(search.toLowerCase())
    )
  );
}

// 3. Calls
// Call log from the server (every agent's calls, with duration and transcript)
let callLogs = null;

async function loadCallLogs() {
  try {
    callLogs = await api('/api/calls?limit=300');
  } catch {
    callLogs = callLogs || [];
  }
  return callLogs;
}

// Moroccan numbers: 06…/07… -> 2126…/2127… for tel: and WhatsApp links.
function intlPhone(phone) {
  let d = cleanPhone(phone);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('212')) return d;
  if (d.startsWith('0')) return '212' + d.slice(1);
  return d.length === 9 ? '212' + d : d;
}

function callButtons(o, compact = false) {
  const n = intlPhone(o.phone);
  return `
    <a class="btn-call" href="tel:+${n}" data-action="start-call" data-id="${esc(o.id)}:phone" title="Call ${esc(o.phone)} with your phone">${compact ? 'Call' : 'Phone call'}</a>
    <a class="btn-call wa" href="https://wa.me/${n}" target="_blank" rel="noopener" data-action="start-call" data-id="${esc(o.id)}:whatsapp" title="Open WhatsApp and tap the call icon">${compact ? 'WhatsApp' : 'WhatsApp call'}</a>
  `;
}

const fmtDuration = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function calls() {
  if (!callLogs) loadCallLogs().then(() => page === 'calls' && render());
  const me = db.currentUser;
  const isAgent = !hasPermission('orders');
  if (isAgent && agent(me.id)) selectedAgent = me.id;
  if (!selectedAgent || (selectedAgent !== 'all' && !agent(selectedAgent))) selectedAgent = agent(me.id) ? me.id : 'all';
  const a = selectedAgent === 'all' ? null : agent(selectedAgent);
  const open = db.orders.filter(o => ['New', 'Callback'].includes(o.status));
  const queue = (a ? open.filter(o => o.agent === a.id) : open)
    .sort((x, y) => (x.status === 'Callback') - (y.status === 'Callback') || String(x.callback || '').localeCompare(String(y.callback || '')));
  const today = new Date().toISOString().slice(0, 10);
  const logs = (callLogs || []).filter(c => !a || c.agentId === a.id);
  const todays = logs.filter(c => c.startedAt.slice(0, 10) === today);
  const talk = todays.reduce((t, c) => t + c.durationSec, 0);
  const next = queue[0];

  return title(
    'Call center',
    'Call each lead by phone or WhatsApp. Every call is timed and saved with its outcome, notes and transcript.',
    isAgent ? '' : `<label class="inline-label">Queue
      <select id="agent-select" aria-label="Show queue for">
        <option value="all" ${!a ? 'selected' : ''}>All open leads</option>
        ${db.agents.map(x => `<option value="${esc(x.id)}" ${a?.id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
      </select></label>`
  ) + `
    <div class="metrics">
      ${metric('Leads to call', queue.length, a ? `Assigned to ${esc(a.name)}` : 'New leads and callbacks')}
      ${metric('Calls today', todays.length, `${todays.filter(c => c.outcome === 'No answer').length} without answer`)}
      ${metric('Confirmed today', todays.filter(c => c.outcome === 'Confirmed').length, todays.length ? `${Math.round(todays.filter(c => c.outcome === 'Confirmed').length / todays.length * 100)}% of calls` : 'No calls yet')}
      ${metric('Talk time today', fmtDuration(talk), todays.length ? `Average ${fmtDuration(Math.round(talk / todays.length))} per call` : '—')}
    </div>
    <div class="grid calls-grid">
      <div class="panel">
        <div class="panel-head"><div><h2>Next lead</h2><p>${next ? (next.status === 'Callback' ? 'Scheduled callback' : 'New lead') : 'Nothing waiting'}</p></div></div>
        ${next ? `
          <div class="lead-card">
            <div class="lead-top">
              <span class="eyebrow">${esc(next.id)} · ${esc(next.source || 'Storefront')}</span>
              ${getTrustInfo(next.phone, next.id).badge}
            </div>
            <h2>${esc(next.customer)}</h2>
            <div class="lead-facts">
              <div><small>Phone</small><b>${esc(next.phone)}</b></div>
              <div><small>City</small><b>${esc(next.city)}</b></div>
              <div><small>Order</small><b>${next.quantity} × ${esc(product(next.product)?.name || next.product)}</b></div>
              <div><small>Cash on delivery</small><b>${money(next.amount)}</b></div>
            </div>
            ${next.callback ? `<p class="info">Callback planned for <b>${esc(next.callback.replace('T', ' '))}</b></p>` : ''}
            <div class="actions">${callButtons(next)}<button data-action="order" data-id="${esc(next.id)}">Order details</button></div>
          </div>
        ` : '<div class="empty">No leads waiting. New orders from the store appear here automatically.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>Queue</h2><p>${queue.length} lead(s), callbacks last</p></div></div>
        <div class="queue-list">
        ${queue.slice(0, 25).map(o => `
          <div class="queue">
            <div>
              <b>${esc(o.customer)}</b>
              <p class="info">${esc(o.id)} · ${esc(o.city)} · ${badge(o.status)}</p>
            </div>
            <div class="actions">${callButtons(o, true)}</div>
          </div>
        `).join('') || '<p class="info">Assign leads from Leads &amp; orders or Lead routing.</p>'}
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <div><h2>Call history</h2><p>${callLogs ? `${logs.length} call(s) saved` : 'Loading…'}</p></div>
        <button data-action="refresh-calls">Refresh</button>
      </div>
      ${logs.length ? table(
        ['When', 'Lead', 'Channel', 'Duration', 'Outcome', 'Agent', ''],
        logs.slice(0, 50).map(c => {
          const o = db.orders.find(x => x.id === c.orderId);
          return `<tr>
            <td>${esc(new Date(c.startedAt).toLocaleString())}</td>
            <td><b>${esc(o?.customer || c.orderId)}</b><small>${esc(c.orderId)} · ${esc(c.phone || '')}</small></td>
            <td>${c.channel === 'whatsapp' ? 'WhatsApp' : 'Phone'}</td>
            <td>${fmtDuration(c.durationSec)}</td>
            <td>${badge(c.outcome)}</td>
            <td>${esc(c.agentName || '')}</td>
            <td>${c.transcript || c.notes ? `<button data-action="view-call" data-id="${esc(c.id)}">${c.transcript ? 'Transcript' : 'Notes'}</button>` : ''}</td>
          </tr>`;
        })
      ) : `<div class="empty">${callLogs ? 'No calls yet. Use Phone call or WhatsApp call on a lead to start.' : ''}</div>`}
    </div>
  `;
}

// 4. Routing
function routing() {
  return title(
    'Lead routing',
    'Create product, source or region rules and distribute unassigned leads.',
    `<button class="primary" data-action="new-rule">＋ Add rule</button><button data-action="route">Run routing</button>`
  ) + `
    <div class="panel">
      <h2>Routing rules</h2>
      <p class="info">Rules run in order on unassigned New orders. VIP customers can be fast-tracked directly to warehouse fulfillment.</p>
      ${table(['Match', 'Value', 'Agent', 'Share', ''], db.rules.map(r => `<tr><td>${esc(r.field)}</td><td>${esc(r.value || 'All leads')}</td><td>${esc(agent(r.agent)?.name)}</td><td>${r.share}%</td><td><button data-action="delete-rule" data-id="${r.id}">Remove</button></td></tr>`))}
    </div>
    <div class="panel">
      <h2>Agent distribution</h2>
      ${bars(db.agents.map(a => [a.name, db.orders.filter(o => o.agent === a.id && ['New', 'Callback'].includes(o.status)).length]), db.orders.length)}
    </div>
  `;
}

// 5. Shipping & Airway Bills (AWB)
// Carrier & shipment data from the server (API keys never reach the browser)
let carrierList = null;
let shipmentList = null;
let lastShipmentSync = null;

const canManageCarriers = () => hasPermission('integrations');
const activeCarriers = () => (carrierList || []).filter(c => c.active);

async function loadCarriers() {
  try {
    carrierList = await api('/api/carriers');
  } catch {
    carrierList = carrierList || [];
  }
  return carrierList;
}

// Pull shipments from the server and apply carrier updates to local orders.
async function loadShipments() {
  try {
    shipmentList = await api('/api/shipments');
  } catch {
    shipmentList = shipmentList || [];
    return 0;
  }
  let changed = 0;
  for (const s of shipmentList) {
    const o = db.orders.find(x => String(x.id) === String(s.orderId));
    if (!o) continue;
    o.carrier = s.carrierName;
    o.trackingNumber = s.trackingNumber;
    try {
      if (o.status === 'Confirmed' && s.status !== 'Confirmed') { changeStatus(o, 'In transit'); changed++; }
      if (o.status === 'In transit' && (s.status === 'Delivered' || s.status === 'Returned')) { changeStatus(o, s.status); changed++; }
      if (o.status === 'Returned' && s.status === 'In transit') {
        // Relaunched or sent to a new customer: the server already moved the order and its stock.
        o.status = 'In transit';
        o.stockDeducted = true;
        orderLines(o).forEach(l => { const p = product(l.product); if (p) p.stock -= l.quantity; });
        synced?.orders.set(String(o.id), JSON.stringify(o));
        changed++;
      }
    } catch {}
  }
  persist();
  return changed;
}

const shipmentFor = id => (shipmentList || []).find(s => String(s.orderId) === String(id));

// 5. Shipping
function shipping() {
  if (!carrierList) loadCarriers().then(() => page === 'shipping' && render());
  if (!shipmentList) loadShipments().then(n => { lastShipmentSync = new Date(); if (page === 'shipping') render(); if (n) toast(`${n} order(s) updated by carriers`); });

  const list = db.orders.filter(o => ['Confirmed', 'In transit', 'Delivered', 'Returned'].includes(o.status));
  const ready = list.filter(o => o.status === 'Confirmed');
  const noCarriers = carrierList && !activeCarriers().length;

  const actionsFor = o => {
    const s = shipmentFor(o.id);
    const label = `<button data-action="awb" data-id="${esc(o.id)}">Label</button>${s ? ` <button data-action="parcel" data-id="${esc(o.id)}">Parcel</button>` : ''}`;
    if (o.status === 'Confirmed') return `<button class="primary" data-action="dispatch" data-id="${esc(o.id)}">Dispatch</button> ${label}`;
    if (o.status === 'In transit') {
      return `${label} <button data-action="deliver" data-id="${esc(o.id)}" title="${s ? 'Record it yourself if the carrier has not updated it yet' : ''}">Mark delivered</button> <button data-action="return" data-id="${esc(o.id)}">Mark returned</button>`;
    }
    return `${label} <a class="btn-link" href="/track?id=${encodeURIComponent(o.id)}" target="_blank">Tracking page ↗</a>`;
  };

  return title(
    'Shipping',
    'Send confirmed orders to your carriers, print labels, and follow each parcel until it is delivered.',
    `<button data-action="sync-shipments">Check carrier updates ↻</button><button data-action="batch-labels">Print all labels</button>`
  ) + `
    ${noCarriers ? `
      <div class="panel notice">
        <div><b>Connect a carrier to dispatch automatically.</b> Add the delivery companies you work with and their API key; dispatched orders are then sent to them and their status updates appear here.</div>
        <a href="#carriers" class="primary btn-link-primary">Add a carrier</a>
      </div>` : ''}
    <div class="metrics">
      ${metric('Ready to dispatch', ready.length, 'Confirmed orders waiting for a carrier')}
      ${metric('In transit', list.filter(o => o.status === 'In transit').length, 'With the carrier')}
      ${metric('Delivered', list.filter(o => o.status === 'Delivered').length, 'Cash collected at the door')}
      ${metric('Returned', list.filter(o => o.status === 'Returned').length, 'Stock put back on return')}
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Parcels</h2>
          <p>${lastShipmentSync ? `Carrier updates checked at ${lastShipmentSync.toLocaleTimeString()}` : 'Checking carrier updates…'}</p>
        </div>
      </div>
      ${list.length ? table(
        ['Order', 'Carrier & tracking', 'Status', 'Cash on delivery', ''],
        list.map(o => {
          const s = shipmentFor(o.id);
          return `
          <tr>
            <td><b>${esc(o.id)}</b><small>${esc(o.customer)} · ${esc(o.city)}</small></td>
            <td>${s
              ? `<b>${esc(s.carrierName)}</b><small>${esc(s.trackingNumber || '')}${s.carrierStatus ? ' · ' + esc(s.carrierStatus) : ''}</small>`
              : o.status === 'Confirmed' ? '<small>Not dispatched yet</small>' : `<b>${esc(o.carrier || '—')}</b>${o.trackingNumber ? `<small>${esc(o.trackingNumber)}</small>` : ''}`}</td>
            <td>${badge(o.status)}</td>
            <td><b>${money(o.amount)}</b></td>
            <td style="white-space:nowrap;">${actionsFor(o)}</td>
          </tr>`;
        })
      ) : '<div class="empty">No confirmed orders yet. Confirm orders in the call center or in Leads &amp; orders, then dispatch them here.</div>'}
    </div>
  `;
}

// 5b. Carriers (transporteurs)
const CARRIER_PRESETS = ['Nearya Express', 'Digylog', 'OzoneExpress', 'AMEEX', 'Sendit', 'Cathedis', 'Amana', 'Other'];
const isNearya = c => c?.kind === 'nearya';

function carriers() {
  if (!carrierList) loadCarriers().then(() => page === 'carriers' && render());
  if (!shipmentList) loadShipments().then(() => page === 'carriers' && render());
  const manage = canManageCarriers();
  const list = carrierList || [];
  const count = (c, st) => (shipmentList || []).filter(s => s.carrierId === c.id && s.status === st).length;

  return title(
    'Carriers',
    'Add each carrier you work with. Dispatched orders are sent to them, and their delivery updates come back into Rosaino and the customer tracking page.',
    manage ? '<button class="primary" data-action="new-carrier">+ Add carrier</button>' : ''
  ) + `
    ${!carrierList ? '<div class="panel empty">Loading carriers…</div>' : !list.length ? `
      <div class="panel">
        <h2>Get started in three steps</h2>
        <ol class="steps">
          <li><b>Add a carrier</b> and paste the API key from your carrier account (Settings or Developers section of their dashboard).</li>
          <li><b>Copy the update link</b> Rosaino gives you into the carrier's webhook / notification settings, so they can tell us when a parcel is picked up, delivered or returned.</li>
          <li><b>Dispatch</b> confirmed orders from the Shipping page. Tracking numbers and statuses then update by themselves.</li>
        </ol>
        ${manage ? '<p><button class="primary" data-action="new-carrier">+ Add your first carrier</button></p>' : '<p class="info">Ask an administrator with the Integrations permission to add carriers.</p>'}
      </div>` : `
      <div class="cards">
        ${list.map(c => `
          <div class="panel carrier-card">
            <div class="panel-head">
              <div>
                <h2>${esc(c.name)}</h2>
                <p>${isNearya(c) ? 'Nearya Express API' : c.kind === 'api' ? 'Connected by API' : 'Manual (no API)'} · ${c.active ? badge('Active') : badge('Paused')}</p>
              </div>
            </div>
            <div class="stat-line"><span>In transit</span><b>${count(c, 'In transit')}</b></div>
            <div class="stat-line"><span>Delivered</span><b>${count(c, 'Delivered')}</b></div>
            <div class="stat-line"><span>Returned</span><b>${count(c, 'Returned')}</b></div>
            ${c.kind !== 'manual' ? `<div class="stat-line"><span>API key</span><b>${esc(c.keyHint || 'not set')}</b></div>` : ''}
            ${isNearya(c) ? `
              <div class="stat-line"><span>Client ID</span><b>${esc(c.config.clientId || '—')}</b></div>
              <div class="stat-line"><span>Business ID</span><b>${esc(c.config.businessId || '—')}</b></div>
              <div class="stat-line"><span>Parcels</span><b>${c.config.parcelType === 'store' ? 'From Nearya stock' : 'Simple (from your place)'}</b></div>
              <div class="stat-line"><span>Confirmed orders</span><b>${c.config.autoDispatch ? 'Sent automatically' : 'Sent from Shipping'}</b></div>
              <div class="actions nearya-tools">
                <button data-action="nearya-regions" data-id="${esc(c.id)}">Cities &amp; regions</button>
                <button data-action="nearya-pickup" data-id="${esc(c.id)}">Request pickup</button>
                ${c.config.parcelType === 'store' ? `<button data-action="nearya-stock" data-id="${esc(c.id)}">Stock at Nearya</button>` : ''}
              </div>` : `
            <label class="copy-field">Status update link (give this to ${esc(c.name)})
              <span><input readonly value="${esc(c.webhookUrl)}" aria-label="Webhook link for ${esc(c.name)}"><button type="button" data-action="copy-webhook" data-id="${esc(c.id)}">Copy</button></span>
            </label>`}
            ${manage ? `
              <div class="actions" style="margin-top:14px;">
                ${c.kind !== 'manual' ? `<button data-action="test-carrier" data-id="${esc(c.id)}">Test connection</button>` : ''}
                <button data-action="edit-carrier" data-id="${esc(c.id)}">Edit</button>
                <button data-action="toggle-carrier" data-id="${esc(c.id)}">${c.active ? 'Pause' : 'Activate'}</button>
                <button class="danger" data-action="delete-carrier" data-id="${esc(c.id)}">Remove</button>
              </div>` : ''}
          </div>
        `).join('')}
      </div>`}
    <div class="panel">
      <h2>How status updates work</h2>
      <p class="info">Rosaino understands the usual carrier wording in French, English and Arabic transliteration, for example <i>Ramassé</i> or <i>En cours</i> (in transit), <i>Livré</i> (delivered), and <i>Retourné</i>, <i>Refusé</i> or <i>Annulé</i> (returned). A failed attempt such as <i>Non livré</i> keeps the parcel in transit. Updates arrive instantly through the update link, and "Check carrier updates" on the Shipping page asks carriers that offer a status API.</p>
    </div>
  `;
}

function carrierForm(c) {
  const cfg = c?.config || {};
  const json = v => (v && Object.keys(v).length ? esc(JSON.stringify(v)) : '');
  return `
    <div class="form-grid">
      ${c ? '' : `<label>Carrier
        <select name="preset" data-preset-select>${CARRIER_PRESETS.map(p => `<option>${p}</option>`).join('')}</select>
      </label>`}
      <label>Name shown in Rosaino<input name="name" required maxlength="60" value="${esc(c?.name || '')}" placeholder="e.g. OzoneExpress"></label>
      <label class="full generic-only">How do you work with this carrier?
        <select name="kind">
          <option value="nearya" ${isNearya(c) ? 'selected' : ''} hidden>Nearya Express</option>
          <option value="api" ${c?.kind === 'api' ? 'selected' : ''}>They have an API: send orders automatically</option>
          <option value="manual" ${c?.kind === 'manual' ? 'selected' : ''}>No API: I'll type tracking numbers myself</option>
        </select>
      </label>
      <p class="full info nearya-only">Find these in your Nearya account under API settings. Rosaino sends parcels, reads their status and requests pickups with them.</p>
      <label class="nearya-only">Client ID (x-api-id)<input name="clientId" autocomplete="off" value="${esc(cfg.clientId || '')}" placeholder="Your Nearya Client ID"></label>
      <label class="nearya-only">Business ID<input name="businessId" autocomplete="off" value="${esc(cfg.businessId || '')}" placeholder="Your Nearya Business ID"></label>
      <label class="full nearya-only">API key (x-api-key)<input name="nearyaKey" type="password" autocomplete="off" placeholder="${c?.hasKey ? `Leave empty to keep the saved key (${esc(c.keyHint)})` : 'Paste your Nearya API key'}"></label>
      <label class="nearya-only">Parcels
        <select name="parcelType">
          <option value="simple" ${cfg.parcelType !== 'store' ? 'selected' : ''}>Simple: Nearya picks up from you</option>
          <option value="store" ${cfg.parcelType === 'store' ? 'selected' : ''}>Stock: shipped from your stock at Nearya</option>
        </select>
      </label>
      <label class="nearya-only">Stock region (for stock levels)<input name="stockRegion" value="${esc(cfg.stockRegion || '')}" placeholder="Region ID of your Nearya warehouse"></label>
      <label class="nearya-only">Pickup address<input name="pickupAddress" value="${esc(cfg.pickupAddress || '')}" placeholder="Where Nearya collects parcels"></label>
      <label class="nearya-only">Pickup phone<input name="pickupPhone" value="${esc(cfg.pickupPhone || '')}" placeholder="06 …"></label>
      <label class="full checkline nearya-only"><input type="checkbox" name="autoDispatch" ${cfg.autoDispatch ? 'checked' : ''}> Send orders to Nearya as soon as an agent confirms them</label>
      <label class="full api-only generic-only">API URL (from the carrier's developer documentation)<input name="baseUrl" value="${esc(cfg.baseUrl || '')}" placeholder="https://api.carrier.ma/v1"></label>
      <label class="full api-only generic-only">API key<input name="apiKey" type="password" autocomplete="off" placeholder="${c?.hasKey ? `Leave empty to keep the saved key (${esc(c.keyHint)})` : 'Paste the key from your carrier account'}"></label>
    </div>
    <details class="api-only generic-only advanced">
      <summary>Connection details (only if your carrier's documentation differs)</summary>
      <div class="form-grid">
        <label>Create parcel path<input name="createPath" value="${esc(cfg.createPath ?? '/shipments')}" placeholder="/shipments"></label>
        <label>Parcel status path<input name="statusPath" value="${esc(cfg.statusPath || '')}" placeholder="/shipments/{tracking}"></label>
        <label>How the key is sent
          <select name="keyPlacement">
            <option value="bearer" ${!cfg.keyPlacement || cfg.keyPlacement === 'bearer' ? 'selected' : ''}>Authorization: Bearer KEY</option>
            <option value="header" ${cfg.keyPlacement === 'header' ? 'selected' : ''}>Custom header</option>
            <option value="query" ${cfg.keyPlacement === 'query' ? 'selected' : ''}>In the URL (?key=…)</option>
          </select>
        </label>
        <label>Header / parameter name<input name="keyName" value="${esc(cfg.keyName || '')}" placeholder="X-API-Key or api_key"></label>
        <label>Request format
          <select name="bodyFormat">
            <option value="json" ${cfg.bodyFormat !== 'form' ? 'selected' : ''}>JSON</option>
            <option value="form" ${cfg.bodyFormat === 'form' ? 'selected' : ''}>Form fields</option>
          </select>
        </label>
        <label>Tracking number field in replies<input name="trackingField" value="${esc(cfg.trackingField || '')}" placeholder="auto-detect (e.g. data.tracking_number)"></label>
        <label>Status field in replies<input name="statusField" value="${esc(cfg.statusField || '')}" placeholder="auto-detect (e.g. data.status)"></label>
        <label>Carrier's public tracking page<input name="trackingUrl" value="${esc(cfg.trackingUrl || '')}" placeholder="https://carrier.ma/track/{tracking}"></label>
        <label class="full">Field names the carrier expects (JSON)<textarea name="fieldMap" rows="2" placeholder='{"recipient_name": "nom", "recipient_phone": "telephone", "cod_amount": "prix"}'>${json(cfg.fieldMap)}</textarea></label>
        <label class="full">Extra status wording (JSON)<textarea name="statusMap" rows="2" placeholder='{"Remis au client": "Delivered", "Retour expéditeur": "Returned"}'>${json(cfg.statusMap)}</textarea></label>
      </div>
      <p class="info">Rosaino sends: reference, recipient_name, recipient_phone, city, address, cod_amount, product, quantity, note. Rename them above if your carrier uses other names.</p>
    </details>
    <div id="carrier-error" role="alert" class="form-error"></div>
  `;
}

function wireCarrierForm() {
  const form = $('#dialog-form');
  const show = (sel, on) => form.querySelectorAll(sel).forEach(el => { el.style.display = on ? '' : 'none'; });
  const sync = () => {
    const kind = form.kind.value;
    show('.generic-only', kind !== 'nearya');
    show('.nearya-only', kind === 'nearya');
    if (kind !== 'nearya') show('.api-only', kind === 'api');
  };
  form.kind.onchange = sync;
  const preset = form.querySelector('[data-preset-select]');
  const nameInput = form.elements.namedItem('name'); // form.name is the form's own attribute
  const applyPreset = () => {
    if (preset.value === 'Nearya Express') form.kind.value = 'nearya';
    else if (form.kind.value === 'nearya') form.kind.value = 'api';
    sync();
  };
  if (preset) preset.onchange = () => { nameInput.value = preset.value === 'Other' ? '' : preset.value; applyPreset(); nameInput.focus(); };
  if (preset && !nameInput.value) nameInput.value = preset.value;
  if (preset) applyPreset(); else sync();
}

function carrierPayload(f) {
  if (f.get('kind') === 'nearya') {
    return {
      name: f.get('name').trim(),
      kind: 'nearya',
      apiKey: (f.get('nearyaKey') || '').trim(),
      config: {
        clientId: (f.get('clientId') || '').trim(),
        businessId: (f.get('businessId') || '').trim(),
        parcelType: f.get('parcelType') || 'simple',
        stockRegion: (f.get('stockRegion') || '').trim(),
        pickupAddress: (f.get('pickupAddress') || '').trim(),
        pickupPhone: (f.get('pickupPhone') || '').trim(),
        autoDispatch: f.get('autoDispatch') === 'on'
      }
    };
  }
  return {
    name: f.get('name').trim(),
    kind: f.get('kind'),
    apiKey: (f.get('apiKey') || '').trim(),
    config: {
      baseUrl: (f.get('baseUrl') || '').trim(),
      createPath: f.get('createPath') ?? '/shipments',
      statusPath: f.get('statusPath') || '',
      keyPlacement: f.get('keyPlacement') || 'bearer',
      keyName: f.get('keyName') || '',
      bodyFormat: f.get('bodyFormat') || 'json',
      trackingField: f.get('trackingField') || '',
      statusField: f.get('statusField') || '',
      trackingUrl: f.get('trackingUrl') || '',
      fieldMap: f.get('fieldMap') || '',
      statusMap: f.get('statusMap') || ''
    }
  };
}

function openCarrierDialog(c) {
  modal(c ? `Edit ${esc(c.name)}` : 'Add a carrier', carrierForm(c), c ? 'Save changes' : 'Add carrier', f => {
    const body = carrierPayload(f);
    if (c && !body.apiKey) delete body.apiKey;
    api(c ? `/api/carriers/${encodeURIComponent(c.id)}` : '/api/carriers', c ? 'PATCH' : 'POST', body)
      .then(async ({ carrier }) => {
        $('#modal').close();
        await loadCarriers();
        render();
        toast(c ? `${carrier.name} saved` : `${carrier.name} added. Copy its update link into the carrier's dashboard.`);
      })
      .catch(err => { $('#carrier-error').textContent = err.message; });
    return false;
  });
  wireCarrierForm();
}

// Fill a <select> with Nearya regions, choosing the one that matches the city.
async function fillRegionSelect(select, carrierId, city) {
  select.innerHTML = '<option value="">Loading regions…</option>';
  try {
    const { regions, match } = await api(`/api/carriers/${encodeURIComponent(carrierId)}/regions?city=${encodeURIComponent(city || '')}`);
    select.innerHTML = `<option value="">Choose a region…</option>` + regions.map(r => `<option value="${esc(r.id)}" ${r.id === match ? 'selected' : ''}>${esc(r.name)}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Regions unavailable</option>';
    const box = $('#dispatch-error') || $('#nearya-error');
    if (box) box.textContent = err.message;
  }
}

const nearyaCarriers = () => (carrierList || []).filter(isNearya);
const carrierById = id => (carrierList || []).find(c => c.id === id);

// Cities in your orders and the Nearya region each one is sent to.
async function openNearyaRegions(id) {
  const c = carrierById(id);
  if (!c) return;
  modal(`${esc(c.name)} · cities &amp; regions`, '<p class="info">Loading Nearya regions…</p>', null);
  let data;
  try {
    data = await api(`/api/carriers/${encodeURIComponent(id)}/regions?fresh=1`);
  } catch (err) {
    modal(`${esc(c.name)} · cities &amp; regions`, `<p class="form-error">${esc(err.message)}</p>`, null);
    return;
  }
  const cities = [...new Set(db.orders.map(o => (o.city || '').trim()).filter(Boolean))].sort();
  const norm = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const guess = city => data.regionMap[city] || data.regions.find(r => norm(r.name) === norm(city))?.id || '';
  const options = sel => `<option value="">Not set</option>` + data.regions.map(r => `<option value="${esc(r.id)}" ${r.id === sel ? 'selected' : ''}>${esc(r.name)}</option>`).join('');
  modal(`${esc(c.name)} · cities &amp; regions`, `
    <p class="info">Nearya delivers by region. Each city in your orders is matched to a region by name; choose one where the match is missing or wrong. ${data.regions.length} regions available.</p>
    <div class="region-map">
      ${cities.map(city => `<label><span>${esc(city)}</span><select name="city:${esc(city)}">${options(guess(city))}</select></label>`).join('') || '<p class="info">No orders yet.</p>'}
    </div>
    <div id="nearya-error" role="alert" class="form-error"></div>
  `, canManageCarriers() ? 'Save regions' : null, f => {
    const regionMap = {};
    for (const [k, v] of f.entries()) if (k.startsWith('city:') && v) regionMap[k.slice(5)] = v;
    api(`/api/carriers/${encodeURIComponent(id)}`, 'PATCH', { config: { ...c.config, regionMap } })
      .then(async () => { $('#modal').close(); await loadCarriers(); render(); toast('Regions saved'); })
      .catch(err => { $('#nearya-error').textContent = err.message; });
    return false;
  });
}

function openNearyaPickup(id) {
  const c = carrierById(id);
  if (!c) return;
  const ready = db.orders.filter(o => o.status === 'In transit' && shipmentFor(o.id)?.carrierId === id).length;
  modal(`Request a ${esc(c.name)} pickup`, `
    <p class="info">${ready} parcel(s) currently with ${esc(c.name)}. Nearya sends a courier to collect your parcels at this address.</p>
    <div class="form-grid">
      <label class="full">Pickup address<input name="clientAddress" required value="${esc(c.config.pickupAddress || '')}"></label>
      <label>Phone<input name="clientPhone" required value="${esc(c.config.pickupPhone || '')}"></label>
      <label>Parcel type
        <select name="type">
          <option value="simple" ${c.config.parcelType !== 'store' ? 'selected' : ''}>Simple parcels</option>
          <option value="store" ${c.config.parcelType === 'store' ? 'selected' : ''}>Stock parcels</option>
        </select>
      </label>
      <label class="checkline"><input type="checkbox" name="ticket"> Print delivery tickets</label>
    </div>
    <div id="nearya-error" role="alert" class="form-error"></div>
  `, 'Request pickup', f => {
    const btn = $('#dialog-form button.primary');
    btn.disabled = true;
    api(`/api/carriers/${encodeURIComponent(id)}/pickup`, 'POST', {
      clientAddress: f.get('clientAddress'), clientPhone: f.get('clientPhone'), type: f.get('type'), ticket: f.get('ticket') === 'on', pickup: true
    }).then(() => { $('#modal').close(); toast(`Pickup requested from ${c.name}`); })
      .catch(err => { $('#nearya-error').textContent = err.message; btn.disabled = false; });
    return false;
  });
}

// Units Nearya holds for each product (by SKU).
async function openNearyaStock(id) {
  const c = carrierById(id);
  if (!c) return;
  const rows = db.products.filter(p => p.sku);
  modal(`Stock at ${esc(c.name)}`, `
    <p class="info">Units held in your Nearya stock${c.config.stockRegion ? ` (region ${esc(c.config.stockRegion)})` : ''}, next to the stock counted in Rosaino.</p>
    ${table(['Product', 'SKU', 'In Rosaino', 'At Nearya'], rows.map(p => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.sku)}</td><td>${p.stock}</td><td data-nearya-sku="${esc(p.sku)}">…</td></tr>`))}
  `, null);
  for (const p of rows) {
    const cell = document.querySelector(`[data-nearya-sku="${CSS.escape(p.sku)}"]`);
    api(`/api/carriers/${encodeURIComponent(id)}/inventory?sku=${encodeURIComponent(p.sku)}`)
      .then(r => { if (cell) cell.innerHTML = r.quantity == null ? '<small>see Nearya</small>' : `<b>${r.quantity}</b>`; })
      .catch(err => { if (cell) cell.innerHTML = `<small class="form-error">${esc(err.message)}</small>`; });
  }
}

// One Nearya parcel: status history and what can be done with it.
function openParcel(orderId) {
  const o = db.orders.find(x => x.id === orderId);
  const s = shipmentFor(orderId);
  if (!o || !s) return;
  const c = carrierById(s.carrierId);
  const nearyaParcel = isNearya(c);
  const events = [...(s.events || [])].reverse();
  modal(`Parcel ${esc(s.trackingNumber || o.id)}`, `
    <div class="stat-line"><span>Order</span><b>${esc(o.id)} · ${esc(o.customer)} · ${esc(o.city)}</b></div>
    <div class="stat-line"><span>Carrier</span><b>${esc(s.carrierName)}${s.snapshot?.region ? ' · ' + esc(s.snapshot.region) : ''}</b></div>
    <div class="stat-line"><span>Status</span><b>${badge(s.status)} ${esc(s.carrierStatus || '')}</b></div>
    ${(s.snapshot?.replacements || []).map(r => `<div class="stat-line"><span>Exchange parcel</span><b>${esc(r.trackingCode)}</b></div>`).join('')}
    <h3 class="sub">History</h3>
    <ul class="timeline">${events.map(e => `<li><b>${esc(e.raw)}</b><small>${new Date(e.at).toLocaleString()} · ${esc(e.source || '')}</small></li>`).join('')}</ul>
    ${nearyaParcel && hasPermission('shipping') ? `
      <div class="actions parcel-actions">
        <button type="button" data-action="parcel-refresh" data-id="${esc(o.id)}">Check status now</button>
        ${s.status !== 'Delivered' ? `<button type="button" data-action="parcel-relaunch" data-id="${esc(o.id)}">Relaunch delivery</button>
        <button type="button" data-action="parcel-new-recipient" data-id="${esc(o.id)}">Send to a new customer</button>` : ''}
        <button type="button" data-action="parcel-replace" data-id="${esc(o.id)}">Exchange</button>
      </div>` : ''}
    <div id="nearya-error" role="alert" class="form-error"></div>
  `, null);
}

async function parcelAction(orderId, path, body, done) {
  try {
    const r = await api(`/api/shipments/${encodeURIComponent(orderId)}/${path}`, 'POST', body || {});
    if (r.shipment) shipmentList = [r.shipment, ...(shipmentList || []).filter(x => x.orderId !== orderId)];
    await loadShipments();
    done(r);
  } catch (err) {
    const box = $('#nearya-error');
    if (box) box.textContent = err.message; else toast(err.message);
  }
}

function openNewRecipient(orderId) {
  const o = db.orders.find(x => x.id === orderId);
  const s = shipmentFor(orderId);
  if (!o || !s) return;
  modal(`Send ${esc(s.trackingNumber)} to a new customer`, `
    <p class="info">The parcel goes to another customer instead (for example after a refusal). Nearya relaunches it with the new details.</p>
    <div class="form-grid">
      <label>Customer name<input name="recipient" required></label>
      <label>Phone<input name="phone" required></label>
      <label>City<input name="city" required></label>
      <label>Nearya region<select name="regionId" required><option value="">Enter the city first</option></select></label>
      <label class="full">Address<input name="address" required></label>
      <label>Cash to collect (MAD)<input name="price" type="number" min="0" value="${Number(o.amount) || 0}"></label>
      <label>Comment<input name="comment" maxlength="200"></label>
    </div>
    <div id="nearya-error" role="alert" class="form-error"></div>
  `, 'Send to new customer', f => {
    parcelAction(orderId, 'new-recipient', {
      recipient: f.get('recipient'), phone: f.get('phone'), address: f.get('address'), regionId: f.get('regionId'),
      price: f.get('price'), comment: f.get('comment')
    }, () => { $('#modal').close(); render(); toast(`${o.id} sent to ${f.get('recipient')}`); });
    return false;
  });
  const form = $('#dialog-form');
  form.city.onchange = () => fillRegionSelect(form.regionId, s.carrierId, form.city.value);
}

function openDispatchDialog(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o || !checkAction('shipping', 'Dispatch order')) return;
  const options = activeCarriers();
  if (!options.length) {
    modal('Dispatch ' + esc(o.id), `
      <p>No carrier is connected yet. Connect one to send this order automatically and get a tracking number.</p>
      <p class="info">You can also mark it as dispatched without a carrier; you'll then update its status yourself.</p>
    `, 'Mark as dispatched', () => { shipment(o.id, 'In transit'); });
    $('#modal-content .modal-actions').insertAdjacentHTML('afterbegin', '<a href="#carriers" class="btn-link" onclick="document.getElementById(\'modal\').close()">Add a carrier</a>');
    return;
  }
  const p = product(o.product);
  modal('Dispatch ' + esc(o.id), `
    <div class="stat-line"><span>Customer</span><b>${esc(o.customer)} · ${esc(o.phone)}</b></div>
    <div class="stat-line"><span>Address</span><b>${esc(o.city)} · ${esc(o.address || '')}</b></div>
    <div class="stat-line"><span>Parcel</span><b>${esc(parcelText(o))} · ${money(o.amount)} cash on delivery</b></div>
    <div class="form-grid" style="margin-top:16px;">
      <label class="full">Carrier
        <select name="carrierId">${options.map(c => `<option value="${esc(c.id)}" data-kind="${c.kind}" ${c.name === o.carrier ? 'selected' : ''}>${esc(c.name)}${c.kind === 'manual' ? ' (manual)' : ''}</option>`).join('')}</select>
      </label>
      <label class="full manual-only">Tracking number from the carrier<input name="trackingNumber" maxlength="80" placeholder="e.g. AMX-2026-00123"></label>
      <label class="full nearya-only">Nearya delivery region for ${esc(o.city || 'this city')}
        <select name="regionId"><option value="">Loading regions…</option></select>
      </label>
      <label class="full checkline nearya-only"><input type="checkbox" name="rememberRegion" checked> Use this region for every order to ${esc(o.city || 'this city')}</label>
    </div>
    <div id="dispatch-error" role="alert" class="form-error"></div>
  `, 'Send to carrier', f => {
    const btn = $('#dialog-form button.primary');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    api('/api/shipments', 'POST', {
      orderId: o.id,
      carrierId: f.get('carrierId'),
      trackingNumber: f.get('trackingNumber') || '',
      regionId: f.get('regionId') || '',
      rememberRegion: f.get('rememberRegion') === 'on',
      order: { id: o.id, customer: o.customer, phone: o.phone, city: o.city, address: o.address, amount: o.amount, prepaid: !!o.prepaid, quantity: o.quantity, product: o.product, items: o.items, productName: p?.name || (typeof o.product === 'string' && !p ? o.product : ''), sku: p?.sku || o.sku || '', date: o.date }
    }).then(({ shipment: s }) => {
      $('#modal').close();
      o.carrier = s.carrierName;
      o.trackingNumber = s.trackingNumber;
      shipmentList = [s, ...(shipmentList || []).filter(x => x.orderId !== s.orderId)];
      try { changeStatus(o, 'In transit'); } catch (err) { toast(err.message); }
      persist();
      render();
      toast(`${o.id} sent to ${s.carrierName} · tracking ${s.trackingNumber}`);
    }).catch(err => {
      $('#dispatch-error').textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Send to carrier';
    });
    return false;
  });
  const form = $('#dialog-form');
  const syncKind = () => {
    const kind = form.carrierId.selectedOptions[0]?.dataset.kind;
    form.querySelector('.manual-only').style.display = kind === 'manual' ? '' : 'none';
    form.querySelectorAll('.nearya-only').forEach(el => { el.style.display = kind === 'nearya' ? '' : 'none'; });
    $('#dialog-form button.primary').textContent = kind === 'manual' ? 'Record dispatch' : 'Send to carrier';
    if (kind === 'nearya') fillRegionSelect(form.regionId, form.carrierId.value, o.city);
  };
  form.carrierId.onchange = syncKind;
  syncKind();
}

// 6. Products & Stock
function products() {
  return title(
    'Products & stock',
    'Manage product pricing, available units and landed costs. The storefront updates immediately.',
    `<button class="primary" data-action="new-product">+ Add product</button>`
  ) + `
    <div class="panel">
      ${table(
        ['Product / SKU', 'Category', 'Price / True Landed Cost', 'On hand', 'Reserved', 'Available', 'Storefront Status', ''],
        db.products.map(p => {
          const res = reserved(p.id);
          const avail = p.stock - res;
          const isLow = avail > 0 && avail < 15;
          const isOut = avail <= 0;
          return `
            <tr>
              <td><b>${esc(p.name)}</b><small>${esc(p.sku)}</small></td>
              <td>${esc(p.category)}</td>
              <td>${money(p.price)}<small>True Landed Cost ${money(p.cost)}</small></td>
              <td><b>${p.stock}</b></td>
              <td>${res}</td>
              <td class="${isLow ? 'stock-low' : ''}"><b>${avail}</b></td>
              <td>${isOut ? '<span class="badge returned">Out of stock</span>' : isLow ? '<span class="badge pending">Low stock</span>' : '<span class="badge active">In stock</span>'}</td>
              <td style="white-space:nowrap;">
                <button data-action="open-cms" data-id="${p.id}" class="primary" style="font-size:11px;padding:6px 10px;">Landing CMS</button>
                <a href="/product?id=${p.id}" target="_blank" style="font-size:11px;padding:6px 9px;border:1px solid #147d86;border-radius:6px;color:#147d86;text-decoration:none;font-weight:600;display:inline-block;margin-left:4px;">View Page ↗</a>
                <button data-action="stock" data-id="${p.id}">Stock</button>
                <button data-action="edit-product" data-id="${p.id}">Edit</button>
              </td>
            </tr>
          `;
        })
      )}
    </div>
    <div class="panel">
      <h2>Recent activity</h2>
      ${db.activity.slice(0, 8).map(a => `<div class="stat-line"><span>${esc(a.text)}</span><small>${new Date(a.date).toLocaleTimeString()}</small></div>`).join('') || '<p class="info">Product and order changes will appear here.</p>'}
    </div>
  `;
}

// Helper to render image upload dropzone with drag & drop file upload and preview
function renderImageDropzone(label, fieldName, currentSrc, hintText) {
  const hasImage = !!currentSrc;
  return `
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <label style="font-weight:700;margin:0;font-size:12px;color:#183243;">${label}</label>
        ${hasImage ? `<span style="font-size:11px;color:#10b981;font-weight:600;">✓ Image Active</span>` : ''}
      </div>
      
      ${hasImage ? `
        <div class="uploaded-preview-card">
          <img src="${esc(currentSrc)}" class="uploaded-preview-thumb" alt="${label}">
          <div class="uploaded-preview-info">
            <strong>${esc(currentSrc.startsWith('data:') ? 'Custom Uploaded Photo' : currentSrc.split('/').pop())}</strong>
            <small style="color:#557077;">Ready for live display</small>
          </div>
          <div class="uploaded-preview-actions">
            <button type="button" class="primary" style="font-size:11px;padding:6px 10px;" onclick="document.querySelector('#file-input-${fieldName}').click()">
              Replace ↺
            </button>
            <button type="button" class="danger" style="font-size:11px;padding:6px 10px;" data-action="remove-cms-image" data-field="${fieldName}">
              Remove ✕
            </button>
          </div>
        </div>
      ` : ''}

      <div class="image-upload-zone" data-target="${fieldName}">
        <input type="file" id="file-input-${fieldName}" accept="image/*" class="cms-file-input" data-target="${fieldName}">
        <p class="upload-text-main">${t('upload_image')}: ${label}</p>
        <p class="upload-text-sub">${hintText || t('upload_hint')} · JPG, PNG, WebP</p>
      </div>

      <input type="hidden" name="${fieldName}" id="cms-input-${fieldName}" value="${esc(currentSrc || '')}">

      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;color:#789096;margin-top:6px;">
        <span>Presets:</span>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/collection.png" style="font-size:11px;padding:4px 8px;">Collection</button>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/pattern.png" style="font-size:11px;padding:4px 8px;">Pattern</button>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/ribbon.png" style="font-size:11px;padding:4px 8px;">Ribbon</button>
      </div>
    </div>
  `;
}

// 6b. Product Landing Page CMS & Drag & Drop Builder
function cms() {
  const pList = db.products || [];
  if (!pList.length) {
    return title(t('cms'), 'No products available. Please add a product first.');
  }

  let p = pList.find(x => String(x.id) === String(activeCmsProductId));
  if (!p) {
    p = pList[0];
    activeCmsProductId = p.id;
  }

  if (!db.cmsPages) db.cmsPages = {};
  if (!db.cmsPages[p.id]) {
    db.cmsPages[p.id] = CMS_TEMPLATES[currentLang] ? CMS_TEMPLATES[currentLang](p) : CMS_TEMPLATES.fr(p);
  }

  const cms = db.cmsPages[p.id];
  if (!cms.sectionOrder || !Array.isArray(cms.sectionOrder) || !cms.sectionOrder.length) {
    cms.sectionOrder = ['announcement', 'hero_media', 'hook_and_copy', 'pricing_bundles', 'urgency_bar', 'cod_checkout', 'features', 'reviews', 'faqs'];
  }
  if (!cms.sectionsEnabled) {
    cms.sectionsEnabled = {
      announcement: true,
      hero_media: true,
      hook_and_copy: true,
      pricing_bundles: true,
      urgency_bar: true,
      cod_checkout: true,
      features: true,
      reviews: true,
      faqs: true
    };
  }

  const targetLang = cms.language || currentLang || 'fr';
  const origin = window.location.origin;
  const rawUtmCamp = utmCampaign || `Meta_${p.sku}_Scale`;
  const rawUtmCont = utmContent || 'vid_hook_v1';
  const boostLink = `${origin}/product?id=${p.id}&utm_source=${utmPlatform}&utm_medium=cpc&utm_campaign=${encodeURIComponent(rawUtmCamp)}&utm_content=${encodeURIComponent(rawUtmCont)}&lang=${targetLang}`;

  return title(
    t('cms'),
    currentLang === 'ar'
      ? 'صمم صفحات هبوط احترافية ومربحة بنظام السحب والإفلات مع دعم رفع الصور، باقات الخصم وروابط الحملات الإعلانية.'
      : currentLang === 'en'
      ? 'Intuitive drag-and-drop landing page editor with direct image uploads, bundle tiers, and instant live preview.'
      : 'Concevez des pages de vente à fort taux de conversion par glisser-déposer avec upload d\'images, packs réduits et aperçu en direct.',
    `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <select id="cms-product-select" style="min-width:220px;font-weight:700;">
          ${pList.map(item => `<option value="${item.id}" ${item.id === p.id ? 'selected' : ''}>${esc(item.name)} (${esc(item.sku)})</option>`).join('')}
        </select>
        <button type="button" class="primary" data-action="save-cms-trigger" style="display:inline-flex;align-items:center;gap:6px;">
          ${t('save_cms')}
        </button>
        <a href="/product?id=${p.id}&lang=${targetLang}" target="_blank" style="padding:10px 14px;border:1px solid #147d86;border-radius:8px;font-size:12px;color:#147d86;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
          ${t('preview_landing')}
        </a>
      </div>
    `
  ) + `
    <!-- Top Control Bar: Language for Landing Page & Layout Presets -->
    <div class="cms-lang-bar">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:13px;font-weight:700;color:#183243;display:inline-flex;align-items:center;gap:6px;">
          ${t('target_language')}
        </span>
        <div class="cms-lang-pill-group">
          <button type="button" class="btn-cms-lang ${targetLang === 'fr' ? 'active' : ''}" data-action="set-cms-lang" data-lang="fr">
            <span>🇫🇷</span> Français
          </button>
          <button type="button" class="btn-cms-lang ${targetLang === 'en' ? 'active' : ''}" data-action="set-cms-lang" data-lang="en">
            <span>🇬🇧</span> English
          </button>
          <button type="button" class="btn-cms-lang ${targetLang === 'ar' ? 'active' : ''}" data-action="set-cms-lang" data-lang="ar">
            <span>🇲🇦</span> العربية (RTL)
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="font-size:12px;color:#557077;">${t('presets')}:</span>
        <button type="button" class="btn-cms-lang" data-action="apply-preset" data-preset="flash_cod" title="High-converting urgency layout with countdown and COD form at top">
          Flash COD
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-preset" data-preset="minimal" title="Clean minimalist luxury layout">
          Minimal Luxury
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-preset" data-preset="bundles" title="Quantity bundles layout to boost average order value">
          Bundle Booster
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-lang-template" data-lang="${targetLang}" title="Load idiomatic high-converting copy in ${targetLang.toUpperCase()}">
          ${t('auto_translate')} ${targetLang.toUpperCase()}
        </button>
      </div>
    </div>

    <!-- Ad Manager Boost Link Generator Banner (Collapsible) -->
    <details class="panel" style="border: 2px solid #147d86;background:#fcfefe;margin-bottom:20px;">
      <summary style="cursor:pointer;padding:8px 0;font-weight:700;color:#147d86;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:inline-flex;align-items:center;gap:8px;">
          Ad Manager Boost Link & UTM Attribution (Meta, TikTok, Snapchat)
        </span>
        <span style="font-size:12px;text-decoration:underline;">Click to expand / collapse ▾</span>
      </summary>
      
      <div style="margin-top:14px;border-top:1px solid #e1eeec;padding-top:14px;">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 14px;">
          <label>
            Ad Network / Platform
            <select id="boost-platform">
              <option value="meta" ${utmPlatform === 'meta' ? 'selected' : ''}>Meta Ads (Facebook & Instagram)</option>
              <option value="tiktok" ${utmPlatform === 'tiktok' ? 'selected' : ''}>TikTok Ads</option>
              <option value="snapchat" ${utmPlatform === 'snapchat' ? 'selected' : ''}>Snapchat Ads</option>
              <option value="google" ${utmPlatform === 'google' ? 'selected' : ''}>Google Ads / Search</option>
              <option value="influencer" ${utmPlatform === 'influencer' ? 'selected' : ''}>Influencer Promotion Link</option>
            </select>
          </label>
          <label>
            Campaign Name (utm_campaign)
            <input id="boost-campaign" value="${esc(rawUtmCamp)}" placeholder="e.g. Meta_Scale_Maroc">
          </label>
          <label>
            Creative / Ad Set ID (utm_content)
            <input id="boost-content" value="${esc(rawUtmCont)}" placeholder="e.g. vid_unboxing_v1">
          </label>
        </div>

        <div style="background:#f0f8f7;border:1px solid #b8d8cd;border-radius:8px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <code style="font-size:12px;color:#147d86;word-break:break-all;flex:1;">${esc(boostLink)}</code>
          <div style="display:flex;gap:8px;">
            <button type="button" data-action="copy-boost-url" data-url="${esc(boostLink)}" style="font-size:12px;font-weight:700;">
              Copy Link
            </button>
            <a href="${esc(boostLink)}" target="_blank" style="padding:6px 12px;border:1px solid #147d86;border-radius:6px;font-size:12px;color:#147d86;font-weight:600;">
              Test Link ↗
            </a>
          </div>
        </div>
      </div>
    </details>

    <!-- Main CMS Workspace: Drag-and-Drop Canvas (Left) + Interactive Live Device Preview (Right) -->
    <form id="cms-editor-form">
      <div class="cms-builder-wrap">
        
        <!-- Left: Drag-and-Drop Blocks List -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <h2 style="font-size:16px;margin:0 0 2px;">${t('drag_drop_title')}</h2>
              <p style="font-size:12px;color:#789096;margin:0;">${t('drag_drop_hint')}</p>
            </div>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn-cms-lang" data-action="expand-all-sections" style="font-size:11px;">
                Expand All ▾
              </button>
              <button type="button" class="btn-cms-lang" data-action="collapse-all-sections" style="font-size:11px;">
                Collapse All ▸
              </button>
            </div>
          </div>

          <div class="cms-blocks-list" id="cms-sections-container">
            ${cms.sectionOrder.map((secId, index) => {
              const def = CMS_SECTION_DEFS[secId] || { icon: '📦', title: { fr: secId, en: secId, ar: secId }, desc: { fr: '', en: '', ar: '' } };
              const isEnabled = cms.sectionsEnabled?.[secId] !== false;
              const isExpanded = expandedSections.has(secId);
              const titleText = def.title[targetLang] || def.title.fr || def.title.en;
              const descText = def.desc[targetLang] || def.desc.fr || def.desc.en;

              return `
                <div class="section-block ${isExpanded ? 'expanded' : ''} ${!isEnabled ? 'disabled-section' : ''}" data-section-id="${secId}" draggable="true">
                  <div class="section-head">
                    <span class="drag-handle" title="Drag to reorder section">⠿</span>
                    <div class="section-meta">
                      <h3>
                        ${esc(titleText)}
                        ${!isEnabled ? '<span class="badge" style="background:#fee2e2;color:#b91c1c;font-size:10px;">Hidden</span>' : ''}
                      </h3>
                      <p>${esc(descText)}</p>
                    </div>
                    <div class="section-actions">
                      <button type="button" class="btn-icon-action ${isEnabled ? 'toggle-active' : 'toggle-inactive'}" data-action="toggle-section" data-id="${secId}" title="${isEnabled ? 'Click to hide section' : 'Click to show section'}">
                        ${isEnabled ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" class="btn-icon-action" data-action="move-section-up" data-id="${secId}" title="Move section up" ${index === 0 ? 'disabled' : ''}>
                        ▲
                      </button>
                      <button type="button" class="btn-icon-action" data-action="move-section-down" data-id="${secId}" title="Move section down" ${index === cms.sectionOrder.length - 1 ? 'disabled' : ''}>
                        ▼
                      </button>
                      <button type="button" class="btn-icon-action btn-chevron" data-action="toggle-section-expand" data-id="${secId}" title="Expand or collapse settings">
                        ▾
                      </button>
                    </div>
                  </div>

                  <div class="section-body">
                    ${renderSectionBody(secId, cms, p, targetLang)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Actions Card -->
          <div class="panel" style="margin-top:20px;background:#f0f8f7;border:1.5px solid #147d86;text-align:center;">
            <button type="submit" class="primary" style="width:100%;padding:14px;font-size:15px;justify-content:center;margin-bottom:10px;">
              ${t('save_cms')}
            </button>
            <div style="display:flex;gap:10px;justify-content:center;">
              <a href="/product?id=${p.id}&lang=${targetLang}" target="_blank" style="padding:8px 14px;border:1px solid #147d86;border-radius:6px;font-size:12px;color:#147d86;font-weight:700;">
                ${t('preview_landing')}
              </a>
              <button type="button" data-action="reset-cms-product" data-id="${p.id}" style="font-size:12px;">
                Reset to Defaults ↺
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Live Device Preview -->
        <div class="cms-preview-column">
          <div class="device-toolbar">
            <span style="font-size:12px;font-weight:700;color:#183243;display:inline-flex;align-items:center;gap:6px;">
              ${t('live_preview')}
            </span>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="btn-visual-mode ${visualEditMode ? 'active' : ''}" data-action="toggle-visual-edit-mode" title="Toggle interactive in-preview editing">
                ${visualEditMode ? 'Visual Edit ON' : 'Visual Edit Mode'}
              </button>
              <div class="device-toggles">
                <button type="button" class="btn-device ${previewDevice === 'desktop' ? 'active' : ''}" data-device="desktop">
                  ${t('device_desktop')}
                </button>
                <button type="button" class="btn-device ${previewDevice === 'tablet' ? 'active' : ''}" data-device="tablet">
                  ${t('device_tablet')}
                </button>
                <button type="button" class="btn-device ${previewDevice === 'mobile' ? 'active' : ''}" data-device="mobile">
                  ${t('device_mobile')}
                </button>
              </div>
            </div>
          </div>

          ${visualEditMode ? `
            <div class="visual-edit-tip">
              <div style="flex:1;">
                <strong>In-Preview Direct Editing Active:</strong>
                <span>Click any text, button or COD field in the preview below to focus & edit it, or use the <b>▲/▼</b> section bars directly in the preview to reorder!</span>
              </div>
            </div>
          ` : ''}

          <div class="preview-viewport-wrap">
            <iframe id="cms-preview-iframe" class="preview-iframe-box device-${previewDevice}" src="/product?id=${p.id}&preview=1&lang=${targetLang}" title="Product Landing Live Preview"></iframe>
          </div>

          <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#789096;">
            <span>Updates in real-time as you drag or edit</span>
            <a href="/product?id=${p.id}&lang=${targetLang}" target="_blank" style="color:#147d86;font-weight:600;">
              ${t('open_public')}
            </a>
          </div>
        </div>

      </div>
    </form>
  `;
}

// Sub-render function for each draggable section's internal form controls
function renderSectionBody(secId, cms, p, targetLang) {
  if (secId === 'announcement') {
    return `
      <div class="form-grid">
        <label class="full">
          Announcement Bar Message
          <input name="announcement" value="${esc(cms.announcement)}" placeholder="⚡ Special Ramadan Offer · Free Express Delivery Across Morocco">
        </label>
        <label style="display:flex;flex-direction:row;align-items:center;gap:8px;font-weight:600;margin-top:4px;">
          <input type="checkbox" name="announcementEnabled" ${cms.announcementEnabled !== false ? 'checked' : ''} style="width:18px;height:18px;">
          Show Top Announcement Bar
        </label>
      </div>
    `;
  }

  if (secId === 'hero_media') {
    return `
      <div style="background:#fcfdfe;border:1px solid #e7ecee;border-radius:10px;padding:16px;margin-bottom:14px;">
        <h4 style="margin:0 0 12px;font-size:13px;color:#147d86;">Drag & Drop Product Pictures (Upload Directly)</h4>
        
        <!-- Hero Main Image -->
        ${renderImageDropzone('1. Main Hero Image (Primary Showcase)', 'heroImage', cms.heroImage || p.image || '/assets/collection.png', 'Drag & drop your main high-res product photo here')}

        <!-- Secondary Lifestyle Image -->
        ${renderImageDropzone('2. Secondary Lifestyle / Texture Photo', 'secondaryImage', cms.secondaryImage || '/assets/pattern.png', 'Drag & drop lifestyle or package view')}

        <!-- Gallery Image 3 -->
        ${renderImageDropzone('3. Additional Gallery Detail Photo', 'galleryImage3', cms.galleryImage3 || '/assets/ribbon.png', 'Drag & drop close-up craftsmanship shot')}

        <label style="margin-top:10px;">
          Product Badge / Discount Tag Overlay
          <input name="badgeText" value="${esc(cms.badgeText)}" placeholder="🔥 LIMITED OFFER - SAVE 200 MAD">
        </label>
      </div>
    `;
  }

  if (secId === 'hook_and_copy') {
    return `
      <div class="form-grid">
        <label class="full">
          Browser Page Title (SEO & Social Sharing)
          <input name="pageTitle" value="${esc(cms.pageTitle || `${p.name} — Rosaino Store`)}" placeholder="e.g. ${esc(p.name)} — Rosaino Official Store">
        </label>
        <label class="full">
          Main Catchy Hook / Headline *
          <input name="headline" value="${esc(cms.headline)}" required placeholder="e.g. Experience the everyday craft of ${esc(p.name)}">
        </label>
        <label class="full">
          Subtitle & Reassuring Value Proposition
          <textarea name="subtitle" style="min-height:70px;">${esc(cms.subtitle)}</textarea>
        </label>
      </div>
    `;
  }

  if (secId === 'pricing_bundles') {
    return `
      <div class="form-grid">
        <label class="full" style="display:flex;flex-direction:row;align-items:center;gap:10px;font-weight:700;">
          <input type="checkbox" name="pricingTableEnabled" ${cms.pricingTableEnabled !== false ? 'checked' : ''} style="width:18px;height:18px;">
          Enable Quantity Pricing Table / Bundle Deal Selector on Landing Page
        </label>
        <label>
          Single Unit MSRP / Regular Price (MAD)
          <input type="number" name="tier1_orig" value="${cms.tiers?.[0]?.originalPrice || Math.round(p.price * 1.35)}" min="1">
        </label>
        <label>
          Single Unit COD Sale Price (MAD) *
          <input type="number" name="tier1_price" value="${cms.tiers?.[0]?.price || p.price}" required min="1">
        </label>
        <label>
          Single Unit Badge
          <input name="tier1_badge" value="${esc(cms.tiers?.[0]?.badge || 'Standard Offer')}">
        </label>
        <label>
          Duo Pack (2 Units) Total Price (MAD)
          <input type="number" name="tier2_price" value="${cms.tiers?.[1]?.price || Math.round(p.price * 1.75)}" min="1">
        </label>
        <label>
          Duo Pack Badge Label
          <input name="tier2_badge" value="${esc(cms.tiers?.[1]?.badge || 'MOST POPULAR 🔥')}">
        </label>
        <label>
          Family Pack (3 Units) Total Price (MAD)
          <input type="number" name="tier3_price" value="${cms.tiers?.[2]?.price || Math.round(p.price * 2.35)}" min="1">
        </label>
        <label>
          Family Pack Badge Label
          <input name="tier3_badge" value="${esc(cms.tiers?.[2]?.badge || 'BEST VALUE 🏆 + Free Gift')}">
        </label>
      </div>
    `;
  }

  if (secId === 'urgency_bar') {
    return `
      <div class="form-grid">
        <label class="full" style="display:flex;flex-direction:row;align-items:center;gap:10px;font-weight:700;">
          <input type="checkbox" name="urgencyEnabled" ${cms.urgencyEnabled !== false ? 'checked' : ''} style="width:18px;height:18px;">
          Show Urgency Countdown Timer & Stock Scarcity Bar
        </label>
        <label>
          Flash Countdown Hours
          <input type="number" name="countdownHours" value="${cms.countdownHours || 5}" min="1" max="48">
        </label>
        <label>
          Stock Scarcity Units Left
          <input type="number" name="stockLeft" value="${cms.stockLeft || 7}" min="1" max="99">
        </label>
        <label>
          Star Rating Display
          <input name="rating" value="${esc(cms.rating || '4.9')}" placeholder="4.9">
        </label>
        <label>
          Verified Moroccan Reviews Count
          <input type="number" name="reviewCount" value="${cms.reviewCount || 184}" min="1">
        </label>
      </div>
    `;
  }

  if (secId === 'cod_checkout') {
    if (!cms.codFields || !Array.isArray(cms.codFields) || !cms.codFields.length) {
      const tpl = CMS_TEMPLATES[targetLang] || CMS_TEMPLATES.fr;
      cms.codFields = JSON.parse(JSON.stringify(tpl(p).codFields || DEFAULT_COD_FIELDS));
    }

    const fields = cms.codFields;
    const activeCount = fields.filter(f => f.enabled !== false).length;

    return `
      <div class="form-grid" style="margin-bottom:18px;">
        <label class="full">
          Checkout Section Title
          <input name="checkoutHeadline" value="${esc(cms.checkoutHeadline || 'Complete Your Order Below')}" placeholder="e.g. Complete Your Order Below">
        </label>
        <label class="full">
          Reassurance Subtitle
          <input name="checkoutSubtitle" value="${esc(cms.checkoutSubtitle || 'Pay with Cash to the courier at your doorstep upon arrival.')}" placeholder="e.g. Pay with Cash upon arrival">
        </label>
        <label>
          Order Button Call-to-Action Text
          <input name="submitButtonText" value="${esc(cms.submitButtonText || 'CONFIRM CASH ON DELIVERY ORDER ➔')}">
        </label>
        <label>
          Customer Support WhatsApp Number
          <input name="supportPhone" value="${esc(cms.supportPhone || '212600000000')}" placeholder="212600000000">
        </label>
      </div>

      <!-- COD Form Fields Drag-and-Drop Builder -->
      <div class="cod-fields-customizer" style="background:#f8fafb;border:1.5px solid #b8d8cd;border-radius:10px;padding:16px;margin-top:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
          <div>
            <h4 style="margin:0 0 4px;font-size:13.5px;color:#147d86;display:flex;align-items:center;gap:6px;">
              Moroccan Express COD Form Fields Builder
              <span class="badge" style="background:#147d86;color:#fff;font-size:10.5px;font-weight:700;">${activeCount} / ${fields.length} Active</span>
            </h4>
            <p style="margin:0;font-size:11.5px;color:#64748b;">
              Drag & drop fields to reorder the form, toggle visibility, customize labels & placeholders, or add custom checkout fields.
            </p>
          </div>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-cms-lang" data-action="add-cod-field" style="background:#147d86;color:#fff;font-size:11px;font-weight:700;border:none;padding:6px 12px;border-radius:6px;">
              + Add Custom Field
            </button>
            <button type="button" class="btn-cms-lang" data-action="reset-cod-fields" style="font-size:11px;padding:6px 10px;border-radius:6px;" title="Reset fields to Moroccan COD defaults">
              Reset Fields ↺
            </button>
          </div>
        </div>

        <div class="cod-fields-container" id="cod-fields-container">
          ${fields.map((f, idx) => {
            const isEnabled = f.enabled !== false;
            const isExpanded = expandedCodFields.has(f.id);

            return `
              <div class="cod-field-item ${!isEnabled ? 'disabled-field' : ''} ${isExpanded ? 'expanded' : ''}" data-field-id="${esc(f.id)}" draggable="true">
                <div class="cod-field-head">
                  <span class="drag-handle cod-drag-handle" title="Drag to reorder field">⠿</span>
                  <div class="cod-field-meta">
                    <strong>${esc(f.label || f.key)}</strong>
                    <span class="cod-field-tag">key: ${esc(f.key)}</span>
                    <span class="cod-field-tag ${f.required ? 'required' : ''}">
                      ${f.required ? 'Required *' : 'Optional'}
                    </span>
                    <span class="cod-field-tag type">${f.type}</span>
                  </div>
                  <div class="cod-field-actions" style="display:flex;align-items:center;gap:4px;">
                    <button type="button" class="btn-icon-action ${isEnabled ? 'toggle-active' : 'toggle-inactive'}" data-action="toggle-cod-field" data-id="${esc(f.id)}" title="${isEnabled ? 'Disable field' : 'Enable field'}" style="font-size:12px;padding:4px 6px;">
                      ${isEnabled ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" class="btn-icon-action" data-action="move-cod-field-up" data-id="${esc(f.id)}" title="Move field up" ${idx === 0 ? 'disabled' : ''} style="font-size:10px;padding:4px 6px;">
                      ▲
                    </button>
                    <button type="button" class="btn-icon-action" data-action="move-cod-field-down" data-id="${esc(f.id)}" title="Move field down" ${idx === fields.length - 1 ? 'disabled' : ''} style="font-size:10px;padding:4px 6px;">
                      ▼
                    </button>
                    <button type="button" class="btn-icon-action btn-chevron" data-action="toggle-cod-field-expand" data-id="${esc(f.id)}" title="Field configuration" style="font-size:11px;padding:4px 7px;">
                      ${isExpanded ? '▴' : '▾'}
                    </button>
                    <button type="button" class="btn-icon-action" data-action="delete-cod-field" data-id="${esc(f.id)}" title="Delete field" style="color:#b91c1c;font-size:11px;padding:4px 6px;">
                      Delete
                    </button>
                  </div>
                </div>

                <div class="cod-field-settings">
                  <div class="form-grid" style="gap:10px;">
                    <label>
                      Field Display Label *
                      <input name="cod_${esc(f.id)}_label" value="${esc(f.label)}" required placeholder="e.g. Nom complet, Ville, etc.">
                    </label>
                    <label>
                      Form Field Key (Internal Name)
                      <input name="cod_${esc(f.id)}_key" value="${esc(f.key)}" required placeholder="e.g. name, phone, city" style="font-family:monospace;font-size:12px;">
                    </label>
                    <label>
                      Input Placeholder Text
                      <input name="cod_${esc(f.id)}_placeholder" value="${esc(f.placeholder || '')}" placeholder="e.g. ex. Fatima Zahra Bennani">
                    </label>
                    <label>
                      Field Type
                      <select name="cod_${esc(f.id)}_type">
                        <option value="text" ${f.type === 'text' ? 'selected' : ''}>Text (Single Line)</option>
                        <option value="tel" ${f.type === 'tel' ? 'selected' : ''}>Telephone (Moroccan Phone)</option>
                        <option value="textarea" ${f.type === 'textarea' ? 'selected' : ''}>Textarea (Multi-line Address/Notes)</option>
                        <option value="select" ${f.type === 'select' ? 'selected' : ''}>Select Dropdown (List of Cities/Choices)</option>
                        <option value="checkbox" ${f.type === 'checkbox' ? 'selected' : ''}>Checkbox (Confirmation / Opt-in)</option>
                        <option value="number" ${f.type === 'number' ? 'selected' : ''}>Number</option>
                      </select>
                    </label>
                    <label class="full">
                      Help Text / Sub-Label
                      <input name="cod_${esc(f.id)}_help" value="${esc(f.help || '')}" placeholder="e.g. Notre agent vous appelle pour valider la livraison.">
                    </label>
                    ${f.type === 'select' ? `
                      <label class="full">
                        Dropdown Options (Comma separated list)
                        <textarea name="cod_${esc(f.id)}_options" style="min-height:55px;" placeholder="Casablanca, Rabat, Marrakech, Tanger, Fès...">${esc(f.options || '')}</textarea>
                      </label>
                    ` : ''}
                    <label class="full" style="display:flex;flex-direction:row;align-items:center;gap:8px;font-weight:600;margin-top:2px;">
                      <input type="checkbox" name="cod_${esc(f.id)}_required" ${f.required ? 'checked' : ''} style="width:16px;height:16px;">
                      Mandatory / Required Field (customer cannot place order without completing this)
                    </label>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  if (secId === 'features') {
    if (!cms.features || !Array.isArray(cms.features)) {
      cms.features = [
        { title: 'Artisan Craftsmanship', desc: 'Constructed from carefully selected, honest materials built to last.' },
        { title: 'Express Moroccan Delivery', desc: 'Doorstep dispatch in 24 to 48 hours to all Moroccan cities via trusted couriers.' },
        { title: 'Zero Risk · Pay Upon Arrival', desc: 'No online cards required. Inspect your parcel before handing cash to the driver.' },
        { title: '14-Day Hassle-Free Exchange', desc: 'Dedicated WhatsApp customer support team standing by for any sizing or swap needs.' }
      ];
    }
    const list = cms.features;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;color:#64748b;">Highlight key product selling points, quality guarantees, or shipping promises.</span>
        <button type="button" class="btn-cms-lang" data-action="add-feature" style="font-size:11px;padding:4px 10px;">+ Add Feature</button>
      </div>
      <div class="form-grid" style="gap:12px;">
        ${list.map((f, i) => `
          <div style="background:#f8fafb;border:1px solid #e3e9eb;border-radius:8px;padding:12px;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:12px;color:#147d86;">Benefit Card #${i + 1}</strong>
              <button type="button" class="btn-icon-action" data-action="delete-feature" data-id="${i}" title="Delete feature" style="color:#b91c1c;font-size:11px;padding:2px 6px;">Delete</button>
            </div>
            <label style="margin-top:6px;">Title<input name="feat_${i}_title" value="${esc(f.title)}" required></label>
            <label style="margin-top:6px;">Description<input name="feat_${i}_desc" value="${esc(f.desc)}" required></label>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (secId === 'reviews') {
    if (!cms.reviews || !Array.isArray(cms.reviews)) {
      cms.reviews = [
        { name: 'Kenza Alaoui', city: 'Casablanca', comment: 'Ordered yesterday and received it today in Maarif!' },
        { name: 'Youssef El Amrani', city: 'Rabat', comment: 'Very pleased with the quality.' }
      ];
    }
    const list = cms.reviews;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;color:#64748b;">Social proof and customer reviews build trust with Moroccan buyers.</span>
        <button type="button" class="btn-cms-lang" data-action="add-review" style="font-size:11px;padding:4px 10px;">+ Add Testimonial</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${list.map((r, i) => `
          <div style="background:#f8fafb;border:1px solid #e3e9eb;border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:11.5px;color:#147d86;">Reviewer #${i + 1}</strong>
              <button type="button" class="btn-icon-action" data-action="delete-review" data-id="${i}" title="Delete testimonial" style="color:#b91c1c;font-size:11px;padding:2px 6px;">Delete</button>
            </div>
            <div class="form-grid" style="margin-top:6px;">
              <label>Name<input name="rev_${i}_name" value="${esc(r.name)}" required></label>
              <label>City<input name="rev_${i}_city" value="${esc(r.city)}" required></label>
            </div>
            <label style="margin-top:8px;">Customer Testimonial<textarea name="rev_${i}_comment" style="min-height:55px;" required>${esc(r.comment)}</textarea></label>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (secId === 'faqs') {
    if (!cms.faqs || !Array.isArray(cms.faqs)) {
      cms.faqs = [
        { q: 'How does Cash on Delivery (COD) work?', a: 'Pay cash to the courier when they hand you the package.' },
        { q: 'Can I open and check before paying?', a: 'Yes, inspection before payment is guaranteed.' },
        { q: 'How fast is delivery?', a: '24–48 hours across major Moroccan cities.' }
      ];
    }
    const list = cms.faqs;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;color:#64748b;">Answer common buyer questions to eliminate checkout friction.</span>
        <button type="button" class="btn-cms-lang" data-action="add-faq" style="font-size:11px;padding:4px 10px;">+ Add FAQ</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${list.map((faq, i) => `
          <div style="background:#f8fafb;border:1px solid #e3e9eb;border-radius:8px;padding:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:11.5px;color:#147d86;">FAQ #${i + 1}</strong>
              <button type="button" class="btn-icon-action" data-action="delete-faq" data-id="${i}" title="Delete FAQ" style="color:#b91c1c;font-size:11px;padding:2px 6px;">Delete</button>
            </div>
            <label style="margin-top:6px;">Question<input name="faq_${i}_q" value="${esc(faq.q)}" required></label>
            <label style="margin-top:8px;">Answer<textarea name="faq_${i}_a" style="min-height:60px;" required>${esc(faq.a)}</textarea></label>
          </div>
        `).join('')}
      </div>
    `;
  }

  return '<p style="color:#789096;">Section settings</p>';
}

// 7. Suppliers & Purchase Orders (PO) with True Landed Cost Engine
function suppliers() {
  const poList = db.purchaseOrders || [];
  return title(
    'Suppliers & purchase orders',
    'Track Purchase Orders from factory to warehouse. True Landed Cost engine factoring freight, customs and port handling.',
    `<button class="primary" data-action="new-po">＋ Create Purchase Order (PO)</button><button data-action="new-supplier">Add supplier</button>`
  ) + `
    <!-- Purchase Orders & True Landed Costs Matrix -->
    <div class="panel" style="border: 2px solid #147d86;background:#fcfefe;">
      <div class="panel-head">
        <div>
          <span class="badge active" style="margin-bottom:6px;">PROCUREMENT & LANDED COSTS</span>
          <h2>Purchase Orders (PO) Lifecycle</h2>
          <p>Calculates true unit cost: Factory Price + International Freight + Customs & Port Duties + Local Handling.</p>
        </div>
      </div>
      ${table(
        ['PO Number / Date', 'Product / Supplier', 'Quantity', 'Factory / Freight / Customs', 'True Landed Cost', 'Gross Margin', 'Status', 'Actions'],
        poList.map(po => {
          const isReceived = po.status === 'Received';
          return `
            <tr>
              <td>
                <b>${esc(po.poNumber || po.id)}</b>
                <small>${esc(po.orderDate)}</small>
              </td>
              <td>
                <strong>${esc(po.productName)}</strong>
                <small>Supplier: ${esc(po.supplierName)}</small>
              </td>
              <td><b>${po.quantity} units</b></td>
              <td>
                <small>Factory: ${money(po.factoryPricePerUnit)}/u<br>Freight: ${money(po.freightShipping)} · Duty: ${money(po.customsDuty)}</small>
              </td>
              <td>
                <b style="color:#147d86;font-size:14px;">${money(po.landedCostPerUnit)}</b>
                <small>per unit landed</small>
              </td>
              <td>
                <span class="roas-badge golden">${po.expectedMarginPercent || 60}%</span>
                <small>MSRP ${money(po.sellingPrice)}</small>
              </td>
              <td>${badge(po.status)}</td>
              <td>
                ${!isReceived ? `
                  <button data-action="receive-po" data-id="${po.id}" class="primary" style="font-size:11px;padding:6px 10px;">
                    Receive into Stock ↗
                  </button>
                ` : `<span style="color:#16a34a;font-weight:600;font-size:11px;">✓ In Stock</span>`}
              </td>
            </tr>
          `;
        })
      )}
    </div>

    <div class="cards">
      ${db.suppliers.map(s => `
        <div class="panel">
          <div class="mini-icon">◇</div>
          <h2>${esc(s.name)}</h2>
          <p class="info">${esc(s.city)}<br>${esc(s.contact)}</p>
          <div class="stat-line"><span>Lead time</span><b>${s.lead} days</b></div>
          <div class="stat-line"><span>Linked products</span><b>${db.products.filter(p => p.supplier === s.name).length}</b></div>
          <p><button data-action="restock" data-id="${s.id}">Quick restock</button></p>
        </div>
      `).join('')}
    </div>
  `;
}

// 8. Finance
function finance() {
  const d = db.orders.filter(o => o.status === 'Delivered');
  const rev = sum(d, 'amount');
  const cost = sum(d, 'cost');
  const shipping = sum(db.orders.filter(o => ['Delivered', 'Returned', 'In transit'].includes(o.status)), 'shipping');
  const expenses = sum(db.expenses, 'amount');

  return title(
    'COD accounting',
    'A transparent view of COD collections, true landed costs and courier remittance.',
    `<button class="primary" data-action="expense">＋ Record expense</button>`
  ) + `
    <div class="metrics">
      ${metric('Collected COD', money(rev), 'Delivered order revenue')}
      ${metric('Product Landed Cost', money(cost), 'Cost of delivered products')}
      ${metric('Shipping + expenses', money(shipping + expenses), 'Includes dispatched and returned orders')}
      ${metric('Net contribution', money(rev - cost - shipping - expenses), 'Before salaries, tax and fixed overhead')}
    </div>
    <div class="grid">
      <div class="panel">
        <h2>Expense ledger</h2>
        ${table(['Description', 'Category', 'Amount'], db.expenses.map(e => `<tr><td>${esc(e.name)}</td><td>${esc(e.category)}</td><td>${money(e.amount)}</td></tr>`))}
      </div>
      <div class="panel">
        <h2>Cash position</h2>
        <div class="stat-line"><span>Collected from delivered orders</span><b>${money(rev)}</b></div>
        <div class="stat-line"><span>Expected from in-transit orders</span><b>${money(sum(db.orders.filter(o => o.status === 'In transit'), 'amount'))}</b></div>
        <div class="stat-line"><span>Return shipping exposure</span><b>${money(sum(db.orders.filter(o => o.status === 'Returned'), 'shipping'))}</b></div>
      </div>
    </div>
  `;
}

// 8b. Courier COD Cash Remittance & Audit Reconciler
function reconciliation() {
  const delivered = db.orders.filter(o => o.status === 'Delivered');
  const totalCollected = sum(delivered, 'amount');
  const remitted = delivered.filter(o => o.remittanceStatus === 'Remitted');
  const pending = delivered.filter(o => o.remittanceStatus === 'Pending');
  const overdue = delivered.filter(o => o.remittanceStatus === 'Overdue');
  const discrepancies = delivered.filter(o => (o.courierFeeCharged || 35) > 35);

  const remittedAmount = sum(remitted, 'amount');
  const pendingAmount = sum(pending, 'amount');
  const overdueAmount = sum(overdue, 'amount');
  const overchargeSum = discrepancies.reduce((s, o) => s + ((o.courierFeeCharged || 35) - 35), 0);

  const carriers = ['Digylog', 'OzoneExpress', 'AMEEX'];

  // Filter list by selected filter tab
  let displayList = delivered;
  if (remittanceFilter === 'pending') displayList = pending;
  else if (remittanceFilter === 'overdue') displayList = overdue;
  else if (remittanceFilter === 'remitted') displayList = remitted;
  else if (remittanceFilter === 'discrepancies') displayList = discrepancies;

  return title(
    'Courier remittance audit',
    'Track collected COD cash in courier accounts, audit bank transfers, and eliminate courier payment leakage.',
    `<button class="primary" data-action="reconcile-modal">Batch Mark as Remitted</button><button data-action="dispute-statement">Courier Claim Statement</button>`
  ) + `
    <div class="metrics">
      ${metric('Collected at Doorstep', money(totalCollected), `${delivered.length} parcels paid cash on delivery`)}
      ${metric('Remitted into Bank', money(remittedAmount), `${remitted.length} parcels settled via wire transfer`)}
      ${metric('Pending with Couriers', money(pendingAmount), `${pending.length} parcels in standard 7-day payout cycle`)}
      ${metric('Overdue Cash (>7 Days)', money(overdueAmount), `${overdue.length} parcels unremitted · Action Required`)}
    </div>

    <!-- Carrier Performance & Cash Exposure Cards -->
    <div class="cards" style="margin-bottom:22px;">
      ${carriers.map(c => {
        const cOrders = delivered.filter(o => o.carrier === c);
        const cCollected = sum(cOrders, 'amount');
        const cSettled = sum(cOrders.filter(o => o.remittanceStatus === 'Remitted'), 'amount');
        const cHeld = sum(cOrders.filter(o => o.remittanceStatus !== 'Remitted'), 'amount');
        const cOverdue = cOrders.filter(o => o.remittanceStatus === 'Overdue').length;
        return `
          <div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              ${cOverdue ? '<span class="badge returned">Overdue Cash</span>' : '<span class="badge active">On Schedule</span>'}
            </div>
            <h2>${esc(c)}</h2>
            <p class="info">${cOrders.length} delivered parcels · Tariff: 35 MAD</p>
            <div class="stat-line"><span>Collected</span><b>${money(cCollected)}</b></div>
            <div class="stat-line"><span>Remitted to Bank</span><b style="color:#16a34a;">${money(cSettled)}</b></div>
            <div class="stat-line"><span>Outstanding Cash</span><b style="color:#b45309;">${money(cHeld)}</b></div>
            <p style="margin-top:14px;"><button data-action="filter-carrier" data-carrier="${c}">View ${c} Manifest ↗</button></p>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Delivered Orders Remittance Ledger -->
    <div class="panel" style="border: 2px solid #147d86;background:#fcfefe;">
      <div class="panel-head">
        <div>
          <span class="badge active" style="margin-bottom:6px;">COURIER SETTLEMENT LEDGER</span>
          <h2>Delivered Parcels Cash Reconciliation</h2>
          <p>Audits every delivered package against courier bank remittances (bordereaux de virement). Discrepancies are highlighted.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button data-action="remittance-filter" data-val="all" class="${remittanceFilter === 'all' ? 'primary' : ''}" style="font-size:11px;">All Delivered (${delivered.length})</button>
          <button data-action="remittance-filter" data-val="pending" class="${remittanceFilter === 'pending' ? 'primary' : ''}" style="font-size:11px;">Pending (${pending.length})</button>
          <button data-action="remittance-filter" data-val="overdue" class="${remittanceFilter === 'overdue' ? 'primary' : ''}" style="font-size:11px;color:#dc2626;">Overdue (${overdue.length})</button>
          <button data-action="remittance-filter" data-val="remitted" class="${remittanceFilter === 'remitted' ? 'primary' : ''}" style="font-size:11px;color:#16a34a;">Settled (${remitted.length})</button>
          <button data-action="remittance-filter" data-val="discrepancies" class="${remittanceFilter === 'discrepancies' ? 'primary' : ''}" style="font-size:11px;color:#b45309;">Overcharges (${discrepancies.length})</button>
        </div>
      </div>

      ${table(
        ['Order / Destination', 'Carrier & Date', 'Collected COD', 'Courier Fee Charged', 'Net Cash Due', 'Remittance Status', 'Actions'],
        displayList.map(o => {
          const fee = o.courierFeeCharged || 35;
          const isOvercharged = fee > 35;
          const netDue = o.amount - fee;
          const isRemitted = o.remittanceStatus === 'Remitted';
          const isOverdue = o.remittanceStatus === 'Overdue';

          return `
            <tr>
              <td>
                <b>${esc(o.id)}</b>
                <small>${esc(o.customer)} · ${esc(o.city)}</small>
              </td>
              <td>
                <b>${esc(o.carrier)}</b>
                <small>Delivered ${esc(o.date)}</small>
              </td>
              <td><b style="font-size:14px;color:#147d86;">${money(o.amount)}</b></td>
              <td>
                <b>${money(fee)}</b>
                ${isOvercharged ? `<small style="color:#dc2626;font-weight:700;">+${fee - 35} MAD Overcharge</small>` : '<small style="color:#16a34a;">Standard Tariff</small>'}
              </td>
              <td><b>${money(netDue)}</b></td>
              <td>
                ${isRemitted ? `
                  <span class="badge delivered">✓ Settled in Bank</span>
                  <small style="color:#16a34a;">${esc(o.remittanceRef || 'Wire Received')}</small>
                ` : isOverdue ? `
                  <span class="badge returned">Overdue (>7d)</span>
                  <small style="color:#dc2626;">Cash with Courier</small>
                ` : `
                  <span class="badge in-transit">⏳ Pending Payout</span>
                  <small>Standard cycle</small>
                `}
              </td>
              <td>
                ${!isRemitted ? `
                  <button data-action="single-remit" data-id="${o.id}" class="primary" style="font-size:11px;padding:6px 10px;">
                    Mark Settled
                  </button>
                ` : `<span style="color:#16a34a;font-size:11px;font-weight:600;">Settled · ${esc(o.remittedDate || '2026-09-25')}</span>`}
              </td>
            </tr>
          `;
        })
      )}
    </div>
  `;
}

// 9. Reports & Delivered ROAS Campaign Attribution
function reports() {
  const campaigns = [
    { name: 'Meta · Warm Neutral Headphones V1', platform: 'Meta Ads', spend: 3200, creative: 'vid_neutral_aesthetic_v1', key: 'Meta_WarmNeutral_Headphones' },
    { name: 'TikTok · Everyday Carry Lifestyle', platform: 'TikTok Ads', spend: 1800, creative: 'tote_lifestyle_transition', key: 'TikTok_DailyCarry_Tote' },
    { name: 'Meta · Minimal Home Decor', platform: 'Meta Ads', spend: 2400, creative: 'lamp_night_glow_img', key: 'Meta_MinimalHome_Decor' },
    { name: 'Storefront Direct & Organic', platform: 'Direct / SEO', spend: 0, creative: 'organic_browse', key: 'Storefront_Direct' }
  ];

  return title(
    'Reports',
    'Unit economics, campaign attribution and delivered ROAS.',
    `<button data-action="export">Export order data</button>`
  ) + `
    <!-- Delivered ROAS Attribution Table -->
    <div class="panel" style="border: 2px solid #147d86;background:#fcfefe;">
      <div class="panel-head">
        <div>
          <span class="badge active" style="margin-bottom:6px;">AD ATTRIBUTION & DELIVERED CASH</span>
          <h2>Delivered ROAS & Ad Creative Truth</h2>
          <p>Measures actual delivered cash in the bank rather than vanity unconfirmed leads. Deducts cancelled/returned shipping fees.</p>
        </div>
      </div>
      ${table(
        ['Campaign / Platform', 'Ad Creative Asset', 'Ad Spend', 'Leads / Confirmed %', 'Delivered Cash', 'Net Cash Profit', 'Delivered ROAS'],
        campaigns.map(c => {
          const ords = db.orders.filter(o => o.campaign === c.key || (c.key === 'Storefront_Direct' && !o.campaign));
          const leads = ords.length;
          const conf = ords.filter(o => ['Confirmed', 'In transit', 'Delivered'].includes(o.status)).length;
          const del = ords.filter(o => o.status === 'Delivered').length;
          const ret = ords.filter(o => o.status === 'Returned').length;
          const cash = ords.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.amount, 0);
          const cogs = ords.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.cost || 0), 0);
          const courier = (del + ret + ords.filter(o => o.status === 'In transit').length) * 35;
          const net = cash - cogs - courier - c.spend;
          const roas = c.spend > 0 ? (cash / c.spend).toFixed(2) : 'Organic';
          const isProfitable = net > 0;

          return `
            <tr>
              <td>
                <b>${esc(c.name)}</b>
                <small>${esc(c.platform)}</small>
              </td>
              <td><code>${esc(c.creative)}</code></td>
              <td>${c.spend ? money(c.spend) : '0 MAD'}</td>
              <td>
                <b>${leads} leads</b>
                <small>${leads ? Math.round((conf / leads) * 100) : 0}% confirmed</small>
              </td>
              <td>
                <b style="color:#147d86;">${money(cash)}</b>
                <small>${del} parcels delivered</small>
              </td>
              <td>
                <b style="color:${isProfitable ? '#16a34a' : '#dc2626'};">${money(net)}</b>
                <small>${isProfitable ? 'Net Positive' : 'Ad Loss'}</small>
              </td>
              <td>
                <span class="roas-badge ${c.spend === 0 || Number(roas) >= 2.5 ? 'golden' : 'toxic'}">
                  ${roas}${c.spend > 0 ? 'x ROAS' : ''}
                </span>
              </td>
            </tr>
          `;
        })
      )}
    </div>

    <div class="grid">
      <div class="panel">
        <h2>Product performance</h2>
        ${table(['Product', 'Orders', 'Delivered revenue'], db.products.map(p => `<tr><td>${esc(p.name)}</td><td>${db.orders.filter(o => o.product === p.id).length}</td><td>${money(sum(db.orders.filter(o => o.product === p.id && o.status === 'Delivered'), 'amount'))}</td></tr>`))}
      </div>
      <div class="panel">
        <h2>Acquisition channels</h2>
        ${bars(['Meta Ads', 'Storefront', 'WooCommerce', 'CSV import'].map(s => [s, db.orders.filter(o => o.source === s).length]), db.orders.length)}
      </div>
    </div>
  `;
}

// 10. Stores
let contactInbox = null;

function contactInboxPanel() {
  if (!contactInbox) {
    fetch('/api/contact').then(r => r.ok ? r.json() : []).then(list => {
      contactInbox = list;
      if (page === 'stores') render();
    }).catch(() => {});
  }
  const list = contactInbox || [];
  const open = list.filter(m => m.status === 'New').length;
  return `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Contact inbox</h2>
          <p>${contactInbox ? `${list.length} message(s) from the storefront contact form · ${open} new` : 'Loading messages…'}</p>
        </div>
        <button data-action="refresh-inbox">Refresh</button>
      </div>
      ${list.length ? table(
        ['Received', 'From', 'Topic', 'Order', 'Message', 'Status', 'Actions'],
        list.map(m => `
          <tr>
            <td><small>${esc(new Date(m.date).toLocaleString())}</small></td>
            <td><b>${esc(m.name)}</b><small>${esc(m.email)}${m.phone ? ' · ' + esc(m.phone) : ''}</small></td>
            <td>${esc(m.topic)}</td>
            <td>${esc(m.orderId || '—')}</td>
            <td style="white-space:pre-wrap;min-width:260px;max-width:420px;">${esc(m.message)}</td>
            <td>${badge(m.status)}</td>
            <td><div style="display:flex;gap:6px;">
              <a href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.topic + (m.orderId ? ' (' + m.orderId + ')' : ''))}"><button type="button" data-action="contact-status" data-id="${esc(m.id)}:Replied">Reply</button></a>
              ${m.status !== 'Closed' ? `<button data-action="contact-status" data-id="${esc(m.id)}:Closed">Close</button>` : ''}
            </div></td>
          </tr>
        `)
      ) : `<div class="empty">${contactInbox ? 'No messages yet.' : ''}</div>`}
    </div>
  `;
}

function stores() {
  return title(
    'Storefronts & assets',
    'Organize storefronts, customer tracking links, and creative assets.',
    `<button class="primary" data-action="new-page">+ Add page</button>`
  ) + `
    <div class="panel">
      ${table(['Page / Route', 'Channel', 'Status', 'Attributed orders'], [
        { name: 'Storefront Home (/)', channel: 'Direct / Storefront', status: 'Active', count: db.orders.filter(o => o.source === 'Storefront').length },
        { name: 'Customer Tracking Portal (/track)', channel: 'Self-Service Tracking', status: 'Active', count: db.orders.length },
        { name: 'Policies (/policy)', channel: 'Shipping, returns, privacy & terms', status: 'Active', count: 0 },
        ...db.pages.map(p => ({ name: p.name, channel: p.channel, status: p.status, count: db.orders.filter(o => o.source === p.channel).length }))
      ].map(p => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.channel)}</td><td>${badge(p.status)}</td><td>${p.count} <small>Orders</small></td></tr>`))}
    </div>
    ${contactInboxPanel()}
    <div class="cards">
      ${[['logo.png', 'Brand wordmark'], ['ribbon.png', 'Flowing ribbon'], ['pattern.png', 'Modular pattern']].map(([file, label]) => `
        <div class="panel">
          <img src="../assets/${file}" alt="${label}" style="width:100%;height:140px;object-fit:contain">
          <h2>${label}</h2>
          <p><a href="../assets/${file}" download>Download asset ↗</a></p>
        </div>
      `).join('')}
    </div>
  `;
}

// 11. Integrations & Supabase Database Setup
function integrations() {
  return title(
    'Integrations',
    'Database, email, carriers and ad platform connections.'
  ) + `
    <div class="panel" style="border: 2px solid #147d86;background:#f9fdfc;">
      <div class="panel-head">
        <div>
          <span class="badge ${setupStatus?.database ? 'active' : 'pending'}" style="margin-bottom:6px;">${setupStatus?.database ? 'CONNECTED' : setupStatus?.databaseConfigured ? 'NOT WORKING' : 'NOT CONNECTED'}</span>
          <h2>Supabase PostgreSQL Database</h2>
          <p>${setupStatus?.databaseError ? esc(setupStatus.databaseError) : 'Orders, products, landing pages, accounts, carriers and calls are saved here.'}</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="primary" data-action="test-supabase">Test connection</button>
          <button data-action="view-schema">Security script</button>
        </div>
      </div>
      <p class="info" style="line-height:1.7;">
        Connected through <code>DATABASE_URL</code> in Vercel. Tables are created automatically, with no public access.
        Anyone can check the connection at <a href="/api/health" target="_blank" rel="noopener">/api/health</a>.
      </p>
    </div>

    <div class="panel notice">
      <div><b>Delivery carriers</b> (Digylog, OzoneExpress, AMEEX, Sendit…) are connected on their own page, with their API key and update link.</div>
      <a href="#carriers" class="btn-link-primary">Open Carriers</a>
    </div>
    <div class="cards">
      ${[
        ['Supabase', 'Cloud PostgreSQL database with live products and orders sync.'],
        ['Meta Ads', 'Track acquisition, creative assets, and campaign spend'],
        ['Google Sheets', 'Import and synchronize lead rows']
      ].map(([name, desc]) => `
        <div class="panel">
          <div class="mini-icon">${name[0]}</div>
          <h2>${name}</h2>
          <p class="info">${desc}</p>
          <p>${badge(db.connections[name] ? 'Configured & Active' : 'Connected')}</p>
          <button data-action="integration" data-id="${name}">${name === 'Supabase' ? 'Manage Supabase' : 'View configuration'}</button>
        </div>
      `).join('')}
    </div>
  `;
}

// 12. Team & RBAC Management (Super Admin Control)
function team() {
  const canManage = isRealSuperAdmin() && !previewRole;
  const roleList = Object.keys(db.roles);
  const members = db.agents;
  if (!serverUsers) loadUsers().then(() => page === 'team' && render());

  let rbacMatrix = '';
  if (canManage) {
    rbacMatrix = `
      <div class="panel" style="border: 2px solid #147d86;background: #fcfefe;">
        <div class="panel-head">
          <div>
            <span class="badge active" style="margin-bottom:6px;">SUPER ADMIN ACCESS CONTROL</span>
            <h2>Role permissions</h2>
            <p>Enforced by the server on every request. Changes apply immediately to everyone with the role.</p>
          </div>
          <div class="actions">
            <button data-action="new-role" style="font-size:12px;">+ New role</button>
            <button data-action="preview-role" style="font-size:12px;">Preview as role</button>
            <button data-action="reset-rbac" style="font-size:12px;">Reset to defaults ↺</button>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="min-width:180px;">Role</th>
                <th style="text-align:center;font-size:10px;">Users</th>
                ${ALL_PERMISSIONS.map(p => `<th style="text-align:center;font-size:10px;" title="${esc(p.desc)}">${esc(p.name)}</th>`).join('')}
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${roleList.map(r => {
                const isSuper = r === 'Super Admin';
                const count = members.filter(m => m.role === r).length;
                return `
                  <tr>
                    <td>
                      <strong>${esc(r)}</strong>
                      ${isSuper ? '<br><small style="color:#147d86;">Always has every permission</small>' : ''}
                    </td>
                    <td style="text-align:center;">${count}</td>
                    ${ALL_PERMISSIONS.map(p => {
                      const has = isSuper || (db.roles[r] && db.roles[r].includes(p.id));
                      return `
                        <td style="text-align:center;">
                          <input type="checkbox"
                            data-rbac-role="${esc(r)}"
                            data-rbac-perm="${esc(p.id)}"
                            ${has ? 'checked' : ''}
                            ${isSuper ? 'disabled title="Super Admin always has full permissions"' : ''}
                            aria-label="Toggle ${esc(p.name)} for ${esc(r)}">
                        </td>
                      `;
                    }).join('')}
                    <td>${isSuper || DEFAULT_ROLES[r] ? '' : `<button class="danger" data-action="delete-role" data-id="${esc(r)}" ${count ? 'disabled title="Reassign its users first"' : ''}>Delete</button>`}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  const fmtDate = d => d ? new Date(d).toLocaleString() : '—';

  return title(
    'Team & roles',
    'Team accounts, role-based access control and fraud blacklist.',
    `${canManage ? '<button class="primary" data-action="new-agent">+ Add team member</button>' : ''}<button data-action="manage-blacklist">Blacklist Management</button>`
  ) + `
    ${rbacMatrix}

    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Team accounts</h2>
          <p>${serverUsers ? `${members.length} account(s) · ${members.filter(m => m.active === false).length} disabled` : 'Loading accounts…'}</p>
        </div>
      </div>
      ${table(
        ['Member', 'Email', 'Role', 'Account', 'Availability', 'Last sign-in', 'Assigned orders', 'Actions'],
        members.map(a => {
          const isMe = a.id === db.currentUser.id;
          return `
            <tr>
              <td>
                <b>${esc(a.name)}</b>
                ${isMe ? '<span class="badge active" style="margin-left:6px;">You</span>' : ''}
              </td>
              <td>${esc(a.email || '')}</td>
              <td>
                ${canManage && !isMe ? `
                  <select data-role="${esc(a.id)}" aria-label="Role for ${esc(a.name)}">
                    ${roleList.map(r => `<option ${r === a.role ? 'selected' : ''}>${esc(r)}</option>`).join('')}
                  </select>
                ` : `<b>${esc(a.role)}</b>`}
              </td>
              <td>${a.active === false ? badge('Disabled') : badge('Active')}</td>
              <td>${badge(a.status || 'Available')}</td>
              <td><small>${fmtDate(a.lastLoginAt)}</small></td>
              <td>${db.orders.filter(o => o.agent === a.id).length}</td>
              <td><div style="display:flex;gap:6px;">
                ${canManage ? `
                  <button data-action="edit-user" data-id="${esc(a.id)}">Edit</button>
                  <button data-action="reset-user-password" data-id="${esc(a.id)}">Reset password</button>
                  ${isMe ? '' : `<button data-action="toggle-user" data-id="${esc(a.id)}">${a.active === false ? 'Enable' : 'Disable'}</button>
                  <button class="danger" data-action="delete-user" data-id="${esc(a.id)}">Delete</button>`}
                ` : (isMe ? '<button data-action="my-account">My account</button>' : '')}
              </div></td>
            </tr>
          `;
        })
      )}
    </div>
  `;
}

// 13. Security & audit trail
function security() {
  if (!auditEntries) {
    fetch('/api/audit').then(r => r.ok ? r.json() : []).then(list => {
      auditEntries = list;
      if (page === 'security') render();
    }).catch(() => {});
  }
  const list = auditEntries || [];
  const failed = list.filter(e => e.action === 'login.failed');
  const logins = list.filter(e => e.action === 'login');
  const label = a => ({
    'login': 'Signed in', 'login.failed': 'Failed sign-in', 'logout': 'Signed out', 'logout.all': 'Signed out everywhere',
    'password.changed': 'Password changed', 'user.created': 'User created', 'user.updated': 'User updated', 'user.deleted': 'User deleted',
    'roles.updated': 'Permissions changed', 'roles.reset': 'Permissions reset', 'order.status': 'Order status',
    'blacklist.added': 'Blacklisted phone', 'blacklist.removed': 'Unblacklisted phone', 'remittance.reconciled': 'Remittance reconciled',
    'purchase_order.received': 'PO received', 'product.saved': 'Product saved', 'cms.saved': 'Landing page saved'
  }[a] || a);
  return title('Security & audit', 'Who signed in, and who changed what. Recorded on the server.', '<button data-action="refresh-audit">Refresh</button>') + `
    <div class="metrics">
      ${metric('Events recorded', list.length, 'Most recent 200')}
      ${metric('Successful sign-ins', logins.length, logins[0] ? `Last: ${esc(logins[0].actor)}` : '—')}
      ${metric('Failed sign-ins', failed.length, failed.length ? 'Accounts lock for 15 min after 5 failures' : 'No failed attempts')}
      ${metric('Team accounts', db.agents.length, `${db.agents.filter(a => a.active === false).length} disabled`)}
    </div>
    <div class="panel">
      <div class="panel-head"><div><h2>Audit trail</h2><p>${auditEntries ? 'Newest first' : 'Loading…'}</p></div></div>
      ${list.length ? table(
        ['When', 'Who', 'Event', 'Details', 'IP'],
        list.map(e => `
          <tr>
            <td><small>${esc(new Date(e.at).toLocaleString())}</small></td>
            <td>${esc(e.actor)}</td>
            <td>${e.action === 'login.failed' ? `<span class="badge cancelled">${esc(label(e.action))}</span>` : esc(label(e.action))}</td>
            <td style="white-space:normal;max-width:420px;">${esc(e.detail || '')}</td>
            <td><small>${esc(e.ip || '')}</small></td>
          </tr>
        `)
      ) : '<div class="empty">No events yet.</div>'}
    </div>
  `;
}

// 14. Settings
function settings() {
  const me = db.currentUser;
  return title('Settings', 'Your account, workspace preferences and database connection.') + `
    <div class="grid">
      <div class="panel">
        <h2>Workspace preferences</h2>
        <form id="settings-form">
          <div class="form-grid">
            <label>Workspace name<input name="company" value="${esc(db.settings.company)}" required maxlength="80"></label>
            <label>Operating region<input name="region" value="${esc(db.settings.region)}" required maxlength="80"></label>
            <label class="full">Supabase URL<input value="https://kwqbghlwarkibhlgbgft.supabase.co" disabled></label>
          </div>
          <p><button class="primary">Save preferences</button></p>
        </form>
      </div>
      <div class="panel">
        <h2>My account</h2>
        <div class="stat-line"><span>Name</span><b>${esc(me.name)}</b></div>
        <div class="stat-line"><span>Email</span><b>${esc(me.email)}</b></div>
        <div class="stat-line"><span>Role</span><b>${esc(me.role)}</b></div>
        <div class="stat-line"><span>Session expires</span><b>${esc(getSession()?.expiresAt ? new Date(getSession().expiresAt).toLocaleString() : '—')}</b></div>
        <div class="actions" style="margin-top:18px;">
          <button class="primary" data-action="change-password">Change password</button>
          <button data-action="sign-out-all">Sign out everywhere</button>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Platform guide: what every part of Rosaino does, with buttons that open it.
// ---------------------------------------------------------------------------
const GUIDE_SECTIONS = [
  {
    group: 'Sales',
    items: [
      { page: 'overview', icon: '📊', title: 'Overview', text: 'Your day at a glance.', points: [
        'Collected revenue, total orders, orders awaiting confirmation and parcels on the way.',
        'Revenue chart and order pipeline by status.',
        '“Finish setting up” checklist: database, online store, carrier and team.'
      ] },
      { page: 'store', icon: '🔗', title: 'Store connection', text: 'Your online store sends its orders here.', points: [
        'Create an API key for your Shopify, YouCan or WooCommerce store, or your own site.',
        'Add it to the store as an order webhook: each new order becomes a lead in seconds.',
        'Products are matched by SKU so stock is counted; the same order sent twice is recorded once.',
        'Your store can ask for an order’s status, carrier and tracking number with the same key.'
      ], action: ['new-store-key', 'Create an API key', 'integrations'] },
      { page: 'orders', icon: '🧾', title: 'Leads & orders', text: 'Every order from your online store, CSV imports or typed in by hand.', points: [
        'Search and filter by status; open an order to see details, notes, history and assignment.',
        'Move orders through New → Confirmed → In transit → Delivered / Returned.',
        'Risk score per phone number (VIP, first-time, serial refuser, blacklisted) and duplicate detection.',
        'Import and export CSV (save Excel sheets as CSV first).'
      ], action: ['new-order', 'Create an order', 'orders'] },
      { page: 'calls', icon: '📞', title: 'Call center', text: 'Confirmation calls for each agent’s queue.', points: [
        'Phone call opens the dialer; WhatsApp call opens the customer’s chat.',
        'A timer runs during the call; pick the outcome (Confirmed, Callback, No answer, Cancelled, Spam) and add notes.',
        'Optional live transcript in Chrome/Edge (French, Moroccan Arabic, English) after telling the customer.',
        'Every call is saved with agent, duration, outcome and transcript in Call history.'
      ] },
      { page: 'routing', icon: '🔀', title: 'Lead routing', text: 'Decide which agent gets which lead.', points: [
        'Rules by product, source, city, or all leads, with percentage splits between agents.',
        'Paused agents are skipped; anything unmatched is shared round-robin.',
        'Run routing to assign all unassigned leads at once.'
      ], action: ['new-rule', 'Add a routing rule', 'routing'] }
    ]
  },
  {
    group: 'Delivery',
    items: [
      { page: 'shipping', icon: '🚚', title: 'Shipping & labels', text: 'Send confirmed orders to a carrier and follow each parcel.', points: [
        'Dispatch sends the order to the chosen carrier and stores its tracking number.',
        'Stock is taken when a parcel ships and put back if it is returned.',
        'Print one label or all labels; “Check carrier updates” pulls the latest statuses.',
        'Nearya parcels: history, relaunch delivery, send to a new customer, exchange.'
      ] },
      { page: 'carriers', icon: '🏢', title: 'Carriers', text: 'The delivery companies you work with.', points: [
        'Add Nearya Express, Digylog, OzoneExpress, AMEEX, Sendit, Cathedis, Amana or any other.',
        'Paste the API URL and key, then “Test connection”. Carriers without an API can be added as manual.',
        'Each carrier gets an update link (webhook) so “Livré / Retourné” updates orders by themselves.',
        'Optionally send orders automatically the moment an agent confirms them.'
      ], action: ['new-carrier', 'Add a carrier', 'integrations'] }
    ]
  },
  {
    group: 'Catalogue',
    items: [
      { page: 'products', icon: '📦', title: 'Products & stock', text: 'What you sell and how many you have.', points: [
        'Price, cost, SKU, category, supplier and units in stock.',
        'Reserved (confirmed) and available stock, with low-stock warnings.',
        'Changes show on the storefront immediately.'
      ], action: ['new-product', 'Add a product', 'products'] },
      { page: 'cms', icon: '🎨', title: 'Landing page CMS', text: 'Build the product pages you send ad traffic to.', points: [
        'Edit headline, images, bundle prices (1, 2 or 3 pieces), reviews, FAQs and the order form fields.',
        'Show, hide and reorder sections; live preview while you edit.',
        'French, Arabic or English pages. Customers order cash on delivery from the page.'
      ] },
      { page: 'suppliers', icon: '🏭', title: 'Suppliers & purchase orders', text: 'Restock from your suppliers.', points: [
        'Create purchase orders with factory price, freight, customs and handling.',
        'True landed cost per unit and expected margin are calculated for you.',
        'Receiving a PO adds the units to stock and updates the product’s cost.'
      ], action: ['new-po', 'Create a purchase order', 'suppliers'] }
    ]
  },
  {
    group: 'Finance',
    items: [
      { page: 'finance', icon: '💰', title: 'COD accounting', text: 'Where the cash on delivery money is.', points: [
        'Collected revenue, delivered product costs, shipping expenses and net contribution.',
        'Record expenses in the ledger.'
      ] },
      { page: 'reconciliation', icon: '🧮', title: 'Courier remittance audit', text: 'Make sure carriers pay you what they collected.', points: [
        'Cash held by each carrier: remitted, pending and overdue.',
        'Mark delivered orders as remitted with the bank transfer reference.',
        'Spot carriers charging more than the agreed fee; print a claim statement.'
      ] },
      { page: 'reports', icon: '📈', title: 'Reports & ROAS', text: 'What is actually making money.', points: [
        'Sales by product, results by campaign and channel, delivered ROAS.',
        'Agent confirmation rates, calls and talk time. Export the data.'
      ] }
    ]
  },
  {
    group: 'Workspace',
    items: [
      { page: 'stores', icon: '🛍️', title: 'Stores & media', text: 'Pages, links, brand assets and customer messages.', points: [
        'Contact inbox: every message from the storefront’s “Contact us” form.',
        'Store and landing page records, tracking links, downloadable brand assets.'
      ] },
      { page: 'integrations', icon: '🔌', title: 'Integrations & Supabase', text: 'What is connected.', points: [
        'Database status: connected, not configured or unreachable (with the reason).',
        'Email (Resend), carriers and ad platform connections.'
      ] },
      { page: 'team', icon: '👥', title: 'Team & roles', text: 'Who can sign in and what they can see.', points: [
        'Create accounts with a temporary password; disable, reset or delete them.',
        'Edit what each role can open, create custom roles, preview the portal as any role.',
        'Manage the blacklist of phone numbers that refuse parcels.'
      ], action: ['new-agent', 'Add a team member', 'rbac_manage'] },
      { page: 'security', icon: '🛡️', title: 'Security & audit', text: 'A record of who did what.', points: [
        'Sign-ins, failed sign-ins, password changes, user and permission changes.',
        'Order status changes, dispatches, remittances, product and page saves.'
      ] },
      { page: 'settings', icon: '⚙️', title: 'Settings', text: 'Your account and workspace.', points: [
        'Workspace name and region.',
        'Change your password and sign out on every device.'
      ], action: ['change-password', 'Change my password', ''] }
    ]
  }
];

const GUIDE_PUBLIC_ALL = [
  { href: '/', icon: '🏠', title: 'Storefront', text: 'Home page with featured products, the bag and cash-on-delivery checkout, plus the “Contact us” form.' },
  { href: '/shop', icon: '🗂️', title: 'Shop', text: 'Every category with all of its products.' },
  { href: '/product', icon: '🎯', title: 'Product landing page', text: 'The page built in the CMS. Link it from your ads (add utm_source / utm_campaign to track results).' },
  { href: '/track', icon: '📍', title: 'Order tracking', text: 'Customers search by order number, carrier tracking number or phone. Changing the address needs the order number and phone.' },
  { href: '/policy', icon: '📄', title: 'Policies', text: 'Shipping, cash on delivery, returns, privacy and terms.' }
];
// Without the built-in storefront, only the tracking page is public.
const GUIDE_PUBLIC = STOREFRONT_ENABLED ? GUIDE_PUBLIC_ALL : GUIDE_PUBLIC_ALL.filter(p => p.href === '/track');

const GUIDE_FLOW = [
  ['New', 'orders', 'An order arrives from your online store, an import or the portal.'],
  ['Confirmed', 'calls', 'An agent calls the customer and confirms. It can go to the carrier automatically.'],
  ['In transit', 'shipping', 'The parcel is dispatched; stock is taken.'],
  ['Delivered', 'shipping', 'The carrier collects the cash. Returned parcels put the stock back.'],
  ['Remitted', 'reconciliation', 'The carrier transfers the cash to you.']
];

const GUIDE_START = [
  ['Check the database is connected', 'integrations', 'Shows “Database connected” when everything is saved in Supabase.'],
  ['Add your products and stock', 'products', 'Price, cost, SKU and units.'],
  ['Connect your online store', 'store', 'Create an API key and add it to your store.'],
  ['Connect a carrier', 'carriers', 'API or manual; test the connection.'],
  ['Invite your team', 'team', 'One account per person, with the right role.'],
  ['Set routing rules', 'routing', 'Who receives which leads.'],
  ['Change your password', 'settings', 'Keep the Super Admin account safe.']
];

const pageAllowed = id => {
  const def = pages.find(p => p[0] === id);
  return !def || !def[3] || hasPermission(def[3]);
};
const guideOpen = (id, label) => pageAllowed(id)
  ? `<a class="guide-go" href="#${id}">${esc(label)} →</a>`
  : `<span class="guide-locked" title="Your role cannot open this page">🔒 Not in your role</span>`;

function guide() {
  const toc = GUIDE_SECTIONS.map(s => `<button type="button" class="guide-chip" data-action="guide-jump" data-id="guide-${s.group.toLowerCase()}">${esc(s.group)}</button>`).join('')
    + '<button type="button" class="guide-chip" data-action="guide-jump" data-id="guide-customer">Customer pages</button>';
  const card = it => `
    <article class="panel guide-card" data-guide-text="${esc([it.title, it.text, ...it.points].join(' ').toLowerCase())}">
      <div class="guide-card-head">
        <span class="guide-icon" aria-hidden="true">${it.icon}</span>
        <div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>
      </div>
      <ul>${it.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ul>
      <div class="guide-actions">
        ${guideOpen(it.page, 'Open ' + it.title)}
        ${it.action && (!it.action[2] || hasPermission(it.action[2])) ? `<button type="button" data-action="${it.action[0]}">${esc(it.action[1])}</button>` : ''}
      </div>
    </article>`;

  return title('Platform guide', 'What every part of Rosaino does. Use the buttons to jump straight to a page.') + `
    <div class="panel guide-intro">
      <input id="guide-search" type="search" placeholder="Search the guide (e.g. carrier, stock, password)…" aria-label="Search the guide">
      <div class="guide-toc">${toc}</div>
    </div>

    <section class="panel guide-flow-panel" data-guide-text="order flow new confirmed in transit delivered returned remitted">
      <h2>How an order moves through Rosaino</h2>
      <p class="info">Click a step to open the page where it happens.</p>
      <ol class="guide-flow">
        ${GUIDE_FLOW.map(([name, id, text], i) => `
          <li>${pageAllowed(id) ? `<a href="#${id}">` : '<div>'}
            <span class="guide-step-n">${i + 1}</span><b>${esc(name)}</b><small>${esc(text)}</small>
          ${pageAllowed(id) ? '</a>' : '</div>'}</li>`).join('')}
      </ol>
    </section>

    ${hasPermission('team') ? `<section class="panel" data-guide-text="getting started setup checklist first steps">
      <h2>Getting started</h2>
      <p class="info">First steps for a new workspace.</p>
      <div class="guide-start">
        ${GUIDE_START.map(([name, id, text], i) => `
          <div class="guide-start-row">
            <span class="guide-step-n">${i + 1}</span>
            <div><b>${esc(name)}</b><small>${esc(text)}</small></div>
            ${guideOpen(id, 'Open')}
          </div>`).join('')}
      </div>
    </section>` : ''}

    ${GUIDE_SECTIONS.map(s => ({ ...s, items: s.items.filter(it => STOREFRONT_ENABLED || !STOREFRONT_PAGES.includes(it.page)) })).map(s => `
      <section class="guide-section" id="guide-${s.group.toLowerCase()}">
        <div class="nav-group guide-group">${esc(s.group.toUpperCase())}</div>
        <div class="guide-grid">${s.items.map(card).join('')}</div>
      </section>`).join('')}

    <section class="guide-section" id="guide-customer">
      <div class="nav-group guide-group">CUSTOMER PAGES</div>
      <div class="guide-grid">
        ${GUIDE_PUBLIC.map(pp => ({ ...pp, href: pp.href === '/product' ? '/product?id=' + encodeURIComponent(db.products?.[0]?.id || 'p1') : pp.href })).map(pp => `
          <article class="panel guide-card" data-guide-text="${esc((pp.title + ' ' + pp.text).toLowerCase())}">
            <div class="guide-card-head">
              <span class="guide-icon" aria-hidden="true">${pp.icon}</span>
              <div><h3>${esc(pp.title)}</h3><p>${esc(pp.text)}</p></div>
            </div>
            <div class="guide-actions"><a class="guide-go" href="${esc(pp.href)}" target="_blank" rel="noopener">Open ${esc(pp.title)} ↗</a></div>
          </article>`).join('')}
      </div>
    </section>
    <p id="guide-empty" class="empty" hidden>Nothing in the guide matches your search.</p>
  `;
}

// Store connection: Rosaino's own online store (Shopify, YouCan, WooCommerce
// or custom code) sends its orders here with an API key.
let storeKeys = null;
const STORE_PLATFORMS = ['Shopify', 'YouCan', 'WooCommerce', 'Lightfunnels', 'Google Sheets', 'Zapier / Make', 'Other'];
const storeEndpoint = () => `${location.origin}/api/v1/orders`;

let storeRefused = [];
async function loadStoreKeys() {
  const refused = api('/api/store-keys/refused').then(l => { storeRefused = Array.isArray(l) ? l : []; }).catch(() => {});
  try {
    storeKeys = await api('/api/store-keys');
    await refused;
  } catch {
    storeKeys = storeKeys || [];
  }
  return storeKeys;
}

function storeSetupSteps(platform, secret) {
  const key = secret || 'YOUR_API_KEY';
  const hookUrl = `${storeEndpoint()}?key=${key}`;
  const code = v => `<code class="copyable">${esc(v)}</code>`;
  const steps = {
    Shopify: `
      <ol class="steps">
        <li>In your Shopify admin, open <b>Settings → Notifications → Webhooks</b> and click <b>Create webhook</b>.</li>
        <li>Event: <b>Order creation</b> · Format: <b>JSON</b> · URL: ${code(hookUrl)}</li>
        <li>Save. Shopify shows <i>"Your webhooks will be signed with …"</i>: copy that secret into this key's <b>Signing secret</b> here, so Rosaino only accepts orders really sent by your store.</li>
        <li>Click <b>Send test</b> next to the webhook in Shopify: a sample order appears in Leads &amp; orders.</li>
      </ol>
      <p class="info">Cash-on-delivery form apps (EasySell, Releasit…) create normal Shopify orders, so they arrive too, including the phone and city fields those apps add.</p>`,
    YouCan: `
      <ol class="steps">
        <li>If your YouCan plan offers webhooks, add one for the <b>order created</b> event. Otherwise use the <b>Google Sheets</b> or <b>Zapier / Make</b> setup (create the key with that platform to see its steps).</li>
        <li>URL: ${code(hookUrl)} · Method: <b>POST</b> · Format: <b>JSON</b></li>
        <li>Place a test order on your store: it appears in Leads &amp; orders within seconds.</li>
      </ol>`,
    WooCommerce: `
      <ol class="steps">
        <li>In WordPress, open <b>WooCommerce → Settings → Advanced → Webhooks</b> and click <b>Add webhook</b>.</li>
        <li>Status: <b>Active</b> · Topic: <b>Order created</b> · Delivery URL: ${code(hookUrl)}</li>
        <li>Save, then place a test order on your store: it appears in Leads &amp; orders.</li>
      </ol>`,
    Lightfunnels: `
      <ol class="steps">
        <li>In Lightfunnels, add a webhook for the <b>order created</b> event (Settings → Webhooks, or an automation that sends a webhook).</li>
        <li>URL: ${code(hookUrl)} · Method: <b>POST</b> · Format: <b>JSON</b></li>
        <li>Place a test order: it appears in Leads &amp; orders.</li>
      </ol>`,
    'Google Sheets': `
      <p class="info">For stores that already send their orders to a Google Sheet (YouCan, Shopify and most COD forms can). Each new row is sent to Rosaino every minute; a <b>Rosaino</b> column shows what was sent.</p>
      <ol class="steps">
        <li>Open the orders sheet → <b>Extensions → Apps Script</b>, replace the code with the script below and click <b>Save</b>.</li>
        <li>Click <b>Triggers</b> (clock icon) → <b>Add trigger</b> → function <b>sendNewOrders</b>, event <b>Time-driven</b>, <b>every minute</b> → Save, and allow access.</li>
        <li>Columns can be in English, French or Arabic: Name / Nom / الاسم, Phone / Téléphone / الهاتف, City / Ville / المدينة, Address / Adresse / العنوان, Product / Produit / المنتج, Quantity / Quantité / الكمية, Total / Prix, SKU, Order ID.</li>
      </ol>
      <pre class="code-block">${esc(`// Rosaino: send new order rows to the operations portal.
const ROSAINO_URL = '${hookUrl}';

function sendNewOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  const head = rows[0].map(String);
  let col = head.indexOf('Rosaino');
  if (col < 0) { col = head.length; sheet.getRange(1, col + 1).setValue('Rosaino'); }
  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][col] || '').startsWith('Sent')) continue;
    const order = {};
    head.forEach((h, i) => { if (h && i !== col && rows[r][i] !== '') order[h] = rows[r][i]; });
    if (!Object.keys(order).length) continue;
    order.sheet_row = 'sheet-' + sheet.getSheetId() + '-row-' + (r + 1);
    const res = UrlFetchApp.fetch(ROSAINO_URL, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify(order), muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    sheet.getRange(r + 1, col + 1).setValue(code < 300
      ? 'Sent ' + new Date().toLocaleString()
      : 'Error ' + code + ': ' + res.getContentText().slice(0, 100));
  }
}`)}</pre>`,
    'Zapier / Make': `
      <ol class="steps">
        <li>Create a Zap (or Make scenario): trigger <b>New order</b> in your store's app (YouCan, Shopify, WooCommerce, Google Sheets…).</li>
        <li>Action: <b>Webhooks → POST</b> to ${code(hookUrl)}, payload type <b>JSON</b>.</li>
        <li>Map the fields: <code>order_id</code>, <code>customer</code>, <code>phone</code>, <code>city</code>, <code>address</code>, <code>product</code> (or <code>sku</code>), <code>quantity</code>, <code>total</code>, and <code>note</code> if you have it.</li>
        <li>Test the step: the order appears in Leads &amp; orders.</li>
      </ol>`,
    Other: `
      <ol class="steps">
        <li>From your site's code, send each new order to ${code(storeEndpoint())} with <b>POST</b>.</li>
        <li>Add the header ${code('Authorization: Bearer ' + key)} (or ${code('X-API-Key: ' + key)}).</li>
        <li>Send JSON like the example under <b>Developer reference</b> below.</li>
      </ol>`
  };
  return steps[platform] || steps.Other;
}

// Problems that stop store orders from arriving, with what to do.
function storeWarnings(keys) {
  const out = [];
  if (setupStatus && !setupStatus.database) {
    out.push(`<div class="alert danger"><b>Store orders can't be saved: the database is not connected.</b>
      <ol><li>Supabase → your project → <b>Connect</b> → <b>Transaction pooler</b>: copy the string and put your database password in place of [YOUR-PASSWORD].</li>
      <li>Vercel → Settings → Environment Variables: set <code>DATABASE_URL</code> to it, then <b>Redeploy</b>.</li>
      <li>Come back here: this message disappears and the top bar says "Database connected".</li></ol>
      ${setupStatus.databaseError ? `<small>Reason: ${esc(setupStatus.databaseError)}</small>` : ''}</div>`);
  }
  const host = location.hostname;
  if (/\.vercel\.app$/.test(host) && /-git-|-[a-z0-9]{9}-/.test(host)) {
    out.push(`<div class="alert warn"><b>You're on a Vercel preview address (${esc(host)}).</b> Links and keys made here point to this preview, which Shopify may not be allowed to reach. Open the portal on its main address and create the link there.</div>`);
  }
  const lastGood = keys.flatMap(k => (k.recent || []).filter(r => r.result === 'created' || r.result === 'duplicate').map(r => r.at)).sort().pop() || '';
  const lastDay = storeRefused.filter(r => Date.now() - new Date(r.at).getTime() < 7 * 86400000 && r.at > lastGood);
  if (lastDay.length) {
    const r = lastDay[0];
    const who = r.shop ? `${r.source || 'A store'} (${esc(r.shop)})` : r.source || 'A store';
    out.push(`<div class="alert danger"><b>${who} tried to send ${lastDay.length} order${lastDay.length > 1 ? 's' : ''} with a link that no longer works</b> (last: ${new Date(r.at).toLocaleString()}; ${esc(r.reason)}${r.keyStart ? `, key ${esc(r.keyStart)}…` : ''}).
      <ol><li>Click the store's tile below and create a new link (Shopify: <b>Paste one link in Shopify</b> → <b>Copy link</b>).</li>
      <li>In the store, replace the old link with the new one (Shopify: Paramètres → Notifications → Webhooks: delete the old Rosaino webhook, create a new one with the new link).</li>
      <li>Send a test: the green box confirms it, and this message stops appearing.</li></ol></div>`);
  }
  keys.filter(k => k.active).forEach(k => {
    const last = (k.recent || []).find(r => r.result !== 'test' && r.result !== 'ignored');
    if (last && last.result === 'rejected') {
      const sig = /signature/i.test(last.reason || '');
      out.push(`<div class="alert warn"><b>${esc(k.name)}: the last order was refused</b> (${new Date(last.at).toLocaleString()}): ${esc(last.reason || '')}.
        ${sig ? ` The signing code saved for this connection doesn't match Shopify's. Click <b>Signing secret</b> on its row and paste the code again from Shopify (Settings → Notifications → Webhooks), or clear it.` : ' Real orders need a customer name, a phone number or email, and at least one product.'}</div>`);
    }
  });
  return out.join('');
}

// Shopify connection check: each link of the chain, with what to do.
function shopifyCheck(keys) {
  const shop = keys.filter(k => k.platform === 'Shopify');
  const active = shop.filter(k => k.active);
  const recentAll = active.flatMap(k => (k.recent || []).map(r => ({ ...r, key: k })));
  const real = recentAll.filter(r => r.result !== 'test' && r.result !== 'ignored').sort((a, b) => b.at.localeCompare(a.at));
  const last = real[0];
  const refused = storeRefused.find(r => r.source === 'Shopify');
  const rows = [];
  const row = (state, label, detail) => rows.push(`<li class="chk ${state}"><span class="chk-icon" aria-hidden="true">${state === 'ok' ? '✓' : state === 'bad' ? '✕' : '…'}</span><div><b>${label}</b><small>${detail}</small></div></li>`);
  const db = setupStatus?.database;
  row(setupStatus ? (db ? 'ok' : 'bad') : 'wait', 'Database', setupStatus ? (db ? 'Connected: orders are saved and shared by every server.' : 'Not connected: fix DATABASE_URL in Vercel first (see the red box above).') : 'Checking…');
  row('ok', 'Portal version', `Running version <code>${esc(setupStatus?.version || '…')}</code>. It should match the latest commit on GitHub main; if not, redeploy in Vercel.`);
  row(active.length ? 'ok' : 'bad', 'Shopify link', active.length ? `${active.length} active Shopify connection${active.length > 1 ? 's' : ''}: ${active.map(k => esc(k.name)).join(', ')}.` : 'No active Shopify connection: click the Shopify tile below and create the link.');
  if (active.length) row(active.some(k => k.hasSigningSecret) ? 'ok' : 'wait', 'Shopify signature', active.some(k => k.hasSigningSecret) ? 'Signing secret saved: only orders signed by your store are accepted.' : 'Optional: paste Shopify\'s signing secret with the Signing secret button for extra security.');
  if (refused && (!last || refused.at > last.at)) row('bad', 'Old link still in Shopify', `Shopify sent orders with a link that no longer works (${new Date(refused.at).toLocaleString()}). Replace the webhook URL in Shopify with a new link.`);
  if (!last) row(active.length ? 'wait' : 'bad', 'Orders from Shopify', active.length ? 'Nothing received yet. In Shopify → Settings → Notifications → Webhooks, click <b>Send test</b> next to the Rosaino webhook.' : 'Waiting for a link.');
  else if (last.result === 'created' || last.result === 'duplicate') row('ok', 'Orders from Shopify', `Last order received ${new Date(last.at).toLocaleString()}${last.orderId ? ` (${esc(last.orderId)})` : ''}. Everything works.`);
  else row('bad', 'Orders from Shopify', `The last delivery (${new Date(last.at).toLocaleString()}) was refused: ${esc(last.reason || '')}. Use <b>Fix &amp; add to orders</b> in Recent deliveries, and send the details to support if it repeats.`);
  return `<div class="panel"><div class="panel-head"><div><h2>Shopify connection check</h2><p>Each step from your Shopify store to the Orders page. Green everywhere means it works.</p></div><button data-action="refresh-store-keys">Check again</button></div><ul class="chk-list">${rows.join('')}</ul></div>`;
}

function storeConnection() {
  if (!storeKeys) loadStoreKeys().then(() => page === 'store' && render());
  if (!setupStatus) api('/api/setup-status').then(st => { setupStatus = st; if (page === 'store') render(); }).catch(() => {});
  const keys = storeKeys || [];
  const active = keys.filter(k => k.active);
  const received = keys.reduce((n, k) => n + (k.ordersReceived || 0), 0);
  const last = keys.map(k => k.lastUsedAt).filter(Boolean).sort().pop();
  const recent = keys.flatMap(k => (k.recent || []).map(r => ({ ...r, keyName: k.name, keyId: k.id }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
  const fromStore = db.orders.filter(o => o.storeKeyId);
  const resultBadge = r => ({ created: badge('New'), duplicate: '<span class="badge">Already received</span>', rejected: '<span class="badge cancelled">Rejected</span>', test: '<span class="badge in-transit">Test</span>', ping: '<span class="badge in-transit">Connection check</span>', ignored: '<span class="badge">Not an order</span>' }[r] || esc(r));
  const example = JSON.stringify({
    order_id: '1042',
    customer: 'Hind Berrada',
    phone: '0661234567',
    city: 'Rabat',
    address: '12 Rue Oued Fes, Agdal',
    items: [{ sku: 'ROS-FASH-02', name: 'Everyday Tote', quantity: 2, price: 240 }],
    total: 480,
    note: 'Call after 6pm',
    utm_campaign: 'Meta_Tote_Oct'
  }, null, 2);

  return title(
    'Store connection',
    'Orders placed on your online store (Shopify, YouCan, WooCommerce or your own site) arrive here as new leads, ready for the call center and your carriers.',
    '<button class="primary" data-action="connect-shopify">Connect Shopify</button> <button data-action="new-store-key">+ Create API key</button>'
  ) + storeWarnings(keys) + `
    <div class="metrics">
      ${metric('Connected stores', active.length, active.length ? active.map(k => esc(k.name)).join(', ') : 'No API key yet')}
      ${metric('Orders received', received, 'Since the first key was created')}
      ${metric('Last order', last ? new Date(last).toLocaleDateString() : '—', last ? new Date(last).toLocaleTimeString() : 'Waiting for the first one')}
      ${metric('Open store leads', fromStore.filter(o => ['New', 'Callback'].includes(o.status)).length, 'To confirm in the call center')}
    </div>

    ${storeKeys ? shopifyCheck(storeKeys) : ''}
    <div class="panel">
      <div class="panel-head"><div><h2>Connect a store</h2><p>Choose where your orders come from. Each option shows what you need and the exact steps, then gives you a ready-to-paste key.</p></div></div>
      <div class="platform-grid">${STORE_PLATFORMS.map(p => `
        <button type="button" class="platform-tile" data-action="store-platform" data-id="${esc(p)}">
          <span class="platform-mark">${platformLogo(p, 34)}</span>
          <b>${p === 'Other' ? 'Other / custom site' : esc(p)}</b>
          <small>${PLATFORM_GUIDE[p].tagline}</small>
        </button>`).join('')}
      </div>
    </div>

    ${!storeKeys ? '<div class="panel empty">Loading…</div>' : !keys.length ? `
      <div class="panel empty">No store connected yet. Choose your store above: orders then arrive in Leads &amp; orders, ready for the call center and your carriers.</div>` : `
      <div class="panel">
        <div class="panel-head"><div><h2>API keys</h2><p>Each key lets one store send orders. Revoke a key and its store can no longer send anything.</p></div></div>
        <div class="store-keys">${table(['Store', 'Key', 'Orders received', 'Last order', 'Status', ''], keys.map(k => `
          <tr>
            <td><b>${esc(k.name)}</b><small>${esc(k.platform)}${k.shopDomain ? ' · ' + esc(k.shopDomain) + ' · connected automatically' : ''} · created ${new Date(k.createdAt).toLocaleDateString()}${k.createdBy ? ' by ' + esc(k.createdBy) : ''}</small></td>
            <td><code>${esc(k.prefix)}…</code>${k.platform === 'Shopify' ? `<small>${k.hasSigningSecret ? 'Shopify signature checked' : 'No signing secret'}</small>` : ''}</td>
            <td><b>${k.ordersReceived || 0}</b></td>
            <td>${k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '<small>Nothing yet</small>'}</td>
            <td>${k.active ? badge('Active') : '<span class="badge cancelled">Revoked</span>'}</td>
            <td><div class="row-actions">
              <button data-action="store-key-setup" data-id="${esc(k.id)}">Setup steps</button>
              ${k.active ? `<button data-action="store-key-test" data-id="${esc(k.id)}">Send test order</button>` : ''}
              ${k.platform === 'Shopify' ? `<button data-action="store-key-secret" data-id="${esc(k.id)}">Signing secret</button>` : ''}
              <button class="${k.active ? 'danger' : ''}" data-action="store-key-toggle" data-id="${esc(k.id)}">${k.active ? 'Revoke' : 'Activate'}</button>
            </div></td>
          </tr>`))}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>Recent deliveries</h2><p>What your store sent, and what Rosaino did with it.</p></div><button data-action="refresh-store-keys">Refresh</button></div>
        ${recent.length ? table(['When', 'Store', 'Result', 'Order', 'Details'], recent.map(r => `
          <tr>
            <td>${new Date(r.at).toLocaleString()}</td>
            <td>${esc(r.keyName)}<small>${esc(r.platform || '')}</small></td>
            <td>${resultBadge(r.result)}</td>
            <td>${r.orderId && r.orderId !== 'pending' ? `<button data-action="order" data-id="${esc(r.orderId)}">${esc(r.orderId)}</button>${r.ref ? `<small>Store ref ${esc(r.ref)}</small>` : ''}` : '—'}</td>
            <td>${r.reason ? `<small class="${r.result === 'rejected' ? 'form-error' : ''}">${esc(r.reason)}</small>` : r.customer ? esc(r.customer) : ''}${r.result === 'rejected' && r.inboxId ? `<button class="fix-btn" data-action="fix-delivery" data-id="${esc(r.keyId + '|' + r.inboxId)}">Fix &amp; add to orders</button>` : ''}</td>
          </tr>`)) : '<div class="empty">Nothing received yet. Use <b>Send test order</b>, or place an order on your store.</div>'}
      </div>`}

    <div class="panel">
      <div class="panel-head"><div><h2>Developer reference</h2><p>For a custom site, Zapier / Make, or anyone checking the setup.</p></div></div>
      <div class="dev-ref">
        <div class="stat-line"><span>Send an order</span><b><code>POST ${esc(storeEndpoint())}</code></b></div>
        <div class="stat-line"><span>Authentication</span><b><code>Authorization: Bearer rsk_live_…</code> or <code>X-API-Key</code>, or <code>?key=</code> in the URL for webhooks</b></div>
        <div class="stat-line"><span>Formats accepted</span><b>Shopify, YouCan, WooCommerce, Lightfunnels orders · Google Sheets rows (English, French or Arabic columns) · Zapier / Make · the JSON below</b></div>
        <div class="stat-line"><span>Order status</span><b><code>GET ${esc(storeEndpoint())}/{your order number}</code> → status, carrier, tracking number</b></div>
        <div class="stat-line"><span>Check a key</span><b><code>GET ${esc(location.origin)}/api/v1/ping</code></b></div>
        <h3 class="sub">Example order</h3>
        <pre class="code-block">${esc(example)}</pre>
        <p class="info">Required: customer name, phone and at least one item. Items are matched to your products by SKU (then by name) so stock is counted; unknown items are kept on the order as sent. Send <code>"prepaid": true</code> (or a Shopify order marked paid) when the customer already paid, so the courier collects nothing. Sending the same order number twice records it once. Replies: <code>201</code> created, <code>200</code> already received, <code>401</code> bad key, <code>422</code> missing fields.</p>
      </div>
    </div>
  `;
}

// The key is shown once, with the steps for the store's platform.
function showStoreKey(k, secret) {
  modal(`Connect ${esc(k.platform === 'Other' ? 'your site' : k.platform)}`, `
    ${connectHero(k.platform, esc(k.name), 'Your key is ready. Follow the steps below; the box at the bottom turns green when the first order arrives.')}
    <p class="info">Copy this key now. For security it is never shown again; if it's lost, revoke it and create a new one.</p>
    <label class="copy-field">API key
      <span><input readonly id="store-secret" value="${esc(secret)}"><button type="button" data-action="copy-store-secret">Copy</button></span>
    </label>
    <label class="copy-field">Webhook URL (key included)
      <span><input readonly id="store-hook" value="${esc(`${storeEndpoint()}?key=${secret}`)}"><button type="button" data-action="copy-store-hook">Copy</button></span>
    </label>
    <h3 class="sub">Set up ${esc(k.platform === 'Other' ? 'your site' : k.platform)}</h3>
    ${storeSetupSteps(k.platform, secret)}
    ${connectStatus(k, k.platform)}
  `, null);
  watchConnection(k.id, k.platform);
}

function openNewStoreKey() {
  if (!checkAction('integrations', 'Create API key')) return;
  modal('Create an API key', `
    <div class="form-grid">
      <label>Name<input name="name" required maxlength="60" placeholder="e.g. Shopify store"></label>
      <label>Store platform
        <select name="platform">${STORE_PLATFORMS.map(p => `<option value="${p}">${p === 'Other' ? 'Other / custom site' : p}</option>`).join('')}</select>
      </label>
      <label class="full shopify-only">Shopify webhook signing secret (optional, can be added later)<input name="signingSecret" autocomplete="off" placeholder="Shown in Shopify under Settings → Notifications → Webhooks"></label>
    </div>
    <div id="store-key-error" role="alert" class="form-error"></div>
  `, 'Create key', f => {
    api('/api/store-keys', 'POST', { name: f.get('name').trim(), platform: f.get('platform'), signingSecret: (f.get('signingSecret') || '').trim() })
      .then(async ({ key, secret }) => {
        await loadStoreKeys();
        render();
        showStoreKey(key, secret);
      })
      .catch(err => { $('#store-key-error').textContent = err.message; });
    return false;
  });
  const form = $('#dialog-form');
  const sync = () => { form.querySelector('.shopify-only').style.display = form.platform.value === 'Shopify' ? '' : 'none'; };
  form.platform.onchange = sync;
  sync();
}



// Platform logos (Simple Icons, CC0) and simple marks where none exists.
const brandSvg = (path, hex, label, size = 30) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${label}"><path fill="#${hex}" d="${path}"/></svg>`;
const letterMark = (text, bg, label, size = 30) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${label}"><rect width="24" height="24" rx="6" fill="${bg}"/><text x="12" y="16.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#fff">${text}</text></svg>`;
const LOGO_PATHS = {"Shopify": ["M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z", "7AB55C"], "WooCommerce": ["M.754 9.58a.754.754 0 00-.754.758v2.525c0 .42.339.758.758.758h3.135l1.431.799-.326-.799h2.373a.757.757 0 00.758-.758v-2.525a.757.757 0 00-.758-.758H.754zm2.709.445h.03c.065.001.124.023.179.067a.26.26 0 01.103.19.29.29 0 01-.033.16c-.13.239-.236.64-.322 1.199-.083.541-.114.965-.094 1.267a.392.392 0 01-.039.219.213.213 0 01-.176.12c-.086.006-.177-.034-.263-.124-.31-.316-.555-.788-.735-1.416-.216.425-.375.744-.478.957-.196.376-.363.568-.502.578-.09.007-.166-.069-.233-.228-.17-.436-.352-1.277-.548-2.524a.297.297 0 01.054-.222c.047-.064.116-.095.21-.102.169-.013.265.065.288.238.103.695.217 1.284.336 1.766l.727-1.387c.066-.126.15-.192.25-.199.146-.01.237.083.273.28.083.441.188.817.315 1.136.086-.844.233-1.453.44-1.828a.255.255 0 01.218-.147zm1.293.36c.056 0 .116.006.18.02.232.05.411.177.53.386.107.18.161.395.161.654 0 .343-.087.654-.26.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.158-.659c0-.342.085-.655.258-.937.202-.333.462-.498.78-.498zm2.084 0c.056 0 .116.006.18.02.236.05.411.177.53.386.107.18.16.395.16.654 0 .343-.086.654-.259.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.16-.659c0-.342.087-.655.26-.937.202-.333.462-.498.78-.498zm4.437.047c-.305 0-.546.102-.718.304-.173.203-.256.49-.256.856 0 .395.086.697.256.906.17.21.418.316.744.316.315 0 .559-.107.728-.316.17-.21.256-.504.256-.883s-.087-.673-.26-.879c-.176-.202-.424-.304-.75-.304zm-1.466.002a1.13 1.13 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.505.336.861.336.103 0 .22-.016.346-.052v-.54c-.117.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm12.414 0a1.135 1.135 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.506.336.861.336.103 0 .22-.016.346-.052v-.54c-.116.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm-9.598.06l-.29 2.264h.579l.156-1.559.395 1.559h.412l.379-1.555.164 1.555h.603l-.304-2.264h-.791l-.12.508c-.03.13-.06.264-.087.4l-.067.352a29.97 29.97 0 00-.258-1.26h-.771zm2.768 0l-.29 2.264h.579l.156-1.559.396 1.559h.412l.375-1.555.165 1.555h.603l-.305-2.264h-.789l-.119.508c-.03.13-.06.264-.086.4l-.066.352c-.063-.352-.15-.771-.26-1.26h-.771zm3.988 0v2.264h.611v-1.031h.012l.494 1.03h.645l-.489-1.019a.61.61 0 00.37-.552.598.598 0 00-.25-.506c-.167-.123-.394-.186-.68-.186h-.713zm3.377 0v2.264H24v-.483h-.63v-.414h.54v-.468h-.54v-.416h.626v-.483H22.76zm-4.793.004v2.264h1.24v-.483h-.627v-.416h.541v-.468h-.54v-.415h.622v-.482h-1.236zm2.025.432c.146.003.25.025.313.072.063.046.091.12.091.227 0 .156-.135.236-.404.24v-.54zm-15.22.011c-.104 0-.205.069-.301.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.016-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm2.083 0c-.103 0-.204.069-.3.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.013-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm4.428.006c.233 0 .354.218.354.66-.004.273-.038.46-.098.553a.293.293 0 01-.262.139.266.266 0 01-.242-.139c-.056-.093-.084-.28-.084-.562 0-.436.11-.65.332-.65Z", "96588A"], "Google Sheets": ["M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z", "34A853"], "Zapier": ["M4.157 0A4.151 4.151 0 0 0 0 4.161v15.678A4.151 4.151 0 0 0 4.157 24h15.682A4.152 4.152 0 0 0 24 19.839V4.161A4.152 4.152 0 0 0 19.839 0H4.157Zm10.61 8.761h.03a.577.577 0 0 1 .23.038.585.585 0 0 1 .201.124.63.63 0 0 1 .162.431.612.612 0 0 1-.162.435.58.58 0 0 1-.201.128.58.58 0 0 1-.23.042.529.529 0 0 1-.235-.042.585.585 0 0 1-.332-.328.559.559 0 0 1-.038-.235.613.613 0 0 1 .17-.431.59.59 0 0 1 .405-.162Zm2.853 1.572c.03.004.061.004.095.004.325-.011.646.064.937.219.238.144.431.355.552.609.128.279.189.582.185.888v.193a2 2 0 0 1 0 .219h-2.498c.003.227.075.45.204.642a.78.78 0 0 0 .646.265.714.714 0 0 0 .484-.136.642.642 0 0 0 .23-.318l.915.257a1.398 1.398 0 0 1-.28.537c-.14.159-.321.284-.521.355a2.234 2.234 0 0 1-.836.136 1.923 1.923 0 0 1-1.001-.245 1.618 1.618 0 0 1-.665-.703 2.221 2.221 0 0 1-.227-1.036 1.95 1.95 0 0 1 .48-1.398 1.9 1.9 0 0 1 1.3-.488Zm-9.607.023c.162.004.325.026.48.079.207.065.4.174.563.314.26.302.393.692.366 1.088v2.276H8.53l-.109-.711h-.065c-.064.163-.155.31-.272.439a1.122 1.122 0 0 1-.374.264 1.023 1.023 0 0 1-.453.083 1.334 1.334 0 0 1-.866-.264.965.965 0 0 1-.329-.801.993.993 0 0 1 .076-.431 1.02 1.02 0 0 1 .242-.363 1.478 1.478 0 0 1 1.043-.303h.952v-.181a.696.696 0 0 0-.136-.454.553.553 0 0 0-.438-.154.695.695 0 0 0-.378.086.48.48 0 0 0-.193.254l-.99-.144a1.26 1.26 0 0 1 .257-.563c.14-.174.321-.302.533-.378.261-.091.54-.136.82-.129.053-.003.106-.007.163-.007Zm4.384.007c.174 0 .347.038.506.114.182.083.34.211.458.374.257.423.377.911.351 1.406a2.53 2.53 0 0 1-.355 1.448 1.148 1.148 0 0 1-1.009.517c-.204 0-.401-.045-.582-.136a1.052 1.052 0 0 1-.48-.457 1.298 1.298 0 0 1-.114-.234h-.045l.004 1.784h-1.059v-4.713h.904l.117.805h.057c.068-.208.177-.401.328-.56a1.129 1.129 0 0 1 .843-.344h.076v-.004Zm7.559.084h.903l.113.805h.053a1.37 1.37 0 0 1 .235-.484.813.813 0 0 1 .313-.242.82.82 0 0 1 .39-.076h.234v1.051h-.401a.662.662 0 0 0-.313.008.623.623 0 0 0-.272.155.663.663 0 0 0-.174.26.683.683 0 0 0-.027.314v1.875h-1.054v-3.666Zm-17.515.003h3.262v.896L3.73 13.104l.034.113h1.973l.042.9H2.4v-.9l1.931-1.754-.045-.117H2.441v-.896Zm11.815 0h1.055v3.659h-1.055V10.45Zm3.443.684.019.016a.69.69 0 0 0-.351.045.756.756 0 0 0-.287.204c-.11.155-.174.336-.189.522h1.545c-.034-.526-.257-.787-.74-.787h.003Zm-5.718.163c-.026 0-.057 0-.083.004a.78.78 0 0 0-.31.053.746.746 0 0 0-.257.189 1.016 1.016 0 0 0-.204.695v.064c-.015.257.057.507.204.711a.634.634 0 0 0 .253.196.638.638 0 0 0 .314.061.644.644 0 0 0 .578-.265c.14-.223.204-.48.189-.74a1.216 1.216 0 0 0-.181-.711.677.677 0 0 0-.503-.257Zm-4.509 1.266a.464.464 0 0 0-.268.102.373.373 0 0 0-.114.276c0 .053.008.106.027.155a.375.375 0 0 0 .087.132.576.576 0 0 0 .397.11v.004a.863.863 0 0 0 .563-.182.573.573 0 0 0 .211-.457v-.14h-.903Z", "FF4F00"], "Make": ["M13.38 3.498c-.27 0-.511.19-.566.465L9.85 18.986a.578.578 0 0 0 .453.678l4.095.826a.58.58 0 0 0 .682-.455l2.963-15.021a.578.578 0 0 0-.453-.678l-4.096-.826a.589.589 0 0 0-.113-.012zm-5.876.098a.576.576 0 0 0-.516.318L.062 17.697a.575.575 0 0 0 .256.774l3.733 1.877a.578.578 0 0 0 .775-.258l6.926-13.781a.577.577 0 0 0-.256-.776L7.762 3.658a.571.571 0 0 0-.258-.062zm11.74.115a.576.576 0 0 0-.576.576v15.426c0 .318.258.578.576.578h4.178a.58.58 0 0 0 .578-.578V4.287a.578.578 0 0 0-.578-.576Z", "6D00CC"]};
function platformLogo(p, size = 30) {
  const b = k => brandSvg(LOGO_PATHS[k][0], LOGO_PATHS[k][1], k, size);
  if (p === 'WooCommerce') return `<svg viewBox="-0.3 9.2 24.6 5.6" width="${Math.round(size * 2.6)}" height="${Math.round(size * 0.6)}" role="img" aria-label="WooCommerce"><path fill="#${LOGO_PATHS.WooCommerce[1]}" d="${LOGO_PATHS.WooCommerce[0]}"/></svg>`;
  if (LOGO_PATHS[p]) return b(p);
  if (p === 'Zapier / Make') return `<span class="logo-pair">${brandSvg(LOGO_PATHS.Zapier[0], LOGO_PATHS.Zapier[1], 'Zapier', size)}${brandSvg(LOGO_PATHS.Make[0], LOGO_PATHS.Make[1], 'Make', size)}</span>`;
  if (p === 'YouCan') return letterMark('YC', '#5b2bd6', 'YouCan', size);
  if (p === 'Lightfunnels') return letterMark('LF', '#111827', 'Lightfunnels', size);
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="Custom site"><rect width="24" height="24" rx="6" fill="#147d86"/><path d="M9.5 8 6 12l3.5 4M14.5 8 18 12l-3.5 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// What each store platform needs, shown when it is chosen on Store connection.
const PLATFORM_GUIDE = {
  Shopify: { mark: '', tagline: 'Easiest: paste one link in Shopify', time: '1 minute',
    how: 'Rosaino adds the "order created" webhook to your Shopify store for you. Every new order, including cash-on-delivery form apps (EasySell, Releasit…), arrives here as a lead.',
    need: ['Your store address ending in <b>.myshopify.com</b> (Shopify → Settings → Domains)', 'A Shopify app with the <b>read_orders</b> permission, and its <b>Admin API access token</b> (shpat_…) or its <b>Client ID</b> and <b>Client secret</b>'] },
  YouCan: { mark: '🟣', tagline: 'Webhook, Google Sheets or Zapier', time: '5 minutes',
    how: 'YouCan sends each new order to your Rosaino webhook URL. If your YouCan plan has no webhooks, connect through Google Sheets (YouCan can save orders to a sheet) or Zapier / Make.',
    need: ['Access to your YouCan seller area', 'The webhook URL Rosaino gives you in the next step'] },
  WooCommerce: { mark: '🟪', tagline: 'Built-in WooCommerce webhook', time: '3 minutes',
    how: 'WooCommerce has webhooks built in: you add one for "Order created" pointing to your Rosaino webhook URL.',
    need: ['Admin access to your WordPress site', 'The webhook URL Rosaino gives you in the next step'] },
  Lightfunnels: { mark: '⚡', tagline: 'Webhook on order created', time: '3 minutes',
    how: 'Lightfunnels sends each new order to your Rosaino webhook URL through a webhook or an automation.',
    need: ['Access to your Lightfunnels account', 'The webhook URL Rosaino gives you in the next step'] },
  'Google Sheets': { mark: '📊', tagline: 'For any store or COD form that fills a sheet', time: '5 minutes',
    how: 'A small script in your orders sheet sends each new row to Rosaino every minute and writes "Sent" next to it. Works with any store, landing page or COD form that saves orders to Google Sheets. Columns can be in English, French or Arabic.',
    need: ['The Google Sheet your orders go to (edit access)', 'The script Rosaino gives you in the next step (copy and paste)'] },
  'Zapier / Make': { mark: '🔗', tagline: 'Connect any app without code', time: '5 minutes',
    how: 'A Zap (or Make scenario) watches for new orders in your store\'s app and sends them to your Rosaino webhook URL.',
    need: ['A Zapier or Make account', 'The webhook URL Rosaino gives you in the next step'] },
  Other: { mark: '🧩', tagline: 'Your own site or a developer', time: '15 minutes for a developer',
    how: 'Your site sends each new order to Rosaino with a simple HTTPS request (JSON). Give your developer the key and the Developer reference below.',
    need: ['Someone who can edit your site\'s code', 'The API key Rosaino gives you in the next step'] }
};

function openStorePlatform(platform) {
  if (!checkAction('integrations', 'Connect a store')) return;
  const g = PLATFORM_GUIDE[platform] || PLATFORM_GUIDE.Other;
  const label = platform === 'Other' ? 'your site' : platform;
  modal(`Connect ${esc(label)}`, `
    ${connectHero(platform, `Connect ${esc(label)}`, 'About ' + esc(g.time) + '.')}
    <p class="info"><b>How it works.</b> ${g.how}</p>
    <h3 class="sub">What you need</h3>
    <ul class="steps">${g.need.map(n => `<li>${n}</li>`).join('')}</ul>
    <h3 class="sub">The steps</h3>
    <p class="info">Click <b>Create my key</b> below: the same steps are shown again with your real key and URL filled in, ready to copy.</p>
    ${storeSetupSteps(platform)}
    <div class="form-grid">
      <label class="full">Name for this connection<input name="name" required maxlength="60" value="${esc(platform === 'Other' ? 'My website' : platform + ' store')}"></label>
      ${platform === 'Shopify' ? '<label class="full">Shopify webhook signing secret (optional, can be added later)<input name="signingSecret" autocomplete="off"></label>' : ''}
    </div>
    <div id="store-key-error" role="alert" class="form-error"></div>
  `, 'Create my key', f => {
    api('/api/store-keys', 'POST', { name: f.get('name').trim(), platform, signingSecret: (f.get('signingSecret') || '').trim() })
      .then(async ({ key, secret }) => { await loadStoreKeys(); render(); showStoreKey(key, secret); })
      .catch(err => { $('#store-key-error').textContent = err.message; });
    return false;
  });
}

const connectHero = (p, title, sub) => `<div class="connect-hero">${platformLogo(p, 40)}<div><b>${title}</b><small>${sub}</small></div></div>`;

// Shopify: choose between the one-link setup (nothing to install) and an app token.
function openConnectShopify() {
  if (!checkAction('integrations', 'Connect Shopify')) return;
  modal('Connect Shopify', `
    ${connectHero('Shopify', 'Bring your Shopify orders into Rosaino', 'Choose one option. Both send every new order here as a lead, within seconds.')}
    <div class="option-cards">
      <button type="button" class="option-card recommended" data-action="shopify-quick">
        <span class="option-tag">Recommended · easiest</span>
        <b>Paste one link in Shopify</b>
        <small>About 1 minute. Nothing to install: copy a link from Rosaino and paste it in Shopify's notification settings.</small>
      </button>
      <button type="button" class="option-card" data-action="shopify-app">
        <b>Connect with a Shopify app</b>
        <small>Paste your store address and app token, and Rosaino sets everything up. Use this if you already have a Shopify app with the read_orders permission.</small>
      </button>
    </div>
  `, null);
}

function startShopifyQuick() {
  if (!checkAction('integrations', 'Connect Shopify')) return;
  api('/api/store-keys', 'POST', { name: 'Shopify store', platform: 'Shopify' })
    .then(async ({ key, secret }) => { await loadStoreKeys(); render(); showShopifyQuick(key, secret); })
    .catch(err => toast(err.message));
}

function showShopifyQuick(k, secret) {
  modal('Connect Shopify', `
    ${connectHero('Shopify', 'Paste this link in Shopify', 'Four short steps. Shopify menus in French are shown in brackets.')}
    <ol class="steps big-steps">
      <li><b>Copy your link</b>
        <span class="copy-field"><span><input readonly id="store-hook" value="${esc(`${storeEndpoint()}?key=${secret}`)}"><button type="button" class="primary" data-action="copy-store-hook">Copy link</button></span></span>
      </li>
      <li>In your Shopify admin, open <b>Settings → Notifications</b> <span class="fr">(Paramètres → Notifications)</span>, scroll to the bottom and click <b>Webhooks</b>.</li>
      <li>Click <b>Create webhook</b> <span class="fr">(Créer un webhook)</span> and fill in:
        <br>Event <b>Order creation</b> <span class="fr">(Création de commande)</span> · Format <b>JSON</b> · URL: <b>paste the link</b> · API version: leave as is.
        <br>Click <b>Save</b> <span class="fr">(Enregistrer)</span>.</li>
      <li>Next to your new webhook, click <b>Send test</b> <span class="fr">(Envoyer un test)</span>.</li>
    </ol>
    ${connectStatus(k, 'Shopify')}
    <details><summary>Extra security (optional)</summary>
      <p class="info">After saving, Shopify shows <i>"Your webhooks will be signed with …"</i> <span class="fr">(« Vos webhooks seront signés avec … »)</span>. Paste that code here so Rosaino only accepts orders really sent by your store.</p>
      <div class="inline-form"><input id="shopify-signing-secret" autocomplete="off" placeholder="Signing code from Shopify"><button type="button" data-action="save-signing-secret" data-id="${esc(k.id)}">Save</button></div>
    </details>
  `, null);
  watchConnection(k.id, 'Shopify');
}

function openShopifyApp() {
  if (!checkAction('integrations', 'Connect Shopify')) return;
  modal('Connect Shopify', `
    ${connectHero('Shopify', 'Connect with a Shopify app', 'Rosaino checks the credentials and adds the order webhook to your store itself.')}
    <div class="form-grid">
      <label class="full">Store address<input name="shop" required placeholder="your-store.myshopify.com" autocomplete="off"></label>
      <label class="full">Admin API access token<input name="accessToken" autocomplete="off" placeholder="shpat_…"></label>
      <p class="full muted" style="margin:0">or, for an app made in the Shopify Dev Dashboard:</p>
      <label>Client ID<input name="clientId" autocomplete="off"></label>
      <label>Client secret<input name="clientSecret" type="password" autocomplete="off"></label>
    </div>
    <details><summary>Where do I find these?</summary>
      <ol class="steps">
        <li>Shopify admin → <b>Settings → Apps and sales channels → Develop apps</b> <span class="fr">(Paramètres → Applications et canaux de vente → Développer des applications)</span> → <b>Create an app</b> named Rosaino.</li>
        <li><b>Configuration → Admin API integration → Configure</b>: tick <b>read_orders</b>, Save.</li>
        <li><b>API credentials → Install app</b>, then <b>Reveal token once</b> <span class="fr">(Révéler le jeton une fois)</span> and copy the token (starts with <code>shpat_</code>).</li>
        <li>No "Develop apps"? Create the app on <b>dev.shopify.com</b>, give it <b>read_orders</b>, install it, and copy its <b>Client ID</b> and <b>Client secret</b> instead.</li>
        <li>The store address is under <b>Settings → Domains</b>: the one ending in <code>.myshopify.com</code>.</li>
      </ol>
    </details>
    <p class="info">Sounds complicated? <button type="button" class="link-btn" data-action="shopify-quick">Paste one link instead (easiest)</button></p>
    <div id="shopify-connect-error" role="alert" class="form-error"></div>
  `, 'Connect', f => {
    const btn = $('#dialog-form .primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Connecting…'; }
    api('/api/store-keys/shopify-connect', 'POST', {
      shop: f.get('shop').trim(), accessToken: (f.get('accessToken') || '').trim(),
      clientId: (f.get('clientId') || '').trim(), clientSecret: (f.get('clientSecret') || '').trim()
    }).then(async ({ shopName, shop, key }) => {
      await loadStoreKeys();
      render();
      modal('Connect Shopify', `
        ${connectHero('Shopify', `✓ ${esc(shopName)} is connected`, esc(shop))}
        <p>Every new order on your store now arrives in <b>Leads &amp; orders</b> within seconds. Place a test order on your Shopify store to see it.</p>
        ${connectStatus(key, 'Shopify', 'Waiting for your first Shopify order…')}`, null);
      watchConnection(key.id, 'Shopify');
    }).catch(err => {
      $('#shopify-connect-error').textContent = err.message;
      if (btn) { btn.disabled = false; btn.textContent = 'Connect'; }
    });
    return false;
  });
}

// Live "is it connected?" box: turns green as soon as the store's first
// delivery reaches Rosaino (the portal's own test orders don't count).
const connectStatus = (k, platform, waiting) => `<div id="connect-status" class="connect-status waiting" role="status" data-key="${esc(k.id)}">
  <span class="spinner" aria-hidden="true"></span><span class="status-text">${waiting || `Waiting for ${esc(platform === 'Other' ? 'your site' : platform)}… finish the steps above and this turns green.`}</span></div>`;

function watchConnection(keyId, platform) {
  const tick = async () => {
    const box = $('#connect-status');
    if (!box || box.dataset.key !== keyId || !$('#modal').open) return;
    try {
      storeKeys = await api('/api/store-keys');
      const k = storeKeys.find(x => x.id === keyId);
      const hit = (k?.recent || []).find(r => r.result !== 'test');
      if (hit) {
        const name = platform === 'Other' ? 'Your site' : platform;
        let html;
        if (hit.result === 'rejected' && /signature/i.test(hit.reason || '')) {
          box.className = 'connect-status error';
          html = `${esc(name)} reached Rosaino, but the signature didn't match: check the signing code saved for this connection.`;
        } else if (hit.result === 'rejected') {
          box.className = 'connect-status ok';
          html = `<b>✓ Connected.</b> ${esc(name)} reached Rosaino. Its sample order wasn't added (${esc(hit.reason || 'incomplete')}); real orders with a customer phone will be.`;
        } else {
          box.className = 'connect-status ok';
          html = `<b>✓ Connected!</b> ${esc(name)} is sending orders to Rosaino.${hit.orderId ? ` The first one (${esc(hit.orderId)}) is in Leads &amp; orders.` : ''}`;
        }
        box.innerHTML = `<span class="status-text">${html}</span>`;
        if (page === 'store') render();
        return;
      }
    } catch {}
    setTimeout(tick, 4000);
  };
  setTimeout(tick, 3000);
}

// A refused store order: show what arrived, let staff fill in the rest, add it.
async function openFixDelivery(ref) {
  const [keyId, inboxId] = String(ref).split('|');
  let info;
  try { info = await api(`/api/store-keys/${encodeURIComponent(keyId)}/inbox/${encodeURIComponent(inboxId)}`); } catch (err) { return toast(err.message); }
  if (info.resolvedOrderId) return toast(`Already added as ${info.resolvedOrderId}`);
  const d = info.draft || {};
  const item = (d.items || [])[0] || {};
  const field = (name, label, value, extra = '') => `<label>${label}<input name="${name}" value="${esc(value ?? '')}" ${extra}></label>`;
  modal('Fix & add this order', `
    <p class="info">This order was refused: <b>${esc(info.error || 'incomplete')}</b> It arrived as ${esc(info.format || '?')}${info.fields?.length ? ` with: <code>${esc(info.fields.join(', '))}</code>` : ' with no readable fields'}.
    ${!info.fields?.length ? 'Nothing could be read, so copy the details from the order in your store (e.g. Shopify → Orders).' : 'Check the details below and fill in what is missing.'}</p>
    <div class="form-grid">
      ${field('customer', 'Customer name', d.customer, 'required')}
      ${field('phone', 'Phone', d.phone, 'inputmode="tel"')}
      ${field('city', 'City', d.city)}
      ${field('address', 'Address', d.address)}
      ${field('product', 'Product', item.name || '', 'required')}
      ${field('sku', 'SKU (optional)', item.sku || '')}
      ${field('quantity', 'Quantity', item.quantity || 1, 'type="number" min="1"')}
      ${field('amount', 'Total (MAD)', d.amount || '', 'type="number" min="0" step="0.01"')}
    </div>
    ${d.email ? `<p class="info">Customer email: ${esc(d.email)}</p>` : ''}
    <div id="fix-error" role="alert" class="form-error"></div>
  `, 'Add to orders', f => {
    const body = Object.fromEntries(['customer', 'phone', 'city', 'address', 'product', 'sku', 'quantity', 'amount'].map(k => [k, (f.get(k) || '').trim()]));
    if (!body.phone && !d.email) { $('#fix-error').textContent = 'Add a phone number so the call center can confirm the order.'; return false; }
    api(`/api/store-keys/${encodeURIComponent(keyId)}/inbox/${encodeURIComponent(inboxId)}`, 'POST', body)
      .then(async r => {
        $('#modal').close();
        toast(r.duplicate ? `This order was already in your orders (${r.id})` : `Added to orders as ${r.id}`);
        await Promise.all([loadStoreKeys(), pullOrders()]);
        render();
      })
      .catch(err => { $('#fix-error').textContent = err.message; });
    return false;
  });
}

const storeKeyById = id => (storeKeys || []).find(k => k.id === id);

// ---------------------------------------------------------------------------
// Analytics: where customers come from, what they want, and a live dot map.
// ---------------------------------------------------------------------------
// Land as dots, pre-computed from Natural Earth (public domain): rows of
// alternating sea/land run lengths in base 36.
const MAP_DOTS = {"world": {"lon0": -180, "lat1": 82, "step": 2, "rows": "19,e,1,7,1,9,2w|16,d,2,p,g,1,1,4,x,3,15|y,2,4,1,7,4,2,r,g,3,1,1,12,1,14|t,1,2,2,2,1,2,3,2,1,f,l,13,4,d,a,c,3,j|s,4,b,2,h,i,12,1,f,c,z|s,2,1,5,1,1,2,2,3,8,a,g,11,2,7,2,2,q,5,5,g|9,a,6,2,5,8,1,4,3,9,6,g,m,5,i,1a,b|0,2,6,p,3,3,2,1,1,3,1,3,2,1,1,4,6,a,o,d,2,1,2,b,1,1h|0,6,1,14,6,3,1,2,5,8,7,1,1,2,e,b,3,1y|a,10,1,3,4,4,7,5,9,3,d,6,1,26,1|8,10,6,4,c,3,o,6,2,1z,1,5,3|7,7,1,1,3,o,9,4,11,7,2,1,2,1r,3,2,8|c,1,a,l,8,7,t,1,7,3,4,1m,8,3,9|a,1,d,n,5,8,s,1,6,3,3,1m,9,4,9|o,p,2,b,o,1,2,1,5,2,1,1p,1,1,7,3,a|r,n,1,c,n,1,1,3,2,1x,7,1,b|q,v,5,1,s,1y,1,1,i|s,u,3,3,o,20,1,1,j|t,u,1,1,t,g,1,1,1,6,2,16,m|s,s,1,1,w,7,1,7,5,4,2,16,3,2,i|s,s,u,6,4,2,2,4,3,1,3,4,2,13,4,1,k|s,p,x,5,7,1,1,3,1,b,2,x,1,3,6,1,k|t,n,y,4,7,2,2,2,1,b,2,x,3,2,5,1,k|u,n,12,5,d,16,3,1,3,3,k|v,l,z,9,c,17,5,3,m|w,i,10,c,2,3,5,17,u|y,c,3,1,10,t,1,z,u|x,1,1,7,7,1,y,v,1,z,u|y,1,1,6,15,p,1,7,3,v,v|z,1,1,5,15,p,2,9,5,p,w|12,4,6,1,1,2,u,r,1,a,5,m,y|12,4,3,2,5,1,t,r,2,8,8,7,3,7,1,1,z|13,7,b,1,o,s,1,8,8,5,6,6,7,1,t|16,4,1,1,y,s,2,5,a,4,8,6,5,1,u|19,4,x,t,1,3,d,3,9,5,6,1,t|1b,2,5,2,q,u,g,2,c,3,10|1c,1,4,6,o,x,d,1,d,1,11|1f,a,n,w,e,1,9,1,b,2,r|1g,a,n,6,2,m,q,1,13|1g,d,u,j,p,1,1,1,5,2,w|1f,e,u,i,r,1,1,1,3,3,w|1e,f,u,h,s,2,3,4,1,1,3,1,q|1e,i,r,g,u,2,3,3,1,1,6,1,1,1,l|1e,l,p,e,w,1,7,2,6,5,i|1e,n,o,d,x,1,g,4,1,1,f|1f,m,o,d,10,2,b,3,1,2,g|1f,m,o,d,14,1,1,1,b,2,f|1g,k,p,e,1a,2,2,1,j|1g,j,q,e,3,2,13,3,3,1,j|1h,i,p,f,2,2,12,6,2,2,i|1j,g,p,d,4,2,11,c,f,1,1|1j,f,r,b,5,2,z,f,g|1j,f,s,a,4,3,x,h,8,1,7|1j,c,v,a,4,2,x,j,f|1j,b,w,9,14,k,e|1j,b,w,9,15,j,e|1j,a,y,7,16,j,e|1j,a,z,5,17,7,2,a,e|1j,9,10,2,1a,2,8,8,f|1i,8,2q,6,b,1,3|1i,8,2r,3,e,2,1|1i,5,3b,1,2|1h,5,2x,2,b,2,3|1i,4,39,2,4|1h,4,39,2,5|1h,5,3f|1h,3,3h|1h,3,3h|1i,3,3g|51"}, "morocco": {"lon0": -17.2, "lat1": 36, "step": 0.2, "rows": "2b|1l,3,n|1l,3,n|1k,5,m|1k,8,2,6,b|1j,l,7|1j,m,6|1i,n,6|1i,o,5|1h,p,5|1g,q,5|1e,s,5|1c,u,5|19,x,5|18,y,5|17,10,4|16,11,4|14,15,2|14,15,2|14,14,3|13,x,b|13,w,c|12,t,g|11,v,f|11,u,g|11,v,f|11,t,h|12,p,k|12,n,m|12,n,m|12,m,n|11,h,t|10,f,1,2,t|10,d,y|z,c,10|y,b,12|w,c,13|u,d,14|t,e,14|r,g,14|o,j,14|l,m,14|l,m,14|k,n,14|k,n,14|j,o,14|j,o,14|i,p,14|g,r,14|e,t,14|e,t,14|d,d,1l|d,d,1l|d,d,1l|c,e,1l|c,e,1l|c,e,1l|c,e,1l|a,g,1l|9,h,1l|8,i,1l|8,i,1l|7,j,1l|6,k,1l|6,h,1o|6,f,1q|5,g,1q|5,g,1q|4,h,1q|3,i,1q|2,j,1q|2,j,1q|2,j,1q|1,k,1q|1,1,29|2b|2b|2b"}};

const CITY_COORDS = (() => {
  const list = [
    ['casablanca|casa|dar el beida|الدار البيضاء|الدارالبيضاء', 33.57, -7.59], ['rabat|الرباط', 34.02, -6.84], ['sale|سلا', 34.05, -6.8],
    ['temara|تمارة', 33.93, -6.91], ['kenitra|القنيطرة', 34.26, -6.58], ['fes|fez|فاس', 34.03, -5.0], ['meknes|مكناس', 33.89, -5.55],
    ['marrakech|marrakesh|مراكش', 31.63, -8.01], ['agadir|أكادير|اكادير', 30.43, -9.6], ['tanger|tangier|tanja|طنجة', 35.76, -5.83],
    ['tetouan|tetuan|تطوان', 35.57, -5.37], ['oujda|وجدة', 34.68, -1.91], ['nador|الناظور', 35.17, -2.93], ['al hoceima|alhoceima|الحسيمة', 35.25, -3.93],
    ['el jadida|eljadida|الجديدة', 33.25, -8.5], ['safi|آسفي|اسفي', 32.3, -9.24], ['essaouira|الصويرة', 31.51, -9.77], ['beni mellal|بني ملال', 32.34, -6.36],
    ['khouribga|خريبكة', 32.88, -6.91], ['settat|سطات', 33.0, -7.62], ['berrechid|برشيد', 33.27, -7.59], ['mohammedia|المحمدية', 33.69, -7.38],
    ['khemisset|الخميسات', 33.82, -6.07], ['taza|تازة', 34.21, -4.01], ['errachidia|الرشيدية', 31.93, -4.43], ['ouarzazate|ورزازات', 30.92, -6.89],
    ['taroudant|تارودانت', 30.47, -8.88], ['tiznit|تزنيت', 29.7, -9.73], ['guelmim|كلميم', 28.99, -10.06], ['laayoune|العيون', 27.15, -13.2],
    ['dakhla|الداخلة', 23.68, -15.96], ['larache|العرائش', 35.19, -6.16], ['ksar el kebir|القصر الكبير', 35.0, -5.9], ['chefchaouen|chaouen|شفشاون', 35.17, -5.27],
    ['berkane|بركان', 34.92, -2.32], ['ifrane|إفران', 33.53, -5.11], ['azrou|أزرو', 33.43, -5.22], ['khenifra|خنيفرة', 32.94, -5.67],
    ['sidi kacem|سيدي قاسم', 34.22, -5.71], ['sidi slimane|سيدي سليمان', 34.26, -5.93], ['inezgane|إنزكان', 30.36, -9.54], ['ait melloul|أيت ملول', 30.33, -9.5],
    ['skhirat|الصخيرات', 33.85, -7.03], ['bouznika|بوزنيقة', 33.79, -7.16], ['fnideq|الفنيدق', 35.85, -5.36], ['martil|مرتيل', 35.62, -5.27],
    ['youssoufia|اليوسفية', 32.25, -8.53], ['benguerir|ben guerir|ابن جرير', 32.24, -7.95], ['el kelaa des sraghna|قلعة السراغنة', 32.05, -7.41],
    ['oued zem|وادي زم', 32.86, -6.57], ['fquih ben salah|الفقيه بن صالح', 32.5, -6.69], ['zagora|زاكورة', 30.33, -5.84], ['tinghir|تنغير', 31.51, -5.53],
    ['midelt|ميدلت', 32.68, -4.74], ['guercif|جرسيف', 34.23, -3.35], ['taourirt|تاوريرت', 34.41, -2.9], ['sefrou|صفرو', 33.83, -4.84],
    ['paris', 48.86, 2.35], ['lyon', 45.76, 4.84], ['marseille', 43.3, 5.37], ['toulouse', 43.6, 1.44], ['lille', 50.63, 3.06], ['bordeaux', 44.84, -0.58],
    ['nice', 43.7, 7.27], ['brussels|bruxelles|brussel', 50.85, 4.35], ['antwerp|anvers|antwerpen', 51.22, 4.4], ['amsterdam', 52.37, 4.9],
    ['rotterdam', 51.92, 4.48], ['madrid', 40.42, -3.7], ['barcelona|barcelone', 41.39, 2.17], ['malaga', 36.72, -4.42], ['london|londres', 51.51, -0.13],
    ['berlin', 52.52, 13.4], ['frankfurt', 50.11, 8.68], ['milan|milano', 45.46, 9.19], ['rome|roma', 41.9, 12.5], ['geneva|geneve', 46.2, 6.14],
    ['montreal', 45.5, -73.57], ['toronto', 43.65, -79.38], ['new york', 40.71, -74.01], ['dubai|دبي', 25.2, 55.27], ['abu dhabi|أبوظبي', 24.45, 54.38],
    ['riyadh|الرياض', 24.71, 46.68], ['jeddah|جدة', 21.49, 39.19], ['doha|الدوحة', 25.29, 51.53], ['cairo|le caire|القاهرة', 30.04, 31.24],
    ['algiers|alger|الجزائر', 36.75, 3.06], ['tunis|تونس', 36.81, 10.18], ['dakar', 14.72, -17.47], ['istanbul', 41.01, 28.98], ['lisbon|lisbonne|lisboa', 38.72, -9.14]
  ];
  const m = new Map();
  list.forEach(([names, lat, lng]) => names.split('|').forEach(n => m.set(geoKey(n), { lat, lng, name: names.split('|')[0] })));
  return m;
})();
const COUNTRY_COORDS = (() => {
  const list = [
    ['ma|mar|morocco|maroc|المغرب', 'Morocco', 31.8, -7.1], ['fr|fra|france|فرنسا', 'France', 46.6, 2.4], ['es|esp|spain|espagne|espana|إسبانيا', 'Spain', 40.2, -3.6],
    ['be|bel|belgium|belgique|belgie', 'Belgium', 50.6, 4.6], ['nl|nld|netherlands|pays-bas|pays bas|holland', 'Netherlands', 52.2, 5.5],
    ['de|deu|germany|allemagne|deutschland', 'Germany', 51.1, 10.4], ['it|ita|italy|italie|italia', 'Italy', 42.8, 12.6],
    ['gb|uk|gbr|united kingdom|royaume-uni|royaume uni', 'United Kingdom', 54.0, -2.0], ['pt|prt|portugal', 'Portugal', 39.6, -8.0],
    ['ch|che|switzerland|suisse', 'Switzerland', 46.8, 8.2], ['us|usa|united states|etats-unis|etats unis', 'United States', 39.8, -98.6],
    ['ca|can|canada', 'Canada', 56.0, -96.0], ['ae|are|united arab emirates|emirats arabes unis|uae|الإمارات', 'United Arab Emirates', 24.0, 54.0],
    ['sa|sau|saudi arabia|arabie saoudite|السعودية', 'Saudi Arabia', 24.0, 45.0], ['qa|qat|qatar|قطر', 'Qatar', 25.3, 51.2],
    ['eg|egy|egypt|egypte|مصر', 'Egypt', 26.8, 30.8], ['dz|dza|algeria|algerie|الجزائر', 'Algeria', 28.0, 2.6], ['tn|tun|tunisia|tunisie|تونس', 'Tunisia', 34.0, 9.5],
    ['sn|sen|senegal', 'Senegal', 14.5, -14.5], ['tr|tur|turkey|turquie|turkiye', 'Turkey', 39.0, 35.0], ['mr|mrt|mauritania|mauritanie', 'Mauritania', 20.0, -10.5],
    ['ci|civ|cote d ivoire|ivory coast', "Côte d'Ivoire", 7.5, -5.5]
  ];
  const m = new Map();
  list.forEach(([keys, name, lat, lng]) => keys.split('|').forEach(k => m.set(geoKey(k), { lat, lng, name })));
  return m;
})();
function geoKey(v) { return String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }

// Best known position of an order: Shopify's coordinates, then the city, then the country.
function orderPlace(o) {
  const cityKey = geoKey(o.city);
  const c = cityKey && (CITY_COORDS.get(cityKey) || CITY_COORDS.get(cityKey.split(' ')[0]));
  const country = COUNTRY_COORDS.get(geoKey(o.country));
  const label = o.city ? String(o.city).trim() : country ? country.name : '';
  if (o.geo && Number.isFinite(o.geo.lat)) return { lat: o.geo.lat, lng: o.geo.lng, key: (c?.name || cityKey || `${o.geo.lat.toFixed(1)},${o.geo.lng.toFixed(1)}`), label: label || 'Unknown city', country: country?.name || '' };
  if (c) return { lat: c.lat, lng: c.lng, key: c.name, label: label || c.name, country: country?.name || '' };
  if (country) return { lat: country.lat, lng: country.lng, key: 'country:' + country.name, label: o.city ? `${String(o.city).trim()} (${country.name})` : country.name, country: country.name };
  return null;
}

let analyticsRange = '30';
let analyticsMap = 'auto';
const CONFIRMED_STATUSES = ['Confirmed', 'In transit', 'Delivered', 'Returned'];

function analyticsOrders() {
  const days = Number(analyticsRange);
  const since = days ? Date.now() - days * 86400000 : 0;
  return db.orders.filter(o => o.source !== 'Test' && (!since || new Date(o.date || o.createdAt || 0).getTime() >= since - 86400000));
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function sourceMark(src) {
  const known = STORE_PLATFORMS.includes(src) ? src : src === 'Zapier' || src === 'Make' ? 'Zapier / Make' : null;
  if (known) return platformLogo(known, known === 'WooCommerce' ? 13 : 22);
  return `<span class="src-dot" aria-hidden="true">${esc(String(src || '?').slice(0, 1).toUpperCase())}</span>`;
}

function barList(rows, { valueLabel, extra }) {
  if (!rows.length) return '<p class="empty">No orders in this period yet.</p>';
  const max = Math.max(...rows.map(r => r.value), 1);
  return `<div class="bar-list">${rows.map(r => `
    <div class="bar-item" tabindex="0" data-tip="${esc(r.tip)}">
      <div class="bar-label">${r.mark || ''}<span>${esc(r.label)}</span></div>
      <div class="bar-track2"><div class="bar-fill2" style="width:${Math.max(2, (r.value / max) * 100)}%"></div></div>
      <div class="bar-value"><b>${r.value.toLocaleString()}</b> <small>${valueLabel}${extra ? ' · ' + extra(r) : ''}</small></div>
    </div>`).join('')}</div>`;
}

function dotGrid(view, cell) {
  let d = '';
  view.rows.split('|').forEach((row, ri) => {
    let col = 0, land = false;
    row.split(',').forEach(run => {
      const n = parseInt(run, 36);
      if (land) for (let i = 0; i < n; i++) d += `M${(col + i) * cell} ${ri * cell}h0`;
      col += n;
      land = !land;
    });
  });
  return d;
}

function worldMap(places, which) {
  const view = MAP_DOTS[which];
  const cell = which === 'world' ? 6 : 7;
  const rows = view.rows.split('|');
  const cols = rows[0].split(',').reduce((s, n) => s + parseInt(n, 36), 0);
  const W = (cols - 1) * cell, H = (rows.length - 1) * cell;
  const lon1 = view.lon0 + (cols - 1) * view.step, lat0 = view.lat1 - (rows.length - 1) * view.step;
  const inView = p => p.lng >= view.lon0 - 0.5 && p.lng <= lon1 + 0.5 && p.lat >= lat0 - 0.5 && p.lat <= view.lat1 + 0.5;
  const x = lng => ((lng - view.lon0) / view.step) * cell, y = lat => ((view.lat1 - lat) / view.step) * cell;
  const shown = places.filter(inView);
  const max = Math.max(...shown.map(p => p.count), 1);
  const r = n => (which === 'world' ? 4 : 5) + (which === 'world' ? 11 : 14) * Math.sqrt(n / max);
  const pad = 20;
  return `
    <svg class="dot-map" viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" role="img" aria-label="Map of where orders come from">
      <path d="${dotGrid(view, cell)}" class="land-dots" stroke-width="${which === 'world' ? 3.2 : 3.6}"/>
      ${[...shown].sort((a, b) => b.count - a.count).map(p => `
        <g class="place" tabindex="0" data-tip="${esc(`<b>${esc(p.label)}</b>${p.country && !p.label.includes(p.country) ? ' · ' + esc(p.country) : ''}<br>${p.count} order${p.count > 1 ? 's' : ''} · ${pct(p.confirmed, p.count)}% confirmed${p.top ? '<br>Top product: ' + esc(p.top) : ''}`)}">
          ${p.today ? `<circle class="pulse" cx="${x(p.lng).toFixed(1)}" cy="${y(p.lat).toFixed(1)}" r="${r(p.count).toFixed(1)}"/>` : ''}
          <circle class="hit" cx="${x(p.lng).toFixed(1)}" cy="${y(p.lat).toFixed(1)}" r="${(r(p.count) + 6).toFixed(1)}"/>
          <circle class="client-dot" cx="${x(p.lng).toFixed(1)}" cy="${y(p.lat).toFixed(1)}" r="${r(p.count).toFixed(1)}"/>
        </g>`).join('')}
    </svg>`;
}

function analytics() {
  const list = analyticsOrders();
  const total = list.length;
  const confirmedOf = arr => arr.filter(o => CONFIRMED_STATUSES.includes(o.status)).length;
  const deliveredOf = arr => arr.filter(o => o.status === 'Delivered').length;

  // Sources
  const bySource = new Map();
  list.forEach(o => {
    const src = o.source || 'Unknown';
    const e = bySource.get(src) || { label: src, orders: [] };
    e.orders.push(o);
    bySource.set(src, e);
  });
  const sources = [...bySource.values()].map(e => ({
    label: e.label, value: e.orders.length, mark: sourceMark(e.label),
    confirmed: pct(confirmedOf(e.orders), e.orders.length), share: pct(e.orders.length, total),
    revenue: e.orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (Number(o.amount) || 0), 0)
  })).sort((a, b) => b.value - a.value);
  sources.forEach(r => { r.tip = `<b>${esc(r.label)}</b><br>${r.value} orders · ${r.share}% of all<br>${r.confirmed}% confirmed · ${money(r.revenue)} delivered`; });

  // Products (by units across all items)
  const byProduct = new Map();
  list.forEach(o => {
    const items = Array.isArray(o.items) && o.items.length ? o.items : [{ product: o.product, name: '', quantity: o.quantity || 1, price: o.amount }];
    const seen = new Set();
    items.forEach(i => {
      const prod = db.products.find(p => p.id === i.product);
      const name = prod?.name || i.name || String(i.product || 'Unknown product');
      const e = byProduct.get(name) || { label: name, value: 0, orders: 0, confirmed: 0 };
      e.value += Number(i.quantity) || 1;
      if (!seen.has(name)) { e.orders++; if (CONFIRMED_STATUSES.includes(o.status)) e.confirmed++; seen.add(name); }
      byProduct.set(name, e);
    });
  });
  const products = [...byProduct.values()].sort((a, b) => b.value - a.value);
  products.forEach(r => { r.tip = `<b>${esc(r.label)}</b><br>${r.value} units in ${r.orders} orders<br>${pct(r.confirmed, r.orders)}% of those orders confirmed`; });
  const topProducts = products.slice(0, 8);
  if (products.length > 8) {
    const rest = products.slice(8);
    const o = { label: `Other (${rest.length} products)`, value: rest.reduce((s, r) => s + r.value, 0), orders: rest.reduce((s, r) => s + r.orders, 0), confirmed: rest.reduce((s, r) => s + r.confirmed, 0) };
    o.tip = `<b>${esc(o.label)}</b><br>${o.value} units in ${o.orders} orders`;
    topProducts.push(o);
  }

  // Places
  const today = new Date().toISOString().slice(0, 10);
  const byPlace = new Map();
  let unplaced = 0;
  list.forEach(o => {
    const pl = orderPlace(o);
    if (!pl) { unplaced++; return; }
    const e = byPlace.get(pl.key) || { ...pl, count: 0, confirmed: 0, today: false, products: {} };
    e.count++;
    if (CONFIRMED_STATUSES.includes(o.status)) e.confirmed++;
    if ((o.date || '').slice(0, 10) === today) e.today = true;
    const pn = db.products.find(p => p.id === o.product)?.name || o.items?.[0]?.name || '';
    if (pn) e.products[pn] = (e.products[pn] || 0) + 1;
    byPlace.set(pl.key, e);
  });
  const places = [...byPlace.values()].map(p => ({ ...p, top: Object.entries(p.products).sort((a, b) => b[1] - a[1])[0]?.[0] || '' })).sort((a, b) => b.count - a.count);
  const abroad = places.filter(p => p.lng < -17.5 || p.lng > -0.5 || p.lat < 20.5 || p.lat > 36.5).length;
  const mapView = analyticsMap === 'auto' ? (abroad ? 'world' : 'morocco') : analyticsMap;

  const ranges = [['7', '7 days'], ['30', '30 days'], ['90', '90 days'], ['0', 'All time']];
  const seg = (items, cur, action) => `<div class="segmented" role="group">${items.map(([v, l]) => `<button type="button" class="${cur === v ? 'active' : ''}" aria-pressed="${cur === v}" data-action="${action}" data-id="${v}">${l}</button>`).join('')}</div>`;
  const topSource = sources[0], topProduct = products[0];

  return title('Analytics', 'Where your customers come from, what they want, and where they are.', seg(ranges, analyticsRange, 'analytics-range')) + `
    <div class="metrics">
      ${metric('Orders', total.toLocaleString(), analyticsRange === '0' ? 'All time' : `Last ${analyticsRange} days`)}
      ${metric('Confirmation rate', pct(confirmedOf(list), total) + '%', `${deliveredOf(list)} delivered`)}
      ${metric('Top source', topSource ? esc(topSource.label) : '—', topSource ? `${topSource.share}% of orders` : 'No orders yet')}
      ${metric('Most wanted product', topProduct ? esc(topProduct.label) : '—', topProduct ? `${topProduct.value} units ordered` : 'No orders yet')}
    </div>

    <div class="panel">
      <div class="panel-head">
        <div><h2>Where your customers are</h2><p>Each dot is a city; bigger dots mean more orders. Pulsing dots ordered today. Hover a dot for details.</p></div>
        ${seg([['world', 'World'], ['morocco', 'Morocco']], mapView, 'analytics-map')}
      </div>
      <div class="map-layout">
        <div class="map-wrap">${places.length ? worldMap(places, mapView) : worldMap([], mapView)}
          <div class="map-legend"><span><i class="lg-dot s"></i><i class="lg-dot m"></i><i class="lg-dot l"></i> Orders per city</span><span><i class="lg-pulse"></i> Ordered today</span></div>
        </div>
        <div class="map-side">
          <h3 class="sub">Top cities</h3>
          ${places.length ? `<ol class="city-list">${places.slice(0, 10).map(p => `<li><span>${esc(p.label)}</span><b>${p.count}</b></li>`).join('')}</ol>` : '<p class="info">No orders with a city yet.</p>'}
          ${unplaced ? `<p class="info">${unplaced} order${unplaced > 1 ? 's' : ''} without a recognised city or country.</p>` : ''}
        </div>
      </div>
    </div>

    <div class="grid two-equal">
      <div class="panel">
        <div class="panel-head"><div><h2>Where orders come from</h2><p>Orders per store or channel, with the share confirmed by the call center.</p></div></div>
        ${barList(sources, { valueLabel: 'orders', extra: r => `${r.share}% · ${r.confirmed}% confirmed` })}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>What customers want</h2><p>Units ordered per product.</p></div></div>
        ${barList(topProducts, { valueLabel: 'units', extra: r => `${r.orders} orders` })}
      </div>
    </div>`;
}

// One tooltip for every chart mark that has data-tip.
(() => {
  const tip = document.createElement('div');
  tip.id = 'chart-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  const show = (el, x, y) => {
    tip.innerHTML = el.dataset.tip;
    tip.classList.add('show');
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 14)) + 'px';
    tip.style.top = Math.max(8, y - r.height - 12) + 'px';
  };
  document.addEventListener('mousemove', e => {
    const el = e.target.closest?.('[data-tip]');
    if (el) show(el, e.clientX, e.clientY); else tip.classList.remove('show');
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest?.('[data-tip]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    show(el, r.left + r.width / 2, r.top);
  });
  document.addEventListener('focusout', () => tip.classList.remove('show'));
})();

const views = { overview, guide, store: storeConnection, orders, analytics, calls, routing, shipping, carriers, products, cms, suppliers, finance, reconciliation, reports, stores, integrations, team, security, settings };

function updateLivePreview() {
  const pId = activeCmsProductId;
  const cms = db.cmsPages?.[pId];
  const iframe = $('#cms-preview-iframe');
  if (!iframe) return;

  try {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'ROSAINO_CMS_UPDATE',
        productId: pId,
        cms: cms
      }, '*');
      iframe.contentWindow.postMessage({
        type: 'ROSAINO_SET_VISUAL_EDIT_MODE',
        active: visualEditMode
      }, '*');
    }
  } catch (e) {
    // fallback: refresh iframe src
    const targetLang = cms?.language || currentLang || 'fr';
    iframe.src = `/product?id=${pId}&preview=1&lang=${targetLang}&_t=${Date.now()}`;
  }
}

// Scale an image data URL down to at most 2000px and about 2.5 MB (WebP).
// Small images, GIFs and SVGs are returned unchanged.
function shrinkImage(dataUrl) {
  const MAX_SIDE = 2000;
  const MAX_CHARS = 2.5 * 1024 * 1024 * 4 / 3;
  if (dataUrl.length <= MAX_CHARS || /^data:image\/(gif|svg)/.test(dataUrl)) return Promise.resolve(dataUrl);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      let out = dataUrl;
      for (let quality = 0.85; quality >= 0.5; quality -= 0.15) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        out = canvas.toDataURL('image/webp', quality);
        if (out.length <= MAX_CHARS) break;
        scale *= 0.8;
      }
      resolve(out);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function handleImageFileUpload(file, targetField) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Please select a valid image file (PNG, JPG, WebP).');
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    toast('File size limit is 25 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async evt => {
    // Vercel accepts request bodies up to 4.5 MB, so large photos are scaled down first.
    const dataUrl = await shrinkImage(evt.target.result);
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (!p) return;
    if (!db.cmsPages) db.cmsPages = {};
    if (!db.cmsPages[p.id]) db.cmsPages[p.id] = {};

    db.cmsPages[p.id][targetField] = dataUrl;
    persist();

    // Also send to backend upload endpoint for file persistence
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataUrl, filename: file.name })
    }).then(res => res.json()).then(data => {
      if (data && data.url) {
        db.cmsPages[p.id][targetField] = data.url;
        persist();
      } else {
        toast(data?.error || 'The photo could not be saved on the server.');
      }
    }).catch(() => toast('The photo could not be saved on the server.'));

    toast(`Photo uploaded for "${targetField}"!`);
    render();
    updateLivePreview();
  };
  reader.readAsDataURL(file);
}

function setupImageDropzones() {
  const zones = document.querySelectorAll('.image-upload-zone');
  zones.forEach(zone => {
    const target = zone.dataset.target;
    const input = zone.querySelector('input[type="file"]');

    zone.ondragover = e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-active');
    };
    zone.ondragleave = e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-active');
    };
    zone.ondrop = e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-active');
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleImageFileUpload(files[0], target);
      }
    };
    if (input) {
      input.onchange = () => {
        if (input.files && input.files[0]) {
          handleImageFileUpload(input.files[0], target);
        }
      };
    }
  });
}

function setupDragAndDropSections() {
  const container = $('#cms-sections-container');
  if (!container) return;

  const blocks = container.querySelectorAll('.section-block');
  blocks.forEach(block => {
    block.ondragstart = e => {
      draggedSectionId = block.dataset.sectionId;
      block.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedSectionId);
    };

    block.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetBlock = e.target.closest('.section-block');
      if (targetBlock && targetBlock !== block) {
        container.querySelectorAll('.section-block').forEach(b => b.classList.remove('drag-over'));
        targetBlock.classList.add('drag-over');
      }
    };

    block.ondragleave = () => {
      block.classList.remove('drag-over');
    };

    block.ondrop = e => {
      e.preventDefault();
      block.classList.remove('drag-over');
      const targetBlock = e.target.closest('.section-block');
      if (!targetBlock || !draggedSectionId) return;

      const targetId = targetBlock.dataset.sectionId;
      if (targetId === draggedSectionId) return;

      const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
      if (!p || !db.cmsPages?.[p.id]) return;
      const cms = db.cmsPages[p.id];
      if (!cms.sectionOrder) return;

      const oldIdx = cms.sectionOrder.indexOf(draggedSectionId);
      const newIdx = cms.sectionOrder.indexOf(targetId);
      if (oldIdx !== -1 && newIdx !== -1) {
        cms.sectionOrder.splice(oldIdx, 1);
        cms.sectionOrder.splice(newIdx, 0, draggedSectionId);
        persist();
        toast('Section reordered!');
        render();
        updateLivePreview();
      }
    };

    block.ondragend = () => {
      blocks.forEach(b => {
        b.classList.remove('dragging');
        b.classList.remove('drag-over');
      });
      draggedSectionId = null;
    };
  });
}

function setupDragAndDropCodFields() {
  const container = document.getElementById('cod-fields-container');
  if (!container) return;

  const items = container.querySelectorAll('.cod-field-item');
  items.forEach(item => {
    item.ondragstart = e => {
      draggedCodFieldId = item.dataset.fieldId;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedCodFieldId);
    };

    item.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetItem = e.target.closest('.cod-field-item');
      if (targetItem && targetItem !== item) {
        container.querySelectorAll('.cod-field-item').forEach(b => b.classList.remove('drag-over'));
        targetItem.classList.add('drag-over');
      }
    };

    item.ondragleave = () => {
      item.classList.remove('drag-over');
    };

    item.ondrop = e => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const targetItem = e.target.closest('.cod-field-item');
      if (!targetItem || !draggedCodFieldId) return;

      const targetId = targetItem.dataset.fieldId;
      if (targetId === draggedCodFieldId) return;

      const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
      if (!p || !db.cmsPages?.[p.id]) return;
      const cms = db.cmsPages[p.id];
      if (!cms.codFields || !Array.isArray(cms.codFields)) return;

      const oldIdx = cms.codFields.findIndex(f => f.id === draggedCodFieldId);
      const newIdx = cms.codFields.findIndex(f => f.id === targetId);
      if (oldIdx !== -1 && newIdx !== -1) {
        const moved = cms.codFields.splice(oldIdx, 1)[0];
        cms.codFields.splice(newIdx, 0, moved);
        persist();
        toast('Form field reordered!');
        render();
        updateLivePreview();
      }
    };

    item.ondragend = () => {
      items.forEach(b => {
        b.classList.remove('dragging');
        b.classList.remove('drag-over');
      });
      draggedCodFieldId = null;
    };
  });
}

function moveCodField(fieldId, delta) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  if (!cms.codFields) return;

  const idx = cms.codFields.findIndex(f => f.id === fieldId);
  if (idx === -1) return;
  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= cms.codFields.length) return;

  const item = cms.codFields.splice(idx, 1)[0];
  cms.codFields.splice(targetIdx, 0, item);
  persist();
  render();
  updateLivePreview();
  toast('Field reordered');
}

function toggleCodField(fieldId) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  if (!cms.codFields) return;

  const f = cms.codFields.find(x => x.id === fieldId);
  if (!f) return;
  f.enabled = f.enabled === false ? true : false;
  persist();
  render();
  updateLivePreview();
  toast(f.enabled ? `Field "${f.label || f.key}" enabled` : `Field "${f.label || f.key}" hidden`);
}

function toggleCodFieldExpand(fieldId) {
  if (expandedCodFields.has(fieldId)) {
    expandedCodFields.delete(fieldId);
  } else {
    expandedCodFields.add(fieldId);
  }
  render();
}

function deleteCodField(fieldId) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  if (!cms.codFields) return;

  const idx = cms.codFields.findIndex(f => f.id === fieldId);
  if (idx === -1) return;

  const removed = cms.codFields.splice(idx, 1)[0];
  persist();
  render();
  updateLivePreview();
  toast(`Field "${removed.label || removed.key}" removed`);
}

function addCodField() {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p) return;
  if (!db.cmsPages) db.cmsPages = {};
  if (!db.cmsPages[p.id]) db.cmsPages[p.id] = {};
  const cms = db.cmsPages[p.id];
  if (!cms.codFields) {
    const tpl = CMS_TEMPLATES[currentLang || 'fr'] || CMS_TEMPLATES.fr;
    cms.codFields = JSON.parse(JSON.stringify(tpl(p).codFields || DEFAULT_COD_FIELDS));
  }

  const newId = 'f_custom_' + Date.now().toString(36);
  const newField = {
    id: newId,
    key: 'custom_' + Math.floor(100 + Math.random() * 900),
    label: 'Custom Field',
    placeholder: 'Enter details...',
    type: 'text',
    required: false,
    enabled: true,
    help: ''
  };

  cms.codFields.push(newField);
  expandedCodFields.add(newId);
  expandedSections.add('cod_checkout');
  persist();
  render();
  updateLivePreview();
  toast('New custom field added to COD form!');
}

function resetCodFields() {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  const lang = cms.language || currentLang || 'fr';
  const tpl = CMS_TEMPLATES[lang] || CMS_TEMPLATES.fr;
  cms.codFields = JSON.parse(JSON.stringify(tpl(p).codFields || DEFAULT_COD_FIELDS));
  persist();
  render();
  updateLivePreview();
  toast('Reset COD form fields to Moroccan defaults');
}

function toggleVisualEditMode() {
  visualEditMode = !visualEditMode;
  render();
  updateLivePreview();
  toast(visualEditMode ? '✏️ Visual Edit Mode activated: click preview elements to edit' : 'Visual Edit Mode paused');
}

function addFeature() {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  if (!db.cmsPages[p.id].features) db.cmsPages[p.id].features = [];
  db.cmsPages[p.id].features.push({ title: 'New Product Advantage', desc: 'Describe the key customer benefit or guarantee here.' });
  persist();
  render();
  updateLivePreview();
  toast('New feature benefit added');
}

function deleteFeature(idx) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]?.features) return;
  db.cmsPages[p.id].features.splice(idx, 1);
  persist();
  render();
  updateLivePreview();
  toast('Feature removed');
}

function addReview() {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  if (!db.cmsPages[p.id].reviews) db.cmsPages[p.id].reviews = [];
  db.cmsPages[p.id].reviews.push({ name: 'Client Vérifié', city: 'Casablanca', comment: 'Excellente qualité, reçu très rapidement à domicile.' });
  persist();
  render();
  updateLivePreview();
  toast('New review testimonial added');
}

function deleteReview(idx) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]?.reviews) return;
  db.cmsPages[p.id].reviews.splice(idx, 1);
  persist();
  render();
  updateLivePreview();
  toast('Review testimonial removed');
}

function addFaq() {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  if (!db.cmsPages[p.id].faqs) db.cmsPages[p.id].faqs = [];
  db.cmsPages[p.id].faqs.push({ q: 'Question fréquente sur le produit ou la livraison ?', a: 'Réponse claire et rassurante pour faciliter la prise de commande.' });
  persist();
  render();
  updateLivePreview();
  toast('New FAQ question added');
}

function deleteFaq(idx) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]?.faqs) return;
  db.cmsPages[p.id].faqs.splice(idx, 1);
  persist();
  render();
  updateLivePreview();
  toast('FAQ question removed');
}

function handlePreviewElementClicked(data) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;

  const fieldName = data.fieldName || '';
  let secId = data.sectionId;

  if (!secId) {
    if (['announcement'].includes(fieldName)) secId = 'announcement';
    else if (['heroImage', 'secondaryImage', 'galleryImage3', 'badgeText'].includes(fieldName)) secId = 'hero_media';
    else if (['headline', 'subtitle', 'pageTitle'].includes(fieldName)) secId = 'hook_and_copy';
    else if (['pricing_bundles', 'tier1_price', 'tier2_price', 'tier3_price'].includes(fieldName)) secId = 'pricing_bundles';
    else if (['urgency_bar', 'countdownHours', 'stockLeft', 'rating', 'reviewCount'].includes(fieldName)) secId = 'urgency_bar';
    else if (fieldName.startsWith('feat_') || fieldName === 'features') secId = 'features';
    else if (fieldName.startsWith('rev_') || fieldName === 'reviews') secId = 'reviews';
    else if (fieldName.startsWith('faq_') || fieldName === 'faqs') secId = 'faqs';
    else secId = 'cod_checkout';
  }

  if (secId === 'cod_checkout') {
    expandedSections.add('cod_checkout');
    const cms = db.cmsPages[p.id];
    if (cms?.codFields) {
      const matchField = cms.codFields.find(f => f.key === fieldName || f.id === fieldName);
      if (matchField) {
        expandedCodFields.add(matchField.id);
      }
    }
  } else if (secId) {
    expandedSections.add(secId);
  }

  render();

  setTimeout(() => {
    let target = null;
    if (fieldName) {
      target = document.querySelector(`[name="${fieldName}"]`) ||
               document.querySelector(`[name="cod_${fieldName}_label"]`) ||
               document.querySelector(`[name="cod_${fieldName}_key"]`) ||
               document.querySelector(`[data-field-id="${fieldName}"]`);
    }
    if (!target && secId) {
      target = document.querySelector(`[data-section-id="${secId}"]`);
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof target.focus === 'function' && target.tagName !== 'DIV') {
        target.focus();
        if (typeof target.select === 'function') target.select();
      }
      target.classList.add('field-highlight-pulse');
      setTimeout(() => target.classList.remove('field-highlight-pulse'), 2000);
    }
  }, 100);

  toast(`✏️ Editing: ${fieldName ? fieldName.replace(/_/g, ' ') : secId}`);
}

function handlePreviewInlineEdit(data) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];

  const field = data.field;
  const val = data.value;

  if (field === 'headline') cms.headline = val;
  else if (field === 'subtitle') cms.subtitle = val;
  else if (field === 'announcement') cms.announcement = val;
  else if (field === 'badgeText') cms.badgeText = val;
  else if (field === 'checkoutHeadline') cms.checkoutHeadline = val;
  else if (field === 'checkoutSubtitle') cms.checkoutSubtitle = val;
  else if (field === 'submitButtonText') cms.submitButtonText = val;
  else if (field.startsWith('feat_')) {
    const parts = field.split('_');
    const idx = parseInt(parts[1], 10);
    const sub = parts[2];
    if (cms.features?.[idx]) cms.features[idx][sub] = val;
  } else if (field.startsWith('rev_')) {
    const parts = field.split('_');
    const idx = parseInt(parts[1], 10);
    const sub = parts[2];
    if (cms.reviews?.[idx]) cms.reviews[idx][sub] = val;
  } else if (field.startsWith('faq_')) {
    const parts = field.split('_');
    const idx = parseInt(parts[1], 10);
    const sub = parts[2];
    if (cms.faqs?.[idx]) cms.faqs[idx][sub] = val;
  }

  const inp = document.querySelector(`[name="${field}"]`);
  if (inp && inp !== document.activeElement) inp.value = val;

  persist();
  toast(`✓ Updated "${field}" directly from preview`);
}

function moveSection(secId, delta) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  if (!cms.sectionOrder) return;

  const idx = cms.sectionOrder.indexOf(secId);
  if (idx === -1) return;
  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= cms.sectionOrder.length) return;

  const item = cms.sectionOrder.splice(idx, 1)[0];
  cms.sectionOrder.splice(targetIdx, 0, item);
  persist();
  render();
  updateLivePreview();
  toast('Section reordered');
}

function toggleSection(secId) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p || !db.cmsPages?.[p.id]) return;
  const cms = db.cmsPages[p.id];
  if (!cms.sectionsEnabled) cms.sectionsEnabled = {};

  cms.sectionsEnabled[secId] = cms.sectionsEnabled[secId] === false ? true : false;
  persist();
  render();
  updateLivePreview();
  toast(cms.sectionsEnabled[secId] ? 'Section activated' : 'Section hidden');
}

function saveCmsEditor(f) {
  const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
  if (!p) return;
  if (!db.cmsPages) db.cmsPages = {};

  const existing = db.cmsPages[p.id] || {};

  // Extract updated COD form fields
  const baseFields = existing.codFields || JSON.parse(JSON.stringify(DEFAULT_COD_FIELDS));
  const updatedCodFields = baseFields.map(field => {
    const labelVal = f.get(`cod_${field.id}_label`);
    const keyVal = f.get(`cod_${field.id}_key`);
    const placeholderVal = f.get(`cod_${field.id}_placeholder`);
    const typeVal = f.get(`cod_${field.id}_type`);
    const helpVal = f.get(`cod_${field.id}_help`);
    const optionsVal = f.get(`cod_${field.id}_options`);
    const requiredVal = f.get(`cod_${field.id}_required`);

    return {
      ...field,
      label: labelVal !== null && labelVal !== undefined ? labelVal.trim() : field.label,
      key: keyVal ? keyVal.trim().replace(/[^a-zA-Z0-9_]/g, '_') : field.key,
      placeholder: placeholderVal !== null ? placeholderVal.trim() : field.placeholder,
      type: typeVal || field.type,
      help: helpVal !== null ? helpVal.trim() : (field.help || ''),
      options: optionsVal !== null ? optionsVal.trim() : (field.options || ''),
      required: requiredVal === 'on' || requiredVal === 'true',
      enabled: field.enabled !== false
    };
  });

  // Dynamically extract features
  const features = [];
  for (let i = 0; i < 30; i++) {
    const titleVal = f.get(`feat_${i}_title`);
    const descVal = f.get(`feat_${i}_desc`);
    if (titleVal !== null && descVal !== null) {
      features.push({ title: titleVal.trim(), desc: descVal.trim() });
    }
  }

  // Dynamically extract reviews
  const reviews = [];
  for (let i = 0; i < 30; i++) {
    const nameVal = f.get(`rev_${i}_name`);
    const cityVal = f.get(`rev_${i}_city`);
    const commVal = f.get(`rev_${i}_comment`);
    if (nameVal !== null && cityVal !== null && commVal !== null) {
      reviews.push({ name: nameVal.trim(), city: cityVal.trim(), comment: commVal.trim() });
    }
  }

  // Dynamically extract FAQs
  const faqs = [];
  for (let i = 0; i < 30; i++) {
    const qVal = f.get(`faq_${i}_q`);
    const aVal = f.get(`faq_${i}_a`);
    if (qVal !== null && aVal !== null) {
      faqs.push({ q: qVal.trim(), a: aVal.trim() });
    }
  }

  const updated = {
    ...existing,
    productId: p.id,
    language: existing.language || currentLang || 'fr',
    pageTitle: f.get('pageTitle')?.trim() || `${p.name} — Rosaino Store`,
    headline: f.get('headline')?.trim() || p.name,
    subtitle: f.get('subtitle')?.trim() || p.desc,
    announcement: f.get('announcement')?.trim() || '',
    announcementEnabled: f.get('announcementEnabled') === 'on',
    badgeText: f.get('badgeText')?.trim() || '',
    heroImage: f.get('heroImage')?.trim() || existing.heroImage || p.image || '/assets/collection.png',
    secondaryImage: f.get('secondaryImage')?.trim() || existing.secondaryImage || '/assets/pattern.png',
    galleryImage3: f.get('galleryImage3')?.trim() || existing.galleryImage3 || '/assets/ribbon.png',
    sectionOrder: existing.sectionOrder || ['announcement', 'hero_media', 'hook_and_copy', 'pricing_bundles', 'urgency_bar', 'cod_checkout', 'features', 'reviews', 'faqs'],
    sectionsEnabled: existing.sectionsEnabled || {
      announcement: true,
      hero_media: true,
      hook_and_copy: true,
      pricing_bundles: true,
      urgency_bar: true,
      cod_checkout: true,
      features: true,
      reviews: true,
      faqs: true
    },
    codFields: updatedCodFields,
    pricingTableEnabled: f.get('pricingTableEnabled') === 'on',
    urgencyEnabled: f.get('urgencyEnabled') === 'on',
    checkoutHeadline: f.get('checkoutHeadline')?.trim() || 'Complete Your Order Below',
    checkoutSubtitle: f.get('checkoutSubtitle')?.trim() || 'Pay with Cash to the courier at your doorstep upon arrival.',
    submitButtonText: f.get('submitButtonText')?.trim() || 'CONFIRM CASH ON DELIVERY ORDER ➔',
    supportPhone: f.get('supportPhone')?.trim() || '212600000000',
    tiers: [
      {
        qty: 1,
        title: f.get('tier1_badge') ? `1 Piece (${f.get('tier1_badge')})` : '1 Piece (Single Pack)',
        price: Number(f.get('tier1_price')) || p.price,
        originalPrice: Number(f.get('tier1_orig')) || Math.round(p.price * 1.35),
        badge: f.get('tier1_badge')?.trim() || 'Standard Offer',
        savings: `Save ${Math.max(0, (Number(f.get('tier1_orig')) || 0) - (Number(f.get('tier1_price')) || p.price))} MAD`
      },
      {
        qty: 2,
        title: '2 Pieces (Duo Pack)',
        price: Number(f.get('tier2_price')) || Math.round(p.price * 1.75),
        originalPrice: (Number(f.get('tier1_orig')) || Math.round(p.price * 1.35)) * 2,
        badge: f.get('tier2_badge')?.trim() || 'MOST POPULAR 🔥',
        savings: 'Save on Duo Pack'
      },
      {
        qty: 3,
        title: '3 Pieces (Family Pack + Gift)',
        price: Number(f.get('tier3_price')) || Math.round(p.price * 2.35),
        originalPrice: (Number(f.get('tier1_orig')) || Math.round(p.price * 1.35)) * 3,
        badge: f.get('tier3_badge')?.trim() || 'BEST VALUE 🏆 + Free Gift',
        savings: 'Save on Family Pack + Free Gift'
      }
    ],
    features: features.length ? features : existing.features || [
      { title: f.get('feat_0_title')?.trim() || 'Artisan Craftsmanship', desc: f.get('feat_0_desc')?.trim() || 'Constructed from carefully selected materials.' },
      { title: f.get('feat_1_title')?.trim() || 'Express Moroccan Delivery', desc: f.get('feat_1_desc')?.trim() || 'Doorstep dispatch in 24 to 48 hours to all Moroccan cities.' },
      { title: f.get('feat_2_title')?.trim() || 'Zero Risk · Pay Upon Arrival', desc: f.get('feat_2_desc')?.trim() || 'Inspect before paying the courier.' },
      { title: f.get('feat_3_title')?.trim() || '14-Day Hassle-Free Exchange', desc: f.get('feat_3_desc')?.trim() || 'Dedicated WhatsApp customer support team.' }
    ],
    countdownHours: Number(f.get('countdownHours')) || 5,
    stockLeft: Number(f.get('stockLeft')) || 7,
    rating: f.get('rating')?.trim() || '4.9',
    reviewCount: Number(f.get('reviewCount')) || 184,
    reviews: reviews.length ? reviews : existing.reviews || [
      { name: f.get('rev_0_name')?.trim() || 'Kenza Alaoui', city: f.get('rev_0_city')?.trim() || 'Casablanca', comment: f.get('rev_0_comment')?.trim() || 'Ordered yesterday and received it today in Maarif!' },
      { name: f.get('rev_1_name')?.trim() || 'Youssef El Amrani', city: f.get('rev_1_city')?.trim() || 'Rabat', comment: f.get('rev_1_comment')?.trim() || 'Very pleased with the quality.' }
    ],
    faqs: faqs.length ? faqs : existing.faqs || [
      { q: f.get('faq_0_q')?.trim() || 'How does Cash on Delivery (COD) work?', a: f.get('faq_0_a')?.trim() || 'Pay cash to the courier when they hand you the package.' },
      { q: f.get('faq_1_q')?.trim() || 'Can I open and check before paying?', a: f.get('faq_1_a')?.trim() || 'Yes, inspection before payment is guaranteed.' },
      { q: f.get('faq_2_q')?.trim() || 'How fast is delivery?', a: f.get('faq_2_a')?.trim() || '24–48 hours across major Moroccan cities.' }
    ]
  };

  db.cmsPages[p.id] = updated;
  persist();
  window.dispatchEvent(new Event('storage'));
  toast(t('save_success'));
  render();
  updateLivePreview();

  fetch(`/api/cms/${p.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
}

function render() {
  if (!checkAuth()) return;

  page = location.hash.slice(1) || 'overview';
  if (!views[page]) page = 'overview';

  const pageDef = pages.find(p => p[0] === page);
  const reqPerm = pageDef ? pageDef[3] : page;

  // Header and user profile updates
  $('#breadcrumb').textContent = t(page) || (pageDef ? pageDef[2] : 'Overview');
  const roleNameEl = $('#header-role-name');
  if (roleNameEl) roleNameEl.textContent = previewRole ? `${effectiveRole()} (preview)` : db.currentUser.role;

  // Render navigation with permission locks and translated labels
  // Only list the pages this role can open, so the menu stays short and clear.
  const groupStarts = {
    store: { fr: 'VENTES', en: 'SALES', ar: 'المبيعات' },
    shipping: { fr: 'LIVRAISON', en: 'DELIVERY', ar: 'التوصيل' },
    products: { fr: 'CATALOGUE', en: 'CATALOGUE', ar: 'المنتجات' },
    finance: { fr: 'FINANCE', en: 'FINANCE', ar: 'المالية' },
    stores: { fr: 'ESPACE', en: 'WORKSPACE', ar: 'المساحة' }
  };
  let pendingGroup = '';
  $('#nav').innerHTML = pages.map(([id, icon, name, perm]) => {
    if (groupStarts[id]) pendingGroup = groupStarts[id][currentLang] || groupStarts[id].en;
    if (perm && !hasPermission(perm)) return '';
    if (STOREFRONT_PAGES.includes(id) && !STOREFRONT_ENABLED) return '';
    const isAct = page === id;
    const group = pendingGroup ? `<div class="nav-group">${pendingGroup}</div>` : '';
    pendingGroup = '';
    return group + `
      <a href="#${id}" class="${isAct ? 'active' : ''}" ${isAct ? 'aria-current="page"' : ''}>
        <span class="nav-icon" aria-hidden="true">${getNavIcon(id)}</span>
        ${t(id) || name}
      </a>
    `;
  }).join('');

  // The built-in storefront is retired: its editors are not shown.
  if (STOREFRONT_PAGES.includes(page) && !STOREFRONT_ENABLED) {
    location.hash = 'store';
    return;
  }

  // Check RBAC permission for this view
  if (reqPerm && !hasPermission(reqPerm)) {
    $('#content').innerHTML = previewBanner() + accessDeniedView(pageDef ? pageDef[2] : page, reqPerm);
    return;
  }

  // Render authorized view
  $('#content').innerHTML = previewBanner() + views[page]();

  // Attach view-specific listeners
  if (page === 'orders') {
    $('#search').oninput = e => {
      search = e.target.value;
      $('#order-results').innerHTML = orderResults();
    };
    $('#filter').onchange = e => {
      filter = e.target.value;
      $('#order-results').innerHTML = orderResults();
    };
  }
  if (page === 'guide') {
    // Filter the guide's cards and sections as you type.
    $('#guide-search').oninput = e => {
      const q = e.target.value.trim().toLowerCase();
      let shown = 0;
      document.querySelectorAll('#content [data-guide-text]').forEach(el => {
        const hit = !q || el.dataset.guideText.includes(q);
        el.hidden = !hit;
        if (hit) shown++;
      });
      document.querySelectorAll('#content .guide-section').forEach(sec => {
        sec.hidden = !sec.querySelector('[data-guide-text]:not([hidden])');
      });
      $('#guide-empty').hidden = shown > 0;
    };
  }
  if (page === 'calls' && $('#agent-select')) {
    $('#agent-select').onchange = e => {
      selectedAgent = e.target.value;
      render();
    };
  }
  if (page === 'cms') {
    const prodSelect = $('#cms-product-select');
    if (prodSelect) {
      prodSelect.onchange = e => {
        activeCmsProductId = e.target.value;
        render();
      };
    }
    const platSelect = $('#boost-platform');
    if (platSelect) {
      platSelect.onchange = e => {
        utmPlatform = e.target.value;
        render();
      };
    }
    const campInput = $('#boost-campaign');
    if (campInput) {
      campInput.oninput = e => {
        utmCampaign = e.target.value;
      };
    }
    const contInput = $('#boost-content');
    if (contInput) {
      contInput.oninput = e => {
        utmContent = e.target.value;
      };
    }
    const cmsForm = $('#cms-editor-form');
    if (cmsForm) {
      cmsForm.onsubmit = e => {
        e.preventDefault();
        saveCmsEditor(new FormData(cmsForm));
      };
      // Real-time live preview update on input
      let liveTimer;
      cmsForm.oninput = () => {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(() => {
          const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
          if (!p || !db.cmsPages?.[p.id]) return;
          const formData = new FormData(cmsForm);
          db.cmsPages[p.id].headline = formData.get('headline') || db.cmsPages[p.id].headline;
          db.cmsPages[p.id].subtitle = formData.get('subtitle') || db.cmsPages[p.id].subtitle;
          db.cmsPages[p.id].announcement = formData.get('announcement') || db.cmsPages[p.id].announcement;
          db.cmsPages[p.id].badgeText = formData.get('badgeText') || db.cmsPages[p.id].badgeText;
          db.cmsPages[p.id].checkoutHeadline = formData.get('checkoutHeadline') || db.cmsPages[p.id].checkoutHeadline;
          db.cmsPages[p.id].checkoutSubtitle = formData.get('checkoutSubtitle') || db.cmsPages[p.id].checkoutSubtitle;
          db.cmsPages[p.id].submitButtonText = formData.get('submitButtonText') || db.cmsPages[p.id].submitButtonText;

          // Also live update COD field labels
          if (db.cmsPages[p.id].codFields) {
            db.cmsPages[p.id].codFields.forEach(fld => {
              const l = formData.get(`cod_${fld.id}_label`);
              if (l !== null && l !== undefined) fld.label = l.trim();
              const p = formData.get(`cod_${fld.id}_placeholder`);
              if (p !== null && p !== undefined) fld.placeholder = p.trim();
            });
          }

          updateLivePreview();
        }, 250);
      };
    }

    // Initialize drag-and-drop sections, COD form fields, and image upload dropzones
    setupDragAndDropSections();
    setupDragAndDropCodFields();
    setupImageDropzones();

    const previewIframe = $('#cms-preview-iframe');
    if (previewIframe) {
      previewIframe.onload = () => {
        updateLivePreview();
      };
    }
  }
  if (page === 'settings') {
    $('#settings-form').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      db.settings.company = f.get('company').trim();
      db.settings.region = f.get('region').trim();
      persist();
      toast('Preferences saved');
    };
  }
}

function modal(name, body, submit, callback) {
  $('#modal-content').innerHTML = `
    <div class="modal-heading">
      <h2>${name}</h2>
      <button type="button" data-action="close" aria-label="Close dialog">×</button>
    </div>
    <form id="dialog-form">
      ${body}
      <div class="modal-actions">
        <button type="button" data-action="close">Close</button>
        ${submit ? `<button class="primary">${submit}</button>` : ''}
      </div>
    </form>
  `;
  if (!$('#modal').open) $('#modal').showModal();
  $('#dialog-form').onsubmit = e => {
    e.preventDefault();
    try {
      if (callback(new FormData(e.target)) !== false) {
        $('#modal').close();
        persist();
        render();
      }
    } catch (err) {
      toast(err.message);
    }
  };
}

function input(name, label, value = '', type = 'text', extra = '') {
  return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra} required></label>`;
}

function select(name, label, options, value) {
  return `
    <label>${label}
      <select name="${name}">
        ${options.map(o => {
          const [v, t] = Array.isArray(o) ? o : [o, o];
          return `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(t)}</option>`;
        }).join('')}
      </select>
    </label>
  `;
}

function changeStatus(o, next) {
  if (o.status === next) return;
  const allowed = {
    New: ['Confirmed', 'Callback', 'Cancelled', 'Spam'],
    Callback: ['Confirmed', 'Callback', 'Cancelled', 'Spam'],
    Confirmed: ['In transit', 'Cancelled'],
    'In transit': ['Delivered', 'Returned'],
    Delivered: [],
    Returned: [],
    Cancelled: [],
    Spam: []
  };

  if (!allowed[o.status].includes(next)) throw Error('That status transition is unavailable.');
  const lines = orderLines(o).map(l => ({ ...l, p: product(l.product) })).filter(l => l.p);
  if (lines.length) {
    if (next === 'Confirmed' && lines.some(l => l.p.stock - reserved(l.p.id) < l.quantity)) {
      throw Error('Not enough available stock to confirm this order.');
    }
    if (next === 'In transit') {
      if (lines.some(l => l.p.stock < l.quantity)) throw Error('Not enough stock to dispatch.');
      lines.forEach(l => { l.p.stock -= l.quantity; });
      o.stockDeducted = true;
    }
    if (next === 'Returned' && o.stockDeducted) {
      lines.forEach(l => { l.p.stock += l.quantity; });
      o.stockDeducted = false;
    }
  }
  o.status = next;
  log(`${o.id} moved to ${next}`); // log() saves; the server sync sends the change
}

// Upgraded Order Dialog with Customer Trust, Duplicate Merge, WhatsApp, and Waybill
function orderDialog(id) {
  const o = db.orders.find(o => o.id === id);
  if (!o) return;
  const trust = getTrustInfo(o.phone, o.id);
  const isDup = checkDuplicateOrder(o);
  const p = product(o.product);
  const waMsg = encodeURIComponent(`Hello ${o.customer}, this is Rosaino Confirmation regarding your order ${o.id} for ${p?.name || 'your items'} (${money(o.amount)} COD). Please reply YES to confirm your delivery address in ${o.city}.`);

  const choices = {
    New: ['New', 'Confirmed', 'Callback', 'Cancelled', 'Spam'],
    Callback: ['Callback', 'Confirmed', 'Cancelled', 'Spam'],
    Confirmed: ['Confirmed', 'In transit', 'Cancelled'],
    'In transit': ['In transit', 'Delivered', 'Returned']
  }[o.status] || [o.status];

  modal(
    `Order ${esc(o.id)} Details`,
    `
      <!-- Customer Trust & Risk Card -->
      <div style="background:#f8fafb;border:1px solid #e2e8ea;border-radius:10px;padding:16px;margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span class="eyebrow" style="margin-bottom:4px;">CUSTOMER RISK EVALUATION</span>
            <div style="font-size:16px;font-weight:700;">${esc(o.customer)} · ${esc(o.phone)}</div>
          </div>
          <div>${trust.badge}</div>
        </div>
        <p style="margin:6px 0 0;font-size:12px;color:#556b71;">
          <strong>Trust Rating:</strong> ${esc(trust.label)} · Delivery Trust Score: <strong>${trust.score}/100</strong>
        </p>
        ${isDup ? `
          <div style="margin-top:10px;padding:8px 12px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e;display:flex;justify-content:space-between;align-items:center;">
            <span>Duplicate Order: Same customer has another active order for this item.</span>
            <button type="button" data-action="cancel-duplicate" data-id="${o.id}" style="font-size:11px;background:#fff;border:1px solid #d97706;color:#b45309;padding:4px 8px;">Cancel Duplicate</button>
          </div>
        ` : ''}
      </div>

      <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
        ${callButtons(o)}
        <a href="https://wa.me/${intlPhone(o.phone)}?text=${waMsg}" target="_blank" rel="noopener" class="btn-link">WhatsApp message</a>
        <button type="button" data-action="awb" data-id="${o.id}">
          Thermal 4x6 Label
        </button>
        <a href="/track?id=${encodeURIComponent(o.id)}" target="_blank" style="padding:7px 12px;border:1px solid #dce4e6;border-radius:6px;font-size:12px;display:inline-flex;align-items:center;font-weight:600;">
          Public Tracking Portal ↗
        </a>
        <button type="button" data-action="toggle-blacklist" data-phone="${esc(o.phone)}" style="font-size:12px;color:#ac3838;margin-left:auto;">
          ${trust.type === 'risk' ? 'Unblacklist Phone' : 'Blacklist Customer'}
        </button>
      </div>

      <div class="form-grid">
        ${select('status', 'Status', choices, o.status)}
        ${select('agent', 'Assigned agent', [['', 'Unassigned'], ...db.agents.map(a => [a.id, a.name])], o.agent)}
        <label class="full">Callback time<input name="callback" type="datetime-local" value="${esc(o.callback)}"></label>
        <label class="full">Add note<textarea name="note" maxlength="1000"></textarea></label>
      </div>
      <div class="history">${o.notes.map(n => esc(n)).join('<br>') || 'No notes recorded.'}</div>
      <h3 class="sub">Calls</h3>
      <div id="order-calls" class="info">Loading calls…</div>
    `,
    'Save changes',
    f => {
      if (f.get('status') === 'Callback' && !f.get('callback')) throw Error('Choose a callback time.');
      changeStatus(o, f.get('status'));
      o.agent = f.get('agent');
      o.callback = f.get('callback');
      if (f.get('note').trim()) o.notes.push(f.get('note').trim());
      log(`${o.id} details updated`);
      toast('Order updated');

      // Sync with backend API
      fetch(`/api/orders/${o.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: o.agent, callback: o.callback, notes: o.notes })
      }).catch(() => {});
    }
  );

  // Calls for this order, from the server
  api(`/api/calls?orderId=${encodeURIComponent(o.id)}`).then(list => {
    const box = $('#order-calls');
    if (!box) return;
    callLogs = [...list, ...(callLogs || []).filter(c => c.orderId !== o.id)];
    box.innerHTML = list.length ? list.map(c => `
      <div class="stat-line">
        <span>${esc(new Date(c.startedAt).toLocaleString())} · ${c.channel === 'whatsapp' ? 'WhatsApp' : 'Phone'} · ${esc(c.agentName || '')}</span>
        <span>${fmtDuration(c.durationSec)} · ${badge(c.outcome)} ${c.transcript || c.notes ? `<button type="button" data-action="view-call" data-id="${esc(c.id)}">View</button>` : ''}</span>
      </div>`).join('') : 'No calls yet.';
  }).catch(() => { const box = $('#order-calls'); if (box) box.textContent = 'Calls could not be loaded.'; });
}

// Thermal Airway Bill (AWB) Label Modal
function showThermalLabel(id) {
  const o = db.orders.find(o => o.id === id);
  if (!o) return;
  const p = product(o.product);

  modal(
    'Printable 4x6 Thermal Airway Bill (AWB)',
    `
      <div class="thermal-label" id="printable-awb">
        <div class="thermal-header">
          <div>
            <strong style="font-size:16px;">ROSAINO LOGISTICS</strong><br>
            <small>Express Cash on Delivery</small>
          </div>
          <div style="text-align:right;">
            <strong style="font-size:16px;">${esc(o.carrier || 'DIGYLOG')}</strong><br>
            <small>STANDARD COD</small>
          </div>
        </div>

        <div style="margin:10px 0;font-size:13px;border-bottom:1px dashed #000;padding-bottom:10px;">
          <div><strong>DESTINATION:</strong> ${esc(o.city).toUpperCase()}</div>
          <div><strong>CUSTOMER:</strong> ${esc(o.customer)}</div>
          <div><strong>ADDRESS:</strong> ${esc(o.address || 'Standard Doorstep Delivery')}</div>
          <div><strong>PHONE:</strong> ${esc(o.phone)}</div>
        </div>

        <div style="font-size:12px;margin:8px 0;">
          <strong>ITEMS:</strong> ${orderLines(o).map(l => { const lp = product(l.product); return `${esc(lp?.name || l.product)} × ${l.quantity} (${esc(lp?.sku || 'SKU-01')})`; }).join(', ')}
        </div>

        <div class="thermal-barcode"></div>
        <div style="text-align:center;font-size:12px;letter-spacing:2px;font-weight:700;">*${esc(o.id)}*</div>

        <div class="thermal-cod">
          COD TO COLLECT: ${money(o.amount)}
        </div>
      </div>
      <p style="text-align:center;"><button type="button" class="primary" onclick="window.print()">Print Label on Thermal Printer</button></p>
    `,
    null
  );
}

function newOrder() {
  if (!checkAction('orders', 'Create order')) return;
  modal(
    'Create a demo order',
    `
      <div class="form-grid">
        ${input('customer', 'Customer name')}
        ${input('phone', 'Phone or contact')}
        ${input('city', 'City')}
        ${select('product', 'Product', db.products.map(p => [p.id, p.name]))}
        ${input('quantity', 'Quantity', 1, 'number', 'min="1" max="100" step="1"')}
        ${select('source', 'Acquisition source', ['Storefront', 'Meta Ads', 'TikTok Ads', 'WooCommerce'])}
        ${select('agent', 'Assigned agent', [['', 'Unassigned'], ...db.agents.map(a => [a.id, a.name])])}
        ${input('address', 'Address')}
      </div>
    `,
    'Create order',
    f => {
      const p = product(f.get('product'));
      const q = Number(f.get('quantity'));
      const newO = {
        id: 'RS-' + uid().toUpperCase(),
        customer: f.get('customer').trim(),
        phone: f.get('phone').trim(),
        city: f.get('city').trim(),
        address: f.get('address').trim(),
        product: p.id,
        quantity: q,
        amount: p.price * q,
        cost: p.cost * q,
        status: 'New',
        agent: f.get('agent'),
        source: f.get('source'),
        campaign: 'Manual_Admin_Entry',
        creative: 'admin_console',
        carrier: 'Digylog',
        date: new Date().toISOString().slice(0, 10),
        notes: [],
        callback: '',
        shipping: 35,
        stockDeducted: false
      };
      db.orders.unshift(newO);
      log('New order created');
      toast('Order created and sent to Supabase');

      // Sync with backend API (Supabase)
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newO)
      }).catch(() => {});
    }
  );
}

// Create Purchase Order (PO) Modal with True Landed Cost Calculation
function createPurchaseOrderModal() {
  modal(
    'Create Supplier Purchase Order (PO) & Calculate Landed Cost',
    `
      <div class="form-grid">
        ${select('supplierId', 'Supplier', db.suppliers.map(s => [s.id, s.name]))}
        ${select('productId', 'Product to Procure', db.products.map(p => [p.id, p.name]))}
        ${input('quantity', 'Order Quantity (Units)', 100, 'number', 'min="1" step="1"')}
        ${input('factoryPrice', 'Factory Unit Price (MAD)', 100, 'number', 'min="1" step="1"')}
        ${input('freight', 'International Freight (MAD)', 2000, 'number', 'min="0" step="10"')}
        ${input('customs', 'Customs Clearance & Duties (MAD)', 1500, 'number', 'min="0" step="10"')}
        ${input('handling', 'Port & Local Warehouse Handling (MAD)', 500, 'number', 'min="0" step="10"')}
        ${input('sellingPrice', 'Target Selling Price MSRP (MAD)', 390, 'number', 'min="1" step="1"')}
        <label class="full">Procurement Notes<input name="notes" placeholder="e.g. Sea freight shipment from Ningbo to Casablanca port"></label>
      </div>
      <div style="background:#f0f8f7;padding:12px 16px;border-radius:8px;margin-top:14px;font-size:12px;line-height:1.6;">
        <strong>Automatic Landed Cost Formula:</strong><br>
        <code>Landed Unit Cost = (Units × Factory Price + Freight + Customs + Handling) ÷ Units</code><br>
        This gives you the exact true cost per unit before calculating gross profit.
      </div>
    `,
    'Submit Purchase Order',
    f => {
      const p = product(f.get('productId'));
      const s = db.suppliers.find(x => x.id === f.get('supplierId'));
      const qty = +f.get('quantity');
      const factoryPrice = +f.get('factoryPrice');
      const freight = +f.get('freight');
      const customs = +f.get('customs');
      const handling = +f.get('handling');
      const sellingPrice = +f.get('sellingPrice');

      const totalLanded = (qty * factoryPrice) + freight + customs + handling;
      const landedCostPerUnit = Math.round((totalLanded / qty) * 100) / 100;
      const margin = Math.round(((sellingPrice - landedCostPerUnit) / sellingPrice) * 1000) / 10;

      const newPO = {
        id: 'PO-2026-' + String((db.purchaseOrders || []).length + 1).padStart(2, '0'),
        poNumber: 'PO-2026-' + String((db.purchaseOrders || []).length + 1).padStart(2, '0'),
        supplierId: s.id,
        supplierName: s.name,
        productId: p.id,
        productName: p.name,
        quantity: qty,
        factoryPricePerUnit: factoryPrice,
        freightShipping: freight,
        customsDuty: customs,
        localHandling: handling,
        landedCostPerUnit,
        sellingPrice,
        expectedMarginPercent: margin,
        status: 'Ordered',
        orderDate: new Date().toISOString().slice(0, 10),
        receivedDate: null,
        notes: f.get('notes').trim()
      };

      if (!db.purchaseOrders) db.purchaseOrders = [];
      db.purchaseOrders.unshift(newPO);
      log(`Purchase Order ${newPO.poNumber} created for ${p.name}`);
      toast(`PO created. True Landed Cost: ${money(landedCostPerUnit)}/unit.`);

      fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO)
      }).catch(() => {});
    }
  );
}

// Receive PO into stock
function receivePO(id) {
  const po = (db.purchaseOrders || []).find(p => p.id === id);
  if (!po) return;

  po.status = 'Received';
  po.receivedDate = new Date().toISOString().slice(0, 10);

  const prod = product(po.productId);
  if (prod) {
    prod.stock += po.quantity;
    prod.cost = po.landedCostPerUnit; // update true landed cost!
  }

  log(`PO ${po.poNumber} received: +${po.quantity} units added to ${prod?.name}. Cost set to ${money(po.landedCostPerUnit)}.`);
  persist();
  toast(`PO ${po.poNumber} received! Inventory updated in Storefront.`);

  fetch(`/api/purchase-orders/${po.id}/receive`, { method: 'POST' }).catch(() => {});
}

// Add/Edit Product with live Storefront & Supabase synchronization
function editProduct(id) {
  if (!checkAction('products', 'Add/Edit product')) return;
  const p = product(id) || {
    name: '',
    sku: '',
    category: 'Electronics',
    price: 390,
    cost: 150,
    stock: 25,
    supplier: db.suppliers[0]?.name || '',
    desc: ''
  };

  modal(
    id ? 'Edit product' : 'Add new product',
    `
      <div class="form-grid">
        ${input('name', 'Product name', p.name)}
        ${input('sku', 'SKU', p.sku || 'ROS-' + uid().toUpperCase())}
        ${select('category', 'Category', ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Care', 'Sports & Outdoors', 'Kids & Toys'], p.category)}
        ${select('supplier', 'Supplier', db.suppliers.map(s => s.name), p.supplier)}
        ${input('price', 'Selling Price (MAD)', p.price, 'number', 'min="1" step="1"')}
        ${input('cost', 'Unit Landed Cost (MAD)', p.cost, 'number', 'min="1" step="1"')}
        ${!id ? input('stock', 'Opening stock', p.stock, 'number', 'min="0" step="1"') : ''}
        <label class="full">Description<textarea name="desc">${esc(p.desc || '')}</textarea></label>
      </div>
    `,
    'Save product',
    f => {
      const name = f.get('name').trim();
      const sku = f.get('sku').trim();
      if (!name || !sku) throw Error('Product name and SKU are required.');
      if (db.products.some(x => x.id !== id && x.sku.toLowerCase() === sku.toLowerCase())) {
        throw Error('A product with this SKU already exists.');
      }

      const values = {
        name,
        sku,
        category: f.get('category'),
        supplier: f.get('supplier'),
        price: +f.get('price'),
        cost: +f.get('cost'),
        desc: f.get('desc').trim()
      };

      let targetProduct;
      if (id) {
        Object.assign(p, values);
        targetProduct = p;
        log(`Product ${values.name} updated`);
        toast(`Product ${values.name} updated in Storefront and Supabase`);
      } else {
        const newId = 'p' + Math.floor(1000 + Math.random() * 9000);
        targetProduct = {
          id: newId,
          ...values,
          stock: +f.get('stock')
        };
        db.products.push(targetProduct);

        if (!db.cmsPages) db.cmsPages = {};
        db.cmsPages[newId] = {
          productId: newId,
          pageTitle: `${values.name} — Rosaino Official Store`,
          headline: `Experience the craft of ${values.name}`,
          subtitle: values.desc || 'Premium materials, quiet silhouettes, and tactile comfort delivered directly to your doorstep in Morocco.',
          announcement: '⚡ Special Ramadan & Eid Offer · Free Shipping Across Morocco · 100% Cash on Delivery',
          badgeText: `🔥 LIMITED OFFER - SAVE ${Math.round(values.price * 0.35)} MAD`,
          heroImage: '/assets/collection.png',
          secondaryImage: '/assets/pattern.png',
          regularPrice: Math.round((values.price * 1.35) / 10) * 10,
          salePrice: values.price,
          pricingTableEnabled: true,
          tiers: [
            { qty: 1, title: '1 Piece (Single Pack)', price: values.price, originalPrice: Math.round((values.price * 1.35) / 10) * 10, badge: 'Standard Offer', savings: `Save ${Math.round(values.price * 0.35)} MAD` },
            { qty: 2, title: '2 Pieces (Duo Pack)', price: Math.round((values.price * 1.75) / 10) * 10, originalPrice: Math.round((values.price * 1.35 * 2) / 10) * 10, badge: 'MOST POPULAR 🔥', savings: 'Save on Duo Pack' },
            { qty: 3, title: '3 Pieces (Family Pack + Gift)', price: Math.round((values.price * 2.35) / 10) * 10, originalPrice: Math.round((values.price * 1.35 * 3) / 10) * 10, badge: 'BEST VALUE 🏆 + Free Gift', savings: 'Save on Family Pack + Free Gift' }
          ],
          features: [
            { title: 'Artisan Craftsmanship', desc: 'Constructed from carefully selected, honest materials built to last.' },
            { title: 'Express Moroccan Delivery', desc: 'Doorstep dispatch in 24 to 48 hours to all Moroccan cities via trusted couriers.' },
            { title: 'Zero Risk · Pay Upon Arrival', desc: 'No online cards required. Inspect your parcel before handing cash to the driver.' },
            { title: '14-Day Hassle-Free Exchange', desc: 'Dedicated WhatsApp customer support team standing by for any sizing or swap needs.' }
          ],
          urgencyEnabled: true,
          countdownHours: 5,
          stockLeft: Math.min(12, Math.max(3, values.stock || 8)),
          rating: '4.9',
          reviewCount: 184,
          reviews: [
            { name: 'Kenza Alaoui', city: 'Casablanca', rating: 5, comment: `Ordered yesterday morning and received it today in Maarif! Exactly as described, high quality finish and driver called before arrival.` },
            { name: 'Youssef El Amrani', city: 'Rabat', rating: 5, comment: `Very pleased with the ${values.name}. Packaging was neat, and paying cash on delivery gave total peace of mind.` }
          ],
          faqs: [
            { q: 'How does Cash on Delivery (COD) work?', a: 'You simply place your order by filling your name, phone, and city above. Our confirmation agent calls to confirm, and you pay cash to the courier when they hand you the package.' },
            { q: 'Can I open and check the box before paying?', a: 'Yes! We encourage all customers to inspect the contents and verify the condition before paying the courier.' },
            { q: 'How fast is delivery to my city?', a: 'Deliveries to Casablanca, Rabat, Marrakech, Tangier, and Fès take 24–48 hours. Other cities take 48–72 hours.' }
          ]
        };
        activeCmsProductId = newId;
        location.hash = 'cms';
        render();

        log(`Product ${values.name} created with dedicated landing page`);
        toast(`Product "${values.name}" created! Configure its dedicated landing page elements below.`);
      }

      // Sync with backend API (Supabase)
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetProduct)
      }).catch(() => {});
    }
  );
}

// Live call panel: timer, optional transcription, outcome. Saved to the server.
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
let transcribing = false;

function stopTranscription() {
  transcribing = false;
  try { recognizer?.stop(); } catch {}
  recognizer = null;
  const btn = $('#transcribe-btn');
  if (btn) { btn.textContent = 'Start transcription'; btn.classList.remove('recording'); }
  const st = $('#transcribe-state');
  if (st) st.textContent = '';
}

function startTranscription() {
  const consent = $('#transcribe-consent');
  const box = $('#call-transcript');
  const st = $('#transcribe-state');
  if (!consent?.checked) { st.textContent = 'Tick the box once the customer has been told.'; return; }
  recognizer = new SpeechRec();
  recognizer.lang = $('#transcribe-lang').value;
  recognizer.continuous = true;
  recognizer.interimResults = true;
  let finalText = box.value.trim();
  box.oninput = () => { finalText = box.value.trim(); };
  recognizer.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += (finalText ? ' ' : '') + r[0].transcript.trim();
      else interim += r[0].transcript;
    }
    box.value = finalText + (interim ? ' ' + interim : '');
    box.scrollTop = box.scrollHeight;
  };
  recognizer.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      stopTranscription();
      $('#transcribe-state').textContent = 'Microphone access was blocked. Allow it in the browser address bar, or type notes instead.';
    }
  };
  // Browsers stop listening after a pause; keep going until the agent stops it.
  recognizer.onend = () => { if (transcribing) { try { recognizer.start(); } catch {} } };
  transcribing = true;
  recognizer.start();
  const btn = $('#transcribe-btn');
  btn.textContent = 'Stop transcription';
  btn.classList.add('recording');
  st.textContent = 'Listening through your microphone…';
}

function startCall(value) {
  const [id, channel] = String(value).split(':');
  if (!checkAction('calls', 'Call lead')) return;
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  stopTranscription();
  clearInterval(timer);
  activeCall = { id, channel, start: Date.now() };
  const p = product(o.product);
  const n = intlPhone(o.phone);
  const reopen = channel === 'whatsapp'
    ? `<a href="https://wa.me/${n}" target="_blank" rel="noopener">Open WhatsApp again</a> and tap the call icon.`
    : `<a href="tel:+${n}">Dial again</a> if your phone did not open.`;

  modal(
    `${channel === 'whatsapp' ? 'WhatsApp call' : 'Phone call'} · ${esc(o.customer)}`,
    `
      <div class="call-live">
        <div>
          <span class="live-dot" aria-hidden="true"></span>
          <b id="call-time" class="call-timer">00:00</b>
          <small>Started ${new Date(activeCall.start).toLocaleTimeString()}</small>
        </div>
        <div class="call-who">
          <b>${esc(o.phone)}</b>
          <small>${esc(o.id)} · ${esc(parcelText(o))} · ${money(o.amount)} · ${esc(o.city)}</small>
        </div>
      </div>
      <p class="info">${reopen}</p>

      <div class="transcribe-box">
        <div class="panel-head" style="margin-bottom:10px;">
          <div><b>Transcript</b><p>${SpeechRec ? 'Optional. Uses your microphone, so put the call on speaker for both voices.' : 'Live transcription works in Chrome or Edge. You can type a summary here instead.'}</p></div>
          ${SpeechRec ? `<div class="actions">
            <select id="transcribe-lang" aria-label="Transcription language">
              <option value="fr-FR">Français</option>
              <option value="ar-MA">العربية (المغرب)</option>
              <option value="en-US">English</option>
            </select>
            <button type="button" id="transcribe-btn" data-action="toggle-transcription">Start transcription</button>
          </div>` : ''}
        </div>
        ${SpeechRec ? `<label class="checkline"><input type="checkbox" id="transcribe-consent"> The customer has been told this call is transcribed</label>` : ''}
        <small id="transcribe-state" class="transcribe-state"></small>
        <textarea id="call-transcript" name="transcript" rows="5" maxlength="20000" placeholder="${SpeechRec ? 'The transcript appears here. You can correct it before saving.' : 'Summary of the conversation'}"></textarea>
      </div>

      <fieldset class="outcomes">
        <legend>Outcome</legend>
        ${['Confirmed', 'Callback', 'No answer', 'Cancelled', 'Spam'].map((x, i) => `
          <label class="outcome"><input type="radio" name="outcome" value="${x}" ${i === 0 ? 'checked' : ''}><span>${x}</span></label>`).join('')}
      </fieldset>
      <div class="form-grid">
        <label>Callback time<input type="datetime-local" name="callback"></label>
        <label>Notes<input name="note" maxlength="1000" placeholder="e.g. Deliver after 6pm"></label>
      </div>
      <div id="call-error" role="alert" class="form-error"></div>
    `,
    'End call & save',
    f => {
      const outcome = f.get('outcome');
      const err = $('#call-error');
      if (outcome === 'Callback' && !f.get('callback')) { err.textContent = 'Choose when to call back.'; return false; }
      stopTranscription();
      const endedAt = new Date();
      const btn = $('#dialog-form button.primary');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      const transcript = ($('#call-transcript')?.value || '').trim();
      api('/api/calls', 'POST', {
        orderId: o.id,
        channel,
        phone: o.phone,
        startedAt: new Date(activeCall.start).toISOString(),
        endedAt: endedAt.toISOString(),
        outcome,
        notes: f.get('note').trim(),
        transcript,
        transcriptLang: $('#transcribe-lang')?.value || ''
      }).then(({ call: saved }) => {
        clearInterval(timer);
        activeCall = null;
        $('#modal').close();
        callLogs = [saved, ...(callLogs || [])];
        db.calls.unshift({ order: o.id, agent: o.agent, outcome, seconds: saved.durationSec, date: saved.startedAt });
        if (f.get('note').trim()) o.notes.push(f.get('note').trim());
        if (outcome === 'No answer') {
          o.notes.push(`No answer (${channel === 'whatsapp' ? 'WhatsApp' : 'phone'}, ${new Date().toLocaleString()})`);
        } else {
          try {
            changeStatus(o, outcome);
            if (outcome === 'Callback') o.callback = f.get('callback');
          } catch (e) {
            toast(`Call saved, but the order could not be updated: ${e.message}`);
          }
        }
        persist();
        render();
        toast(`Call saved · ${fmtDuration(saved.durationSec)} · ${outcome}`);
      }).catch(e => {
        err.textContent = e.message;
        btn.disabled = false;
        btn.textContent = 'End call & save';
      });
      return false;
    }
  );

  timer = setInterval(() => {
    const el = $('#call-time');
    if (el && activeCall) {
      const sec = Math.floor((Date.now() - activeCall.start) / 1000);
      el.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
    }
  }, 1000);
}

function viewCall(id) {
  const c = (callLogs || []).find(x => x.id === id);
  if (!c) return;
  const o = db.orders.find(x => x.id === c.orderId);
  modal(`Call with ${esc(o?.customer || c.orderId)}`, `
    <div class="stat-line"><span>When</span><b>${esc(new Date(c.startedAt).toLocaleString())}</b></div>
    <div class="stat-line"><span>Channel</span><b>${c.channel === 'whatsapp' ? 'WhatsApp' : 'Phone'} · ${esc(c.phone || '')}</b></div>
    <div class="stat-line"><span>Duration</span><b>${fmtDuration(c.durationSec)}</b></div>
    <div class="stat-line"><span>Outcome</span><b>${esc(c.outcome)}</b></div>
    <div class="stat-line"><span>Agent</span><b>${esc(c.agentName || '')}</b></div>
    ${c.notes ? `<h3 class="sub">Notes</h3><p>${esc(c.notes)}</p>` : ''}
    ${c.transcript ? `<h3 class="sub">Transcript</h3><div class="transcript">${esc(c.transcript)}</div>` : ''}
  `, '', () => {});
}

function csvRows(text) {
  const rows = [];
  let row = [], field = '', quote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quote && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quote = !quote;
    } else if (c === ',' && !quote) {
      row.push(field);
      field = '';
    } else if (c === '\n' && !quote) {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (quote) throw Error('Unclosed CSV quote.');
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter(r => r.some(x => x.trim()));
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function exportOrders() {
  if (!checkAction('orders', 'Export CSV')) return;
  const cols = ['id', 'customer', 'phone', 'city', 'product', 'quantity', 'amount', 'status', 'agent', 'source', 'carrier', 'date'];
  const cell = v => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
  download('rosaino-demo-orders.csv', [cols, ...db.orders.map(o => cols.map(k => o[k]))].map(r => r.map(cell).join(',')).join('\r\n'), 'text/csv');
  toast('CSV exported');
}

function importOrders() {
  if (!checkAction('orders', 'Import CSV')) return;
  modal(
    'Import leads from CSV',
    `
      <p class="info">Required headers: customer, phone, city, sku, quantity. Up to 500 rows.</p>
      <button type="button" data-action="template">Download CSV template</button>
      <p><label>CSV file<input name="csv" type="file" accept=".csv,text/csv" required></label></p>
      <div id="import-error" role="alert" style="color:#ac3838;margin-top:8px;"></div>
    `,
    'Import leads',
    f => {
      const file = f.get('csv');
      if (file.size > 1000000) throw Error('Maximum CSV size is 1 MB.');
      file.text().then(text => {
        try {
          const rows = csvRows(text);
          const headers = rows.shift()?.map(s => s.trim().replace(/^\uFEFF/, '')) || [];
          const cols = ['customer', 'phone', 'city', 'sku', 'quantity'];
          if (cols.some(c => !headers.includes(c))) throw Error('Required headers: ' + cols.join(', '));
          if (!rows.length || rows.length > 500) throw Error('Import between 1 and 500 rows.');

          const incoming = rows.map((r, i) => {
            const v = Object.fromEntries(headers.map((h, j) => [h, r[j]?.trim() || '']));
            const p = db.products.find(p => p.sku === v.sku);
            const q = Number(v.quantity);
            if (!p || !v.customer || !v.phone || !v.city || !Number.isInteger(q) || q < 1 || q > 100) {
              throw Error(`Row ${i + 2}: check product SKU, contact fields and quantity.`);
            }
            return {
              id: 'RS-' + uid().toUpperCase(),
              customer: v.customer,
              phone: v.phone,
              city: v.city,
              product: p.id,
              quantity: q,
              amount: p.price * q,
              cost: p.cost * q,
              status: 'New',
              agent: '',
              source: 'CSV import',
              carrier: 'Digylog',
              date: new Date().toISOString().slice(0, 10),
              notes: [],
              callback: '',
              address: '',
              shipping: 35,
              stockDeducted: false
            };
          });

          db.orders.unshift(...incoming);
          log(`${incoming.length} CSV leads imported`);
          $('#modal').close();
          persist();
          render();
          toast(`${incoming.length} leads imported`);
        } catch (e) {
          $('#import-error').textContent = e.message;
        }
      });
      return false;
    }
  );
}

function runRouting() {
  if (!checkAction('routing', 'Run routing')) return;
  const agents = db.agents.filter(a => a.status === 'Available');
  if (!agents.length) throw Error('Resume at least one agent first.');
  const leads = db.orders.filter(o => o.status === 'New' && !o.agent);
  for (const r of db.rules) {
    if (!agents.some(a => a.id === r.agent)) continue;
    const matched = leads.filter(o => !o.agent && (r.field === 'All' || String(o[r.field]).toLowerCase() === r.value.toLowerCase()));
    matched.slice(0, Math.ceil((matched.length * r.share) / 100)).forEach(o => (o.agent = r.agent));
  }
  leads.filter(o => !o.agent).forEach((o, i) => (o.agent = agents[i % agents.length].id));
  log(`${leads.length} leads routed`);
  render();
  toast(`${leads.length} leads assigned`);
}

// View Supabase SQL Schema Modal
async function viewSupabaseSchema() {
  try {
    const res = await fetch('/api/schema');
    const sql = await res.text();
    modal(
      'Database security script',
      `
        <p class="info">No setup script is needed: tables are created automatically. If an older version of this script was run in Supabase, run this one once in the <a href="https://supabase.com/dashboard/project/kwqbghlwarkibhlgbgft/sql/new" target="_blank" rel="noopener">Supabase SQL Editor ↗</a> to remove public access to the old tables. It does not delete data.</p>
        <textarea id="sql-schema-area" style="width:100%;height:320px;font-family:monospace;font-size:11px;background:#183243;color:#a3e635;padding:12px;border-radius:8px;" readonly>${esc(sql)}</textarea>
        <p><button type="button" id="copy-sql-btn" class="primary">Copy SQL to Clipboard</button></p>
      `,
      null
    );

    setTimeout(() => {
      const btn = $('#copy-sql-btn');
      if (btn) {
        btn.onclick = () => {
          navigator.clipboard.writeText(sql).then(() => {
            toast('SQL schema copied to clipboard!');
          });
        };
      }
    }, 100);
  } catch (e) {
    toast('Error loading SQL schema: ' + e.message);
  }
}

async function testSupabaseSync() {
  toast('Testing the database connection…');
  try {
    const data = await api('/api/database/status');
    supabaseStatus = data;
    const pill = $('#supabase-pill-text');
    if (pill) pill.textContent = data.connected ? 'Database connected' : data.configured ? 'Database error' : 'Database not connected';
    const r = data.records || {};
    toast(data.connected
      ? `Database connected · ${r.orders || 0} orders · ${r.products || 0} products saved`
      : data.error || 'No database: set DATABASE_URL in Vercel so data is saved.');
  } catch (e) {
    toast('Could not test the database: ' + e.message);
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

async function updateUser(id, body, message) {
  try {
    await api(`/api/users/${encodeURIComponent(id)}`, 'PATCH', body);
    await loadUsers();
    render();
    toast(message);
    return true;
  } catch (err) {
    toast(err.message);
    await loadUsers();
    render();
    return false;
  }
}

async function saveRoles(roles, message) {
  try {
    const data = await api('/api/roles', 'PUT', { roles });
    db.roles = data.roles;
    persist();
    render();
    toast(message);
    return true;
  } catch (err) {
    toast(err.message);
    render();
    return false;
  }
}

function openMyAccount() {
  const me = db.currentUser;
  modal(
    'My account',
    `
      <div class="stat-line"><span>Name</span><b>${esc(me.name)}</b></div>
      <div class="stat-line"><span>Email</span><b>${esc(me.email)}</b></div>
      <div class="stat-line"><span>Role</span><b>${esc(me.role)}</b></div>
      ${previewRole ? `<div class="stat-line"><span>Previewing as</span><b>${esc(previewRole)}</b></div>` : ''}
      <div class="actions" style="margin-top:18px;">
        <button type="button" data-action="change-password">Change password</button>
        ${previewRole ? '<button type="button" data-action="exit-preview">Exit role preview</button>' : ''}
        <button type="button" data-action="sign-out-all">Sign out everywhere</button>
        <button type="button" class="danger" data-action="sign-out">Sign out</button>
      </div>
    `,
    '',
    () => {}
  );
}

function openChangePassword() {
  modal(
    'Change password',
    `
      <p class="info">Changing your password signs you out on other devices.</p>
      <div class="form-grid">
        <label class="full">Current password<input name="current" type="password" required autocomplete="current-password"></label>
        <label>New password<input name="next" type="password" required minlength="8" autocomplete="new-password"></label>
        <label>Confirm new password<input name="confirm" type="password" required minlength="8" autocomplete="new-password"></label>
      </div>
      <div id="password-error" role="alert" style="color:#ac3838;margin-top:8px;"></div>
    `,
    'Update password',
    f => {
      const err = $('#password-error');
      if (f.get('next') !== f.get('confirm')) {
        err.textContent = 'The new passwords do not match.';
        return false;
      }
      api('/api/auth/change-password', 'POST', { currentPassword: f.get('current'), newPassword: f.get('next') })
        .then(data => {
          applySession(data);
          $('#modal').close();
          toast('Password updated.');
        })
        .catch(e => { err.textContent = e.message; });
      return false;
    }
  );
}

const actions = {
  close: () => $('#modal').close(),
  order: orderDialog,
  awb: showThermalLabel,
  'new-order': newOrder,
  'guide-jump': id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  'new-po': createPurchaseOrderModal,
  'receive-po': receivePO,
  export: exportOrders,
  import: importOrders,
  template: () => download('rosaino-lead-template.csv', 'customer,phone,city,sku,quantity\r\nDemo Customer,06 12 34 56 78,Casablanca,ROS-TECH-01,1', 'text/csv'),
  'new-product': () => editProduct(),
  'edit-product': id => editProduct(id),
  call: id => startCall(`${id}:phone`),
  'start-call': startCall,
  'toggle-transcription': () => (transcribing ? stopTranscription() : startTranscription()),
  'view-call': viewCall,
  'refresh-calls': () => { callLogs = null; render(); },
  route: runRouting,
  pause: () => {
    const a = agent(selectedAgent) || db.agents[0];
    if (!a) return;
    a.status = a.status === 'Paused' ? 'Available' : 'Paused';
    log(`${a.name} ${a.status.toLowerCase()}`);
    render();
  },
  'delete-rule': id => {
    if (!checkAction('routing', 'Delete rule')) return;
    db.rules = db.rules.filter(r => r.id !== id);
    persist();
    render();
  },
  'new-rule': () => {
    if (!checkAction('routing', 'Add rule')) return;
    modal(
      'Add routing rule',
      `
        <div class="form-grid">
          ${select('field', 'Match field', ['All', 'product', 'source', 'city'])}
          ${input('value', 'Match value', 'All')}
          ${select('agent', 'Agent', db.agents.map(a => [a.id, a.name]))}
          ${input('share', 'Share of matching leads (%)', 100, 'number', 'min="1" max="100" step="1"')}
        </div>
      `,
      'Save rule',
      f => {
        db.rules.push({ id: uid(), field: f.get('field'), value: f.get('value'), agent: f.get('agent'), share: +f.get('share') });
        log('Routing rule added');
      }
    );
  },
  stock: id => {
    if (!checkAction('products', 'Adjust stock')) return;
    const p = product(id);
    modal(
      'Adjust inventory on hand',
      `
        <p><b>${esc(p.name)}</b> · Current on hand: <b>${p.stock}</b> · Reserved: <b>${reserved(id)}</b></p>
        <div class="form-grid">
          ${input('delta', 'Stock Adjustment (+ or − units)', 1, 'number', 'step="1"')}
          ${input('reason', 'Adjustment reason', 'Manual warehouse count')}
        </div>
      `,
      'Apply adjustment',
      f => {
        const n = p.stock + Number(f.get('delta'));
        if (n < reserved(id)) throw Error('Stock cannot fall below reserved units (' + reserved(id) + ').');
        p.stock = n;
        log(`${p.name}: ${f.get('delta')} units (${f.get('reason')})`);
        persist();
        toast(`${p.name} stock adjusted to ${p.stock} (synced with Storefront & Supabase)`);

        // Sync with backend API
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        }).catch(() => {});
      }
    );
  },
  'open-cms': id => {
    activeCmsProductId = id;
    location.hash = 'cms';
    render();
    toast('Opened Landing Page CMS for this product');
  },
  'copy-boost-url': url => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    toast('Ad Boost tracking link copied! Ready to paste into Meta/TikTok Ads Manager.');
  },
  'pick-image': src => {
    const input = $('#cms-input-heroImage');
    if (input) input.value = src;
    toast('Selected media asset: ' + src);
  },
  'pick-image-field': (val, target) => {
    // handled via dataset in click delegation
  },
  'toggle-section': secId => {
    toggleSection(secId);
  },
  'move-section-up': secId => {
    moveSection(secId, -1);
  },
  'move-section-down': secId => {
    moveSection(secId, 1);
  },
  'toggle-section-expand': secId => {
    if (expandedSections.has(secId)) {
      expandedSections.delete(secId);
    } else {
      expandedSections.add(secId);
    }
    render();
  },
  'expand-all-sections': () => {
    Object.keys(CMS_SECTION_DEFS).forEach(k => expandedSections.add(k));
    render();
  },
  'collapse-all-sections': () => {
    expandedSections.clear();
    render();
  },
  'set-cms-lang': lang => {
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (!p) return;
    if (!db.cmsPages) db.cmsPages = {};
    if (!db.cmsPages[p.id]) db.cmsPages[p.id] = {};
    db.cmsPages[p.id].language = lang;
    persist();
    toast(`${t('target_language')} ${I18N[lang]?.name || lang}`);
    render();
    updateLivePreview();
  },
  'apply-lang-template': lang => {
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (!p) return;
    if (!db.cmsPages) db.cmsPages = {};
    const tplFn = CMS_TEMPLATES[lang] || CMS_TEMPLATES.fr;
    const currentOrder = db.cmsPages[p.id]?.sectionOrder;
    const currentEnabled = db.cmsPages[p.id]?.sectionsEnabled;
    const currentHero = db.cmsPages[p.id]?.heroImage;
    const currentSec = db.cmsPages[p.id]?.secondaryImage;
    const currentG3 = db.cmsPages[p.id]?.galleryImage3;

    db.cmsPages[p.id] = {
      ...tplFn(p),
      sectionOrder: currentOrder || ['announcement', 'hero_media', 'hook_and_copy', 'pricing_bundles', 'urgency_bar', 'cod_checkout', 'features', 'reviews', 'faqs'],
      sectionsEnabled: currentEnabled || { announcement: true, hero_media: true, hook_and_copy: true, pricing_bundles: true, urgency_bar: true, cod_checkout: true, features: true, reviews: true, faqs: true },
      heroImage: currentHero || p.image || '/assets/collection.png',
      secondaryImage: currentSec || '/assets/pattern.png',
      galleryImage3: currentG3 || '/assets/ribbon.png'
    };
    persist();
    toast(`Template applied in ${I18N[lang]?.name || lang}!`);
    render();
    updateLivePreview();
  },
  'apply-preset': presetKey => {
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (!p) return;
    if (!db.cmsPages) db.cmsPages = {};
    if (!db.cmsPages[p.id]) db.cmsPages[p.id] = {};
    const cms = db.cmsPages[p.id];

    if (presetKey === 'flash_cod') {
      cms.sectionOrder = ['announcement', 'urgency_bar', 'hero_media', 'pricing_bundles', 'cod_checkout', 'features', 'reviews', 'faqs'];
      cms.sectionsEnabled = { announcement: true, urgency_bar: true, hero_media: true, hook_and_copy: true, pricing_bundles: true, cod_checkout: true, features: true, reviews: true, faqs: true };
      cms.urgencyEnabled = true;
      toast('Applied "Flash COD Urgency" Layout!');
    } else if (presetKey === 'minimal') {
      cms.sectionOrder = ['hero_media', 'hook_and_copy', 'cod_checkout', 'features', 'faqs'];
      cms.sectionsEnabled = { announcement: false, hero_media: true, hook_and_copy: true, pricing_bundles: false, urgency_bar: false, cod_checkout: true, features: true, reviews: false, faqs: true };
      toast('Applied "Minimal Luxury" Layout!');
    } else if (presetKey === 'bundles') {
      cms.sectionOrder = ['hero_media', 'pricing_bundles', 'reviews', 'cod_checkout', 'features', 'faqs'];
      cms.sectionsEnabled = { announcement: true, hero_media: true, hook_and_copy: true, pricing_bundles: true, urgency_bar: false, cod_checkout: true, features: true, reviews: true, faqs: true };
      cms.pricingTableEnabled = true;
      toast('Applied "Bundle Booster" Layout!');
    }
    persist();
    render();
    updateLivePreview();
  },
  'remove-cms-image': field => {
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (!p || !db.cmsPages?.[p.id]) return;
    db.cmsPages[p.id][field] = '';
    persist();
    toast(`Removed image for "${field}".`);
    render();
    updateLivePreview();
  },
  'save-cms-trigger': () => {
    const form = $('#cms-editor-form');
    if (form) saveCmsEditor(new FormData(form));
  },
  'reset-cms-product': id => {
    const targetId = id || activeCmsProductId;
    const p = db.products.find(x => String(x.id) === String(targetId));
    if (p && db.cmsPages) {
      delete db.cmsPages[p.id];
      persist();
      toast(`Reset landing page for ${p.name} to standard template.`);
      render();
      updateLivePreview();
    }
  },
  'toggle-cod-field': fieldId => {
    toggleCodField(fieldId);
  },
  'move-cod-field-up': fieldId => {
    moveCodField(fieldId, -1);
  },
  'move-cod-field-down': fieldId => {
    moveCodField(fieldId, 1);
  },
  'toggle-cod-field-expand': fieldId => {
    toggleCodFieldExpand(fieldId);
  },
  'delete-cod-field': fieldId => {
    deleteCodField(fieldId);
  },
  'add-cod-field': () => {
    addCodField();
  },
  'reset-cod-fields': () => {
    resetCodFields();
  },
  'toggle-visual-edit-mode': () => {
    toggleVisualEditMode();
  },
  'add-feature': () => {
    addFeature();
  },
  'delete-feature': idx => {
    deleteFeature(Number(idx));
  },
  'add-review': () => {
    addReview();
  },
  'delete-review': idx => {
    deleteReview(Number(idx));
  },
  'add-faq': () => {
    addFaq();
  },
  'delete-faq': idx => {
    deleteFaq(Number(idx));
  },
  'new-supplier': () => {
    if (!checkAction('suppliers', 'Add supplier')) return;
    modal(
      'Add supplier',
      `
        <div class="form-grid">
          ${input('name', 'Supplier name')}
          ${input('contact', 'Contact email', '', 'email')}
          ${input('city', 'City')}
          ${input('lead', 'Lead time (days)', 5, 'number', 'min="1" step="1"')}
        </div>
      `,
      'Save supplier',
      f => {
        db.suppliers.push({ id: uid(), name: f.get('name'), contact: f.get('contact'), city: f.get('city'), lead: +f.get('lead') });
        log('Supplier added');
      }
    );
  },
  restock: id => {
    if (!checkAction('suppliers', 'Receive stock')) return;
    const s = db.suppliers.find(x => x.id === id);
    const list = db.products.filter(p => p.supplier === s.name);
    if (!list.length) throw Error('Link a product to this supplier first.');
    modal(
      'Receive supplier stock',
      `
        <div class="form-grid">
          ${select('product', 'Product', list.map(p => [p.id, p.name]))}
          ${input('quantity', 'Units received', 10, 'number', 'min="1" step="1"')}
        </div>
      `,
      'Receive stock',
      f => {
        const p = product(f.get('product'));
        const q = +f.get('quantity');
        p.stock += q;
        log(`${q} units received from ${s.name}`);
        persist();
        toast(`Received ${q} units of ${p.name}. Stock updated in Storefront & Supabase.`);

        // Sync with backend API
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        }).catch(() => {});
      }
    );
  },
  expense: () => {
    if (!checkAction('finance', 'Record expense')) return;
    modal(
      'Record expense',
      `
        <div class="form-grid">
          ${input('name', 'Description')}
          ${select('category', 'Category', ['Advertising', 'Operations', 'Packaging', 'Other'])}
          ${input('amount', 'Amount (MAD)', 0, 'number', 'min="0.01" step="0.01"')}
        </div>
      `,
      'Save expense',
      f => {
        db.expenses.push({ id: uid(), name: f.get('name'), category: f.get('category'), amount: +f.get('amount') });
        log('Expense recorded');
      }
    );
  },
  'new-page': () => {
    if (!checkAction('stores', 'Add storefront page')) return;
    modal(
      'Add storefront page',
      `
        <div class="form-grid">
          ${input('name', 'Page name')}
          ${select('channel', 'Channel', ['Storefront', 'Meta Ads', 'WooCommerce'])}
          ${select('status', 'Status', ['Draft', 'Active'])}
        </div>
      `,
      'Save page',
      f => {
        db.pages.push({ id: uid(), name: f.get('name'), channel: f.get('channel'), status: f.get('status') });
        log('Demo page record added');
      }
    );
  },
  integration: name => {
    if (name === 'Supabase') {
      viewSupabaseSchema();
      return;
    }
    modal(
      esc(name) + ' setup preview',
      `
        <p>This is a simulated setup flow. No API credentials are requested or stored.</p>
        <div class="history">
          1. Connect an authorized ${esc(name)} account.<br>
          2. Map products, fields and order statuses.<br>
          3. Validate webhooks and test a sample event.<br>
          4. Enable synchronization after backend implementation.
        </div>
      `,
      db.connections[name] ? 'Clear demo configuration' : 'Mark demo configured',
      () => {
        db.connections[name] = !db.connections[name];
        toast('Demo configuration updated');
      }
    );
  },
  'view-schema': viewSupabaseSchema,
  'test-supabase': testSupabaseSync,
  'new-agent': () => {
    if (!checkAction('rbac_manage', 'Add team member')) return;
    modal(
      'Add team member',
      `
        <p class="info">The member signs in with this email and temporary password, and can change it from Settings.</p>
        <div class="form-grid">
          ${input('name', 'Full name', '', 'text', 'maxlength="80"')}
          ${input('email', 'Email address', '', 'email')}
          ${select('role', 'Role', Object.keys(db.roles), 'Confirmation agent')}
          ${input('password', 'Temporary password', generatePassword(), 'text', 'minlength="8" autocomplete="off"')}
        </div>
      `,
      'Create account',
      f => {
        const body = { name: f.get('name').trim(), email: f.get('email').trim(), role: f.get('role'), password: f.get('password') };
        api('/api/users', 'POST', body).then(async ({ user }) => {
          $('#modal').close();
          await loadUsers();
          render();
          toast(`Account created for ${user.name}. Share the temporary password securely.`);
        }).catch(err => toast(err.message));
        return false;
      }
    );
  },

  'toggle-blacklist': phone => {
    const cPhone = cleanPhone(phone);
    if (!cPhone) return;
    if (!db.blacklistedPhones) db.blacklistedPhones = [];
    const idx = db.blacklistedPhones.indexOf(cPhone);
    if (idx >= 0) {
      db.blacklistedPhones.splice(idx, 1);
      toast(`Phone ${cPhone} removed from blacklist.`);
    } else {
      db.blacklistedPhones.push(cPhone);
      toast(`Phone ${cPhone} added to Serial Refuser Blacklist.`);
    }
    persist();
    render();

    fetch('/api/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cPhone, action: idx >= 0 ? 'remove' : 'add' })
    }).catch(() => {});
  },
  'cancel-duplicate': id => {
    const o = db.orders.find(x => x.id === id);
    if (o) {
      o.status = 'Cancelled';
      o.notes.push('[Cancelled by Admin as Duplicate Lead]');
      persist();
      toast(`Order ${id} cancelled as duplicate.`);
      render();
    }
  },
  'filter-duplicates': () => {
    search = '';
    const dups = db.orders.filter(checkDuplicateOrder);
    $('#order-results').innerHTML = orderTable(dups);
    toast(`Showing ${dups.length} duplicate leads.`);
  },
  'reset-rbac': () => {
    if (!checkAction('rbac_manage', 'Reset permissions')) return;
    if (!confirm('Reset every role to its default permissions? Custom roles will be removed.')) return;
    api('/api/roles', 'PUT', { reset: true }).then(({ roles }) => {
      db.roles = roles;
      persist();
      render();
      toast('Role permissions reset to defaults.');
    }).catch(err => toast(err.message));
  },
  'new-role': () => {
    if (!checkAction('rbac_manage', 'Create role')) return;
    modal(
      'Create role',
      `
        <div class="form-grid">
          ${input('name', 'Role name', '', 'text', 'maxlength="40"')}
          ${select('copy', 'Start with permissions from', [['', 'No permissions'], ...Object.keys(db.roles).map(r => [r, r])], '')}
        </div>
      `,
      'Create role',
      f => {
        const name = f.get('name').trim();
        if (db.roles[name]) throw Error('A role with this name already exists.');
        const perms = f.get('copy') ? [...(db.roles[f.get('copy')] || [])].filter(p => p !== 'rbac_manage') : [];
        saveRoles({ ...db.roles, [name]: perms }, `Role "${name}" created`).then(ok => ok && $('#modal').close());
        return false;
      }
    );
  },
  'delete-role': role => {
    if (!checkAction('rbac_manage', 'Delete role')) return;
    if (!confirm(`Delete the role "${role}"?`)) return;
    const next = { ...db.roles };
    delete next[role];
    saveRoles(next, `Role "${role}" deleted`);
  },
  'preview-role': () => {
    modal(
      'Preview workspace as a role',
      `
        <p class="info">See exactly which modules a role can open. This only changes your view; your account keeps its own permissions.</p>
        <div class="form-grid">${select('role', 'Role', Object.keys(db.roles).filter(r => r !== 'Super Admin'), 'Confirmation agent')}</div>
      `,
      'Start preview',
      f => {
        previewRole = f.get('role');
        checkAuth();
        location.hash = (pages.find(p => hasPermission(p[3])) || pages[0])[0];
        toast(`Previewing as ${previewRole}`);
      }
    );
  },
  'exit-preview': () => {
    previewRole = null;
    checkAuth();
    location.hash = 'team';
    render();
    toast('Role preview ended');
  },
  'edit-user': id => {
    const u = agent(id);
    if (!u || !checkAction('rbac_manage', 'Edit user')) return;
    const isMe = u.id === db.currentUser.id;
    modal(
      `Edit ${esc(u.name)}`,
      `
        <div class="form-grid">
          ${input('name', 'Full name', u.name, 'text', 'maxlength="80"')}
          ${input('email', 'Email address', u.email, 'email')}
          ${isMe ? `<label>Role<input value="${esc(u.role)}" disabled></label>` : select('role', 'Role', Object.keys(db.roles), u.role)}
        </div>
      `,
      'Save changes',
      f => {
        const body = { name: f.get('name').trim(), email: f.get('email').trim() };
        if (!isMe) body.role = f.get('role');
        updateUser(u.id, body, `${body.name} updated`).then(ok => ok && $('#modal').close());
        return false;
      }
    );
  },
  'reset-user-password': id => {
    const u = agent(id);
    if (!u || !checkAction('rbac_manage', 'Reset password')) return;
    modal(
      `Reset password for ${esc(u.name)}`,
      `
        <p class="info">Signs ${esc(u.name)} out of every device. Share the new password with them securely.</p>
        <div class="form-grid">${input('password', 'New password', generatePassword(), 'text', 'minlength="8" autocomplete="off"')}</div>
      `,
      'Reset password',
      f => {
        updateUser(u.id, { password: f.get('password') }, `Password reset for ${u.name}`).then(ok => ok && $('#modal').close());
        return false;
      }
    );
  },
  'toggle-user': id => {
    const u = agent(id);
    if (!u || !checkAction('rbac_manage', 'Enable/disable user')) return;
    const enable = u.active === false;
    if (!enable && !confirm(`Disable ${u.name}? They will be signed out immediately.`)) return;
    updateUser(u.id, { active: enable }, `${u.name} ${enable ? 'enabled' : 'disabled'}`);
  },
  'delete-user': id => {
    const u = agent(id);
    if (!u || !checkAction('rbac_manage', 'Delete user')) return;
    if (!confirm(`Permanently delete the account for ${u.name}? Consider disabling it instead.`)) return;
    api(`/api/users/${encodeURIComponent(u.id)}`, 'DELETE').then(async () => {
      await loadUsers();
      render();
      toast(`${u.name} deleted`);
    }).catch(err => toast(err.message));
  },
  'my-account': openMyAccount,
  'change-password': openChangePassword,
  'sign-out': () => signOut(false),
  'sign-out-all': () => {
    if (confirm('Sign out of every device, including this one?')) signOut(true);
  },
  'refresh-inbox': () => {
    contactInbox = null;
    render();
  },
  'contact-status': value => {
    const [id, status] = value.split(':');
    api(`/api/contact/${encodeURIComponent(id)}`, 'PATCH', { status }).then(({ message }) => {
      const m = contactInbox?.find(x => x.id === id);
      if (m) Object.assign(m, message);
      render();
    }).catch(err => toast(err.message));
  },
  'refresh-audit': () => {
    auditEntries = null;
    render();
  },

  'remittance-filter': val => {
    remittanceFilter = val || 'all';
    render();
  },
  'filter-carrier': carrier => {
    remittanceFilter = 'all';
    search = carrier;
    page = 'orders';
    render();
    toast(`Filtered orders for courier: ${carrier}`);
  },
  'single-remit': id => {
    const o = db.orders.find(x => x.id === id);
    if (!o) return;
    const ref = `VIR-2026-${(o.carrier || 'DIGY').slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().slice(0, 10);
    o.remittanceStatus = 'Remitted';
    o.remittanceRef = ref;
    o.remittedDate = now;
    log(`Order ${o.id} marked as settled with wire ${ref}`);
    persist();
    render();
    toast(`Order ${o.id} marked as settled (${money(o.amount)} in bank)`);
    fetch('/api/reconciliation/batch-remit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: [o.id], remittanceRef: ref, carrier: o.carrier })
    }).catch(() => {});
  },
  'reconcile-modal': () => {
    const delivered = db.orders.filter(o => o.status === 'Delivered');
    const pendingOrders = delivered.filter(o => o.remittanceStatus !== 'Remitted');
    const carriers = ['All Carriers', 'Digylog', 'OzoneExpress', 'AMEEX'];

    modal(
      'Reconcile Courier Remittance Batch',
      `
        <div style="background:#f0f8f7;padding:14px;border-radius:8px;margin-bottom:16px;font-size:13px;line-height:1.6;">
          <strong>Settlement Audit:</strong> Match cash deposited in your bank against delivered parcels collected by courier drivers.
        </div>
        <div class="form-grid">
          ${select('carrier', 'Courier Partner', carriers)}
          ${input('wireRef', 'Bank Wire / Bordereau Reference', `VIR-2026-${Math.floor(1000 + Math.random() * 9000)}`)}
          ${input('date', 'Wire Deposit Date', new Date().toISOString().slice(0, 10), 'date')}
          ${input('notes', 'Remittance Note', 'Weekly COD remittance settlement cleared at BMCE Bank')}
        </div>
        <div style="margin-top:16px;padding:12px;background:#f8fafb;border:1px solid #e3e9eb;border-radius:8px;font-size:12px;">
          <strong>Pending Parcels Eligible for Reconciliation:</strong> ${pendingOrders.length} parcels (${money(sum(pendingOrders, 'amount'))})
        </div>
      `,
      'Confirm Bank Reconciliation',
      f => {
        const selCarrier = f.get('carrier');
        const wireRef = f.get('wireRef').trim() || `VIR-${Date.now().toString(36).toUpperCase()}`;
        const wireDate = f.get('date') || new Date().toISOString().slice(0, 10);

        let targetOrders = pendingOrders;
        if (selCarrier && selCarrier !== 'All Carriers') {
          targetOrders = targetOrders.filter(o => o.carrier === selCarrier);
        }

        if (!targetOrders.length) throw Error('No pending parcels found for the selected courier partner.');

        const totalCash = sum(targetOrders, 'amount');
        targetOrders.forEach(o => {
          o.remittanceStatus = 'Remitted';
          o.remittanceRef = wireRef;
          o.remittedDate = wireDate;
        });

        log(`Batch reconciliation: ${targetOrders.length} parcels settled with wire ${wireRef} (${money(totalCash)})`);
        toast(`Successfully reconciled ${targetOrders.length} parcels (${money(totalCash)} settled into bank)!`);

        fetch('/api/reconciliation/batch-remit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIds: targetOrders.map(o => o.id), remittanceRef: wireRef, carrier: selCarrier })
        }).catch(() => {});
      }
    );
  },
  'dispute-statement': () => {
    const delivered = db.orders.filter(o => o.status === 'Delivered');
    const overdue = delivered.filter(o => o.remittanceStatus === 'Overdue');
    const overcharges = delivered.filter(o => (o.courierFeeCharged || 35) > 35);
    const totalOverdueCash = sum(overdue, 'amount');
    const totalOvercharges = overcharges.reduce((s, o) => s + ((o.courierFeeCharged || 35) - 35), 0);

    modal(
      'Official Courier Remittance Audit & Claim Statement',
      `
        <div style="background:#fff;border:2px solid #147d86;border-radius:10px;padding:20px;font-family:monospace;font-size:12px;line-height:1.6;color:#183243;">
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid #147d86;padding-bottom:10px;margin-bottom:14px;">
            <div>
              <strong style="font-size:15px;">ROSAINO E-COMMERCE LOGISTICS AUDIT</strong><br>
              <span>Finance & Reconciliation Department</span><br>
              <small>Casablanca, Morocco</small>
            </div>
            <div style="text-align:right;">
              <strong>STATEMENT REF: AUD-${Date.now().toString(36).toUpperCase()}</strong><br>
              <span>Date: ${new Date().toISOString().slice(0, 10)}</span><br>
              <span style="color:#b91c1c;font-weight:700;">URGENT REMITTANCE CLAIM</span>
            </div>
          </div>

          <p style="margin:8px 0;"><strong>To:</strong> Operations & Accounting Director — Digylog / OzoneExpress Logistics</p>
          <p style="margin:8px 0;"><strong>Subject:</strong> Unremitted Doorstep COD Cash Collections & Tariff Discrepancy Notice</p>

          <div style="margin:14px 0;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;color:#991b1b;">
            <strong>CLAIM SUMMARY:</strong><br>
            • Unremitted Overdue Parcels (>7 Days): <strong>${overdue.length} orders</strong> (Total Unpaid Cash: <strong>${money(totalOverdueCash)}</strong>)<br>
            • Shipping Fee Tariff Overcharges: <strong>${overcharges.length} orders</strong> (Total Disputed: <strong>${money(totalOvercharges)}</strong>)<br>
            • Total Net Claim Due to Rosaino Bank Account: <strong style="font-size:14px;">${money(totalOverdueCash + totalOvercharges)}</strong>
          </div>

          <p><strong>Itemized Disputed Parcels Manifest:</strong></p>
          <div style="max-height:180px;overflow-y:auto;background:#f8fafb;padding:8px;border:1px solid #e2e8ea;border-radius:4px;margin-bottom:12px;">
            ${[...overdue, ...overcharges].map(o => `
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #edf1f2;">
                <span><b>${esc(o.id)}</b> · ${esc(o.customer)} (${esc(o.city)}) · Delivered ${esc(o.date)}</span>
                <span><b>${money(o.amount)}</b> · Courier: ${esc(o.carrier)}</span>
              </div>
            `).join('')}
          </div>

          <p style="font-size:11px;color:#64748b;">
            In accordance with our Service Level Agreement (SLA), all collected Cash-on-Delivery funds must be transferred within 5 business days of doorstep delivery. Please remit the outstanding balance immediately.
          </p>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
          <button type="button" class="primary" onclick="window.print()">Print Claim Statement</button>
          <a class="btn-wa" href="https://wa.me/212600000000?text=${encodeURIComponent(`Hello Courier Accounts Manager, this is Rosaino Finance. Please find our Remittance Audit Statement for ${overdue.length} overdue parcels (${money(totalOverdueCash)} unremitted). Please process the bank wire today.`)}" target="_blank" rel="noopener">
            Send to Courier Manager on WhatsApp
          </a>
        </div>
      `,
      null
    );
  },
  dispatch: id => openDispatchDialog(id),
  deliver: id => recordOutcome(id, 'Delivered'),
  return: id => recordOutcome(id, 'Returned'),
  'sync-shipments': async () => {
    toast('Checking carriers for updates…');
    let polled = null;
    try { polled = await api('/api/shipments/sync', 'POST', {}); } catch (err) { toast(err.message); }
    const n = await loadShipments();
    lastShipmentSync = new Date();
    render();
    toast(n ? `${n} order(s) updated by carriers` : polled?.errors?.length ? `No changes · ${polled.errors.length} carrier error(s): ${polled.errors[0]}` : 'Everything is up to date');
  },
  'new-carrier': () => { if (checkAction('integrations', 'Add carrier')) openCarrierDialog(null); },
  'new-store-key': openNewStoreKey,
  'connect-shopify': openConnectShopify,
  'fix-delivery': ref => openFixDelivery(ref),
  'analytics-range': v => { analyticsRange = v; render(); },
  'analytics-map': v => { analyticsMap = v; render(); },
  'store-platform': p => (p === 'Shopify' ? openConnectShopify() : openStorePlatform(p)),
  'store-platform-manual': p => (p === 'Shopify' ? startShopifyQuick() : openStorePlatform(p)),
  'shopify-quick': () => startShopifyQuick(),
  'shopify-app': () => openShopifyApp(),
  'save-signing-secret': id => {
    const v = ($('#shopify-signing-secret')?.value || '').trim();
    if (!v) return toast('Paste the signing code from Shopify first');
    api(`/api/store-keys/${encodeURIComponent(id)}`, 'PATCH', { signingSecret: v })
      .then(() => { toast('Saved: only orders signed by your store are accepted'); loadStoreKeys(); })
      .catch(err => toast(err.message));
  },
  'refresh-store-keys': () => Promise.all([loadStoreKeys(), api('/api/setup-status').then(st => { setupStatus = st; }).catch(() => {})]).then(() => { render(); toast('Updated'); }),
  'copy-store-secret': () => { const el = $('#store-secret'); el.select(); (navigator.clipboard?.writeText(el.value) || Promise.reject()).then(() => toast('API key copied')).catch(() => toast('Select the key and copy it')); },
  'copy-store-hook': () => { const el = $('#store-hook'); el.select(); (navigator.clipboard?.writeText(el.value) || Promise.reject()).then(() => toast('Webhook URL copied')).catch(() => toast('Select the URL and copy it')); },
  'store-key-setup': id => {
    const k = storeKeyById(id);
    if (!k) return;
    modal(`Set up ${esc(k.name)}`, `
      <p class="info">Replace <code>YOUR_API_KEY</code> with the full key you copied when it was created (it starts with <code>${esc(k.prefix)}</code>).</p>
      <label>Connect with
        <select id="setup-platform">${STORE_PLATFORMS.map(p => `<option value="${p}" ${p === k.platform ? 'selected' : ''}>${p === 'Other' ? 'Other / custom site' : p}</option>`).join('')}</select>
      </label>
      <div id="setup-steps">${storeSetupSteps(k.platform)}</div>
    `, null);
    $('#setup-platform').onchange = e => { $('#setup-steps').innerHTML = storeSetupSteps(e.target.value); };
  },
  'store-key-test': id => {
    const k = storeKeyById(id);
    if (!k) return;
    api(`/api/store-keys/${encodeURIComponent(id)}/test`, 'POST', {})
      .then(async ({ id: orderId }) => {
        await loadStoreKeys();
        await pullOrders();
        render();
        toast(`Test order ${orderId} received. It's in Leads & orders; you can cancel it.`);
      })
      .catch(err => toast(err.message));
  },
  'store-key-secret': id => {
    const k = storeKeyById(id);
    if (!k) return;
    modal(`Shopify signing secret · ${esc(k.name)}`, `
      <p class="info">Shopify shows it under <b>Settings → Notifications → Webhooks</b> ("Your webhooks will be signed with …"). With it, Rosaino rejects any order that wasn't sent by your store. Leave empty to remove it.</p>
      <label>Signing secret<input name="signingSecret" autocomplete="off" placeholder="${k.hasSigningSecret ? 'A secret is saved; enter a new one to replace it' : 'Paste the secret'}"></label>
      <div id="store-key-error" role="alert" class="form-error"></div>
    `, 'Save', f => {
      api(`/api/store-keys/${encodeURIComponent(id)}`, 'PATCH', { signingSecret: (f.get('signingSecret') || '').trim() })
        .then(async () => { $('#modal').close(); await loadStoreKeys(); render(); toast('Signing secret saved'); })
        .catch(err => { $('#store-key-error').textContent = err.message; });
      return false;
    });
  },
  'store-key-toggle': id => {
    const k = storeKeyById(id);
    if (!k) return;
    if (k.active && !confirm(`Revoke the key for ${k.name}? The store can no longer send orders with it.`)) return;
    api(`/api/store-keys/${encodeURIComponent(id)}`, 'PATCH', { active: !k.active })
      .then(async () => { await loadStoreKeys(); render(); toast(k.active ? `${k.name}: key revoked` : `${k.name}: key active again`); })
      .catch(err => toast(err.message));
  },
  'nearya-regions': openNearyaRegions,
  'nearya-pickup': id => { if (checkAction('shipping', 'Request pickup')) openNearyaPickup(id); },
  'nearya-stock': openNearyaStock,
  parcel: openParcel,
  'parcel-refresh': id => parcelAction(id, 'refresh', {}, r => {
    openParcel(id);
    render();
    toast(r.changed ? `${id} is now ${r.shipment.status}` : `Nearya: ${r.shipment.carrierStatus || 'no change'}`);
  }),
  'parcel-relaunch': id => {
    if (!confirm('Ask Nearya to deliver this parcel again?')) return;
    parcelAction(id, 'relaunch', {}, () => { $('#modal').close(); render(); toast(`${id} relaunched`); });
  },
  'parcel-new-recipient': openNewRecipient,
  'parcel-replace': id => {
    const o = db.orders.find(x => x.id === id);
    if (!o || !confirm(`Create an exchange parcel for ${o.customer}? The courier delivers the new item and collects the old one.`)) return;
    parcelAction(id, 'replace', { order: { customer: o.customer, phone: o.phone, city: o.city, address: o.address }, price: 0, comment: 'Échange' },
      r => { openParcel(id); toast(`Exchange parcel ${r.replacement.trackingCode} created`); });
  },
  'edit-carrier': id => { const c = (carrierList || []).find(x => x.id === id); if (c && checkAction('integrations', 'Edit carrier')) openCarrierDialog(c); },
  'toggle-carrier': id => {
    const c = (carrierList || []).find(x => x.id === id);
    if (!c || !checkAction('integrations', 'Pause carrier')) return;
    api(`/api/carriers/${encodeURIComponent(id)}`, 'PATCH', { active: !c.active }).then(async () => { await loadCarriers(); render(); toast(`${c.name} ${c.active ? 'paused' : 'activated'}`); }).catch(err => toast(err.message));
  },
  'delete-carrier': id => {
    const c = (carrierList || []).find(x => x.id === id);
    if (!c || !checkAction('integrations', 'Remove carrier')) return;
    if (!confirm(`Remove ${c.name}? Parcels already dispatched keep their tracking, but ${c.name} will no longer be able to send updates.`)) return;
    api(`/api/carriers/${encodeURIComponent(id)}`, 'DELETE').then(async () => { await loadCarriers(); render(); toast(`${c.name} removed`); }).catch(err => toast(err.message));
  },
  'test-carrier': id => {
    const c = (carrierList || []).find(x => x.id === id);
    toast(`Testing ${c?.name || 'carrier'}…`);
    api(`/api/carriers/${encodeURIComponent(id)}/test`, 'POST', {}).then(r => toast(r.message)).catch(err => toast(err.message));
  },
  'copy-webhook': id => {
    const c = (carrierList || []).find(x => x.id === id);
    if (!c) return;
    (navigator.clipboard?.writeText(c.webhookUrl) || Promise.reject()).then(() => toast('Update link copied')).catch(() => toast('Select the link and copy it'));
  },
  label: showThermalLabel
};

function shipment(id, status) {
  if (!checkAction('shipping', 'Update shipment')) return;
  const o = db.orders.find(o => o.id === id);
  changeStatus(o, status);
  persist();
  render();
  toast(`${o.id} marked ${status.toLowerCase()}`);
}

// Record a delivery outcome yourself (also saved on the carrier shipment, so tracking matches).
async function recordOutcome(id, status) {
  if (!checkAction('shipping', 'Update shipment')) return;
  if (shipmentFor(id)) {
    try {
      await api(`/api/shipments/${encodeURIComponent(id)}/status`, 'POST', { status });
      await loadShipments();
    } catch (err) {
      return toast(err.message);
    }
  }
  const o = db.orders.find(o => o.id === id);
  if (o && o.status === 'In transit') shipment(id, status);
  else render();
}

// Global click delegation
document.addEventListener('click', e => {
  // Language switcher dropdown toggle
  const langBtn = e.target.closest('#lang-dropdown-btn');
  const langWrap = $('#lang-selector-wrap');
  if (langBtn && langWrap) {
    langWrap.classList.toggle('open');
    return;
  }
  if (langWrap && !e.target.closest('#lang-selector-wrap')) {
    langWrap.classList.remove('open');
  }

  // Language option selection
  const langOpt = e.target.closest('.lang-option');
  if (langOpt && langOpt.dataset.lang) {
    switchLanguage(langOpt.dataset.lang);
    return;
  }

  // Device switcher for CMS preview
  const devBtn = e.target.closest('.btn-device');
  if (devBtn && devBtn.dataset.device) {
    previewDevice = devBtn.dataset.device;
    const iframe = $('#cms-preview-iframe');
    if (iframe) {
      iframe.className = `preview-iframe-box device-${previewDevice}`;
    }
    document.querySelectorAll('.btn-device').forEach(b => b.classList.toggle('active', b === devBtn));
    return;
  }

  // Pick image preset for a specific field
  const pickFieldBtn = e.target.closest('[data-action="pick-image-field"]');
  if (pickFieldBtn) {
    const fld = pickFieldBtn.dataset.field;
    const src = pickFieldBtn.dataset.src;
    const p = db.products.find(x => String(x.id) === String(activeCmsProductId));
    if (p && fld && src) {
      if (!db.cmsPages) db.cmsPages = {};
      if (!db.cmsPages[p.id]) db.cmsPages[p.id] = {};
      db.cmsPages[p.id][fld] = src;
      persist();
      toast(`Preset selected: ${src.split('/').pop()}`);
      render();
      updateLivePreview();
    }
    return;
  }

  const b = e.target.closest('[data-action]');
  if (b) {
    try {
      actions[b.dataset.action]?.(b.dataset.id || b.dataset.phone || b.dataset.lang || b.dataset.preset || b.dataset.field);
    } catch (err) {
      toast(err.message);
    }
    return;
  }

  // Profile click opens the account menu
  if (e.target.closest('#user-profile-badge') && !e.target.closest('#sidebar-logout-btn')) {
    openMyAccount();
  }

  // Logout triggers
  if (e.target.closest('#sidebar-logout-btn') || e.target.closest('#header-logout-btn')) {
    signOut(false);
  }
});

// Event delegation for changes: roles, carrier, and RBAC matrix checkboxes
document.addEventListener('change', e => {
  const target = e.target;

  // Carrier change
  if (target.dataset.carrier) {
    const o = db.orders.find(o => o.id === target.dataset.carrier);
    if (o) {
      o.carrier = target.value;
      persist();
      toast('Demo carrier updated');
      fetch(`/api/orders/${o.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: o.carrier })
      }).catch(() => {});
    }
  }

  // Team member role change (server-side)
  if (target.dataset.role) {
    const a = agent(target.dataset.role);
    if (a && a.role !== target.value) {
      updateUser(a.id, { role: target.value }, `Role for ${a.name} updated to ${target.value}`);
    }
  }

  // RBAC permissions matrix checkbox toggle (server-side)
  if (target.dataset.rbacRole && target.dataset.rbacPerm) {
    const role = target.dataset.rbacRole;
    const perm = target.dataset.rbacPerm;
    if (role === 'Super Admin') return;
    const current = db.roles[role] || [];
    const nextPerms = target.checked ? [...new Set([...current, perm])] : current.filter(p => p !== perm);
    saveRoles({ ...db.roles, [role]: nextPerms }, `${target.checked ? 'Granted' : 'Revoked'} "${perm}" ${target.checked ? 'to' : 'from'} ${role}`);
  }
});

// "Back to storefront" navigation fix
document.querySelectorAll('.back, .logo').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/';
  });
});

$('#modal').addEventListener('close', () => {
  clearInterval(timer);
  stopTranscription();
  activeCall = null;
});

$('#menu').onclick = () => document.body.classList.toggle('nav-open');

// Login form submission handler
const loginForm = $('#admin-login-form');
// Show / hide the password, and warn when Caps Lock is on.
const passwordInput = $('#login-password');
const passwordToggle = $('#login-toggle-password');
if (passwordInput && passwordToggle) {
  passwordToggle.onclick = () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    passwordToggle.textContent = show ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-pressed', String(show));
    passwordToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    passwordInput.focus();
  };
  const caps = e => { const el = $('#login-caps'); if (el && e.getModifierState) el.hidden = !e.getModifierState('CapsLock'); };
  passwordInput.addEventListener('keydown', caps);
  passwordInput.addEventListener('keyup', caps);
}
if (loginForm) {
  loginForm.onsubmit = async e => {
    e.preventDefault();
    const errorMsg = $('#login-error-msg');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (errorMsg) errorMsg.style.display = 'none';

    const formData = new FormData(loginForm);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    if (!email || !password) {
      if (errorMsg) {
        errorMsg.textContent = !email ? 'Enter your email address.' : 'Enter your password.';
        errorMsg.style.display = 'block';
      }
      (!email ? $('#login-email') : $('#login-password'))?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const raw = await res.text();
      let data = {};
      try { data = JSON.parse(raw); } catch {}

      if (!res.ok || !data.success) {
        if (errorMsg) {
          // Show what actually happened so problems can be diagnosed instead of guessed.
          errorMsg.textContent = data.error
            || `The sign-in service did not respond correctly (HTTP ${res.status}${raw ? ': ' + raw.replace(/\s+/g, ' ').slice(0, 120) : ''}).`;
          errorMsg.style.display = 'block';
        }
        return;
      }

      applySession(data);
      previewRole = null;
      loginForm.reset();
      if (passwordInput) passwordInput.type = 'password';
      if (passwordToggle) passwordToggle.textContent = 'Show';
      toast(`Welcome, ${data.user.name} (${data.user.role})!`);
      checkAuth();
      // Land on the first module this role can open
      const target = location.hash.slice(1);
      const def = pages.find(p => p[0] === target);
      if (!def || (def[3] && !hasPermission(def[3]))) location.hash = (pages.find(p => hasPermission(p[3])) || pages[0])[0];
      render();
      bootSync();
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Could not reach the server. Please try again.';
        errorMsg.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      }
    }
  };
}

window.addEventListener('hashchange', () => {
  document.body.classList.remove('nav-open');
  if (location.hash === '#security') auditEntries = null; // always show the latest audit trail
  if (location.hash === '#overview' || location.hash === '') setupStatus = null;
  if (location.hash === '#calls') callLogs = null;
  if (location.hash === '#team') serverUsers = null; // and the latest team accounts
  if (location.hash === '#stores') contactInbox = null; // and new contact messages
  if (location.hash === '#shipping' || location.hash === '#carriers') { shipmentList = null; carrierList = null; } // and fresh carrier updates
  render();
  window.scrollTo(0, 0);
});

// Cross-tab synchronization
window.addEventListener('storage', e => {
  if (e.key === SESSION_KEY) {
    // Signed in or out in another tab
    if (!getSession()) handleSessionExpired();
    else { checkAuth(); render(); }
    return;
  }
  if (!e.key || e.key === KEY) {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) db = JSON.parse(raw);
      render();
    } catch {}
  }
});

// Listen for interactive messages from preview iframe (in-context visual editing & reordering)
window.addEventListener('message', event => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'ROSAINO_PREVIEW_ELEMENT_CLICKED') {
    handlePreviewElementClicked(data);
  } else if (data.type === 'ROSAINO_PREVIEW_INLINE_EDIT') {
    handlePreviewInlineEdit(data);
  } else if (data.type === 'ROSAINO_PREVIEW_REORDER_SECTION') {
    moveSection(data.sectionId, data.delta);
  }
});

// Initial boot check: check server for latest products & orders
async function bootSync() {
  if (!getSession()) return;
  if (!(await refreshSession()) && !getSession()) return;
  checkAuth();
  render();
  try {
    const [pRes, oRes, poRes] = await Promise.all([
      fetch('/api/products').catch(() => null),
      fetch('/api/orders').catch(() => null),
      fetch('/api/purchase-orders').catch(() => null)
    ]);
    if (pRes && pRes.ok) {
      const prods = await pRes.json();
      if (Array.isArray(prods)) db.products = prods;
    }
    // The server is the source of truth, even when a list is empty.
    let serverOrders = db.orders;
    if (oRes && oRes.ok) {
      const ords = await oRes.json();
      if (Array.isArray(ords)) serverOrders = db.orders = ords.map(o => ({ notes: [], ...o }));
    }
    if (poRes && poRes.ok) {
      const pos = await poRes.json();
      if (Array.isArray(pos)) db.purchaseOrders = pos;
    }
    // Pages edited only in this browser so far are sent up by the next sync.
    const pages = (hasPermission('cms') || hasPermission('products')) ? await api('/api/cms').catch(() => ({})) : {};
    db.cmsPages = { ...(db.cmsPages || {}), ...pages };

    // With a real database, the samples the portal ships with are removed and
    // shared lists come from the server (lists only in this browser are sent up).
    const live = (await fetch('/api/health').then(r => r.json()).catch(() => ({}))).database === 'connected';
    const workspace = await api('/api/workspace').catch(() => ({}));
    for (const name of Object.keys(WORKSPACE_LISTS)) {
      if (Array.isArray(workspace[name])) db[name] = workspace[name];
      else if (live && Array.isArray(db[name]) && SAMPLE_RECORDS[name]) db[name] = db[name].filter(x => !SAMPLE_RECORDS[name](x));
    }
    if (live) {
      db.pages = (db.pages || []).filter(x => !SAMPLE_RECORDS.pages(x));
      const sampleTeam = { usr_admin: 'Operations Admin', usr_ops: 'Lina Benali', usr_agent: 'Sara Amrani', usr_finance: 'Tariq Mansouri' };
      db.agents = (db.agents || []).filter(a => sampleTeam[a.id] !== a.name);
      const bl = await api('/api/blacklist').catch(() => null);
      if (bl && Array.isArray(bl.blacklistedPhones)) db.blacklistedPhones = bl.blacklistedPhones;
    }
    markSynced(serverOrders, pages, workspace);
    persist();
    render();
  } catch {}

  refreshDbPill();
}

// Header pill: is the portal saving to the Postgres database or running in memory?
function refreshDbPill() {
  api('/api/setup-status').then(st => {
    setupStatus = st;
    const pill = $('#supabase-status-pill');
    if (!pill) return;
    pill.classList.toggle('warn', !st.database);
    $('#supabase-pill-text').textContent = st.database ? 'Database connected' : st.databaseConfigured ? 'Database error' : 'Database not connected';
    pill.title = st.database ? 'Saving to Supabase Postgres' : st.databaseError || 'Set DATABASE_URL so data survives restarts';
  }).catch(() => {});
}

checkAuth();
render();
persist();
bootSync();
