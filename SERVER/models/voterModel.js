const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const voterSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  voterId: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  votedElections: [{ type: Types.ObjectId, ref: "Election" }],
  isAdmin: { type: Boolean, default: false },
  selectedDistrict: {
    type: Types.ObjectId,
    ref: 'District',
    default: null
  }
}, { timestamps: true });

module.exports = model('Voter', voterSchema);
