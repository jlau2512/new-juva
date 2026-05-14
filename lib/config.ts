// Site-wide configuration. Update these once a domain + Apps Script are ready.
export const SITE = {
  name: 'JUVA',
  tagline: {
    en: 'We give birth to brands, websites & apps.',
    fr: 'Nous donnons vie à vos marques, sites et applications.',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://juva.design',
  email: 'hello@juva.design',
  phone: '+230 5968 6136',
  whatsapp: '23059686136', // wa.me digits, no plus
  city: 'Rose-Belle',
  country: 'Mauritius',
  founded: '2022',
  // Replace with your deployed Google Apps Script Web App URL after running setup.
  // See GOOGLE_APPS_SCRIPT.js + SETUP.md for the 15-minute walkthrough.
  formEndpoint:
    process.env.NEXT_PUBLIC_FORM_ENDPOINT ||
    'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
} as const;
