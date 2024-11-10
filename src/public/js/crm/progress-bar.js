function updateProgress() {

  //we will get the dead line date for show how much time is left
  const dueDateInput = document.getElementById("closureDate").value;
  if (!dueDateInput) return alert("Por favor, selecciona una fecha de entrega.");

  //if exist a dead line, we will convert to days 
  const dueDate = new Date(dueDateInput);
  const currentDate = new Date();
  const totalDays = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));

  //get the progressBar
  const progressBar = document.getElementById("progressBar");

  //We will see how much time we have left
  if (totalDays > 15) {
    progressBar.style.backgroundColor = "#28A745";
  } else if (totalDays > 5) {
    progressBar.style.backgroundColor = "yellow";
    progressBar.style.color = "black";
  } else {
    progressBar.style.backgroundColor = "red";
  }


  const daysPassed = Math.max(0, 15 - totalDays); //Calculate elapsed days from 15 down
  const progressPercentageCalculate = 100-Math.min(100, (daysPassed / 15) * 100);
  const progressPercentage = Math.max(100, progressPercentageCalculate);

  progressBar.style.width = `${progressPercentage}%`;
  progressBar.textContent = `Faltan solo ${(totalDays+1)} días`;
}

updateProgress();
