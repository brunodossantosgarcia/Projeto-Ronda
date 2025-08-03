const API_URL = "http://localhost:5000/api";
let scanner = null;

function mostrarTela(id) {
  document.querySelectorAll('.container > div:not(.logo)').forEach(div => div.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ✅ Cadastro
async function cadastrar() {
  const identidade = document.getElementById("cadIdentidade").value;
  const senha = document.getElementById("cadSenha").value;
  const funcao = document.getElementById("cadFuncao").value;

  if (!funcao) {
    alert("Selecione sua função antes de cadastrar!");
    return;
  }

  if (res.ok) {
  localStorage.setItem("funcao", funcao);
}


  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha, funcao })
  });

  const data = await res.json();
  alert(data.msg || "Cadastro realizado");
  if (res.ok) mostrarTela("tela1");
}


// ✅ Login
async function login() {
  const identidade = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha,})
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", identidade);
    mostrarTela("tela4");
  } else {
    alert(data.msg);
  }
}

// ✅ Inicia leitura QR para um posto específico
function iniciarLeitura(postoEsperado) {
  mostrarTela("tela5");
  const reader = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 200 };

  reader.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      if (qrCodeMessage !== postoEsperado) {
        document.getElementById("resultado").innerText = "QR inválido!";
        return;
      }

      const agora = new Date().toLocaleString("pt-BR");
      const funcaoUsuario = localStorage.getItem("funcao") || localStorage.getItem("usuario") || "Desconhecido";


      // ✅ Salva horário local
      localStorage.setItem(postoEsperado, `${qrCodeMessage} - ${agora}`);

      // ✅ Salva no histórico local
      let rondas = JSON.parse(localStorage.getItem("rondas")) || [];
      rondas.push({ usuario: funcaoUsuario, posto: qrCodeMessage, dataHora: agora });
      localStorage.setItem("rondas", JSON.stringify(rondas));

      // ✅ Envia para backend
      fetch(`${API_URL}/rondas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ posto: qrCodeMessage, dataHora: agora })
      });

      reader.stop().then(() => mostrarTela("tela6"));
    }
  );

  scanner = reader;
}

// ✅ Parar leitura
function stopScan() {
  if (scanner) scanner.stop().then(() => mostrarTela("tela4"));
}

// ✅ Preencher formulário com dados locais
function preencherFormulario() {
  const postos = [
    { key: "POSTO_P1", el: "p1info" }, { key: "POSTO_P2", el: "p2info" },
    { key: "POSTO_P3", el: "p3info" }, { key: "POSTO_P4", el: "p4info" },
    { key: "POSTO_P5", el: "p5info" }, { key: "PAIOL_1", el: "paiol1info" },
    { key: "PAIOL_2", el: "paiol2info" }, { key: "ARMARIA_BC", el: "armariabcinfo" },
    { key: "ARMARIA_1", el: "armaria1info" }, { key: "ARMARIA_2", el: "armaria2info" }
  ];
  let inicio = null, fim = null;

  postos.forEach(p => {
    const val = localStorage.getItem(p.key) || "Não registrado";
    document.getElementById(p.el).textContent = val;
    if (val !== "Não registrado") {
      const dt = new Date(val.split(" - ")[1]);
      if (!inicio) inicio = dt;
      fim = dt;
    }

    if (valor) {
      const partes = valor.split(" - ")[1]; // pega só a data/hora
      const dt = new Date(partes);
      if (!inicio) inicio = dt;
      fim = dt;
    }
  });

  // ✅ Cálculo do tempo total
  if (inicio && fim) {
    const diff = fim - inicio;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const tempo = `${dias}d ${horas % 24}h ${minutos % 60}min`;
    document.getElementById("tempoTotal").textContent = tempo;
  } else {
    document.getElementById("tempoTotal").textContent = "---";
  }
}

    function mostrarTela(id) {
  document.querySelectorAll('.container > div:not(.logo)').forEach(div => div.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  // ✅ Se a tela for a 8, preenche automaticamente os dados
  if (id === 'tela8') {
    preencherFormulario();
  }
}

  document.getElementById("tempoTotal").textContent =
    inicio && fim ? `${Math.floor((fim - inicio)/60000)} minutos` : "---";

// ✅ Exportar Excel local
function gerarExcel() {
  const rondas = JSON.parse(localStorage.getItem("rondas")) || [];
  if (!rondas.length) return alert("Nenhuma ronda registrada.");
  const ws = XLSX.utils.json_to_sheet(rondas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rondas");
  XLSX.writeFile(wb, "relatorio_local.xlsx");
}

// ✅ Exportar PDF
function gerarPDF() {
  html2pdf().from(document.getElementById("tela8")).save("relatorio_ronda.pdf");
}

// ✅ Exportar Excel do MongoDB
function exportarExcelRondasMongo() {
  fetch(`${API_URL}/rondas/exportar`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
    .then(res => res.json())
    .then(rondas => {
      const ws = XLSX.utils.json_to_sheet(rondas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RondasMongo");
      XLSX.writeFile(wb, "relatorio_mongodb.xlsx");
    });
}

// ✅ Finalizar ronda
function finalizarRonda() {
  localStorage.removeItem("rondas");
  alert("Ronda finalizada.");
  mostrarTela("tela1");
}
