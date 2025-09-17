const HttpError = require("../models/ErrorModel");
const DistrictModel = require("../models/districtModel");
const ElectionModel = require("../models/electionModel");
const CandidateModel = require("../models/candidateModel");

// Add a new district
const addDistrict = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const { name, code, description } = req.body;
        if (!name || !code) {
            return next(new HttpError("Name and code are required fields.", 422));
        }

        // Check if district with same name or code already exists
        const existingDistrict = await DistrictModel.findOne({ $or: [{ name }, { code }] });
        if (existingDistrict) {
            return next(new HttpError("District with this name or code already exists.", 422));
        }

        const newDistrict = await DistrictModel.create({ name, code, description });
        res.status(201).json(newDistrict);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Get all districts
const getDistricts = async (req, res, next) => {
    try {
        const districts = await DistrictModel.find();
        res.status(200).json(districts);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Get a single district by ID
const getDistrict = async (req, res, next) => {
    try {
        const { id } = req.params;
        const district = await DistrictModel.findById(id);
        if (!district) {
            return next(new HttpError("District not found.", 404));
        }
        res.status(200).json(district);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Update a district
const updateDistrict = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const { id } = req.params;
        const { name, code, description } = req.body;

        if (!name || !code) {
            return next(new HttpError("Name and code are required fields.", 422));
        }

        // Check if another district with the same name or code exists
        const existingDistrict = await DistrictModel.findOne({
            $and: [
                { _id: { $ne: id } },
                { $or: [{ name }, { code }] }
            ]
        });

        if (existingDistrict) {
            return next(new HttpError("Another district with this name or code already exists.", 422));
        }

        const district = await DistrictModel.findById(id);
        if (!district) {
            return next(new HttpError("District not found.", 404));
        }

        district.name = name;
        district.code = code;
        district.description = description || district.description;

        await district.save();
        res.status(200).json("District updated successfully");
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Delete a district
const removeDistrict = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const { id } = req.params;

        // Check if district has associated elections
        const electionsCount = await ElectionModel.countDocuments({ district: id });
        if (electionsCount > 0) {
            return next(new HttpError("Cannot delete district with associated elections. Please reassign or delete the elections first.", 422));
        }

        const deletedDistrict = await DistrictModel.findByIdAndDelete(id);
        if (!deletedDistrict) {
            return next(new HttpError("District not found.", 404));
        }

        res.status(200).json("District deleted successfully.");
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Get elections by district
const getDistrictElections = async (req, res, next) => {
    try {
        const { id } = req.params;
        const elections = await ElectionModel.find({ district: id });
        res.status(200).json(elections);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// Get district results (all candidates and votes for elections in this district)
const getDistrictResults = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Find all elections in this district
        const elections = await ElectionModel.find({ districts: id });
        
        if (!elections || elections.length === 0) {
            return res.status(200).json({ district: id, elections: [] });
        }
        
        const electionIds = elections.map(election => election._id);
        
        // Get all candidates for these elections
        const candidates = await CandidateModel.find({ election: { $in: electionIds } })
            .populate('election', 'title');
        
        // Group candidates by election and filter votes by district
        const resultsByElection = elections.map(election => {
            const electionCandidates = candidates.filter(candidate => 
                candidate.election._id.toString() === election._id.toString()
            );
            
            // Filter candidates to only include votes from this district
            const filteredCandidates = electionCandidates.map(candidate => {
                // If the candidate has votes array, filter by district
                if (candidate.votes && candidate.votes.length > 0) {
                    const districtVotes = candidate.votes.filter(vote => 
                        vote.district.toString() === id
                    );
                    
                    // Create a new object with the filtered vote count
                    return {
                        ...candidate.toObject(),
                        voteCount: districtVotes.length
                    };
                }
                
                // If using the old structure without votes array, return as is
                return candidate;
            });
            
            const totalVotes = filteredCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
            
            return {
                election: {
                    _id: election._id,
                    title: election.title,
                    description: election.description,
                    thumbnail: election.thumbnail
                },
                candidates: filteredCandidates,
                totalVotes
            };
        });
        
        res.status(200).json({
            district: id,
            results: resultsByElection
        });
    } catch (error) {
        return next(new HttpError(error));
    }
};

module.exports = {
    addDistrict,
    getDistricts,
    getDistrict,
    updateDistrict,
    removeDistrict,
    getDistrictElections,
    getDistrictResults
};