/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require('../utils/appError');

const handleDuplicateFiledsInDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  // console.log(value);
  return new AppError(`Name is already in the database: ${value}.`, 400);
};

const handleValidationEddorsDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(errors.join('. '), 400);
};

const handleJWTErrors = () => new AppError('Please Log in again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: { ...err, name: err.name, errmsg: err.errmsg },
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('Error 💥💥', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong. Please try again later.',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  console.error('Error 💥💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  let error = err;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  // err.name = err.name;
  // console.log(err);
  if (process.env.NODE_ENV === 'development') sendErrorDev(error, req, res);
  else if (process.env.NODE_ENV === 'production' || 'test') {
    if (error.code === 11000) error = handleDuplicateFiledsInDB(err);
    if (error.errors && error.errors.name === 'ValidationError')
      error = handleValidationEddorsDB(err);

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    )
      error = handleJWTErrors(err);

    sendErrorProd(error, req, res);
  }
};
