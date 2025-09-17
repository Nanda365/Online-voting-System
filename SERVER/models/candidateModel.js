const { mongoose,Schema, model, Types } = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  image: { type: String, required: true },
  motto: { type: String, required: true },
  voteCount: { type: Number, default: 0 },
  election: { type: Types.ObjectId, required: true, ref: "Election" },
  votes: [{
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voter',
      required: true
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = model("Candidate", candidateSchema);
