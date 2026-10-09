// Contact form handler shared by the Cloudflare Worker (worker.js) and the
// Vercel function (api/kontakt.js). Sends the message via Resend.
const DEFAULT_TO = 'kmt-pianos@t-online.de';
// Must use a domain verified in Resend
const DEFAULT_FROM = 'Website Kim Müller <kontakt@kim-mueller-klavierbaumeister.com>';

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// env needs RESEND_API_KEY, CONTACT_TO and CONTACT_FROM
export async function handleContact(request, env) {
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
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [env.CONTACT_TO || DEFAULT_TO],
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
