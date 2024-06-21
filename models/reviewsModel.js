const mongoose = require('mongoose');

const reviewScehema = mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      required: [true, 'A Review must have a content'],
      // maxLength: [100, 'Maximum length should be less than 100 characters'],
      minLength: [10, 'Minimum length should be less than 10 characters'],
    },
    rating: {
      type: Number,
      default: 2.5,
      max: [5, 'Rating should be less or equal than 5'],
      min: [0, 'Rating should be greater or equal than 0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A Review must have a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Review must have a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewScehema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

reviewScehema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewScehema);

module.exports = Review;
