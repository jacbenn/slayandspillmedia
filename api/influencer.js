// Receives the influencer sign-up and emails it to you through Resend.
// Works on Vercel (as /api/influencer) and with the local server (npm start).
// Needs RESEND_API_KEY and CONTACT_EMAIL (same values as the Book Slayers site).

const PLATFORMS = ['Bookstagram', 'BookTok', 'BookTube', 'Blog', 'Other'];
const clean = (v, max = 1000) => String(v ?? '').trim().slice(0, max);
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => clean(x, 60));
const hasLink = (s) => /(https?:\/\/|www\.|<[^>]+>)/i.test(s);

async function handle(body) {
  // Spam: hidden field filled in, or form sent in under 3 seconds. Pretend it worked.
  if (clean(body.website) || Date.now() - Number(body.formLoadedAt) < 3000 || !Number(body.formLoadedAt)) {
    return { status: 200, json: { success: true } };
  }

  const d = {
    fullName: clean(body.fullName, 120),
    email: clean(body.email, 200),
    handle: clean(body.handle, 120),
    platform: clean(body.platform, 40),
    followerCount: clean(body.followerCount, 12),
    otherHandles: clean(body.otherHandles, 600),
    side: clean(body.side, 40),
    genres: list(body.genres),
    interestedIn: list(body.interestedIn),
    message: clean(body.message, 1500),
  };

  if (!d.fullName || !d.email || !d.handle || !d.platform || !d.followerCount || !d.side || !d.genres.length || !d.interestedIn.length) {
    return { status: 400, json: { error: 'Please fill in all required fields.' } };
  }
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return { status: 400, json: { error: 'Please enter a valid email address.' } };
  if (!PLATFORMS.includes(d.platform)) return { status: 400, json: { error: 'Please choose a valid platform.' } };
  if (!/^\d+$/.test(d.followerCount)) return { status: 200, json: { success: true } };
  if (hasLink(d.fullName) || hasLink(d.handle)) return { status: 200, json: { success: true } };

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    return { status: 500, json: { error: 'Email service is not configured.' } };
  }

  const text = [
    '=== THE BASICS ===',
    `Name: ${d.fullName}`,
    `Email: ${d.email}`,
    `Handle: ${d.handle}`,
    `Platform: ${d.platform}`,
    `Followers: ${d.followerCount}`,
    `Other handles/links: ${d.otherHandles || '-'}`,
    '',
    '=== WHAT THEY WANT ===',
    `Side: ${d.side}`,
    `Genres: ${d.genres.join(', ')}`,
    `Interested in: ${d.interestedIn.join(', ')}`,
    '',
    '=== MESSAGE ===',
    d.message || '-',
    '',
    '(Sent from the Slay and Spill the Book Media site)',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_EMAIL,
        reply_to: d.email,
        subject: `Influencer Sign-Up (both sites): ${d.handle} (${d.platform})`,
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return { status: 500, json: { error: 'Something went wrong sending your sign-up. Please try again.' } };
    }
    return { status: 200, json: { success: true } };
  } catch (err) {
    console.error('Resend exception:', err);
    return { status: 500, json: { error: 'Something went wrong sending your sign-up. Please try again.' } };
  }
}

// Vercel entry point
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method not allowed'); }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const out = await handle(body || {});
  res.statusCode = out.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(out.json));
};
module.exports.handle = handle;
