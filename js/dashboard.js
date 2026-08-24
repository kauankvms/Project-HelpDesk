//FUNÇÃO BOTÃO RECOLHER MENU

const btnRecolher = document.getElementById("btn-recolher");

btnRecolher.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-recolhida");
});
