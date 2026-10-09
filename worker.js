// Cloudflare: serves the static site and handles the contact form.
import { handleContact, json } from './lib/contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/kontakt') {
      if (request.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
