const inputSenha = document.getElementById("senha");
const botaoOlho = document.getElementById("btn-olho");

botaoOlho.addEventListener("click", () => {
  const tipoAtual = inputSenha.getAttribute("type");
  const novoTipo = tipoAtual === "password" ? "text" : "password";
  inputSenha.setAttribute("type", novoTipo);
});