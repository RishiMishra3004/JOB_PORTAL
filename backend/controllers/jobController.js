import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsitetitle,
    personalWebsiteurl,
    jobNiche,
  } = req.body;

  if (
    !title ||
    !jobType ||
    !location ||
    !companyName ||
    !introduction ||
    !responsibilities ||
    !qualifications ||
    !salary ||
    !jobNiche
  ) {
    return next(new ErrorHandler("please provide full job details.", 400));
  }

  if (
    (personalWebsitetitle && !personalWebsiteurl) ||
    (!personalWebsitetitle && personalWebsiteurl)
  ) {
    return next(
      new ErrorHandler(
        "Provide both website url and title, or leave both blank.",
        400
      )
    );
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsite: {
      title: personalWebsitetitle,
      url: personalWebsiteurl,
    },
    jobNiche,
    postedBy,
  });
  res.status(201).json({
    success: true,
    message: "Job Posted successfully",
    job: job,
  });
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { city, niche, searchKeyword } = req.query;
  let query = { $and: [] };

  if (city) {
    query.$and.push({ location: { $regex: city, $options: "i" } });
  }
  if (niche) {
    query.$and.push({ jobNiche: { $regex: niche, $options: "i" } });
  }
  if (searchKeyword) {
    query.$and.push({
      $or: [
        { title: { $regex: searchKeyword, $options: "i" } },
        { companyName: { $regex: searchKeyword, $options: "i" } },
        { introduction: { $regex: searchKeyword, $options: "i" } },
      ],
    });
  }

  if (query.$and.length === 0) {
    query = {};
  }

  const jobs = await Job.find(query);
  res.status(200).json({
    success: true,
    jobs,
    count: jobs.length,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job not found", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job deleted",
  });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    job,
  });
});
