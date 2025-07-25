const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  identidade: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
