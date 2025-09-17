const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/ErrorModel");
const voterModel = require("../models/voterModel");
const ElectionModel = require("../models/electionModel"); // ✅ Required for getVoter
const DistrictModel = require("../models/districtModel");

// Register Voter
const registerVoter = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      dob,
      voterId,
      phoneNumber,
      password,
      password2,
    } = req.body;

    if (!fullName || !email || !dob || !voterId || !phoneNumber || !password || !password2) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.toLowerCase();

    // Check email
    const emailExists = await voterModel.findOne({ email: newEmail });
    if (emailExists) return next(new HttpError("Email already registered.", 422));

    // Validate password
    if (password.trim().length < 6) return next(new HttpError("Password should be at least 6 characters.", 422));
    if (password !== password2) return next(new HttpError("Passwords do not match.", 422));

    // Validate phone
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) return next(new HttpError("Phone number must be 10 digits.", 422));

    const phoneExists = await voterModel.findOne({ phoneNumber });
    if (phoneExists) return next(new HttpError("Phone number already registered.", 422));

    // Check voter ID
    const voterIdExists = await voterModel.findOne({ voterId });
    if (voterIdExists) return next(new HttpError("Voter ID already registered.", 422));

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check for admin
    const isAdmin = newEmail === "admin@gmail.com";

    const newVoter = await voterModel.create({
      fullName,
      email: newEmail,
      dob,
      voterId,
      phoneNumber,
      password: hashedPassword,
      isAdmin,
    });

    res.status(201).json({
      message: `New Voter ${fullName} registered.`,
      voter: {
        id: newVoter._id,
        fullName,
        email: newEmail,
        voterId,
        phoneNumber,
        isAdmin,
      },
    });
  } catch (error) {
    return next(new HttpError("Voter registration failed.", 500));
  }
};

// JWT Generator
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Login Voter
const loginVoter = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new HttpError("Fill in all fields.", 422));

    const newEmail = email.toLowerCase();
    const voter = await voterModel.findOne({ email: newEmail });

    if (!voter) return next(new HttpError("Invalid credentials.", 401));

    const isMatch = await bcrypt.compare(password, voter.password);
    if (!isMatch) return next(new HttpError("Invalid credentials.", 401));

    const { _id: id, isAdmin, votedElections, fullName, voterId, phoneNumber, dob } = voter;
    const token = generateToken({ id, isAdmin });

    res.json({
      token,
      id,
      isAdmin,
      votedElections,
      voter: {
        fullName,
        email: newEmail,
        voterId,
        phoneNumber,
        dob,
        isAdmin,
      },
    });
  } catch (error) {
    return next(new HttpError("Login failed. Please try again later.", 500));
  }
};

// Get Voters of an Election
const getVoter = async (req, res, next) => {
  try {
    const election = await ElectionModel.findById(req.params.id).populate({
      path: "voters",
      select: "fullName email votedAt",
    });

    if (!election) return next(new HttpError("Election not found.", 404));

    res.json(election.voters);
  } catch (error) {
    return next(new HttpError("Failed to get voters.", 500));
  }
};

// Verify voter for voting
const verifyVoter = async (req, res, next) => {
  try {
    const { voterId, phoneNumber, districtId } = req.body;
    
    if (!voterId || !phoneNumber || !districtId) {
      return next(new HttpError("All fields are required.", 422));
    }
    
    // Find the voter with matching voterId and phoneNumber
    const voter = await voterModel.findOne({ voterId, phoneNumber });
    
    if (!voter) {
      return next(new HttpError("Invalid voter credentials. Please check your Voter ID and mobile number.", 401));
    }
    
    // Check if the district exists
    const district = await DistrictModel.findById(districtId);
    if (!district) {
      return next(new HttpError("Selected district not found.", 404));
    }
    
    // Check if there are elections in this district
    const elections = await ElectionModel.find({ districts: districtId });
    if (!elections || elections.length === 0) {
      return next(new HttpError("No active elections found in the selected district.", 404));
    }
    
    // Store the selected district with the voter's session
    voter.selectedDistrict = districtId;
    await voter.save();
    
    // Verification successful
    res.status(200).json({
      success: true,
      message: "Verification successful. You can now proceed to vote.",
      selectedDistrict: districtId
    });
  } catch (error) {
    return next(new HttpError("Verification failed. Please try again later.", 500));
  }
};


const getCurrentVoter = async (req, res, next) => {
    try {
      const voter = await voterModel.findById(req.user.id)
        .select("fullName email voterId phoneNumber selectedDistrict votedElections")
        .populate("selectedDistrict", "name code");
  
      if (!voter) {
        return next(new HttpError("Voter not found.", 404));
      }
  
      res.status(200).json(voter);
    } catch (error) {
      console.error("getCurrentVoter error:", error);
      return next(new HttpError("Failed to get voter information.", 500));
    }
  };
  
  
  // Get all voters
const getAllVoters = async (req, res, next) => {
    try {
      const voters = await voterModel.find();
      res.status(200).json(voters);
    } catch (error) {
      return next(new HttpError("Failed to get voters.", 500));
    }
  };

module.exports = { registerVoter, loginVoter, getVoter, verifyVoter, getCurrentVoter, getAllVoters };