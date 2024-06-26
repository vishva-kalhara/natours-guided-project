/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable node/no-unsupported-features/node-builtins */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

// Setup view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// HTTP Headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body and limiting
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true, // Allows to send complex data
    limit: '10kb',
  }),
);

// Data sanitization agains NoSql Injection
app.use(mongoSanitize());

// Data sanitization agains NoSql Injection
app.use(xss());

// Preventing parameter polution (Only use the last parameter)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});

// Routing
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 404 Error route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// Error handleing middleware
app.use(globalErrorHandler);

module.exports = app;
