export const MAIN_DOMAIN = 'resumeforgeai.in';
export const BASE_URL = process.env.NODE_ENV === 'production'
    ? `https://${MAIN_DOMAIN}`
    : 'http://localhost:3000';
