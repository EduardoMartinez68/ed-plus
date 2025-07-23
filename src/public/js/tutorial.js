document.addEventListener("DOMContentLoaded", () => {
  const helpBoxes = document.querySelectorAll(".video-help");

  helpBoxes.forEach(box => {
    const helpId = box.dataset.id;
    const helpContent = box.querySelector(".help-content");
    const helpToggle = box.querySelector(".help-toggle");
    const hideBtn = box.querySelector(".hide-help");

    const isHidden = localStorage.getItem(`help-${helpId}`) === "hidden";

    function showContent() {
      helpContent.style.display = "block";
      helpToggle.style.display = "none";
    }

    function hideContent() {
      helpContent.style.display = "none";
      helpToggle.style.display = "inline-block";
    }

    if (isHidden) {
      hideContent();
    } else {
      showContent();
    }

    hideBtn.addEventListener("click", () => {
      localStorage.setItem(`help-${helpId}`, "hidden");
      hideContent();
    });

    helpToggle.addEventListener("click", () => {
      localStorage.removeItem(`help-${helpId}`);
      showContent();
    });
  });
});
