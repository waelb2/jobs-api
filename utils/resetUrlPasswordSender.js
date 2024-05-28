const nodemailer = require('nodemailer')
const transporter = require('./mailTransporter')
const jwt = require('jsonwebtoken')
const resetUrl = async ({ email, userId }) => {
  const resetToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: '5m'
  })
  const resetUrl = `http://localhost:3000/api/v1/auth/reset-password?resetToken=${resetToken}&id=${userId}`
  const message = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'JOBS API : Reset Your Password:',
    html: `<p>Click on the link below to reset a new password for your JobApi account :  </p> <br /> <b>Link:</b> ${resetUrl}`
  }
  transporter.sendMail(message)
  return resetUrl
}

module.exports = resetUrl
