const express = require('express')
const router = express.Router()
const {login,register, getLogin,verifyOTP,getVerify, forgotPassword, getResetPassword,postResetPassword,updatePassword} = require('../controllers/auth')

router.post('/register',register)
router.post('/login',login).get('/login',getLogin)
router.post('/user-verification',verifyOTP).get('/user-verification',getVerify)
router.post('/forgot-password',forgotPassword).get('forgot-password')
router.get('/reset-password',getResetPassword).post('/reset-password',postResetPassword)
module.exports = router