let scanner = null;

    function mostrarTela(id) {
      document.querySelectorAll('.container > div:not(.logo)').forEach(div => div.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');

      if (id === 'tela5') iniciarLeituraQRCode();
      if (id === 'tela8') preencherFormulario();
    }

    function iniciarLeituraQRCode() {
  const reader = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 200 };

  reader.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      // ✅ Lista completa de postos válidos
      const postosValidos = [
        "POSTO_P1", "POSTO_P2", "POSTO_P3", "POSTO_P4", "POSTO_P5",
        "PAIOL_1", "PAIOL_2", "ARMARIA_BC", "ARMARIA_1", "ARMARIA_2"
      ];

      // 🔍 Verifica se o QR Code lido é válido
      if (!postosValidos.includes(qrCodeMessage)) {
        document.getElementById("resultado").innerText = "QR inválido!";
        return;
      }

      // ✅ Atualiza resultado na tela
      document.getElementById("resultado").innerText = "QR Lido: " + qrCodeMessage;

      // ✅ Coleta data/hora e usuário atual
      const agora = new Date();
      const dataHora = agora.toLocaleString("pt-BR");
      const usuarioAtual = localStorage.getItem("usuario") || "Desconhecido";

      // ✅ Salva o horário individual para o posto específico
      const postoID = qrCodeMessage.replace("POSTO_", "").replace("_", "").replace("ARMARIA", "ARMARIA_");
      localStorage.setItem(postoID, `${qrCodeMessage} - ${dataHora}`);

      // ✅ Atualiza histórico consolidado no array rondas
      let rondas = JSON.parse(localStorage.getItem("rondas")) || [];
      rondas.push({
        usuario: usuarioAtual,
        posto: qrCodeMessage,
        dataHora: dataHora
      });
      localStorage.setItem("rondas", JSON.stringify(rondas));

      // ✅ Para o scanner e avança para a tela de sucesso
      reader.stop().then(() => {
        mostrarTela("tela6");
      });
    },
    error => {
      console.log("Aguardando leitura...");
    }
  ).catch(err => {
    document.getElementById("resultado").innerText = "Erro ao acessar câmera";
    console.error(err);
  });

  scanner = reader;
}

    function stopScan() {
      if (scanner) scanner.stop();
      mostrarTela('tela4');
    }
    
    function stopScan() {
  if (scanner) {
    scanner.stop().then(() => {
      scanner.clear(); // limpa o conteúdo da div #reader
      mostrarTela('tela4');
    }).catch(err => {
      console.error("Erro ao parar câmera: ", err);
      mostrarTela('tela4');
    });
  } else {
    mostrarTela('tela4');
  }
}

   function preencherFormulario() {
    const postos = [
    { key: "P1", element: "p1info" },
    { key: "P2", element: "p2info" },
    { key: "P3", element: "p3info" },
    { key: "P4", element: "p4info" },
    { key: "P5", element: "p5info" },
    { key: "PAIOL1", element: "paiol1info" },
    { key: "PAIOL2", element: "paiol2info" },
    { key: "ARMARIA_BC", element: "armariabcinfo" },
    { key: "ARMARIA_1", element: "armaria1info" },
    { key: "ARMARIA_2", element: "armaria2info" }
  ];

  let inicio = null, fim = null;

  postos.forEach(p => {
    const valor = localStorage.getItem(p.key) || "Não registrado";
    document.getElementById(p.element).textContent = valor;

    if (valor !== "Não registrado") {
      const partes = valor.split(" - ")[1];
      if (partes) {
        const dataCompleta = new Date(partes);
        if (!inicio) inicio = dataCompleta;
        fim = dataCompleta;
      }
    }
  });

  let duracao = "---";
  if (inicio && fim) {
    const diff = fim - inicio;
    const min = Math.floor(diff / 60000);
    duracao = `${min} minutos`;
  }
  document.getElementById("tempoTotal").textContent = duracao;
}

function gerarExcel() {
  const dados = [];
  for (let i = 1; i <= 5; i++) {
    const valor = localStorage.getItem(`P${i}`) || 'Não registrado';
    dados.push({ Posto: `P${i}`, Horário: valor });
  }

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ronda");

  XLSX.writeFile(workbook, "ronda_9gac.xlsx");
}

function finalizarRonda() {
  // Limpa os dados de P1 a P5 e o contador
  for (let i = 1; i <= 5; i++) {
    localStorage.removeItem(`P${i}`);
  }
  localStorage.removeItem("proxPosto");

  alert("Ronda finalizada com sucesso.");
  mostrarTela("tela1");
}

function gerarExcelRondas() {
  const rondas = JSON.parse(localStorage.getItem("rondas")) || [];

  if (rondas.length === 0) {
    alert("Nenhuma ronda registrada ainda.");
    return;
  }

  // Monta a planilha
  const worksheet = XLSX.utils.json_to_sheet(rondas);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rondas");

  // Salva arquivo
  XLSX.writeFile(workbook, "relatorio_rondas_completo.xlsx");
}


const API_URL = "http://localhost:5000/api/users";

async function cadastrar() {
  const identidade = document.querySelector('#tela2 input[placeholder="Identidade Militar"]').value;
  const senha = document.querySelector('#tela2 input[placeholder="Senha"]').value;

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha })
  });

  const data = await res.json();
  alert(data.msg);
  if (res.ok) mostrarTela("tela1");
}

async function login() {
  const identidade = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identidade, senha })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    mostrarTela("tela3");
  } else {
    alert(data.msg);
  }
}

