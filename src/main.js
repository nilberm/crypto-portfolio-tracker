console.log("App initialized");

document.addEventListener("DOMContentLoaded", () => {
  const modalClose = document.getElementById("modal-close");
  const modal = document.getElementById("modal");

  if (modalClose && modal) {
    modalClose.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
});
