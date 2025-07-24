
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Cadastro
router.post('/register', async (req, res) => {
  const { identidade, senha } = req.body;

  try {
    const existente = await User.findOne({ identidade });
    if (existente) return res.status(400).json({ msg: "Usuário já existe" });

    const hashed = await bcrypt.hash(senha, 10);
    const novo = new User({ identidade, senha: hashed });
    await novo.save();

    res.status(201).json({ msg: "Usuário cadastrado" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identidade, senha } = req.body;

  try {
    const user = await User.findOne({ identidade });
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(400).json({ msg: "Senha incorreta" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, identidade });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
