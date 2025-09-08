 // Suponha que o saldo inicial esteja vindo de outro site
 let saldo = Number(localStorage.getItem("saldo")) || 1000;

 function updateSaldo() {
   // salva o saldo atualizado no localStorage
   localStorage.setItem("saldo", saldo);
   alert("Saldo atualizado: R$ " + saldo.toFixed(2));
 }

 function confirmarDeposito() {
   const valor = Number(document.getElementById("valorDeposito").value);
   if (!valor || valor <= 0 || isNaN(valor)) {
     alert("Digite um valor válido para depósito.");
     return;
   }
   saldo += valor;
   updateSaldo();
   fecharPopupDeposito();
 }

 function fecharPopupDeposito() {
   document.getElementById("valorDeposito").value = "";
   alert("Depósito cancelado.");
 }