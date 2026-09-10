const Joi = require('joi');

// Auth validators
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
    role: Joi.string().valid('student', 'teacher').default('student')
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

// Batch validators
const validateBatch = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    subject: Joi.string().required(),
    description: Joi.string().max(500).allow('', null),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    schedule: Joi.object({
      days: Joi.array()
        .items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
        .min(1)
        .required(),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
    }).required(),
    capacity: Joi.number().min(1).max(200).required(),
    fee: Joi.number().min(0).required(),
    teacher: Joi.string().required(),
    status: Joi.string().valid('upcoming', 'active', 'archived').optional()
  });
  return schema.validate(data);
};

// Enrollment validators
const validateEnrollment = (data) => {
  const schema = Joi.object({
    studentId: Joi.string().required(),
    batchId: Joi.string().required()
  });
  return schema.validate(data);
};

// Payment validators
const validatePaymentVerification = (data) => {
  const schema = Joi.object({
    orderId: Joi.string().required(),
    paymentId: Joi.string().required(),
    signature: Joi.string().required(),
    enrollmentId: Joi.string().required()
  });
  return schema.validate(data);
};

// Attendance validators
const validateAttendance = (data) => {
  const schema = Joi.object({
    batchId: Joi.string().required(),
    date: Joi.date().required(),
    records: Joi.array()
      .items(
        Joi.object({
          student: Joi.string().required(),
          status: Joi.string().valid('present', 'absent', 'late').required()
        })
      )
      .min(1)
      .required()
  });
  return schema.validate(data);
};

// Notice validators
const validateNotice = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(100).required(),
    body: Joi.string().required(),
    batchId: Joi.string().allow(null, '').optional(),  
    pinned: Joi.boolean().default(false)
  });
  return schema.validate(data);
};

// Profile validators
const validateProfile = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
    avatar: Joi.string().allow('', null)
  });
  return schema.validate(data);
};

const validatePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  });
  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin,
  validateBatch,
  validateEnrollment,
  validatePaymentVerification,
  validateAttendance,
  validateNotice,
  validateProfile,
  validatePassword
};