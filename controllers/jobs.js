const { StatusCodes } = require('http-status-codes')
const Job = require('../models/Job')
const { BadRequestError, NotFoundError } = require('../errors/')

const getJob = async (req, res) => {
  const jobId = req.params.id
  const { userId } = req.user
  const job = await Job.findOne({ _id: jobId, createdBy: userId })
  if (!job) {
    throw new NotFoundError(`No Job With The Id : ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}
const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt')
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length })
}
const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}
const updateJob = async (req, res) => {
  const {
    user: { userId },
    body: { company, position },
    params: { id: jobId }
  } = req
  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    {
      company,
      position
    },
    {
      runValidators: true,
      new: true
    }
  )
  if (!job) {
    throw new NotFoundError(`No Job With The Id : ${jobId}`)
  }
  res.status(StatusCodes.OK).json(job)
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId }
  } = req
  const job = await Job.findOneAndDelete(
    { _id: jobId, createdBy: userId }
  )
  if (!job) {
    throw new NotFoundError(`No Job With The Id : ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

module.exports = {
  getJob,
  getAllJobs,
  createJob,
  deleteJob,
  updateJob
}
