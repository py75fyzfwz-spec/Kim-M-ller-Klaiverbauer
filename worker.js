// Serves the static site and sends contact form messages via Resend.
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleContact(request, env) {
  if (!env.RESEND_API_KEY) return json({ success: false, message: 'Mail service not configured' }, 503);

  let data;
  try {
    data = await request.formData();
  } catch {
    return json({ success: false, message: 'Invalid form data' }, 400);
  }

  // Honeypot: bots fill the hidden field; pretend success and drop it
  if (data.get('botcheck')) return json({ success: true });

  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || name.length > 200 || email.length > 200 || message.length > 5000) {
    return json({ success: false, message: 'Invalid input' }, 400);
  }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `Neue Anfrage über die Website von ${name}`,
        text: `${message}\n\n—\n${name}\n${email}`,
      }),
    });
  } catch (error) {
    console.error('Resend unreachable', error);
    return json({ success: false, message: 'Sending failed' }, 502);
  }

  if (!response.ok) {
    console.error('Resend error', response.status, await response.text());
    return json({ success: false, message: 'Sending failed' }, 502);
  }
  return json({ success: true });
}
