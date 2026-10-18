/**
 * Multi-Step Form Application
 * Handles navigation, validation, billing toggle, and summary rendering.
 */

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  currentStep: 1,
  isYearly: false,
  selectedPlan: null,       // { name, price (monthly), yearlyPrice }
  selectedAddons: [],       // [{ name, monthly, yearly }]
};

// ─── DOM References ───────────────────────────────────────────────────────────
const stepContents  = document.querySelectorAll('.step-content');
const stepItems     = document.querySelectorAll('.step-item');
const billingToggle = document.getElementById('billing-toggle');
const planCards     = document.querySelectorAll('.plan_card');
const addonCards    = document.querySelectorAll('.addon_card');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(amount, yearly) {
  return yearly ? `$${amount}/yr` : `$${amount}/mo`;
}



function showStep(stepNumber) {
  stepContents.forEach(section => {
    section.classList.add('hidden');
  });

  const target = document.getElementById(
    stepNumber === 'thank-you'
      ? 'step-thank-you'
      : `step-${stepNumber}`
  );

  if (target) {
    target.classList.remove('hidden');
  }

  // Remove the shared ID from every step's primary button.
  document.querySelectorAll('.step-content .btn--primary')
    .forEach(button => button.removeAttribute('id'));

  // Give the visible step's primary button the ID Cypress expects.
  if (target && typeof stepNumber === 'number') {
    const activeButton = target.querySelector('.btn--primary');

    if (activeButton) {
      activeButton.id = 'next-button';
    }
  }

  stepItems.forEach(item => item.classList.remove('active'));

  if (typeof stepNumber === 'number') {
    const activeItem = document.querySelector(
      `.step-item[data-step="${stepNumber}"]`
    );

    if (activeItem) {
      activeItem.classList.add('active');
    }

    state.currentStep = stepNumber;
  }
}




function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

// ─── Plan Price Rendering ────────────────────────────────────────────────────
function updatePlanPrices() {
  planCards.forEach(card => {
    const monthly  = parseInt(card.dataset.monthly, 10);
    const yearly   = parseInt(card.dataset.yearly, 10);
    const priceEl  = card.querySelector('.plan-price');
    const bonusEl  = card.querySelector('.plan-yearly-bonus');

    priceEl.textContent = state.isYearly ? `$${yearly}/yr` : `$${monthly}/mo`;

    if (state.isYearly) {
      bonusEl.classList.remove('hidden');
    } else {
      bonusEl.classList.add('hidden');
    }
  });
}

// ─── Add-on Price Rendering ──────────────────────────────────────────────────
function updateAddonPrices() {
  addonCards.forEach(card => {
    const monthly = parseInt(card.dataset.monthly, 10);
    const yearly  = parseInt(card.dataset.yearly, 10);
    const priceEl = card.querySelector('.addon-price');
    priceEl.textContent = state.isYearly ? `+$${yearly}/yr` : `+$${monthly}/mo`;
  });
}

// ─── Billing Toggle ───────────────────────────────────────────────────────────
function applyBillingToggle() {
  const isYearly = state.isYearly;
  billingToggle.setAttribute('aria-pressed', String(isYearly));

  document.getElementById('label-monthly').classList.toggle('active', !isYearly);
  document.getElementById('label-yearly').classList.toggle('active', isYearly);

  updatePlanPrices();
  updateAddonPrices();
}

billingToggle.addEventListener('click', () => {
  state.isYearly = !state.isYearly;
  applyBillingToggle();
});

// ─── Plan Card Selection ──────────────────────────────────────────────────────
planCards.forEach(card => {
  function selectCard() {
    planCards.forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
    state.selectedPlan = {
      name:    card.dataset.plan.charAt(0).toUpperCase() + card.dataset.plan.slice(1),
      monthly: parseInt(card.dataset.monthly, 10),
      yearly:  parseInt(card.dataset.yearly, 10),
    };
    // Clear plan error on selection
    document.getElementById('error-plan').textContent = '';
  }

  card.addEventListener('click', selectCard);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectCard();
    }
  });
});

// ─── Add-on Card Checked State ───────────────────────────────────────────────
addonCards.forEach(card => {
  const checkbox = card.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    card.classList.toggle('checked', checkbox.checked);
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep1() {
  clearErrors();
  let valid = true;

  const nameInput  = document.querySelector('input[name="userName"]');
  const emailInput = document.querySelector('input[name="email"]');
  const phoneInput = document.querySelector('input[name="phone"]');

  if (!nameInput.value.trim()) {
    document.getElementById('error-name').textContent = 'Enter your name';
    nameInput.classList.add('is-invalid');
    valid = false;
  }

  if (!emailInput.value.trim()) {
    document.getElementById('error-email').textContent = 'Enter email';
    emailInput.classList.add('is-invalid');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
    document.getElementById('error-email').textContent = 'Please enter a valid email address';
    emailInput.classList.add('is-invalid');
    valid = false;
  }

  if (!phoneInput.value.trim()) {
    document.getElementById('error-phone').textContent = 'Enter your mobile number';
    phoneInput.classList.add('is-invalid');
    valid = false;
  }

  return valid;
}

function validateStep2() {
  if (!state.selectedPlan) {
    document.getElementById('error-plan').textContent = 'Please select a plan';
    return false;
  }
  return true;
}

// ─── Summary Rendering ────────────────────────────────────────────────────────
function renderSummary() {
  const plan = state.selectedPlan;
  if (!plan) return;

  const yearly    = state.isYearly;
  const planPrice = yearly ? plan.yearly : plan.monthly;
  const period    = yearly ? 'year' : 'month';

  document.getElementById('summary-plan-name').textContent =
    `${plan.name} (${yearly ? 'Yearly' : 'Monthly'})`;
  document.getElementById('summary-plan-price').textContent = formatPrice(planPrice, yearly);
  document.getElementById('total-period').textContent = period;

  // Collect selected add-ons
  const selectedAddons = [];
  addonCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
      selectedAddons.push({
        name:    card.querySelector('.addon-name').textContent,
        monthly: parseInt(card.dataset.monthly, 10),
        yearly:  parseInt(card.dataset.yearly, 10),
      });
    }
  });
  state.selectedAddons = selectedAddons;

  // Render add-on lines
  const addonsList = document.getElementById('summary-addons');
  addonsList.innerHTML = '';
  selectedAddons.forEach(addon => {
    const price = yearly ? addon.yearly : addon.monthly;
    const li = document.createElement('li');
    li.className = 'summary-addon-item';
    li.innerHTML = `
      <span class="summary-addon-name">${addon.name}</span>
      <span class="summary-addon-price">+${formatPrice(price, yearly)}</span>
    `;
    addonsList.appendChild(li);
  });

  // Total
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (yearly ? a.yearly : a.monthly), 0);
  const total = planPrice + addonsTotal;
  document.getElementById('total-price').textContent = `+${formatPrice(total, yearly)}`;
}

// ─── Step Navigation ──────────────────────────────────────────────────────────


document.addEventListener('click', event => {
  const button = event.target.closest('button#next-button');
  if (!button) return;

  if (state.currentStep === 1) {
    if (validateStep1()) showStep(2);
  } else if (state.currentStep === 2) {
    if (validateStep2()) showStep(3);
  } else if (state.currentStep === 3) {
    renderSummary();
    showStep(4);
  } else if (state.currentStep === 4) {
    showStep('thank-you');
  }
});

// Go Back buttons (delegated)
document.addEventListener('click', e => {
  const btn = e.target.closest('.go-back');
  if (!btn) return;
  const target = parseInt(btn.dataset.target, 10);
  if (!isNaN(target)) showStep(target);
});

// ─── Initialise ───────────────────────────────────────────────────────────────
(function init() {
  applyBillingToggle(); // Set initial prices & labels
  showStep(1);
})();
