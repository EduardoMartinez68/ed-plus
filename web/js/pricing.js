const toggleButton = document.getElementById('toggle-button');
const monthlyPlans = document.querySelectorAll('.plan-card.monthly');
const annualPlans = document.querySelectorAll('.plan-card.annual');

toggleButton.addEventListener('click', () => {
  monthlyPlans.forEach(plan => plan.classList.toggle('hidden'));
  annualPlans.forEach(plan => plan.classList.toggle('hidden'));

  if (monthlyPlans[0].classList.contains('hidden')) {
    toggleButton.textContent = 'Ver planes mensuales';
  } else {
    toggleButton.textContent = 'Ver planes anuales';
  }
});