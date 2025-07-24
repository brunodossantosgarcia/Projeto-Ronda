const API_URL = "http://localhost:5000/api/users";
let scanner = null;
let horarios = [];

function mostrarTela(id) {
  document.querySelectorAll('.container > div:not(.logo)').forEach(div => div.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

async function cadastrar() {
  const identidade = document.getElementById("cadIdentidade").value;
  const senha = document.getElementById("cadSenha").value;

  const res = await fetch(API_URL + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha })
  });

  const data = await res.json();
  alert(data.msg);
  if (res.ok) mostrarTela('tela1');
}

async function login() {
  const identidade = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(API_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    mostrarTela('tela3');
  } else {
    alert(data.msg);
  }
}

// QR Code
function iniciarLeituraQRCode() {
  const reader = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 200 };

  reader.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      const hora = new Date();
      horarios.push(hora);
      document.getElementById("resultado").innerText = `QR Lido: ${qrCodeMessage} às ${hora.toLocaleTimeString()}`;
      reader.stop();
      mostrarTela('tela6');
    },
    err => console.log("Escaneando...")
  ).catch(err => {
    document.getElementById("resultado").innerText = "Erro ao acessar câmera";
  });

  scanner = reader;
}

function stopScan() {
  if (scanner) scanner.stop();
  mostrarTela('tela4');
}

function finalizarRonda() {
  const labels = ["p1info", "p2info", "p3info", "p4info", "p5info"];
  horarios.forEach((hora, i) => {
    document.getElementById(labels[i]).innerText = `P${i + 1}: ${hora.toLocaleString()}`;
  });

  if (horarios.length >= 2) {
    const diff = horarios[horarios.length - 1] - horarios[0];
    const totalMin = Math.floor(diff / 60000);
    document.getElementById("tempoTotal").innerText = `Tempo total da ronda: ${totalMin} minutos`;
  }

  mostrarTela('tela8');
}