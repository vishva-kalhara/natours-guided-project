const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'b53e365c854277',
      pass: '8abf5f931d3270',
    },
  });

  const mailOptions = {
    from: 'Wishva Kalhara <vishvakalhara@gmail.com>',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
