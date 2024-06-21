const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = reviewRouter;
