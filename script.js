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
      document.getElementById("resultado").innerText = "QR Lido: " + qrCodeMessage;

      // Obter data e hora formatadas
      const agora = new Date();
      const dia = agora.toLocaleDateString('pt-BR');
      const hora = agora.toLocaleTimeString('pt-BR');
      const dataHora = `${dia} ${hora}`;

      // Contador de posto (P1 até P5)
      let posto = localStorage.getItem("proxPosto") || 1;
      localStorage.setItem(`P${posto}`, `${qrCodeMessage} - ${dataHora}`);
      localStorage.setItem("proxPosto", parseInt(posto) + 1);

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
  for (let i = 1; i <= 5; i++) {
    const valor = localStorage.getItem(`P${i}`) || 'Não registrado';
    document.getElementById(`p${i}info`).textContent = valor;
  }
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


