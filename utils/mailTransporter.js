const nodemailer = require('nodemailer')
// Creating a nodemailer transporter to send the OTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_EMAIL_PASS
  }
})
module.exports = transporter