const Razorpay = require('razorpay');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Check if variables are loaded
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Loaded' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Loaded' : '❌ Missing');

// Check if credentials exist
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ ERROR: Razorpay credentials missing in .env file');
  console.error('Please check your .env file has:');
  console.error('RAZORPAY_KEY_ID=your_key_id');
  console.error('RAZORPAY_KEY_SECRET=your_key_secret');
  // Don't throw error in production, but warn
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;