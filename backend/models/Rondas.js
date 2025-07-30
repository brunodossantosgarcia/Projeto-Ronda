const mongoose = require("mongoose");

const RondaSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  posto: { type: String, required: true },
  dataHora: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Ronda", RondaSchema);

const express = require("express");
const router = express.Router();
const Ronda = require("../models/Ronda");
const jwt = require("jsonwebtoken");

// Middleware de autenticação (usa JWT do login)
function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token ausente" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Token inválido" });
    req.usuario = decoded.identidade;
    next();
  });
}

// ✅ Salvar uma nova leitura de QR Code
router.post("/", autenticar, async (req, res) => {
  try {
    const { posto, dataHora } = req.body;
    const novaRonda = new Ronda({
      usuario: req.usuario,
      posto,
      dataHora
    });
    await novaRonda.save();
    res.status(201).json({ msg: "Ronda salva com sucesso" });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao salvar ronda" });
  }
});

// ✅ Listar todas as rondas (apenas admin)
router.get("/", autenticar, async (req, res) => {
  if (req.usuario !== "admin") return res.status(403).json({ msg: "Acesso negado" });
  const rondas = await Ronda.find().sort({ createdAt: -1 });
  res.json(rondas);
});

module.exports = router;
