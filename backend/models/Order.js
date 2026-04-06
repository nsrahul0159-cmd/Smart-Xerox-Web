import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true }
  },
  paymentToken: { type: String },
  files: [{
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    pages: { type: Number, required: true },
    size: { type: Number, required: true }
  }],
  totalPages: { type: Number, required: true },
  settings: {
    color: { type: String, enum: ['Color', 'B/W'], default: 'B/W' },
    sides: { type: String, enum: ['Single Side', 'Double Side'], default: 'Single Side' },
    copies: { type: Number, default: 1 },
    layout: { type: String, enum: ['1', '1/2', '1/4'], default: '1' }
  },
  displayId: { type: String, unique: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Payment Pending', 'Paid', 'Pending', 'Printing', 'Completed', 'Delivered'],
    default: 'Payment Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
