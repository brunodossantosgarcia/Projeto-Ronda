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
      const postosValidos = ["POSTO_P1", "POSTO_P2", "POSTO_P3", "POSTO_P4", "POSTO_P5"];

      if (!postosValidos.includes(qrCodeMessage)) {
        document.getElementById("resultado").innerText = "QR inválido!";
        return;
      }

      document.getElementById("resultado").innerText = "QR Lido: " + qrCodeMessage;

      const agora = new Date();
      const dia = agora.toLocaleDateString('pt-BR');
      const hora = agora.toLocaleTimeString('pt-BR');
      const dataHora = `${dia} ${hora}`;

      // Armazena no posto correspondente
      const postoID = qrCodeMessage.replace("POSTO_", ""); // ex: "P3"
      localStorage.setItem(postoID, `${qrCodeMessage} - ${dataHora}`);

      reader.stop().then(() => {
        mostrarTela('tela6');
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
  let inicio = null;
  let fim = null;

  for (let i = 1; i <= 5; i++) {
    const valor = localStorage.getItem(`P${i}`) || 'Não registrado';
    document.getElementById(`p${i}info`).textContent = valor;

    if (valor !== 'Não registrado') {
      const partes = valor.split(' - ')[1]; // ex: "21/07/2025 14:20:33"
      if (partes) {
        const [dia, mes, anoHora] = partes.split('/');
        const [ano, hora] = anoHora.split(' ');
        const dataCompleta = new Date(`${ano}-${mes}-${dia}T${hora}`);
        
        if (!inicio) inicio = dataCompleta;
        fim = dataCompleta;
      }
    }
  }

  let duracao = "---";
  if (inicio && fim) {
    const diffMs = fim - inicio;

    const segundosTotais = Math.floor(diffMs / 1000);
    const dias = Math.floor(segundosTotais / 86400);
    const horas = Math.floor((segundosTotais % 86400) / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    duracao = `${dias}d ${horas}h ${minutos}min ${segundos}s`;
  }

  document.getElementById("tempoTotal").textContent = duracao;
}


function gerarPDF() {
  const elemento = document.getElementById("tela8");
  const opt = {
    margin:       0.5,
    filename:     'ronda_9gac.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().from(elemento).set(opt).save();
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


