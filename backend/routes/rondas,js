const express = require("express");
const router = express.Router();
const Ronda = require("../models/Ronda");
const jwt = require("jsonwebtoken");

// Middleware de autenticação
function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token ausente" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Token inválido" });
    req.usuario = decoded.identidade;
    next();
  });
}

// ✅ Salvar leitura de QR Code
router.post("/", autenticar, async (req, res) => {
  try {
    const { posto, dataHora } = req.body;
    const nova = new Ronda({ usuario: req.usuario, posto, dataHora });
    await nova.save();
    res.status(201).json({ msg: "Ronda salva" });
  } catch {
    res.status(500).json({ msg: "Erro ao salvar ronda" });
  }
});

// ✅ Listar rondas (apenas admin)
router.get("/", autenticar, async (req, res) => {
  if (req.usuario !== "admin") return res.status(403).json({ msg: "Acesso negado" });
  const rondas = await Ronda.find().sort({ createdAt: -1 });
  res.json(rondas);
});

// ✅ Exportar rondas (para Excel)
router.get("/exportar", autenticar, async (req, res) => {
  if (req.usuario !== "admin") return res.status(403).json({ msg: "Acesso negado" });
  const rondas = await Ronda.find().sort({ createdAt: -1 });
  res.json(rondas);
});

module.exports = router;
