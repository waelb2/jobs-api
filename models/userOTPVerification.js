const mongoose = require('mongoose')
const { UnauthenticatedError, EmailOTPError } = require('../errors/index')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const { number } = require('joi')

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  OTP: String,
  createdAt: Date,
  expiresAt: Date
})

OTPSchema.methods.createJWT = function () {
  const otpToken = jwt.sign({ userId: this.userId }, process.env.JWT_SECRET)
  return otpToken
}
const userOTPVerification = mongoose.model('OTP', OTPSchema)

// Setting up the mail Transporter for the OTP sending.

const transporter = require('../utils/mailTransporter')
// OTP Verification.

const sendOTP = async ({ _id, email }) => {
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000)
    const message = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'TASK MANAGER : Verify Your Email:',
      html: `<p>To verify your email address use the following One Time Password (OTP) : <br> <b>${OTP}</b> </p>`
    }

    // Hashing the OTP

    const salt = await bcrypt.genSalt(10)
    const hashedOTP = await bcrypt.hash(String(OTP), salt)

    await transporter.sendMail(message)
    const newOTP = await userOTPVerification.create({
      userId: _id,
      OTP: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000
    })
    const optToken = newOTP.createJWT()

    return optToken
  } catch (err) {
    console.log(err)
    throw new EmailOTPError('Internal Server Error')
  }
}

module.exports = { userOTPVerification, sendOTP }
