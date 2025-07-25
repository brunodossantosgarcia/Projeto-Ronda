const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Cadastro
router.post("/register", async (req, res) => {
  const { identidade, senha } = req.body;
  try {
    const userExistente = await User.findOne({ identidade });
    if (userExistente) return res.status(400).json({ msg: "Usuário já existe." });

    const hashedSenha = await bcrypt.hash(senha, 10);
    const newUser = new User({ identidade, senha: hashedSenha });
    await newUser.save();

    res.status(201).json({ msg: "Cadastro realizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro interno." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { identidade, senha } = req.body;
  try {
    const user = await User.findOne({ identidade });
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado." });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(400).json({ msg: "Senha incorreta." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, identidade: user.identidade });
  } catch (err) {
    res.status(500).json({ msg: "Erro no login." });
  }
});

module.exports = router;
