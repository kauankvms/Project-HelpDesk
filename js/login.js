// =========================================================
// LOGIN
// Seleciona os elementos usados pelas interações da tela.
// =========================================================

const inputSenha = document.getElementById("senha");
const botaoOlho = document.getElementById("btn-olho");
const formLogin = document.getElementById("form-login");
const inputUsuario = document.getElementById("usuario");

// Alterna entre senha oculta e texto visível.
botaoOlho.addEventListener("click", () => {
  inputSenha.type = inputSenha.type === "password" ? "text" : "password";
});

// Intercepta o envio do formulário e direciona para o dashboard.
formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const usuario = inputUsuario.value;
  const senha = inputSenha.value;

  console.log("Tentativa de login:", { usuario, senha });

  window.location.href = "pages/dashboard.html";
});
