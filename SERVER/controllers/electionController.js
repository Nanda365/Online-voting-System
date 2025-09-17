const HttpError = require("../models/ErrorModel");
const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");
const ElectionModel = require("../models/electionModel");
const CandidateModel = require("../models/candidateModel");
const DistrictModel = require("../models/districtModel");

// Add Election
const addElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only an admin can perform this action.", 403));
    }

    const { title, description } = req.body;
    let districts = req.body.districts;

    // In addElection function
    console.log('Districts received:', req.body.districts);
    console.log('Districts type:', typeof req.body.districts);

    // After processing
    console.log('Districts after processing:', districts);
    // Ensure districts is an array
    if (!districts) districts = [];
    else if (typeof districts === 'string') districts = [districts];
    else if (!Array.isArray(districts)) districts = Array.from(districts);

    if (!title || !description) return next(new HttpError("Fill all fields.", 422));
    if (!req.files || !req.files.thumbnail) return next(new HttpError("Choose a thumbnail.", 422));

    const { thumbnail } = req.files;
    if (thumbnail.size > 1000000) return next(new HttpError("File size too big. Should be less than 1MB", 422));

    let fileName = thumbnail.name.split(".");
    fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
    const filePath = path.join(__dirname, "..", "uploads", fileName);
    await thumbnail.mv(filePath);

    const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
    if (!result.secure_url) return next(new HttpError("Couldn't upload image to Cloudinary", 422));

    fs.unlinkSync(filePath);

    const newElection = await ElectionModel.create({
      title,
      description,
      thumbnail: result.secure_url,
      districts
    });

    await Promise.all(districts.map(districtId =>
      DistrictModel.findByIdAndUpdate(districtId, { $push: { elections: newElection._id } })
    ));

    res.status(201).json(newElection);
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Update Election
const updateElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only an admin can perform this action.", 403));
    }

    const { id } = req.params;
    const { title, description } = req.body;
    let districts = req.body.districts;

    if (!districts) districts = [];
    else if (typeof districts === 'string') districts = [districts];
    else if (!Array.isArray(districts)) districts = Array.from(districts);

    if (!title || !description) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const election = await ElectionModel.findById(id);
    if (!election) return next(new HttpError("Election not found.", 404));

    const currentDistricts = election.districts.map(d => d.toString());

    const districtsToRemove = currentDistricts.filter(d => !districts.includes(d));
    const districtsToAdd = districts.filter(d => !currentDistricts.includes(d));

    await Promise.all(districtsToRemove.map(districtId =>
      DistrictModel.findByIdAndUpdate(districtId, { $pull: { elections: election._id } })
    ));

    await Promise.all(districtsToAdd.map(districtId =>
      DistrictModel.findByIdAndUpdate(districtId, { $push: { elections: election._id } })
    ));

    election.title = title;
    election.description = description;
    election.districts = districts;

    if (req.files && req.files.thumbnail) {
      const { thumbnail } = req.files;
      if (thumbnail.size > 1000000) {
        return next(new HttpError("File size too big. Should be less than 1MB", 422));
      }

      let fileName = thumbnail.name.split(".");
      fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
      const filePath = path.join(__dirname, "..", "uploads", fileName);
      await thumbnail.mv(filePath);

      const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
      if (!result.secure_url) return next(new HttpError("Couldn't upload image to Cloudinary", 422));

      fs.unlinkSync(filePath);
      election.thumbnail = result.secure_url;
    }

    await election.save();
    res.status(200).json("Election updated successfully");
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Get all elections
const getElections = async (req, res, next) => {
  try {
    const elections = await ElectionModel.find().populate('districts');
    res.status(200).json(elections);
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Get single election
const getElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const election = await ElectionModel.findById(id).populate('districts');
    if (!election) return next(new HttpError("Election not found.", 404));
    res.status(200).json(election);
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Get candidates of an election
const getCandidatesOfElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidates = await CandidateModel.find({ election: id });
    res.status(200).json(candidates);
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Get voters of an election
const getElectionVoters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await ElectionModel.findById(id).populate("voters");
    if (!response) return next(new HttpError("Election not found.", 404));
    res.status(200).json(response.voters);
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

// Backend controller for GET /districts/:id/elections
const getElectionsByDistrict = async (req, res, next) => {
  try {
    const { id } = req.params;

    const elections = await ElectionModel.find({ districts: id });

    res.status(200).json(elections);
  } catch (error) {
    return next(new HttpError("Failed to fetch elections.", 500));
  }
};


// Remove election
const removeElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only an admin can perform this action.", 403));
    }

    const { id } = req.params;
    const deletedElection = await ElectionModel.findByIdAndDelete(id);
    if (!deletedElection) return next(new HttpError("Election not found.", 404));

    await CandidateModel.deleteMany({ election: id });
    res.status(200).json("Election deleted successfully.");
  } catch (error) {
    return next(new HttpError(error.message || "Something went wrong."));
  }
};

module.exports = {
  addElection,
  getElections,
  getElection,
  updateElection,
  removeElection,
  getCandidatesOfElection,
  getElectionVoters,
  getElectionsByDistrict,
};
