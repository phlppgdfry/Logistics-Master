import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "YardExx <noreply@yardexx.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Plain-text preview for the console fallback. `[^<>]*` keeps the match linear, and
// repeating until nothing changes also removes tags that a single pass would rebuild.
function stripTags(html: string): string {
  let prev: string;
  let out = html;
  do {
    prev = out;
    out = out.replace(/<[^<>]*>/g, "");
  } while (out !== prev);
  return out.replace(/[<>]/g, "");
}

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n${stripTags(html)}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

function base(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:Inter,system-ui,sans-serif;background:#f4f6f9;margin:0;padding:40px 20px}
    .card{background:#fff;border-radius:16px;padding:32px;max-width:540px;margin:0 auto;border:1px solid #e8edf4}
    .logo{font-size:1.3rem;font-weight:900;color:#0a1628;margin-bottom:24px}
    .logo em{font-style:normal;color:#00c9a7}
    h2{font-size:1.2rem;color:#0a1628;margin:0 0 12px;font-weight:800}
    p{color:#4a5568;font-size:.9rem;line-height:1.6;margin:0 0 12px}
    .btn{display:inline-block;background:#00c9a7;color:#0a1628;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:.9rem;margin:16px 0}
    .highlight{background:#f4f6f9;border-radius:10px;padding:16px;margin:16px 0}
    .highlight strong{color:#0a1628;font-size:.9rem;display:block;margin-bottom:4px}
    .highlight span{color:#8a96a8;font-size:.82rem}
    .lock{background:rgba(0,201,167,.08);border:1px solid rgba(0,201,167,.2);border-radius:8px;padding:10px 14px;font-size:.8rem;color:#009e84;margin:16px 0}
    .footer{text-align:center;color:#8a96a8;font-size:.75rem;margin-top:24px}
  </style></head><body>
  <div class="card">
    <div class="logo">Yard<em>Exx</em></div>
    ${content}
    <div class="footer">© 2026 YardExx · Benelux Terminalcapaciteit Marketplace</div>
  </div></body></html>`;
}

export async function sendNewRequestEmail(to: string, listing: {
  capacityType: string; region: string; volumeM2: number;
}) {
  const html = base(`
    <h2>Nieuwe aanvraag op jouw listing</h2>
    <p>Een andere terminal heeft interesse in jouw listing. Hun identiteit is verborgen tot je accepteert.</p>
    <div class="highlight">
      <strong>${listing.capacityType} · ${listing.volumeM2.toLocaleString("nl-BE")} m²</strong>
      <span>${listing.region}</span>
    </div>
    <div class="lock">🔒 Identiteit van de aanvrager wordt pas gedeeld na acceptatie.</div>
    <a href="${APP_URL}/dashboard" class="btn">Bekijk aanvraag in dashboard →</a>
    <p>Log in op je dashboard om de aanvraag te accepteren of weigeren.</p>
  `);
  await send(to, "Nieuwe aanvraag op jouw YardExx listing", html);
}

export async function sendRequestAcceptedEmail(to: string, data: {
  listing: { capacityType: string; region: string; volumeM2: number };
  partnerTerminalName: string;
  partnerEmail: string;
}) {
  const html = base(`
    <h2>🎉 Jouw aanvraag is geaccepteerd!</h2>
    <p>De deal is bevestigd. Hieronder vind je de contactgegevens van de andere terminal.</p>
    <div class="highlight">
      <strong>Terminal: ${data.partnerTerminalName}</strong>
      <span>E-mail: ${data.partnerEmail}</span>
    </div>
    <div class="highlight">
      <strong>${data.listing.capacityType} · ${data.listing.volumeM2.toLocaleString("nl-BE")} m²</strong>
      <span>${data.listing.region}</span>
    </div>
    <p>Neem rechtstreeks contact op om de logistieke details te bespreken.</p>
    <a href="${APP_URL}/dashboard" class="btn">Naar dashboard →</a>
  `);
  await send(to, "Deal geaccepteerd — YardExx", html);
}

export async function sendDealConfirmedToOwnerEmail(to: string, data: {
  listing: { capacityType: string; region: string; volumeM2: number };
  partnerTerminalName: string;
  partnerEmail: string;
}) {
  const html = base(`
    <h2>Deal bevestigd ✓</h2>
    <p>Je hebt een aanvraag geaccepteerd. De andere terminal is op de hoogte gesteld.</p>
    <div class="highlight">
      <strong>Jouw partner: ${data.partnerTerminalName}</strong>
      <span>E-mail: ${data.partnerEmail}</span>
    </div>
    <div class="highlight">
      <strong>${data.listing.capacityType} · ${data.listing.volumeM2.toLocaleString("nl-BE")} m²</strong>
      <span>${data.listing.region}</span>
    </div>
    <a href="${APP_URL}/dashboard" class="btn">Naar dashboard →</a>
  `);
  await send(to, "Deal bevestigd — YardExx", html);
}

export async function sendTerminalRegisteredEmail(adminEmail: string, data: {
  terminalName: string; region: string; userEmail: string;
}) {
  const html = base(`
    <h2>Nieuwe terminal aanvraag</h2>
    <div class="highlight">
      <strong>${data.terminalName}</strong>
      <span>${data.region} · ${data.userEmail}</span>
    </div>
    <a href="${APP_URL}/admin/terminals" class="btn">Verifieer terminal in admin →</a>
  `);
  await send(adminEmail, `Nieuwe terminal aanvraag: ${data.terminalName}`, html);
}

export async function sendTerminalVerifiedEmail(to: string, terminalName: string) {
  const html = base(`
    <h2>Je terminal is geverifieerd ✓</h2>
    <p>Welkom bij YardExx! <strong>${terminalName}</strong> is nu geverifieerd en je kan direct listings plaatsen en reageren op aanbiedingen.</p>
    <a href="${APP_URL}/dashboard" class="btn">Start nu op YardExx →</a>
  `);
  await send(to, "Terminal geverifieerd — welkom bij YardExx!", html);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = base(`
    <h2>Wachtwoord resetten</h2>
    <p>Je hebt een wachtwoordreset aangevraagd. Klik op de knop hieronder om je wachtwoord te wijzigen. Deze link is 1 uur geldig.</p>
    <a href="${resetUrl}" class="btn">Reset wachtwoord →</a>
    <p>Heb je dit niet aangevraagd? Negeer dan deze e-mail.</p>
  `);
  await send(to, "Wachtwoord resetten — YardExx", html);
}
