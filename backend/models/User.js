const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  identidade: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  funcao: { type: String, required: true } // ✅ precisa ser preenchida
});

module.exports = mongoose.model("User", UserSchema);
