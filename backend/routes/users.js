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

function verificarAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });

    if (decoded.identidade !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    next();
  });
}

// Rota: Listar usuários (acesso só para admin)
router.get('/usuarios', verificarAdmin, async (req, res) => {
  try {
    const usuarios = await User.find({}, '-senha'); // sem senha
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

// Excluir usuário
router.delete('/usuarios/:id', verificarAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir usuário' });
  }
});

// Resetar senha do usuário para "123456"
const bcrypt = require('bcrypt');
router.put('/usuarios/resetar/:id', verificarAdmin, async (req, res) => {
  try {
    const novaSenha = await bcrypt.hash('123456', 10);
    await User.findByIdAndUpdate(req.params.id, { senha: novaSenha });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao resetar senha' });
  }
});


// ... suas rotas aqui ...

module.exports = router;  // ✅ exporte somente o router
