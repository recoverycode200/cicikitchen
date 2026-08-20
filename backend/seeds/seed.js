import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const users = [
  {
    name: 'Admin',
    email: 'admin@cici.com',
    password: bcrypt.hashSync('password', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

const products = [
  {
    name: 'Risol Mayo',
    description: 'Crispy pastry filled with creamy mayonnaise, vegetables, and chicken floss.',
    image: '/uploads/sample-product-1.jpg',
    category: 'snacks',
    price: 15000,
    inStock: 25,
    isFeatured: true,
  },
  {
    name: 'Lontong Sayur',
    description: 'Rice cake served with vegetable curry and boiled eggs.',
    image: '/uploads/sample-product-2.jpg',
    category: 'rice-dishes',
    price: 25000,
    inStock: 15,
    isFeatured: true,
  },
  {
    name: 'Onde-Onde',
    description: 'Glutinous rice ball filled with sweet mung bean paste and coated with sesame seeds.',
    image: '/uploads/sample-product-3.jpg',
    category: 'desserts',
    price: 12000,
    inStock: 30,
    isFeatured: false,
  },
  {
    name: 'Kue Cucur',
    description: 'Traditional Indonesian cake made from palm sugar and rice flour.',
    image: '/uploads/sample-product-4.jpg',
    category: 'desserts',
    price: 10000,
    inStock: 20,
    isFeatured: false,
  },
  {
    name: 'Bakwan Jagung',
    description: 'Crispy corn fritters with vegetables and spices.',
    image: '/uploads/sample-product-5.jpg',
    category: 'snacks',
    price: 8000,
    inStock: 35,
    isFeatured: true,
  },
  {
    name: 'Es Cendol',
    description: 'Traditional Indonesian iced dessert with green rice flour jelly and coconut milk.',
    image: '/uploads/sample-product-6.jpg',
    category: 'drinks',
    price: 18000,
    inStock: 12,
    isFeatured: true,
  },
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Insert products
    await Product.insertMany(products);

    console.log('Data imported successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    console.log('Data destroyed successfully!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Run script based on command line arg
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
