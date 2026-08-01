const form = document.querySelector("#trip-poll");

if (form) {
  const progressBar = document.querySelector("#progress-bar");
  const progressLabel = document.querySelector("#progress-label");
  const trackedQuestions = [...form.querySelectorAll("[data-question]")];
  const limitedQuestions = [...form.querySelectorAll("[data-limit]")];

  const questionIsComplete = (question) => {
    const textInput = question.querySelector("input[type='text']");
    if (textInput) return textInput.value.trim().length > 0;

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

  limitedQuestions.forEach(updateLimitedQuestion);
  updateProgress();

  form.addEventListener("input", (event) => {
    const limitedQuestion = event.target.closest("[data-limit]");
    if (limitedQuestion) updateLimitedQuestion(limitedQuestion);
    updateProgress();
  });

  form.addEventListener("submit", (event) => {
    let firstInvalidQuestion = null;

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
