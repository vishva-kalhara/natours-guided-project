/* eslint-disable prettier/prettier */
// const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factoryHandler = require('../utils/factoryHandlers');

// Depricated
// let tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
// );

const multerStorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload an image!', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.checkId = async (req, res, next, val) => {
  try {
    // console.log(oo);
    await Tour.findById(req.params.id);
  } catch (err) {
    next(new AppError(`There is no tour associated with ${val}`, 404));
  }
  next();
};

// Depricated
// exports.checkBody = (req, res, next) => {
//   console.log('Checking Body...');
//   console.log(req.body);
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'Fail',
//       message: 'Include both name and price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'easy,duration,price,name';
  next();
};

exports.getAllTours = factoryHandler.getAll(Tour);

exports.getTour = factoryHandler.getOne(Tour, {
  path: 'reviews',
  select: 'content rating -tour',
});

exports.createTour = factoryHandler.createOne(Tour);

exports.updateTour = factoryHandler.updateOne(Tour);

exports.deleteTour = factoryHandler.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $addFields: {
        diffuculty: '$_id',
      },
    },
  ];

  const stats = await Tour.aggregate(pipeline);

  res.status(200).json({
    status: 'Success',
    stats,
  });
});
