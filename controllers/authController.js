const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKEI_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const url = `${req.protocol}://${req.get('host')}/account`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide the email and the password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user)
    return next(
      new AppError('There is no an account associated with the email!', 401),
    );

  const isCorrectPassword = await user.correctPassword(password, user.password);
  if (!isCorrectPassword)
    return next(new AppError('Password is incorrect', 401));

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now()),
    // httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, _res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError(
        "You're not logged in! please log in to the application",
        401,
      ),
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userExist = await User.findOne({ _id: decoded.id });
  if (!userExist)
    return next(
      new AppError('The User associated to this token is deleted.', 401),
    );

  const isChangedPassword = await userExist.isPasswordChanged(decoded.iat);
  if (isChangedPassword)
    return next(
      new AppError('User recently changed password! Please login again.', 401),
    );

  req.user = userExist;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const userExist = await User.findOne({ _id: decoded.id });
      if (!userExist) return next();

      const isChangedPassword = await userExist.isPasswordChanged(decoded.iat);
      if (isChangedPassword) return next();

      res.locals.user = userExist;
      // console.log(userExist);
      return next();
    }
    // console.log('JWT not found');
    return next();
  } catch (error) {
    return next();
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check whether there is an existing user
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found!', 404));

  const token = await user.createPasswordResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${token}`;

  // const message = `Here is your password reset URL: ${resetURL}`;

  try {
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Password Reset Token',
    //   text: message,
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      staus: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    return next(
      new AppError("Couldn't send the email! Please tyr again later.", 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Validate whether the token is expired or not
  if (!user) return next(new AppError('Token is expired or not valid!', 400));

  // Persist data in the database
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetAt = Date.now();
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user)
    return next(
      new AppError('There is no account associated with the email.', 401),
    );

  const isMatchingPasswords = await user.correctPassword(
    currentPassword,
    user.password,
  );

  if (!isMatchingPasswords) {
    return next(new AppError('Password does not match!', 401));
  }
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
