const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, 'Name is a required field'],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    require: [true, 'Email is a required field'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'Password is a required field'],
    minlength: 8,
    trim: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    require: [true, 'Confirm password is a required field'],
    trim: true,
    validate: {
      // Works only when using CREATE and SAVE
      validator: function () {
        return this.password === this.confirmPassword;
      },
      message: 'Password and Confirm Password does not match.',
    },
  },
  passwordResetAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  this.confirmPassword = undefined; // Don't persist in the DB

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Don't persist in the DB
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: true });
  next();
});

userSchema.methods.correctPassword = async function (
  plainPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.isPasswordChanged = function (JWTTimeStamp) {
  if (this.passwordResetAt) {
    const changedTimeStamp = parseInt(
      this.passwordResetAt.getTime() / 1000,
      10,
    );

    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
