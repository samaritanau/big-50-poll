const form = document.querySelector("#trip-poll");

if (form) {
  const progressBar = document.querySelector("#progress-bar");
  const progressLabel = document.querySelector("#progress-label");
  const trackedQuestions = [...form.querySelectorAll("[data-question]")];
  const limitedQuestions = [...form.querySelectorAll("[data-limit]")];

  const questionIsComplete = (question) => {
    const textInput = question.querySelector("input[type='text']");
    if (textInput) return textInput.value.trim().length > 0;

    const dateInputs = [...question.querySelectorAll("input[type='date']")];
    if (dateInputs.length) {
      const [from, until] = dateInputs;
      const radios = [...question.querySelectorAll("input[type='radio']")];
      const datesAreComplete = Boolean(from.value && until.value && from.value <= until.value);
      const radioIsComplete = !radios.length || radios.some((radio) => radio.checked);
      return datesAreComplete && radioIsComplete;
    }

    const limit = Number(question.dataset.limit || 0);
    if (limit) {
      return question.querySelectorAll("input[type='checkbox']:checked").length === limit;
    }

    return Boolean(question.querySelector("input[type='radio']:checked"));
  };

  const updateProgress = () => {
    const completed = trackedQuestions.filter(questionIsComplete).length;
    const total = trackedQuestions.length;
    const percentage = Math.round((completed / total) * 100);

    progressBar.style.width = `${percentage}%`;
    progressLabel.textContent = `${completed} of ${total}`;
  };

  const updateLimitedQuestion = (question) => {
    const limit = Number(question.dataset.limit);
    const checkboxes = [...question.querySelectorAll("input[type='checkbox']")];
    const selected = checkboxes.filter((checkbox) => checkbox.checked);
    const counter = question.querySelector(".selection-count");

    counter.textContent = `${selected.length} of ${limit} selected`;

    checkboxes.forEach((checkbox) => {
      checkbox.disabled = selected.length >= limit && !checkbox.checked;
    });

    if (selected.length === limit) {
      question.classList.remove("has-error");
      question.querySelector(".field-error").classList.remove("is-visible");
    }
  };

  const dateRange = form.querySelector("[data-date-range]");

  const updateDateRangeValidity = () => {
    if (!dateRange) return true;

    const question = dateRange.closest(".question");
    const from = dateRange.querySelector("#available-from");
    const until = dateRange.querySelector("#available-until");
    const error = question.querySelector(".field-error");
    const datesAreReversed = Boolean(from.value && until.value && from.value > until.value);

    until.setCustomValidity(datesAreReversed ? "Return date must be on or after departure date." : "");
    question.classList.toggle("has-error", datesAreReversed);
    error.textContent = datesAreReversed ? "Return date must be on or after departure date." : "";
    error.classList.toggle("is-visible", datesAreReversed);

    return !datesAreReversed;
  };

  limitedQuestions.forEach(updateLimitedQuestion);
  updateProgress();

  form.addEventListener("input", (event) => {
    const limitedQuestion = event.target.closest("[data-limit]");
    if (limitedQuestion) updateLimitedQuestion(limitedQuestion);
    if (event.target.matches("input[type='date']")) updateDateRangeValidity();
    updateProgress();
  });

  form.addEventListener("submit", (event) => {
    let firstInvalidQuestion = null;

    if (!updateDateRangeValidity()) {
      event.preventDefault();
      firstInvalidQuestion = dateRange.closest(".question");
    }

    limitedQuestions.forEach((question) => {
      const limit = Number(question.dataset.limit);
      const selectedCount = question.querySelectorAll("input[type='checkbox']:checked").length;
      const error = question.querySelector(".field-error");

      if (selectedCount !== limit) {
        event.preventDefault();
        question.classList.add("has-error");
        error.textContent = `Please select exactly ${limit}.`;
        error.classList.add("is-visible");
        firstInvalidQuestion ||= question;
      }
    });

    if (firstInvalidQuestion) {
      firstInvalidQuestion.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
