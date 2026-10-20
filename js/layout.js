// =========================================================
// SIDEBAR
// Controla o recolhimento do menu lateral.
// =========================================================

const btnRecolher = document.getElementById("btn-recolher");
if (btnRecolher) {
  btnRecolher.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-recolhida");
  });
}