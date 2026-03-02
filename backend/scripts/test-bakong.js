#!/usr/bin/env node
// backend/scripts/test-bakong.js
// Integration test for Bakong KHQR flow
// Usage: node scripts/test-bakong.js

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load .env if exists (for local dev)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BAKONG_TOKEN = process.env.BAKONG_TOKEN;
const BAKONG_ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID;
const BAKONG_MERCHANT_NAME = process.env.BAKONG_MERCHANT_NAME;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

if (!BAKONG_TOKEN || !BAKONG_ACCOUNT_ID || !BAKONG_MERCHANT_NAME) {
    console.error('❌ Missing required environment variables:');
    console.error('  - BAKONG_TOKEN');
    console.error('  - BAKONG_ACCOUNT_ID');
    console.error('  - BAKONG_MERCHANT_NAME');
    console.error('Please set them in .env or system env.');
    process.exit(1);
}

const testOrder = {
    customer: {
        fullName: 'Test User',
        phone: '012345678',
        address: 'Phnom Penh, Cambodia',
        email: 'test@example.com'
    },
    items: [
        {
            productId: 'prod_1',
            nameKm: 'ផលិតផលសាកល្បង',
            nameEn: 'Test Product',
            price: 10.00,
            quantity: 1,
            image: ''
        }
    ],
    subtotal: 10.00,
    total: 10.00,
    paymentMethod: 'Bakong KHQR'
};

async function runTest() {
    console.log('🚀 Starting Bakong KHQR integration test...');

    try {
        // Step 1: Create order
        console.log('➡️ Creating order...');
        const orderRes = await axios.post(`${API_BASE_URL}/orders`, testOrder);
        if (!orderRes.data.success) {
            throw new Error(`Order creation failed: ${orderRes.data.message}`);
        }
        const orderId = orderRes.data.order.id;
        const orderNumber = orderRes.data.order.orderNumber;
        console.log(`✅ Order created: ${orderNumber} (ID: ${orderId})`);

        // Step 2: Check payment status
        console.log('➡️ Checking payment status...');
        const checkRes = await axios.get(`${API_BASE_URL}/orders/${orderId}/check-payment`);
        console.log(`🔍 Payment status: ${JSON.stringify(checkRes.data)}`);

        // Step 3: Fetch full order to verify qrImage & md5 stored
        console.log('➡️ Fetching full order...');
        const fullOrderRes = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
        const order = fullOrderRes.data.order;
        console.log(`✅ QR Image present: ${!!order.qrImage}`);
        console.log(`✅ paymentMd5 present: ${!!order.paymentMd5}`);
        console.log(`✅ paymentMethod: ${order.paymentMethod}`);

        console.log('\n🎉 Test completed successfully!');
        console.log('Next steps:');
        console.log('  - Scan the QR code (if generated) in Bakong sandbox');
        console.log('  - Re-run this script after payment to verify status changes');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

runTest();
