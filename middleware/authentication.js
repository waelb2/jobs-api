const { UnauthenticatedError } = require('../errors/index')
const jwt = require('jsonwebtoken')
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Unauthorized')
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: payload.userId, name: payload.name }
    next()
  } catch (err) {
    throw new UnauthenticatedError('Unauthorized')
  }
}

module.exports = authMiddleware
