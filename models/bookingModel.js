const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
