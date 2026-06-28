// Stub for now — real nodemailer transport + HTML templates land in Step 9.
// Callers wrap these in their own try/catch (a failed email must never
// fail an order), so these just need to resolve or throw, nothing fancier.
const sendOrderConfirmation = async (order, user) => {
  console.log(`[email stub] Confirmation commande ${order._id} → ${user.email}`);
};

const sendAdminOrderAlert = async (order, user) => {
  console.log(`[email stub] Alerte admin nouvelle commande ${order._id} (client : ${user.name})`);
};

module.exports = { sendOrderConfirmation, sendAdminOrderAlert };
