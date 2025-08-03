const mongoose = require("mongoose");

const RondaSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  posto: { type: String, required: true },
  dataHora: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Ronda", RondaSchema);
