const { Schema, model, Types } = require('mongoose');

const districtSchema = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    elections: [{ type: Types.ObjectId, ref: "Election" }]
}, { timestamps: true });

module.exports = model('District', districtSchema);