const HttpError = require("../models/ErrorModel");
const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const ElectionModel = require("../models/electionModel");
const CandidateModel = require("../models/candidateModel");
const VoterModel = require("../models/voterModel");

const addCandidate = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403));
        }

        const { fullName, motto, currentElection } = req.body;

        if (!fullName || !motto) {
            return next(new HttpError("Fill in all fields", 422));
        }

        if (!req.files || !req.files.image) {
            return next(new HttpError("Choose an image.", 422));
        }

        const { image } = req.files;
        if (image.size > 1000000) {
            return next(new HttpError("Image size should be less than 1MB", 422));
        }

        let fileName = image.name.split(".");
        fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

        const filePath = path.join(__dirname, "..", "uploads", fileName);
        await image.mv(filePath);

        const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });

        if (!result.secure_url) {
            return next(new HttpError("Couldn't upload image to Cloudinary."));
        }

        fs.unlinkSync(filePath);

        const newCandidate = new CandidateModel({
            fullName,
            motto,
            image: result.secure_url,
            election: currentElection,
        });

        const election = await ElectionModel.findById(currentElection);
        if (!election) {
            return next(new HttpError("Election not found.", 404));
        }

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newCandidate.save({ session: sess });
        election.candidates.push(newCandidate);
        await election.save({ session: sess });
        await sess.commitTransaction();

        res.status(201).json("Candidate added successfully.");
    } catch (error) {
        return next(new HttpError(error));
    }
};

const getCandidate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const candidate = await CandidateModel.findById(id);
        if (!candidate) {
            return next(new HttpError("Candidate not found.", 404));
        }
        res.json(candidate);
    } catch (error) {
        return next(new HttpError(error));
    }
};

const removeCandidate = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403));
        }

        const { id } = req.params;
        const currentCandidate = await CandidateModel.findById(id).populate("election");

        if (!currentCandidate) {
            return next(new HttpError("Candidate not found.", 404));
        }

        if (!currentCandidate.election) {
            return next(new HttpError("Election associated with this candidate not found.", 404));
        }

        const sess = await mongoose.startSession();
        sess.startTransaction();

        await currentCandidate.deleteOne({ session: sess });

        if (currentCandidate.election.candidates) {
            currentCandidate.election.candidates.pull(currentCandidate._id);
            await currentCandidate.election.save({ session: sess });
        }

        await sess.commitTransaction();

        res.status(201).send("Candidate deleted successfully.");
    } catch (error) {
        return next(new HttpError(error));
    }
}


const voteCandidate = async (req, res, next) => {
    try {
        const { id: candidateId } = req.params;
        const { selectedElection } = req.body;

        const candidate = await CandidateModel.findById(candidateId);
        if (!candidate) {
            return next(new HttpError("Candidate not found.", 404));
        }

        const voter = await VoterModel.findById(req.user.id);
        if (!voter) {
            return next(new HttpError("Voter not found.", 404));
        }

        const hasVoted = voter.votedElections.some(
            (election) => election.toString() === selectedElection
        );

        if (hasVoted) {
            return next(new HttpError("You have already voted in this election.", 400));
        }

        // Get the voter's selected district
        const voterDistrict = voter.selectedDistrict;
        if (!voterDistrict) {
            return next(new HttpError("Please verify your district before voting.", 400));
        }

        const sess = await mongoose.startSession();
        sess.startTransaction();

        candidate.voteCount += 1;
        // Store the district with the vote
        candidate.votes = candidate.votes || [];
        candidate.votes.push({
            voter: voter._id,
            district: voterDistrict,
            votedAt: new Date()
        });
        await candidate.save({ session: sess });

        voter.votedAt = new Date();
        voter.votedElections.push(selectedElection);
        await voter.save({ session: sess });

        const election = await ElectionModel.findById(selectedElection);
        if (!election) {
            return next(new HttpError("Election not found.", 404));
        }
        election.voters.push(voter);
        await election.save({ session: sess });

        await sess.commitTransaction();

        res.status(200).json({ 
            message: "Vote recorded successfully", 
            votedAt: voter.votedAt, 
            voteCount: candidate.voteCount 
        });
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = { addCandidate, getCandidate, removeCandidate, voteCandidate };
