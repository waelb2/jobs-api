const User = require('../models/User')
const url = require('url')
const jwt = require('jsonwebtoken')
const OTPVerification = require('../utils/verifyOTP')
const { StatusCodes } = require('http-status-codes')
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError
} = require('../errors')
const {
  userOTPVerification,
  sendOTP
} = require('../models/userOTPVerification')
const resetPasswordUrl = require('../utils/resetUrlPasswordSender')
const notFound = require('../middleware/not-found')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  const otpToken = await sendOTP(user)
  res.cookie('otpToken', otpToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 5
  })

  res.redirect(StatusCodes.MOVED_PERMANENTLY, '/api/v1/auth/user-verification')
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new BadRequestError('Please provide both email and password')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  const validPassword = await user.comparePassword(password)

  if (!validPassword) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const token = user.createJWT()
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, verified: user.verified }, token })
}

const verifyOTP = async (req, res) => {
  const otpToken = req.cookies.otpToken
  const { OTP } = req.body
  await OTPVerification(otpToken, OTP, res)
  res.json({
    status: 'OK',
    message: 'User account verified successfully.'
  })
}
const forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new BadRequestError(
      'We were not able to identify you, please provide valid info.'
    )
  }
  const url = await resetPasswordUrl({ email: user.email, userId: user._id })
  res.json({ url })
}
const getResetPassword = async (req, res) => {
  const parsedUrl = new URL(`http://localhost:3000/api/v1/auth${req.url}`)
  if (!parsedUrl) {
    throw new NotFoundError('Invalid URL')
  }
  const queryParams = parsedUrl.searchParams
  const resetToken = queryParams.get('resetToken')
  const userId = queryParams.get('id')
  try {
    const validResetToken = await jwt.verify(resetToken, process.env.JWT_SECRET)
    res.render('resetPassword', { validResetToken })
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.redirect('/api/v1/auth/login')
    } else {
      throw new NotFoundError('Invalid URL' + err)
    }
  }
}
const postResetPassword = async (req, res) => {
  const { newPassword, userId } = req.body
  const user = await User.findByIdAndUpdate(
    userId,
    { password: newPassword },
    {
      new: true,
      runValidators: true
    }
  )
  res.json('updated')
}
const updatePassword = (req,res)=>{
  res.render('updatePassword')
}
const getLogin = (req, res) => {
  res.render('login')
}

const getVerify = (req, res) => {
  res.render('otp')
}

module.exports = {
  login,
  getLogin,
  register,
  verifyOTP,
  getVerify,
  forgotPassword,
  getResetPassword,
  postResetPassword,
  updatePassword
}
