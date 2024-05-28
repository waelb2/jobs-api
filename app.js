require('dotenv').config()
require('express-async-errors')
const express = require('express')
const connectDB = require('./db/connect')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()


const authenticateUser = require('./middleware/authentication')
//routers
const jobsRouter = require('./routes/jobs')
const authRouter = require('./routes/auth')
// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authMiddleware = require('./middleware/authentication')

app.use(express.json())
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
// extra packages

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.URI)
    console.log('DATA BASE CONNECTED')
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
