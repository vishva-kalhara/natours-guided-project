const express = require('express');
const {
  createBooking,
  getCheckoutSession,
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);
router.post('/', createBooking);

module.exports = router;
