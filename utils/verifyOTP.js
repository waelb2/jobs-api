const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const {
  userOTPVerification,
  sendOTP
} = require('../models/userOTPVerification')

const verifyOTP = async (otpToken, OTP, res) => {
  if (!otpToken) {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, '/api/v1/auth/login')
    return
  }

  const { userId } = jwt.verify(otpToken, process.env.JWT_SECRET)
  if (!OTP) {
    throw new BadRequestError('Please provide the OTP')
  }
  const OTPRecord = await userOTPVerification
    .findOne({ userId })
    .sort('-createdAt')
  if (!OTPRecord) {
    throw new BadRequestError('Your OTP has been verified.')
  }

  const { expiresAt, OTP: hashedOTP } = OTPRecord
  if (expiresAt < Date.now()) {
    await userOTPVerification.deleteMany({ userId })
    const { email } = await User.findById(userId)
    const newOtpToken = await sendOTP({ _id: userId, email })
    res.cookie('otpToken', newOtpToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 5
    })
    throw new UnauthenticatedError(
      'OTP has expired. A new OTP has been sent. Check your inbox.'
    )
  }

  const validOTP = await bcrypt.compare(OTP, hashedOTP)
  if (!validOTP) {
    throw new BadRequestError('Invalid OTP. Please check your inbox.')
  }

  await User.updateOne({ _id: userId }, { verified: true })
  await userOTPVerification.deleteMany({ userId })
  //   res.json({
  //     status: 'VERIFIED',
  //     message: 'User account has been verified successfully'
  //   })
}
module.exports = verifyOTP
