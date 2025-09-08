const ORDER = Array.from({ length: 37 }, (_, i) => i); // 0–36
const COLORS = { 0: "green" };
for (let i = 1; i <= 36; i++) {
  COLORS[i] = i % 2 === 0 ? "black" : "red";
}

let saldo = 1000;
let ganhos = 0;
let perdas = 0;
let rodadas = 0;
let travado = false;

const elSaldo = document.getElementById("saldo");
const elGanhos = document.getElementById("ganhos");
const elPerdas = document.getElementById("perdas");
const elRodadas = document.getElementById("rodadas");
const elNumero = document.getElementById("numero");
const elCor = document.getElementById("cor");
const elAposta = document.getElementById("aposta");
const elBtn = document.getElementById("btnGirar");
const elReset = document.getElementById("btnReset");
const elHist = document.getElementById("histBody");
const elResultado = document.getElementById("resultado");
const disk = document.getElementById("disk");

// --- Novos elementos (saque + popup) ---
const elSacar = document.getElementById("btnSacar");
const popupSaque = document.getElementById("popupSaque");
const textoSaque = document.getElementById("textoSaque");

// --- Novos elementos (depositar + popup) ---
const elDepositar = document.getElementById("btnDepositar");
const popupDeposito = document.getElementById("popupDeposito");
const inputDeposito = document.getElementById("valorDeposito");

// Preencher números
for (let i = 0; i <= 36; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = i;
  elNumero.appendChild(opt);
}

// Preencher cores
["nenhum", "red", "black", "green"].forEach(cor => {
  const opt = document.createElement("option");
  opt.value = cor;
  opt.textContent = cor === "nenhum" ? "Nenhuma" : cor.toUpperCase();
  elCor.appendChild(opt);
});

function fmt(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function updateTop() {
  elSaldo.textContent = fmt(saldo);
  elGanhos.textContent = fmt(ganhos);
  elPerdas.textContent = fmt(perdas);
  elRodadas.textContent = rodadas;
}

function addHist(escolha, resultado, aposta, delta) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${rodadas}</td>
    <td>${escolha}</td>
    <td>${resultado}</td>
    <td>${fmt(aposta)}</td>
    <td style="color:${delta>=0?"#20e3b2":"#ff6b6b"}">${delta>=0?"+":""}${fmt(delta)}</td>
    <td>${fmt(saldo)}</td>
  `;
  elHist.prepend(tr);
}

function girarPara(numero) {
  const volta = 6; // voltas extras
  const angulo = (360 / ORDER.length) * numero;
  const finalDeg = volta * 360 + angulo;
  disk.style.transform = `rotate(${finalDeg}deg)`;
}

elBtn.addEventListener("click", () => {
  if (travado) return;
  const aposta = Number(elAposta.value);
  const escolhaNumero = elNumero.value;
  const escolhaCor = elCor.value;
  
  if (aposta <= 0 || aposta > saldo) {
    alert("Aposta inválida!");
    return;
  }
  if (escolhaNumero === "" && escolhaCor === "nenhum") {
    alert("Escolha pelo menos um número ou uma cor para apostar!");
    return;
  }

  travado = true;
  saldo -= aposta;
  updateTop();

  const sorteado = ORDER[Math.floor(Math.random() * ORDER.length)];
  const corSorteada = COLORS[sorteado];
  girarPara(sorteado);

  setTimeout(() => {
    rodadas++;
    let ganho = 0;

    const acertouNumero = escolhaNumero !== "" && Number(escolhaNumero) === sorteado;
    const acertouCor = escolhaCor !== "nenhum" && escolhaCor === corSorteada;

    if (acertouNumero && acertouCor) {
      if (corSorteada === "green") {
        ganho = aposta * 504; // número + verde
      } else {
        ganho = aposta * 72; // número + vermelho/preto
      }
      ganhos += ganho - aposta;
    } else if (acertouNumero) {
      ganho = aposta * 36; // só número
      ganhos += ganho - aposta;
    } else if (acertouCor) {
      if (corSorteada === "green") {
        ganho = aposta * 14; // só verde
      } else {
        ganho = aposta * 2; // só vermelho/preto
      }
      ganhos += ganho - aposta;
    } else {
      perdas += aposta;
    }

    saldo += ganho;
    updateTop();

    const delta = ganho - aposta;
    elResultado.querySelector(".desc").textContent =
      `Número sorteado: ${sorteado} (${corSorteada.toUpperCase()})`;
    elResultado.querySelector("h3").textContent =
      ganho > 0 ? `Você ganhou ${fmt(ganho)}` : `Você perdeu ${fmt(aposta)}`;
    addHist(
      `${escolhaNumero || "-"} / ${escolhaCor}`,
      `${sorteado} / ${corSorteada}`,
      aposta,
      delta
    );

    console.log("Rodada", rodadas, "-> Sorteado:", sorteado, corSorteada, "| Escolha:", escolhaNumero, escolhaCor, "| Aposta:", aposta, "| Ganho:", ganho, "| Saldo:", saldo);

    travado = false;
  }, 5000);
});

elReset.addEventListener("click", () => {
  saldo = 1000;
  ganhos = 0;
  perdas = 0;
  rodadas = 0;
  elHist.innerHTML = "";
  updateTop();
  elResultado.querySelector(".desc").textContent = "Pronto para jogar!";
  elResultado.querySelector("h3").textContent = "";
  disk.style.transform = "rotate(0deg)";
});

// --- Função de saque ---
elSacar.addEventListener("click", () => {
  if (saldo > 0) {
    textoSaque.textContent = `Você sacou ${fmt(saldo)}. Agora seu saldo foi zerado.`;
    saldo = 0;
    updateTop();
  } else {
    textoSaque.textContent = "Seu saldo já está zerado, nada para sacar.";
  }
  popupSaque.style.display = "flex";
});

function fecharPopup() {
  popupSaque.style.display = "none";
}

// --- Funções de depósito ---
// --- Abrir popup de depósito ---
elDepositar.addEventListener("click", () => {
  popupDeposito.style.display = "flex";
  inputDeposito.focus(); // foca no campo ao abrir
});

// --- Confirmar depósito ---
function confirmarDeposito() {
  const valor = Number(inputDeposito.value);
  if (!valor || valor <= 0 || isNaN(valor)) {
    alert("Digite um valor válido para depósito.");
    inputDeposito.focus();
    return;
  }
  saldo += valor;
  updateTop();
  alert(`Você depositou ${fmt(valor)} com sucesso!`);
  fecharPopupDeposito();
}

// --- Fechar popup de depósito ---
function fecharPopupDeposito() {
  popupDeposito.style.display = "none";
  inputDeposito.value = "";
}
updateTop();