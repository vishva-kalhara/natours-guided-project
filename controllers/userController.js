/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factoryHandler = require('../utils/factoryHandlers');
const AppError = require('../utils/appError');

// const multerStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload an image!', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (body, ...props) => {
  const newObj = {};
  Object.keys(body).forEach((el) => {
    if (props.includes(el)) newObj[el] = body[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const data = await User.find();

  res.status(200).json({
    status: 'success',
    count: data.length,
    data,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.createUser = async (req, res) => {
  res.status(500).json({
    status: 'fail',
    data: 'Please use /api/v1/users/signup',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.submitUserData = catchAsync(async (req, res, next) => {
  // const updatedUser = await User.findByIdAndUpdate(req.user.id, {
  //   isActive: false,
  // });

  const newUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  req.user = newUser;
  next();
});

exports.getAllUsers = factoryHandler.getAll(User);

exports.getUser = factoryHandler.getOne(User);

exports.updateUser = factoryHandler.updateOne(User);

exports.deleteUser = factoryHandler.deleteOne(User);
