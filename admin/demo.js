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
    orders: 'Commandes & Prospects',
    calls: 'Centre d\'appels',
    routing: 'Routage des prospects',
    shipping: 'Expédition & Colis',
    carriers: 'Transporteurs',
    products: 'Produits & Stock',
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
    orders: 'Leads & Orders',
    calls: 'Call Center',
    routing: 'Lead Routing',
    shipping: 'Shipping & Labels',
    carriers: 'Carriers',
    products: 'Products & Stock',
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
    orders: 'الطلبيات والعملاء',
    calls: 'مركز الاتصال والتأكيد',
    routing: 'توزيع الطلبيات',
    shipping: 'الشحن والتوصيل',
    carriers: 'شركات التوصيل',
    products: 'المنتجات والمخزون',
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
    case 'integrations': return `<svg ${s}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
    case 'security': return `<svg ${s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
    case 'team': return `<svg ${s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case 'settings': return `<svg ${s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    default: return `<svg ${s}><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

const pages = [
  ['overview', 'overview', 'Overview', 'overview'],
  ['orders', 'orders', 'Leads & orders', 'orders'],
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
    localStorage.setItem(KEY, JSON.stringify(db));
    window.dispatchEvent(new Event('storage'));
  } catch {
    toast('Browser storage is unavailable; changes last until this page closes.');
  }
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
const reserved = id => db.orders.filter(o => String(o.product) === String(id) && o.status === 'Confirmed').reduce((s, o) => s + o.quantity, 0);
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
      badge: '<span class="trust-pill risk" title="Blacklisted / High Return Risk">⛔ Blacklisted</span>',
      label: 'Blacklisted Serial Refuser',
      score: 10,
      isRisk: true
    };
  }

  const past = db.orders.filter(o => cleanPhone(o.phone) === cPhone && o.id !== orderId);
  if (past.length === 0) {
    return {
      type: 'new',
      badge: '<span class="trust-pill new" title="First Time Buyer">✨ New</span>',
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
      badge: `<span class="trust-pill risk" title="Refused ${returned} past parcels">⚠️ Risk (${returned} Returns)</span>`,
      label: `Serial Refuser (${returned} past returns)`,
      score: 20,
      isRisk: true
    };
  }

  if (delivered >= 2 && returned === 0) {
    return {
      type: 'vip',
      badge: `<span class="trust-pill vip" title="VIP Buyer (${delivered} delivered)">🟢 VIP (${delivered})</span>`,
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

function checkDuplicateOrder(order) {
  const cPhone = cleanPhone(order.phone);
  return db.orders.some(o =>
    o.id !== order.id &&
    cleanPhone(o.phone) === cPhone &&
    String(o.product) === String(order.product) &&
    o.status !== 'Cancelled'
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
      const cleanP = cleanPhone(o.phone);
      const waMsg = encodeURIComponent(`Hello ${o.customer}, this is Rosaino Confirmation regarding your order ${o.id} for ${p?.name || 'your items'} (${money(o.amount)} COD). Please reply YES to confirm your delivery address in ${o.city}.`);

      return `
        <tr>
          <td>
            <b>${esc(o.id)}</b>
            <small>${esc(o.customer)} · ${esc(o.phone)}</small>
            ${isDup ? '<span class="trust-pill duplicate" title="Duplicate lead detected with same phone & product">⚠️ Duplicate</span>' : ''}
          </td>
          <td>
            ${esc(p?.name || o.product)}
            <small>${o.quantity} unit(s) · ${esc(o.source)}</small>
          </td>
          <td>${esc(o.city)}</td>
          <td><b>${money(o.amount)}</b></td>
          <td>${trust.badge}</td>
          <td>${badge(o.status)}</td>
          <td style="white-space:nowrap;">
            <button data-action="order" data-id="${esc(o.id)}">Details ↗</button>
            <a href="https://wa.me/212${cleanP.replace(/^0/, '')}?text=${waMsg}" target="_blank" rel="noopener" class="btn-wa" title="Send WhatsApp Confirmation">WA 💬</a>
            <button data-action="awb" data-id="${esc(o.id)}" title="Print Thermal Shipping Label">AWB 🏷️</button>
          </td>
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
      <div class="mini-icon" style="background:#fee2e2;color:#dc2626;margin:0 auto 16px;">🔒</div>
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
    [setupStatus.email, 'Contact form emails', 'Customer messages are emailed to you through Resend (RESEND_API_KEY in Vercel).', '', ''],
    [setupStatus.database, 'Database connected', 'Accounts, carriers and tracking are saved in Supabase (DATABASE_URL in Vercel).', '', ''],
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
    'A clear view of your day.',
    'From first lead to doorstep. Connected to Supabase Cloud Database & Public Customer Tracking.',
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
          <strong style="color:#b45309;">⚠️ Duplicate Lead Detection Active:</strong>
          <span style="font-size:13px;color:#78350f;"> Found ${duplicates.length} potential duplicate orders placed with matching phone numbers.</span>
        </div>
        <button data-action="filter-duplicates" style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">Filter Duplicates 🔍</button>
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
function calls() {
  const a = agent(selectedAgent) || db.agents[0];
  const queue = db.orders.filter(o => o.agent === a.id && ['New', 'Callback'].includes(o.status));
  const history = db.calls.filter(c => c.agent === a.id);

  return title(
    'Conversations that convert.',
    'A focused workspace with customer trust scores & WhatsApp integration.',
    `<select id="agent-select" aria-label="Agent">${db.agents.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${esc(x.name)} (${esc(x.role)})</option>`).join('')}</select><button data-action="pause">${a.status === 'Paused' ? 'Resume agent' : 'Pause agent'}</button>`
  ) + `
    <div class="metrics">
      ${metric('In your queue', queue.length, 'Assigned new leads & callbacks')}
      ${metric('Calls completed', history.length, 'Recorded in this session')}
      ${metric('Confirmed', history.filter(c => c.outcome === 'Confirmed').length, 'Confirmation outcomes')}
      ${metric('Agent status', a.status, 'Change with the pause control')}
    </div>
    <div class="grid">
      <div class="panel">
        <h2>Next in your queue</h2>
        ${queue.length ? `
          <div class="call-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="eyebrow">${esc(queue[0].id)} · SOURCE: ${esc(queue[0].source)}</span>
              ${getTrustInfo(queue[0].phone, queue[0].id).badge}
            </div>
            <h2>${esc(queue[0].customer)}</h2>
            <p>
              ${esc(product(queue[0].product)?.name || queue[0].product)} · ${money(queue[0].amount)}<br>
              ${esc(queue[0].city)} · <strong>${esc(queue[0].phone)}</strong>
            </p>
            ${queue[0].callback ? `<p>Scheduled Callback: <b>${esc(queue[0].callback)}</b></p>` : ''}
            <div style="display:flex;gap:10px;margin-top:16px;">
              <button class="primary" data-action="call" data-id="${queue[0].id}" ${a.status === 'Paused' ? 'disabled' : ''}>
                ◉ Start simulated call
              </button>
              <a href="https://wa.me/212${cleanPhone(queue[0].phone).replace(/^0/, '')}?text=${encodeURIComponent('Hello ' + queue[0].customer + ', Rosaino confirmation team regarding order ' + queue[0].id)}" target="_blank" rel="noopener" class="btn-wa">
                WhatsApp 💬
              </a>
            </div>
          </div>
        ` : '<div class="empty">Your queue is clear.</div>'}
        <h2>Recent call history</h2>
        ${table(['Order', 'Outcome', 'Duration'], history.slice(0, 5).map(c => `<tr><td>${esc(c.order)}</td><td>${badge(c.outcome)}</td><td>${c.seconds}s</td></tr>`))}
      </div>
      <div class="panel">
        <h2>Assigned leads</h2>
        ${queue.map(o => `
          <div class="queue">
            <div>
              <b>${esc(o.customer)}</b>
              <p class="info">${esc(o.id)} · ${esc(o.city)} · ${esc(o.source)}</p>
            </div>
            <button data-action="order" data-id="${o.id}">${esc(o.status)} ↗</button>
          </div>
        `).join('') || '<p class="info">Assign leads from Orders or Lead routing.</p>'}
      </div>
    </div>
  `;
}

// 4. Routing
function routing() {
  return title(
    'The right lead. The right agent.',
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
    const label = `<button data-action="awb" data-id="${esc(o.id)}">Label</button>`;
    if (o.status === 'Confirmed') return `<button class="primary" data-action="dispatch" data-id="${esc(o.id)}">Dispatch</button> ${label}`;
    if (o.status === 'In transit') {
      return `${label} <button data-action="deliver" data-id="${esc(o.id)}" title="${s ? 'Record it yourself if the carrier has not updated it yet' : ''}">Mark delivered</button> <button data-action="return" data-id="${esc(o.id)}">Mark returned</button>`;
    }
    return `${label} <a class="btn-link" href="/track?id=${encodeURIComponent(o.id)}" target="_blank">Tracking page ↗</a>`;
  };

  return title(
    'Every doorstep, accounted for.',
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
const CARRIER_PRESETS = ['Digylog', 'OzoneExpress', 'AMEEX', 'Sendit', 'Cathedis', 'Amana', 'Other'];

function carriers() {
  if (!carrierList) loadCarriers().then(() => page === 'carriers' && render());
  if (!shipmentList) loadShipments().then(() => page === 'carriers' && render());
  const manage = canManageCarriers();
  const list = carrierList || [];
  const count = (c, st) => (shipmentList || []).filter(s => s.carrierId === c.id && s.status === st).length;

  return title(
    'Your delivery partners.',
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
                <p>${c.kind === 'api' ? 'Connected by API' : 'Manual (no API)'} · ${c.active ? badge('Active') : badge('Paused')}</p>
              </div>
            </div>
            <div class="stat-line"><span>In transit</span><b>${count(c, 'In transit')}</b></div>
            <div class="stat-line"><span>Delivered</span><b>${count(c, 'Delivered')}</b></div>
            <div class="stat-line"><span>Returned</span><b>${count(c, 'Returned')}</b></div>
            ${c.kind === 'api' ? `<div class="stat-line"><span>API key</span><b>${esc(c.keyHint || 'not set')}</b></div>` : ''}
            <label class="copy-field">Status update link (give this to ${esc(c.name)})
              <span><input readonly value="${esc(c.webhookUrl)}" aria-label="Webhook link for ${esc(c.name)}"><button type="button" data-action="copy-webhook" data-id="${esc(c.id)}">Copy</button></span>
            </label>
            ${manage ? `
              <div class="actions" style="margin-top:14px;">
                ${c.kind === 'api' ? `<button data-action="test-carrier" data-id="${esc(c.id)}">Test connection</button>` : ''}
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
      <label class="full">How do you work with this carrier?
        <select name="kind">
          <option value="api" ${c?.kind !== 'manual' ? 'selected' : ''}>They have an API: send orders automatically</option>
          <option value="manual" ${c?.kind === 'manual' ? 'selected' : ''}>No API: I'll type tracking numbers myself</option>
        </select>
      </label>
      <label class="full api-only">API URL (from the carrier's developer documentation)<input name="baseUrl" value="${esc(cfg.baseUrl || '')}" placeholder="https://api.carrier.ma/v1"></label>
      <label class="full api-only">API key<input name="apiKey" type="password" autocomplete="off" placeholder="${c?.hasKey ? `Leave empty to keep the saved key (${esc(c.keyHint)})` : 'Paste the key from your carrier account'}"></label>
    </div>
    <details class="api-only advanced">
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
  const sync = () => form.querySelectorAll('.api-only').forEach(el => { el.style.display = form.kind.value === 'api' ? '' : 'none'; });
  form.kind.onchange = sync;
  const preset = form.querySelector('[data-preset-select]');
  const nameInput = form.elements.namedItem('name'); // form.name is the form's own attribute
  if (preset) preset.onchange = () => { nameInput.value = preset.value === 'Other' ? '' : preset.value; nameInput.focus(); };
  if (preset && !nameInput.value) nameInput.value = preset.value;
  sync();
}

function carrierPayload(f) {
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
    <div class="stat-line"><span>Parcel</span><b>${o.quantity} × ${esc(p?.name || o.product)} · ${money(o.amount)} cash on delivery</b></div>
    <div class="form-grid" style="margin-top:16px;">
      <label class="full">Carrier
        <select name="carrierId">${options.map(c => `<option value="${esc(c.id)}" data-kind="${c.kind}" ${c.name === o.carrier ? 'selected' : ''}>${esc(c.name)}${c.kind === 'manual' ? ' (manual)' : ''}</option>`).join('')}</select>
      </label>
      <label class="full manual-only">Tracking number from the carrier<input name="trackingNumber" maxlength="80" placeholder="e.g. AMX-2026-00123"></label>
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
      order: { id: o.id, customer: o.customer, phone: o.phone, city: o.city, address: o.address, amount: o.amount, quantity: o.quantity, productName: p?.name || '', date: o.date, note: (o.notes || []).slice(-1)[0]?.text || '' }
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
    $('#dialog-form button.primary').textContent = kind === 'manual' ? 'Record dispatch' : 'Send to carrier';
  };
  form.carrierId.onchange = syncKind;
  syncKind();
}

// 6. Products & Stock
function products() {
  return title(
    'Stock you can count on.',
    'Manage product pricing, available units and true landed costs. Storefront and Supabase adapt immediately.',
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
        <div class="upload-icon-circle">📷</div>
        <p class="upload-text-main">${t('upload_image')}: ${label}</p>
        <p class="upload-text-sub">${hintText || t('upload_hint')} · JPG, PNG, WebP</p>
      </div>

      <input type="hidden" name="${fieldName}" id="cms-input-${fieldName}" value="${esc(currentSrc || '')}">

      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;color:#789096;margin-top:6px;">
        <span>Presets:</span>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/collection.png" style="font-size:11px;padding:4px 8px;">Collection 🖼️</button>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/pattern.png" style="font-size:11px;padding:4px 8px;">Pattern 🖼️</button>
        <button type="button" data-action="pick-image-field" data-field="${fieldName}" data-src="/assets/ribbon.png" style="font-size:11px;padding:4px 8px;">Ribbon 🖼️</button>
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
          💾 ${t('save_cms')}
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
          🌐 ${t('target_language')}
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
          ⚡ Flash COD
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-preset" data-preset="minimal" title="Clean minimalist luxury layout">
          ✨ Minimal Luxury
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-preset" data-preset="bundles" title="Quantity bundles layout to boost average order value">
          📦 Bundle Booster
        </button>
        <button type="button" class="btn-cms-lang" data-action="apply-lang-template" data-lang="${targetLang}" title="Load idiomatic high-converting copy in ${targetLang.toUpperCase()}">
          ✨ ${t('auto_translate')} ${targetLang.toUpperCase()}
        </button>
      </div>
    </div>

    <!-- Ad Manager Boost Link Generator Banner (Collapsible) -->
    <details class="panel" style="border: 2px solid #147d86;background:#fcfefe;margin-bottom:20px;">
      <summary style="cursor:pointer;padding:8px 0;font-weight:700;color:#147d86;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:inline-flex;align-items:center;gap:8px;">
          <span>🎯</span> Ad Manager Boost Link & UTM Attribution (Meta, TikTok, Snapchat)
        </span>
        <span style="font-size:12px;text-decoration:underline;">Click to expand / collapse ▾</span>
      </summary>
      
      <div style="margin-top:14px;border-top:1px solid #e1eeec;padding-top:14px;">
        <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px;">
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
              Copy Link 📋
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
                    <span class="section-icon">${def.icon}</span>
                    <div class="section-meta">
                      <h3>
                        ${esc(titleText)}
                        ${!isEnabled ? '<span class="badge" style="background:#fee2e2;color:#b91c1c;font-size:10px;">Hidden</span>' : ''}
                      </h3>
                      <p>${esc(descText)}</p>
                    </div>
                    <div class="section-actions">
                      <button type="button" class="btn-icon-action ${isEnabled ? 'toggle-active' : 'toggle-inactive'}" data-action="toggle-section" data-id="${secId}" title="${isEnabled ? 'Click to hide section' : 'Click to show section'}">
                        ${isEnabled ? '👁️' : '👁️‍🗨️'}
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
              💾 ${t('save_cms')}
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
              <span>👁️</span> ${t('live_preview')}
            </span>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="btn-visual-mode ${visualEditMode ? 'active' : ''}" data-action="toggle-visual-edit-mode" title="Toggle interactive in-preview editing">
                <span>✏️</span> ${visualEditMode ? 'Visual Edit ON' : 'Visual Edit Mode'}
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
              <span style="font-size:15px;">💡</span>
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
            <span>⚡ Updates in real-time as you drag or edit</span>
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
              <span>📝</span> Moroccan Express COD Form Fields Builder
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
            const typeIcons = { text: '🔤', tel: '📞', select: '📍', textarea: '📝', checkbox: '☑️', number: '🔢' };
            const icon = typeIcons[f.type] || '🏷️';

            return `
              <div class="cod-field-item ${!isEnabled ? 'disabled-field' : ''} ${isExpanded ? 'expanded' : ''}" data-field-id="${esc(f.id)}" draggable="true">
                <div class="cod-field-head">
                  <span class="drag-handle cod-drag-handle" title="Drag to reorder field">⠿</span>
                  <span style="font-size:13px;">${icon}</span>
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
                      ${isEnabled ? '👁️' : '👁️‍🗨️'}
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
                      🗑️
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
              <button type="button" class="btn-icon-action" data-action="delete-feature" data-id="${i}" title="Delete feature" style="color:#b91c1c;font-size:11px;padding:2px 6px;">🗑️</button>
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
              <button type="button" class="btn-icon-action" data-action="delete-review" data-id="${i}" title="Delete testimonial" style="color:#b91c1c;font-size:11px;padding:2px 6px;">🗑️</button>
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
              <button type="button" class="btn-icon-action" data-action="delete-faq" data-id="${i}" title="Delete FAQ" style="color:#b91c1c;font-size:11px;padding:2px 6px;">🗑️</button>
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
    'Sourcing & Supply Chain.',
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
    'Know what comes back.',
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
    'Courier Cash Remittance Audit',
    'Track collected COD cash in courier accounts, audit bank transfers, and eliminate courier payment leakage.',
    `<button class="primary" data-action="reconcile-modal">💵 Batch Mark as Remitted</button><button data-action="dispute-statement">📄 Courier Claim Statement</button>`
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
              <div class="mini-icon" style="background:#eaf4f7;color:#147d86;">🚚</div>
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
                ${isOvercharged ? `<small style="color:#dc2626;font-weight:700;">⚠️ +${fee - 35} MAD Overcharge</small>` : '<small style="color:#16a34a;">Standard Tariff</small>'}
              </td>
              <td><b>${money(netDue)}</b></td>
              <td>
                ${isRemitted ? `
                  <span class="badge delivered">✓ Settled in Bank</span>
                  <small style="color:#16a34a;">${esc(o.remittanceRef || 'Wire Received')}</small>
                ` : isOverdue ? `
                  <span class="badge returned">⛔ Overdue (>7d)</span>
                  <small style="color:#dc2626;">Cash with Courier</small>
                ` : `
                  <span class="badge in-transit">⏳ Pending Payout</span>
                  <small>Standard cycle</small>
                `}
              </td>
              <td>
                ${!isRemitted ? `
                  <button data-action="single-remit" data-id="${o.id}" class="primary" style="font-size:11px;padding:6px 10px;">
                    Mark Settled 💵
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
    'Turn activity into understanding.',
    'Live unit economics, campaign attribution, and Delivered ROAS truth.',
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
    'Your storefront ecosystem.',
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
    'Bring your tools together.',
    'Supabase Cloud Database & external delivery/ad connectors.'
  ) + `
    <div class="panel" style="border: 2px solid #147d86;background:#f9fdfc;">
      <div class="panel-head">
        <div>
          <span class="badge active" style="margin-bottom:6px;">PRIMARY DATABASE</span>
          <h2>Supabase PostgreSQL Database</h2>
          <p>Project URL: <code>https://kwqbghlwarkibhlgbgft.supabase.co</code></p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="primary" data-action="view-schema">View SQL Schema ↗</button>
          <button data-action="test-supabase">Test Live Sync ↺</button>
        </div>
      </div>
      <p class="info" style="line-height:1.7;">
        Your Rosaino app is configured with Supabase publishable credentials. To populate tables in your Supabase project, execute the bundled SQL schema in your Supabase SQL editor.
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
                      ${isSuper ? '<br><small style="color:#147d86;">★ Always has every permission</small>' : ''}
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
    'A team in sync.',
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
  return title('Security & audit.', 'Who signed in, and who changed what. Recorded on the server.', '<button data-action="refresh-audit">Refresh</button>') + `
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
  return title('System & workspace settings.', 'Your account, workspace preferences and database connection.') + `
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

const views = { overview, orders, calls, routing, shipping, carriers, products, cms, suppliers, finance, reconciliation, reports, stores, integrations, team, security, settings };

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
    const dataUrl = evt.target.result;
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
      }
    }).catch(() => {});

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
    orders: { fr: 'VENTES', en: 'SALES', ar: 'المبيعات' },
    shipping: { fr: 'LIVRAISON', en: 'DELIVERY', ar: 'التوصيل' },
    products: { fr: 'CATALOGUE', en: 'CATALOGUE', ar: 'المنتجات' },
    finance: { fr: 'FINANCE', en: 'FINANCE', ar: 'المالية' },
    stores: { fr: 'ESPACE', en: 'WORKSPACE', ar: 'المساحة' }
  };
  let pendingGroup = '';
  $('#nav').innerHTML = pages.map(([id, icon, name, perm]) => {
    if (groupStarts[id]) pendingGroup = groupStarts[id][currentLang] || groupStarts[id].en;
    if (!hasPermission(perm)) return '';
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

  // Check RBAC permission for this view
  if (!hasPermission(reqPerm)) {
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
  if (page === 'calls') {
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
  const p = product(o.product);
  if (p) {
    if (next === 'Confirmed' && p.stock - reserved(p.id) < o.quantity) {
      throw Error('Not enough available stock to confirm this order.');
    }
    if (next === 'In transit') {
      if (p.stock < o.quantity) throw Error('Not enough stock to dispatch.');
      p.stock -= o.quantity;
      o.stockDeducted = true;
    }
    if (next === 'Returned' && o.stockDeducted) {
      p.stock += o.quantity;
      o.stockDeducted = false;
    }
  }
  o.status = next;
  log(`${o.id} moved to ${next}`);

  // Sync with backend API (Supabase)
  fetch(`/api/orders/${o.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: next, stock_deducted: o.stockDeducted })
  }).catch(() => {});
}

// Upgraded Order Dialog with Customer Trust, Duplicate Merge, WhatsApp, and Waybill
function orderDialog(id) {
  const o = db.orders.find(o => o.id === id);
  if (!o) return;
  const trust = getTrustInfo(o.phone, o.id);
  const isDup = checkDuplicateOrder(o);
  const p = product(o.product);
  const cleanP = cleanPhone(o.phone);
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
            <span>⚠️ Duplicate Order: Same customer has another active order for this item.</span>
            <button type="button" data-action="cancel-duplicate" data-id="${o.id}" style="font-size:11px;background:#fff;border:1px solid #d97706;color:#b45309;padding:4px 8px;">Cancel Duplicate</button>
          </div>
        ` : ''}
      </div>

      <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
        <a href="https://wa.me/212${cleanP.replace(/^0/, '')}?text=${waMsg}" target="_blank" rel="noopener" class="btn-wa">
          💬 Send WhatsApp Confirmation
        </a>
        <button type="button" data-action="awb" data-id="${o.id}">
          🏷️ Thermal 4x6 Label
        </button>
        <a href="/track?id=${encodeURIComponent(o.id)}" target="_blank" style="padding:7px 12px;border:1px solid #dce4e6;border-radius:6px;font-size:12px;display:inline-flex;align-items:center;font-weight:600;">
          🚚 Public Tracking Portal ↗
        </a>
        <button type="button" data-action="toggle-blacklist" data-phone="${esc(o.phone)}" style="font-size:12px;color:#ac3838;margin-left:auto;">
          ⛔ ${trust.type === 'risk' ? 'Unblacklist Phone' : 'Blacklist Customer'}
        </button>
      </div>

      <div class="form-grid">
        ${select('status', 'Status', choices, o.status)}
        ${select('agent', 'Assigned agent', [['', 'Unassigned'], ...db.agents.map(a => [a.id, a.name])], o.agent)}
        <label class="full">Callback time<input name="callback" type="datetime-local" value="${esc(o.callback)}"></label>
        <label class="full">Add note<textarea name="note" maxlength="1000"></textarea></label>
      </div>
      <div class="history">${o.notes.map(n => esc(n)).join('<br>') || 'No notes recorded.'}</div>
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
          <strong>ITEMS:</strong> ${esc(p?.name || o.product)} × ${o.quantity} (${esc(p?.sku || 'SKU-01')})
        </div>

        <div class="thermal-barcode"></div>
        <div style="text-align:center;font-size:12px;letter-spacing:2px;font-weight:700;">*${esc(o.id)}*</div>

        <div class="thermal-cod">
          COD TO COLLECT: ${money(o.amount)}
        </div>
      </div>
      <p style="text-align:center;"><button type="button" class="primary" onclick="window.print()">🖨️ Print Label on Thermal Printer</button></p>
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
        💡 <strong>Automatic Landed Cost Formula:</strong><br>
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

function call(id) {
  if (!checkAction('calls', 'Simulated call')) return;
  const o = db.orders.find(o => o.id === id);
  activeCall = { id, start: Date.now() };
  modal(
    'Simulated confirmation call',
    `
      <div class="call-card">
        <h2>${esc(o.customer)}</h2>
        <p>${esc(product(o.product)?.name)} · ${money(o.amount)} · ${esc(o.city)}</p>
        <div id="call-time" class="big">00:00</div>
        <small>No phone call is placed.</small>
      </div>
      <div class="form-grid">
        ${select('outcome', 'Call outcome', ['Confirmed', 'Callback', 'Cancelled', 'Spam'])}
        <label>Callback time<input type="datetime-local" name="callback"></label>
        <label class="full">Call notes<textarea name="note" maxlength="1000"></textarea></label>
      </div>
    `,
    'End call & save',
    f => {
      if (f.get('outcome') === 'Callback' && !f.get('callback')) throw Error('Choose a callback time.');
      changeStatus(o, f.get('outcome'));
      o.callback = f.get('callback');
      if (f.get('note').trim()) o.notes.push(f.get('note').trim());
      db.calls.unshift({
        order: id,
        agent: o.agent,
        outcome: f.get('outcome'),
        seconds: Math.max(1, Math.round((Date.now() - activeCall.start) / 1000)),
        date: new Date().toISOString()
      });
      clearInterval(timer);
      activeCall = null;
      toast('Call outcome saved');
    }
  );

  timer = setInterval(() => {
    const el = $('#call-time');
    if (el && activeCall) {
      const n = Math.floor((Date.now() - activeCall.start) / 1000);
      el.textContent = String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    }
  }, 1000);
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
      'Supabase Database SQL Schema',
      `
        <p class="info">Copy and paste this script into your Supabase SQL Editor (<a href="https://supabase.com/dashboard/project/kwqbghlwarkibhlgbgft/sql/new" target="_blank" rel="noopener">Open Supabase SQL Editor ↗</a>) to create the schema:</p>
        <textarea id="sql-schema-area" style="width:100%;height:320px;font-family:monospace;font-size:11px;background:#183243;color:#a3e635;padding:12px;border-radius:8px;" readonly>${esc(sql)}</textarea>
        <p><button type="button" id="copy-sql-btn" class="primary">📋 Copy SQL to Clipboard</button></p>
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
  toast('Testing Supabase Cloud connection...');
  try {
    const res = await fetch('/api/database/status');
    const data = await res.json();
    supabaseStatus = data;
    const pill = $('#supabase-pill-text');
    if (pill) {
      pill.textContent = data.mode === 'supabase_live' ? 'Supabase Live' : 'Supabase (Schema Pending)';
    }
    toast(`Supabase Status: ${data.connected ? 'Connected' : 'Offline'} · Tables: ${data.tables.products ? 'Ready' : 'Pending schema'}`);
  } catch (e) {
    toast('Failed to test Supabase connection: ' + e.message);
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
  'new-po': createPurchaseOrderModal,
  'receive-po': receivePO,
  export: exportOrders,
  import: importOrders,
  template: () => download('rosaino-lead-template.csv', 'customer,phone,city,sku,quantity\r\nDemo Customer,06 12 34 56 78,Casablanca,ROS-TECH-01,1', 'text/csv'),
  'new-product': () => editProduct(),
  'edit-product': id => editProduct(id),
  call,
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
    toast('📋 Ad Boost tracking link copied! Ready to paste into Meta/TikTok Ads Manager.');
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
      toast(`Phone ${cPhone} added to Serial Refuser Blacklist ⛔.`);
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
      'Confirm Bank Reconciliation 💵',
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
          <button type="button" class="primary" onclick="window.print()">🖨️ Print Claim Statement</button>
          <a class="btn-wa" href="https://wa.me/212600000000?text=${encodeURIComponent(`Hello Courier Accounts Manager, this is Rosaino Finance. Please find our Remittance Audit Statement for ${overdue.length} overdue parcels (${money(totalOverdueCash)} unremitted). Please process the bank wire today.`)}" target="_blank" rel="noopener">
            💬 Send to Courier Manager on WhatsApp
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
  activeCall = null;
});

$('#menu').onclick = () => document.body.classList.toggle('nav-open');

// Login form submission handler
const loginForm = $('#admin-login-form');
if (loginForm) {
  loginForm.onsubmit = async e => {
    e.preventDefault();
    const errorMsg = $('#login-error-msg');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (errorMsg) errorMsg.style.display = 'none';

    const formData = new FormData(loginForm);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

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
      toast(`Welcome, ${data.user.name} (${data.user.role})!`);
      checkAuth();
      // Land on the first module this role can open
      const target = location.hash.slice(1);
      const def = pages.find(p => p[0] === target);
      if (!def || !hasPermission(def[3])) location.hash = (pages.find(p => hasPermission(p[3])) || pages[0])[0];
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
        submitBtn.textContent = 'Sign In';
      }
    }
  };
}

window.addEventListener('hashchange', () => {
  document.body.classList.remove('nav-open');
  if (location.hash === '#security') auditEntries = null; // always show the latest audit trail
  if (location.hash === '#overview' || location.hash === '') setupStatus = null;
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
      if (Array.isArray(prods) && prods.length > 0) {
        db.products = prods;
      }
    }
    if (oRes && oRes.ok) {
      const ords = await oRes.json();
      if (Array.isArray(ords) && ords.length > 0) {
        db.orders = ords;
      }
    }
    if (poRes && poRes.ok) {
      const pos = await poRes.json();
      if (Array.isArray(pos) && pos.length > 0) {
        db.purchaseOrders = pos;
      }
    }
    persist();
  } catch {}

  testSupabaseSync();
}

checkAuth();
render();
persist();
bootSync();
