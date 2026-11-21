import { SITE } from '../config/site';

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
export const mailLink = (subject: string, body: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const productQuoteText = (name: string, ref: string) =>
  `Hola ${SITE.name}, quisiera recibir cotización de:\n• ${name} (Ref. ${ref})\n\nGracias.`;
