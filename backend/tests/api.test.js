/**
 * ============================================================
 * CICI KITCHEN — BACKEND API TESTS
 * Jalankan: npm test
 * ============================================================
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

// ─── Setup app ringan tanpa koneksi DB nyata ─────────────────
// Test ini menguji struktur response & validasi endpoint.
// Untuk full integration test, set TEST_MONGO_URI di .env.test

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

// ─── Helper ──────────────────────────────────────────────────
const api = request(BASE_URL);

let token = '';         // token user biasa
let adminToken = '';    // token admin
let productId = '';     // id produk untuk test
let orderId = '';       // id order untuk test

// ─── AUTH TESTS ──────────────────────────────────────────────
describe('🔐 Auth API', () => {
  test('POST /api/auth/register — berhasil daftar user baru', async () => {
    const res = await api.post('/api/auth/register').send({
      name: 'Test User',
      email: `test_${Date.now()}@mail.com`,
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('name', 'Test User');
  });

  test('POST /api/auth/register — gagal jika email sudah dipakai', async () => {
    await api.post('/api/auth/register').send({
      name: 'Duplikat',
      email: 'duplikat@mail.com',
      password: 'password123',
    });
    const res = await api.post('/api/auth/register').send({
      name: 'Duplikat 2',
      email: 'duplikat@mail.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register — gagal jika field tidak lengkap', async () => {
    const res = await api.post('/api/auth/register').send({
      email: 'tanpanama@mail.com',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — berhasil login dengan kredensial benar', async () => {
    // Daftar dulu
    const email = `login_${Date.now()}@mail.com`;
    await api.post('/api/auth/register').send({
      name: 'Login Test',
      email,
      password: 'password123',
    });

    const res = await api.post('/api/auth/login').send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // simpan untuk test berikutnya
  });

  test('POST /api/auth/login — gagal dengan password salah', async () => {
    const res = await api.post('/api/auth/login').send({
      email: 'tidak@ada.com',
      password: 'salah',
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login — login admin', async () => {
    const res = await api.post('/api/auth/login').send({
      email: process.env.ADMIN_EMAIL || 'admin@cicikitchen.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
    // Jika admin ada di DB test, simpan tokennya
    if (res.status === 200) {
      adminToken = res.body.token;
    }
    expect([200, 401]).toContain(res.status);
  });
});

// ─── PRODUCT TESTS ───────────────────────────────────────────
describe('🛍️ Product API', () => {
  test('GET /api/products — mengembalikan daftar produk', async () => {
    const res = await api.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      productId = res.body.data[0]._id;
    }
  });

  test('GET /api/products — mendukung query limit', async () => {
    const res = await api.get('/api/products?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  test('GET /api/products/categories — mengembalikan kategori', async () => {
    const res = await api.get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/products/:id — mengembalikan detail produk', async () => {
    if (!productId) return;
    const res = await api.get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('_id', productId);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('price');
  });

  test('GET /api/products/:id — 404 jika id tidak valid', async () => {
    const res = await api.get('/api/products/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  test('POST /api/products — gagal tanpa token admin', async () => {
    const res = await api.post('/api/products').send({ name: 'Coba Produk' });
    expect(res.status).toBe(401);
  });

  test('GET /api/products/:id/reviews — mengembalikan review produk', async () => {
    if (!productId) return;
    const res = await api.get(`/api/products/${productId}/reviews`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── REVIEW TESTS ────────────────────────────────────────────
describe('⭐ Review API', () => {
  test('GET /api/reviews — mengembalikan semua review publik', async () => {
    const res = await api.get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/reviews?limit=3 — mengembalikan maks 3 review', async () => {
    const res = await api.get('/api/reviews?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });

  test('POST /api/products/:id/reviews — gagal tanpa login', async () => {
    if (!productId) return;
    const res = await api.post(`/api/products/${productId}/reviews`).send({
      rating: 5,
      comment: 'Enak!',
      orderId: '000000000000000000000000',
    });
    expect(res.status).toBe(401);
  });
});

// ─── ORDER TESTS ─────────────────────────────────────────────
describe('📦 Order API', () => {
  test('GET /api/orders/myorders — gagal tanpa login', async () => {
    const res = await api.get('/api/orders/myorders');
    expect(res.status).toBe(401);
  });

  test('GET /api/orders/myorders — berhasil dengan token', async () => {
    if (!token) return;
    const res = await api.get('/api/orders/myorders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/orders — gagal tanpa login', async () => {
    const res = await api.post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  test('POST /api/orders — gagal jika orderItems kosong', async () => {
    if (!token) return;
    const res = await api.post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderItems: [],
        shippingAddress: {
          fullName: 'Test',
          address: 'Jl. Test',
          city: 'Jakarta',
          postalCode: '12345',
          phone: '08123456789',
        },
        paymentMethod: 'COD',
        itemsPrice: 0,
        shippingPrice: 0,
        totalPrice: 0,
      });
    expect(res.status).toBe(400);
  });

  test('GET /api/orders — admin only, gagal tanpa admin token', async () => {
    if (!token) return;
    const res = await api.get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

// ─── USER TESTS ──────────────────────────────────────────────
describe('👤 User API', () => {
  test('GET /api/users/profile — gagal tanpa login', async () => {
    const res = await api.get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  test('GET /api/users/profile — berhasil dengan token', async () => {
    if (!token) return;
    const res = await api.get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
  });

  test('GET /api/users — admin only, gagal tanpa admin token', async () => {
    if (!token) return;
    const res = await api.get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

// ─── HEALTH CHECK ────────────────────────────────────────────
describe('🏥 Health Check', () => {
  test('GET /api/health — server berjalan', async () => {
    const res = await api.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
