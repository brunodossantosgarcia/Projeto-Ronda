const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Cadastro de usuário
router.post("/register", async (req, res) => {
  try {
    const { identidade, senha, funcao } = req.body;

    if (!identidade || !senha || !funcao) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const existente = await User.findOne({ identidade });
    if (existente) {
      return res.status(400).json({ error: "Identidade já cadastrada" });
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
  try {
    const { identidade, senha } = req.body;

    const user = await User.findOne({ identidade });
    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    // comparação simples, sem hash
    if (user.senha !== senha) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    res.json({
      message: "Login realizado com sucesso",
      funcao: user.funcao
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});


module.exports = router;
