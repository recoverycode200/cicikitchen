import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// Maximum number of products that can be marked as best seller at the same time
const MAX_BEST_SELLERS = 3;

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  // Build query based on request parameters
  const query = {};

  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by featured if provided
  if (req.query.featured) {
    query.isFeatured = req.query.featured === 'true';
  }

  // Filter by best seller if provided
  if (req.query.bestSeller) {
    query.isBestSeller = req.query.bestSeller === 'true';
  }

  // Search by keyword
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Count total products with the query
  const count = await Product.countDocuments(query);

  // Fetch products with pagination
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json({
      success: true,
      data: product,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock, isFeatured, isBestSeller, imagePath } = req.body;

  const wantsBestSeller = isBestSeller === 'true';

  if (wantsBestSeller) {
    const bestSellerCount = await Product.countDocuments({ isBestSeller: true });
    if (bestSellerCount >= MAX_BEST_SELLERS) {
      res.status(400);
      throw new Error(`Menu best seller sudah penuh (maksimal ${MAX_BEST_SELLERS}). Nonaktifkan salah satu menu best seller terlebih dahulu.`);
    }
  }

  // Create product
  const product = new Product({
    name,
    description,
    price,
    category,
    inStock,
    isFeatured: isFeatured === 'true',
    isBestSeller: wantsBestSeller,
    image: imagePath || (req.file ? `/uploads/${req.file.filename}` : '/uploads/default-product.jpg'),
  });

  const createdProduct = await product.save();

  res.status(201).json({
    success: true,
    data: createdProduct,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock, isFeatured, isBestSeller, imagePath } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const wantsBestSeller = isBestSeller === 'true';

    // Only enforce the cap when this product is newly becoming a best seller
    if (wantsBestSeller && !product.isBestSeller) {
      const bestSellerCount = await Product.countDocuments({ isBestSeller: true });
      if (bestSellerCount >= MAX_BEST_SELLERS) {
        res.status(400);
        throw new Error(`Menu best seller sudah penuh (maksimal ${MAX_BEST_SELLERS}). Nonaktifkan salah satu menu best seller terlebih dahulu.`);
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.inStock = inStock || product.inStock;
    product.isFeatured = isFeatured === 'true';
    product.isBestSeller = wantsBestSeller;

    // Update image if a new one is provided
    if (imagePath) {
      product.image = imagePath;
    } else if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      data: updatedProduct,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product removed',
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get unique product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');

  res.json({
    success: true,
    data: categories,
  });
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductCategories };
