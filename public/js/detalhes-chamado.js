// =========================================================
// DETALHES DO CHAMADO - NAVEGAÇÃO DE ABAS
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const botoesAbas = document.querySelectorAll(".btn-aba");
  const conteudosAbas = document.querySelectorAll(".conteudo-aba");

  botoesAbas.forEach((btn) => {
    btn.addEventListener("click", () => {
      const abaAlvo = btn.dataset.aba;

      botoesAbas.forEach((b) => b.classList.remove("ativo"));
      conteudosAbas.forEach((c) => c.classList.remove("ativo"));

      btn.classList.add("ativo");
      const conteudoAlvo = document.getElementById(`aba-${abaAlvo}`);
      if (conteudoAlvo) {
        conteudoAlvo.classList.add("ativo");
      }
    });
  });
});
