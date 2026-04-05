import express from 'express';
import Order from '../models/Order.js';
import { calculatePrice } from '../utils/pricing.js';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { user, files, totalPages, settings } = req.body;

    const amount = calculatePrice(totalPages, settings);

    const newOrder = new Order({
      user,
      files,
      totalPages,
      settings,
      amount
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Update order status (simulated UPI payment complete or admin updates)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// Track orders by phone
router.get('/track/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const orders = await Order.find({ 'user.phone': phone }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Tracking Error:', err);
    res.status(500).json({ error: 'Failed to track orders.' });
  }
});

export default router;
