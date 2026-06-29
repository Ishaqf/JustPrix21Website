const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatPrice = (amount) => `${Number(amount).toLocaleString('fr-FR')} DA`;

// Email clients strip external stylesheets and mishandle flexbox/grid, so
// templates use inline styles + table layout — the only combination that
// renders consistently across Gmail/Outlook/etc.
const emailWrapper = (bodyHtml) => `
  <div style="background-color:#F5EDE6; padding:32px 16px; font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px; margin:0 auto; background-color:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #F5EDE6;">
      <div style="background-color:#1A1A1A; padding:24px; text-align:center;">
        <span style="color:#D9A98A; font-size:22px; font-weight:bold;">JustPrix21</span>
      </div>
      <div style="padding:24px; color:#1A1A1A; line-height:1.5;">
        ${bodyHtml}
      </div>
      <div style="background-color:#F5EDE6; padding:16px 24px; text-align:center; color:#8A7A6E; font-size:12px;">
        JustPrix21 — Contactez-nous : ${process.env.ADMIN_EMAIL || ''}
      </div>
    </div>
  </div>
`;

const buttonHtml = (href, label) => `
  <a href="${href}" style="display:inline-block; margin:16px 0; padding:12px 28px; background-color:#D9A98A; color:#1A1A1A; text-decoration:none; border-radius:6px; font-weight:bold;">
    ${label}
  </a>
`;

// @desc  Generic sender — throws on failure so callers can catch
// independently (a failed email must never fail the action that sent it).
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const sendOrderConfirmation = async (order, user) => {
  const itemsRows = order.orderItems
    .map((item) => {
      const variantLabel = [item.variant?.size, item.variant?.color].filter(Boolean).join(' / ');
      return `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #F5EDE6;">
            <img src="${item.image}" alt="${item.name}" width="48" style="border-radius:4px; display:block;" />
          </td>
          <td style="padding:8px; border-bottom:1px solid #F5EDE6;">
            ${item.name}${variantLabel ? ` <span style="color:#8A7A6E;">(${variantLabel})</span>` : ''}
          </td>
          <td style="padding:8px; border-bottom:1px solid #F5EDE6; text-align:right; white-space:nowrap;">
            ${item.quantity} x ${formatPrice(item.price)}
          </td>
        </tr>`;
    })
    .join('');

  const body = `
    <h2 style="margin-top:0;">Commande confirmée ✓</h2>
    <p>Bonjour ${user.name},</p>
    <p>Merci pour votre commande ! Voici le récapitulatif :</p>
    <table width="100%" style="border-collapse:collapse; margin:16px 0;">${itemsRows}</table>
    <table width="100%">
      <tr><td>Sous-total</td><td style="text-align:right;">${formatPrice(order.subtotal)}</td></tr>
      <tr><td>Livraison</td><td style="text-align:right;">${formatPrice(order.shippingPrice)}</td></tr>
      <tr>
        <td style="font-weight:bold; padding-top:8px;">Total</td>
        <td style="text-align:right; font-weight:bold; padding-top:8px; color:#D9A98A;">${formatPrice(order.totalPrice)}</td>
      </tr>
    </table>
    <h3>Adresse de livraison</h3>
    <p style="color:#8A7A6E;">
      ${order.shippingAddress.fullName}<br/>
      ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
      ${order.shippingAddress.wilaya}, ${order.shippingAddress.country}<br/>
      ${order.shippingAddress.phone}
    </p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Commande confirmée ✓ — JustPrix21',
    html: emailWrapper(body),
  });
};

const sendAdminOrderAlert = async (order, user) => {
  const itemsList = order.orderItems
    .map((item) => `<li>${item.quantity} x ${item.name} — ${formatPrice(item.price)}</li>`)
    .join('');

  const orderUrl = `${process.env.CLIENT_ORIGIN}/orders/${order._id}`;

  const body = `
    <h2 style="margin-top:0;">Nouvelle commande reçue</h2>
    <p><strong>Client :</strong> ${user.name} (${order.shippingAddress.phone})</p>
    <p><strong>Wilaya :</strong> ${order.shippingAddress.wilaya}</p>
    <p><strong>Total :</strong> ${formatPrice(order.totalPrice)}</p>
    <p><strong>Paiement :</strong> ${order.paymentMethod}</p>
    <ul style="color:#8A7A6E;">${itemsList}</ul>
    ${buttonHtml(orderUrl, 'Voir la commande')}
  `;

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `Nouvelle commande — ${formatPrice(order.totalPrice)}`,
    html: emailWrapper(body),
  });
};

const sendPasswordResetEmail = async (user, resetUrl, expireMinutes) => {
  const body = `
    <h2 style="margin-top:0;">Réinitialisation du mot de passe</h2>
    <p>Bonjour ${user.name},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
    ${buttonHtml(resetUrl, 'Réinitialiser mon mot de passe')}
    <p style="color:#8A7A6E; font-size:14px;">
      Ce lien expire dans ${expireMinutes} minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation du mot de passe — JustPrix21',
    html: emailWrapper(body),
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendAdminOrderAlert,
  sendPasswordResetEmail,
};
