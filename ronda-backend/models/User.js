
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  identidade: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  rondas: [{
    posto: String,
    horario: Date
  }]
});

module.exports = mongoose.model('User', UserSchema);
