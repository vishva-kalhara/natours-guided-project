/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Server is shutting down...');
  console.log(err.name, err.message);
  // console.log(err)

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

async function dbConnect() {
  await mongoose.connect(DB);
}

// process.env.NODE_ENV = 'production';

dbConnect().then(() => console.log('Connected to DB...'));
// .catch((err) => console.log(err));

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Server is shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
