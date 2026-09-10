const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (to, name) => {
  const transporter = createTransporter();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #16a34a; text-align: center;">Welcome to EduBatch! 🎓</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Welcome to EduBatch - your education batch management platform!</p>
        <p style="font-size: 16px; color: #333;">We're excited to have you onboard. Here's what you can do:</p>
        <ul style="font-size: 15px; color: #555; line-height: 1.8;">
          <li>✅ Manage your batches and students</li>
          <li>✅ Track attendance easily</li>
          <li>✅ Collect fees online</li>
          <li>✅ Communicate with students via notices</li>
        </ul>
        <p style="font-size: 16px; color: #333; margin-top: 20px;">Get started by logging into your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        </div>
        <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">If you didn't create an account on EduBatch, please ignore this email.</p>
      </div>
      <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">© 2026 EduBatch. All rights reserved.</p>
    </div>
  `;

  const mailOptions = {
    from: `"EduBatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to EduBatch! 🎓',
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (to, token, name) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #16a34a; text-align: center;">Reset Your Password 🔐</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name || 'User'}</strong>,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">This link will expire in <strong>1 hour</strong>.</p>
        <p style="font-size: 14px; color: #777;">If you didn't request a password reset, please ignore this email or contact support.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="font-size: 12px; color: #999; text-align: center; word-break: break-all;">${resetUrl}</p>
      </div>
      <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">© 2026 EduBatch. All rights reserved.</p>
    </div>
  `;

  const mailOptions = {
    from: `"EduBatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password - EduBatch',
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};

// Send payment receipt email
const sendPaymentReceipt = async (to, name, paymentDetails) => {
  const transporter = createTransporter();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #16a34a; text-align: center;">Payment Receipt 💳</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Your payment has been successfully processed.</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${paymentDetails.paymentId || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${paymentDetails.orderId || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${paymentDetails.amount || 0}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Paid</span></p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p style="font-size: 16px; color: #333;">Thank you for your payment!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/payments" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Payment History</a>
        </div>
      </div>
      <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">© 2026 EduBatch. All rights reserved.</p>
    </div>
  `;

  const mailOptions = {
    from: `"EduBatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Payment Receipt - EduBatch',
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};

// Send enrollment confirmation email
const sendEnrollmentConfirmation = async (to, name, batchDetails) => {
  const transporter = createTransporter();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #16a34a; text-align: center;">Enrollment Confirmed! 📚</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">You have been successfully enrolled in:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Batch:</strong> ${batchDetails.batchName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${batchDetails.subject || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Schedule:</strong> ${batchDetails.schedule || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Fee:</strong> ₹${batchDetails.fee || 0}</p>
        </div>
        <p style="font-size: 16px; color: #333;">Please complete the payment to confirm your seat.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/enrollments" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Enrollments</a>
        </div>
      </div>
      <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">© 2026 EduBatch. All rights reserved.</p>
    </div>
  `;

  const mailOptions = {
    from: `"EduBatch" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Enrollment Confirmed - EduBatch',
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentReceipt,
  sendEnrollmentConfirmation
};