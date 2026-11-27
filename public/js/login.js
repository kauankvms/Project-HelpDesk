// =========================================================
// LOGIN - INTERAÇÃO DE SENHA VISÍVEL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const inputSenha = document.getElementById("senha");
  const botaoOlho = document.getElementById("btn-olho");

  if (botaoOlho && inputSenha) {
    botaoOlho.addEventListener("click", () => {
      inputSenha.type = inputSenha.type === "password" ? "text" : "password";
    });
  }
});
