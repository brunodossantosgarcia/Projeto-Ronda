
let scanner = null;

async function carregar(tela) {
  const res = await fetch(tela + '.html');
  const html = await res.text();
  document.getElementById('conteudo').innerHTML = html;

  if (tela === 'tela5') iniciarLeituraQRCode();
}

function iniciarLeituraQRCode() {
  const reader = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 200 };

  reader.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      document.getElementById("resultado").innerText = "QR Lido: " + qrCodeMessage;

      // Armazena horário e valor
      const hora = new Date().toLocaleTimeString();
      localStorage.setItem("P1", `${qrCodeMessage} - ${hora}`);

      // Para o scanner e avança para próxima tela
      reader.stop().then(() => {
        carregar('tela6');
      });
    },
    error => {
      console.log("Leitura em andamento...");
    }
  ).catch(err => {
    document.getElementById("resultado").innerText = "Erro ao acessar câmera";
    console.error(err);
  });

  scanner = reader;
}

function stopScan() {
  if (scanner) scanner.stop();
  carregar('tela4');
}
