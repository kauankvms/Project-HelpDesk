//VARIÁVEIS

const inputSenha = document.getElementById("senha");
const botaoOlho = document.getElementById("btn-olho");
const formLogin = document.getElementById("form-login");

//FUNÇÃO BOTÃO MOSTRAR/ESCONDER SENHA

botaoOlho.addEventListener("click", () => {
  const tipoAtual = inputSenha.getAttribute("type");
  const novoTipo = tipoAtual === "password" ? "text" : "password";
  inputSenha.setAttribute("type", novoTipo);
});

//FUNÇÃO BOTÃO LOGIN

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = inputSenha.value;

  console.log("Tentativa de login:", { usuario, senha });

  window.location.href = "pages/dashboard.html";
});
