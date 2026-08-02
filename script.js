const form = document.querySelector("#trip-poll");

if (form) {
  const progressBar = document.querySelector("#progress-bar");
  const progressLabel = document.querySelector("#progress-label");
  const trackedQuestions = [...form.querySelectorAll("[data-question]")];
  const limitedQuestions = [...form.querySelectorAll("[data-limit]")];
  const participationQuestions = [...form.querySelectorAll("[data-participation]")];
  const partySizeInput = form.querySelector("#party-size");

  const requiredFieldsAreComplete = (question) => {
    const requiredFields = [...question.querySelectorAll("input[required], textarea[required], select[required]")];
    const requiredRadios = requiredFields.filter((field) => field.type === "radio");
    const otherFields = requiredFields.filter((field) => field.type !== "radio");
    const radioGroups = [...new Set(requiredRadios.map((radio) => radio.name))];

    const radiosAreComplete = radioGroups.every((name) =>
      [...question.querySelectorAll("input[type='radio']")].some(
        (radio) => radio.name === name && radio.checked,
      ),
    );

    return radiosAreComplete && otherFields.every((field) => field.value.trim() && field.checkValidity());
  };

  const questionIsComplete = (question) => {
    if (question.matches("[data-household], [data-participation]")) {
      return requiredFieldsAreComplete(question);
    }

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

    const textInput = question.querySelector("input[type='text']");
    if (textInput) return textInput.value.trim().length > 0;

    return Boolean(question.querySelector("input[type='radio']:checked"));
  };

  const updateProgress = () => {
    if (!progressBar || !progressLabel) return;

    const completed = trackedQuestions.filter(questionIsComplete).length;
    const total = trackedQuestions.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    progressBar.style.width = `${percentage}%`;
    progressLabel.textContent = `${completed} of ${total}`;
  };

  const updateLimitedQuestion = (question) => {
    const limit = Number(question.dataset.limit);
    const checkboxes = [...question.querySelectorAll("input[type='checkbox']")];
    const selected = checkboxes.filter((checkbox) => checkbox.checked);
    const counter = question.querySelector(".selection-count");
    const error = question.querySelector(".field-error");

    if (counter) counter.textContent = `${selected.length} of ${limit} selected`;

    checkboxes.forEach((checkbox) => {
      checkbox.disabled = selected.length >= limit && !checkbox.checked;
    });

    if (selected.length === limit) {
      question.classList.remove("has-error");
      error?.classList.remove("is-visible");
    }
  };

  const householdMaximum = () => {
    const householdSize = Number(partySizeInput?.value || 0);
    return householdSize > 0 ? householdSize : 12;
  };

  const updateParticipantMaximums = () => {
    const maximum = householdMaximum();
    participationQuestions.forEach((question) => {
      const countInput = question.querySelector("[data-participant-count]");
      if (countInput) countInput.max = String(maximum);
    });
  };

  const updateParticipationQuestion = (question) => {
    const selected = question.querySelector("input[type='radio']:checked");
    const participantWrap = question.querySelector("[data-participant-wrap]");
    const countInput = question.querySelector("[data-participant-count]");
    const isJoining = selected?.value === "Yes";

    if (!participantWrap || !countInput) return;

    participantWrap.hidden = !isJoining;
    countInput.disabled = !isJoining;
    countInput.required = isJoining;
    countInput.max = String(householdMaximum());

    if (!isJoining) countInput.value = "";
  };

  const dateRange = form.querySelector("[data-date-range]");

  const updateDateRangeValidity = () => {
    if (!dateRange) return true;

    const question = dateRange.closest(".question");
    const [from, until] = dateRange.querySelectorAll("input[type='date']");
    const error = question?.querySelector(".field-error");
    const datesAreReversed = Boolean(from?.value && until?.value && from.value > until.value);

    until?.setCustomValidity(datesAreReversed ? "Return date must be on or after departure date." : "");
    question?.classList.toggle("has-error", datesAreReversed);

    if (error) {
      error.textContent = datesAreReversed ? "Return date must be on or after departure date." : "";
      error.classList.toggle("is-visible", datesAreReversed);
    }

    return !datesAreReversed;
  };

  limitedQuestions.forEach(updateLimitedQuestion);
  updateParticipantMaximums();
  participationQuestions.forEach(updateParticipationQuestion);
  updateProgress();

  form.addEventListener("input", (event) => {
    const limitedQuestion = event.target.closest("[data-limit]");
    const participationQuestion = event.target.closest("[data-participation]");

    if (limitedQuestion) updateLimitedQuestion(limitedQuestion);
    if (participationQuestion) updateParticipationQuestion(participationQuestion);
    if (event.target === partySizeInput) updateParticipantMaximums();
    if (event.target.matches("input[type='date']")) updateDateRangeValidity();

    updateProgress();
  });

  form.addEventListener("submit", (event) => {
    let firstInvalidQuestion = null;

    participationQuestions.forEach(updateParticipationQuestion);

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
        if (error) {
          error.textContent = `Please select exactly ${limit}.`;
          error.classList.add("is-visible");
        }
        firstInvalidQuestion ||= question;
      }
    });

    if (firstInvalidQuestion) {
      firstInvalidQuestion.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
