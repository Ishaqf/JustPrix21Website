import api from './axios';

// Backend route doesn't exist yet — Step 11 (Yalidine delivery-rate
// estimation) was skipped, so this will 404 until that step is built.
// Shape matches what Step 19 (Checkout) is specced to call: live rate
// lookup as the customer picks a wilaya + delivery type.
export const getDeliveryRate = (wilaya, deliveryType) =>
  api.post('/delivery/rate', { wilaya, deliveryType });
