const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Cadastro de usuário
router.post("/register", async (req, res) => {
  try {
    const { identidade, senha, funcao } = req.body;

    if (!funcao) {
      return res.status(400).json({ error: "Função é obrigatória" });
    }

    const novo = new User({ identidade, senha, funcao });
    await novo.save();
    res.json({ message: "Usuário cadastrado com sucesso" });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
});


// Login de usuário
router.post("/login", async (req, res) => {
  const { identidade, senha } = req.body;
  try {
    const user = await User.findOne({ identidade });
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(400).json({ msg: "Senha incorreta" });

    const token = jwt.sign({ identidade: user.identidade }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, identidade: user.identidade, funcao: user.funcao });

  } catch (err) {
    res.status(500).json({ msg: "Erro no login" });
  }
});

module.exports = router;
