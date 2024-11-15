//// Variables
const inputs = document.querySelectorAll(".calc__data-input");
const radioInputs = document.querySelectorAll(".calc__mortgage-type");

const conditionsWrapper = document.querySelector(
  ".calc__wrapper-mortgage-type",
);

const radioWrappers = document.querySelectorAll(".calc__wrapper-radio");

const resultsEmpty = document.querySelector(".calc__results--empty");
const resultsCompleted = document.querySelector(".calc__results--completed");

//Functions
function removeErrorMsg(element) {
  if (
    element.parentElement.parentElement.classList.contains(
      "calc__wrapper-input",
    ) &&
    element.parentElement.parentElement.querySelector(".calc__msg--error")
  ) {
    element.parentElement.parentElement
      .querySelector(".calc__msg--error")
      .remove();
    return;
  }

  if (element.lastElementChild?.classList.contains("calc__msg--error")) {
    element.lastElementChild.remove();
    return;
  }

  if (
    element.parentElement?.lastElementChild.classList.contains(
      "calc__msg--error",
    )
  ) {
    element.parentElement.lastElementChild.remove();
    return;
  }
}

function changeInputColors(input, bg, color) {
  input.parentElement.style.setProperty("--slate-100", bg);
  input.parentElement.style.setProperty("--slate-700", color);
}

function removeCheckedEffectFromRadio() {
  radioWrappers.forEach((btn) => {
    btn.classList.remove("calc__wrapper-radio--checked");
  });
}

function reset() {
  inputs.forEach((input) => {
    removeErrorMsg(input);
    changeInputColors(input, "hsl(202, 86%, 94%)", "hsl(200, 24%, 40%)");
    input.classList.remove("calc__data-input--error");
  });

  removeErrorMsg(conditionsWrapper);

  renderOrClearResult("remove", "add", "column");

  radioInputs.forEach((radio) => {
    radio.checked = false;
  });
  removeCheckedEffectFromRadio();
}

function OverOutInput(e, action) {
  if (
    !e.target.classList.contains("calc__data-input--error") &&
    !e.target.classList.contains("calc__data-input--focus")
  ) {
    e.target.classList[action]("calc__data-input--hover");
  }
}

function focusBlurInput(e, action, bg, color) {
  e.target.classList.remove("calc__data-input--hover");
  e.target.classList.remove("calc__data-input--error");
  e.target.classList[action]("calc__data-input--focus");

  e.target.parentElement.style.setProperty("--slate-100", bg);
  e.target.parentElement.style.setProperty("--slate-700", color);
}

function revertToMaxOrFormat(e) {
  switch (e.target.id) {
    case "amount":
      let value = e.target.value.replace(/\D/g, "");
      value = Number(value).toLocaleString();
      e.target.value = value;
      break;
    case "term":
      if (e.target.value > 50) {
        e.target.value = 50;
      }
      break;
    case "rate":
      if (e.target.value > 100) {
        e.target.value = 100;
      }
      break;
  }
}

function clickOnRadioWrapper(e) {
  //If clicked on the radio wrapper and it's radio not checked
  //then add check effects
  if (
    !e.target.classList.contains("calc__wrapper-radio--checked") &&
    e.target.classList.contains("calc__wrapper-radio")
  ) {
    removeCheckedEffectFromRadio();
    removeErrorMsg(e.target);

    e.target.classList.add("calc__wrapper-radio--checked");
    e.target.firstElementChild.checked = true;
  }
}

function validationInputCheck() {
  for (const input of inputs) {
    if (/^\s*$/.test(input.value)) {
      return false;
    }
  }
  return true;
}

function validationRadioCheck() {
  for (const radio of radioInputs) {
    if (radio.checked === true) {
      return true;
    }
  }
}

function addErrorText(element) {
  const errorMsg = document.createElement("span");
  errorMsg.classList.add("calc__msg--error");
  errorMsg.textContent = "This field is required";

  if (element.classList.contains("calc__data-input")) {
    element.classList.add("calc__data-input--error");
    element.parentElement.parentElement.appendChild(errorMsg);
    return;
  }

  element.appendChild(errorMsg);
}

function addInputErrorEffect(bg, color) {
  inputs.forEach((input) => {
    if (/^\s*$/.test(input.value)) {
      changeInputColors(input, bg, color);
      removeErrorMsg(input);
      addErrorText(input);
    }
  });
}

let isRadioValidationPassed;
function addRadioErrorEffect() {
  if (!isRadioValidationPassed) {
    removeErrorMsg(conditionsWrapper);
    addErrorText(conditionsWrapper);
  }
}

function monthlyPayment(amount, term, rate) {
  const monthlyRate = rate / 12 / 100;
  const payment =
    (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term * 12));

  const totalRepayOverTheTerm = term * 12 * payment;
  return [payment.toFixed(2), totalRepayOverTheTerm.toFixed(2)];
}

function monthlyInterestOnly(amount, term, rate) {
  const interestOnly = (amount * rate) / (12 * 100);
  const totalRepayOverTheTerm = term * 12 * interestOnly;
  return [interestOnly.toFixed(2), totalRepayOverTheTerm.toFixed(2)];
}

function renderOrClearResult(action1, action2, flexDirection) {
  resultsEmpty.classList[action1]("state--hidden");
  resultsCompleted.classList[action2]("state--hidden");
  document.querySelector(".calc__wrapper-results").style.flexDirection =
    flexDirection;

  if (flexDirection === "column") return;

  const radioInputRepayment = document.querySelector(
    ".calc__mortgage-type--repayment",
  );
  const radioInputInterest = document.querySelector(
    ".calc__mortgage-type--interest",
  );

  const amount = document.getElementById("amount").value.replace(/,/g, "");
  const term = document.getElementById("term").value;
  const rate = document.getElementById("rate").value;

  const monthly = document.querySelector(".calc__monthly");
  const total = document.querySelector(".calc__total");

  if (radioInputRepayment.checked === true) {
    const calculationResult = monthlyPayment(amount, term, rate);
    monthly.textContent = `£${Number(calculationResult[0]).toLocaleString()}`;
    total.textContent = `£${Number(calculationResult[1]).toLocaleString()}`;
  } else if (radioInputInterest.checked === true) {
    const calculationResult = monthlyInterestOnly(amount, term, rate);
    monthly.textContent = `£${Number(calculationResult[0]).toLocaleString()}`;
    total.textContent = `£${Number(calculationResult[1]).toLocaleString()}`;
  }
}

function initializeEventListeners() {
  //Reset
  const btnReset = document.querySelector(".calc__btn-reset");
  btnReset.addEventListener("pointerdown", () => {
    reset();
  });

  //Data input
  inputs.forEach((input) => {
    // Hover and out
    input.addEventListener("pointerover", (e) => {
      OverOutInput(e, "add");
    });
    input.addEventListener("pointerout", (e) => {
      OverOutInput(e, "remove");
    });
    // Focus and unfocus
    input.addEventListener("focus", (e) => {
      focusBlurInput(e, "add", "var(--lime)", "var(--slate-900)");
      removeErrorMsg(input);
    });
    input.addEventListener("blur", (e) => {
      focusBlurInput(e, "remove", "hsl(202, 86%, 94%)", "hsl(202, 55%, 16%)");
    });
    input.addEventListener("input", (e) => {
      revertToMaxOrFormat(e);
    });
  });

  //Radio buttons(wrappers)
  radioWrappers.forEach((wrp) => {
    wrp.addEventListener("pointerdown", (e) => {
      clickOnRadioWrapper(e);
    });
  });

  //Radio inputs
  radioInputs.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        removeCheckedEffectFromRadio();
        radio.parentElement.classList.add("calc__wrapper-radio--checked");
        removeErrorMsg(radio.parentElement);
      }
    });
  });

  //Submit button
  const btnSubmit = document.querySelector(".calc__btn-submit");
  btnSubmit.addEventListener("pointerup", () => {
    isRadioValidationPassed = validationRadioCheck();
    if (!validationInputCheck() || !isRadioValidationPassed) {
      addInputErrorEffect("var(--red)", "var(--white)");
      addRadioErrorEffect();
    } else renderOrClearResult("add", "remove", "row");
  });
}

//initialize
initializeEventListeners();
