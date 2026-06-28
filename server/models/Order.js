const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name:     { type: String, required: true },
        image:    { type: String, required: true },
        price:    { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        variant: {
          size:  String,
          color: String,
        },
        serialNumber: { type: String, default: null },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      wilaya:   { type: String, required: true },
      country:  { type: String, default: 'Algeria' },
    },
    subtotal:      { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true },
    deliveryType:  { type: String, enum: ['home', 'stopdesk'], default: 'home' },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'baridimob', 'ccp', 'card'],
      default: 'cash_on_delivery',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isDelivered:  { type: Boolean, default: false },
    deliveredAt:  { type: Date },
    hiddenByUser: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Order', OrderSchema);