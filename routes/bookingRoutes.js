const express = require('express');
const {
  createBooking,
  getCheckoutSession,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  getCheckoutSession,
);
router.route('/').post(createBooking).get(getAllBookings);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
