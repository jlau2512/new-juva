// Site-wide configuration. Update these once a domain + Apps Script are ready.
export const SITE = {
  name: 'JUVA',
  tagline: {
    en: 'We give birth to brands, websites & apps.',
    fr: 'Nous donnons vie à vos marques, sites et applications.',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://juva.design',
  email: 'hello@juva.design',
  phone: '+230 5793 6857', // primary — matches the Google Business Profile (NAP consistency)
  phone2: '+230 5968 6136', // secondary line (also the WhatsApp number)
  whatsapp: '23059686136', // wa.me digits, no plus (the 5968 6136 line)
  city: 'Rose-Belle',
  country: 'Mauritius',
  founded: '2022',
  // Form submissions go to /api/contact (Next.js route → Gmail via nodemailer).
  // GMAIL_USER and GMAIL_APP_PASSWORD must be set as Vercel env vars.
  formEndpoint: '/api/contact',
} as const;
