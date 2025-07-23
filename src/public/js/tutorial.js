  function hideTutorial(id) {
    localStorage.setItem("hide_" + id, "true");
    document.getElementById(id).style.display = "none";
    document.getElementById("helpToggle").style.display = "block";
  }

  function showTutorial(id) {
    localStorage.removeItem("hide_" + id);
    document.getElementById(id).style.display = "block";
    document.getElementById("helpToggle").style.display = "none";
  }

  function checkTutorialVisibility(id) {
    const hidden = localStorage.getItem("hide_" + id);
    if (hidden === "true") {
      document.getElementById(id).style.display = "none";
      document.getElementById("helpToggle").style.display = "block";
    }
  }