const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { default: isEmail } = require('validator/lib/isEmail')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    minLength: [5, 'The name must be 5-50 characters.'],
    maxLength: [50, 'The name must be 5-50 characters.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: [true, 'Email already exists.'],
    validate: [isEmail, 'Enter a valid email.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minLength: [6, 'The password must be at least 6 characters.']
  },
  verified: {
    type: Boolean,
    default: false
  }
})

// Pre-save middleware to hash the password.

userSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Create a jwt token for the user.

userSchema.methods.createJWT = function () {
  const token = jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME
    }
  )
  return token
}
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}
const User = mongoose.model('user', userSchema)
// Checking the user's password.

module.exports = User
