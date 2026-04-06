import express from 'express';
import Order from '../models/Order.js';
import { calculatePrice } from '../utils/pricing.js';
import Joi from 'joi';
import { protectAdmin } from '../utils/auth.js';

const router = express.Router();

const orderValidationSchema = Joi.object({
  user: Joi.object({
    name: Joi.string().min(2).max(50).required().trim(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required()
  }).required(),
  files: Joi.array().items(
    Joi.object({
      originalName: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
      pages: Joi.number().integer().min(1).required(),
      size: Joi.number().positive().required()
    })
  ).min(1).required(),
  totalPages: Joi.number().integer().min(1).required(),
  settings: Joi.object({
    color: Joi.string().valid('Color', 'B/W').required(),
    sides: Joi.string().valid('Single Side', 'Double Side').required(),
    copies: Joi.number().integer().min(1).max(100).required(),
    layout: Joi.string().valid('1', '1/2', '1/4').required()
  }).required()
});

// Create new order
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = orderValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { user, files, totalPages, settings } = value;

    const amount = calculatePrice(totalPages, settings);
    
    // Generate date-reset serial ID: SX-YYYYMMDD-1
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    
    const newOrder = new Order({
      user, files, totalPages, settings, amount,
      paymentToken: Math.random().toString(36).substring(2, 15) // simple secret for mock payment testing
    });

    let saved = false;
    let attempt = 0;
    while (!saved && attempt < 5) {
      const countToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
      newOrder.displayId = `SX-${dateStr}-${countToday + 1 + attempt}`;
      try {
        await newOrder.save();
        saved = true;
      } catch (err) {
        if (err.code === 11000) attempt++;
        else throw err;
      }
    }

    if (!saved) throw new Error('Failed to generate unique Order ID');

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order Creation Error:', error);
    next(error);
  }
});

// Update order status (simulated UPI payment complete or admin updates)
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status, paymentToken } = req.body;
    
    // Authorization check
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Allow user to self-mark as Paid if they have the exact secret payment token from creation
    // Otherwise, require an Admin JWT header
    const changingToPaid = status === 'Paid' && order.status === 'Payment Pending';
    let isAdmin = false;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
       // Check admin dynamically
       const jwt = (await import('jsonwebtoken')).default;
       try {
         const token = req.headers.authorization.split(' ')[1];
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         if (decoded.role === 'admin') isAdmin = true;
       } catch (e) {}
    }

    if (!isAdmin) {
       // Verify payment token
       if (!changingToPaid || !paymentToken || paymentToken !== order.paymentToken) {
          return res.status(403).json({ error: 'Unauthorized to change order status' });
       }
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Status Update Error:', error);
    next(error);
  }
});

// Track orders by phone (Sanitized by express-mongo-sanitize globally, but validated here)
router.get('/track/:phone', async (req, res, next) => {
  try {
    const { phone } = req.params;
    if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone format' });
    }
    const orders = await Order.find({ 'user.phone': phone }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Tracking Error:', err);
    next(err);
  }
});

export default router;
