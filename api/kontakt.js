// Vercel: handles the contact form at /api/kontakt.
// Set RESEND_API_KEY under Project → Settings → Environment Variables.
import { handleContact, json } from '../lib/contact.js';

export function POST(request) {
  return handleContact(request, process.env);
}

export function GET() {
  return json({ success: false, message: 'Method not allowed' }, 405);
}
