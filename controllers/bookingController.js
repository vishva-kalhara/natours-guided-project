/* eslint-disable import/no-extraneous-dependencies */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryHandler = require('../utils/factoryHandlers');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('Please try again later.', 404));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://www.natours.dev/img/tours/tour-1-cover.jpg'],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  // console.log(req.query);
  // next();

  // console.log('executed');
  await Booking.create({ tour, user, price, isPaid: true });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factoryHandler.getAll(Booking);

exports.getBooking = factoryHandler.getOne(Booking);

exports.updateBooking = factoryHandler.updateOne(Booking);

exports.deleteBooking = factoryHandler.deleteOne(Booking);
