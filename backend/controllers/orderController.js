import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    shippingPrice, 
    totalPrice,
    notes 
  } = req.body;

  // Validate if order items exist
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Check if all products are in stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.inStock < item.quantity) {
      res.status(400);
      throw new Error(`${product.name} is out of stock or has insufficient quantity`);
    }
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    notes,
  });

  // Save the order
  const createdOrder = await order.save();

  // Update the stock count for each product
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.inStock -= item.quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    data: createdOrder,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  // Find order and populate user and product information
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name image price');

  if (order) {
    // Check if the order belongs to the logged-in user or if user is admin
    if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
      res.json({
        success: true,
        data: order,
      });
    } else {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'name image');

  res.json({
    success: true,
    data: orders,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  
  // Build filter query
  const query = {};
  
  // Filter by status if provided
  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }
  
  // Count total orders with the query
  const count = await Order.countDocuments(query);
  
  // Fetch orders with pagination
  const orders = await Order.find(query)
    .populate('user', 'id name')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export { createOrder, getOrderById, getMyOrders, getOrders, updateOrderStatus };