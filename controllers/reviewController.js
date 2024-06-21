const Review = require('../models/reviewsModel');
const catchAsync = require('../utils/catchAsync');
const factoryHandler = require('../utils/factoryHandlers');

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  next();
});

exports.getAllReviews = factoryHandler.getAll(Review);

exports.getOneReview = factoryHandler.getOne(Review);

exports.createReview = factoryHandler.createOne(Review);

exports.updateReview = factoryHandler.updateOne(Review);

exports.deleteReview = factoryHandler.deleteOne(Review);
