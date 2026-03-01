(function () {
  var STORAGE_KEY = "add-your-click-count";

  var clickForm = document.getElementById("click-form");
  var countEl = document.getElementById("click-count");
  var resetBtn = document.getElementById("reset-btn");
  var saveInfo = document.getElementById("save-info");

  if (!clickForm || !countEl || !resetBtn || !saveInfo) {
    return;
  }

  function readCount() {
    var stored = window.localStorage.getItem(STORAGE_KEY);
    var count = Number(stored);
    return Number.isFinite(count) && count >= 0 ? count : 0;
  }

  function writeCount(value) {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  }

  function render(value) {
    countEl.textContent = String(value);
    saveInfo.textContent = "Saved locally in your browser. Last value: " + value;
  }

  var params = new URLSearchParams(window.location.search);
  var countFromUrl = Number(params.get("count"));
  var hasValidUrlCount = Number.isFinite(countFromUrl) && countFromUrl >= 0;

  var count = hasValidUrlCount ? Math.floor(countFromUrl) : readCount();
  if (hasValidUrlCount) {
    writeCount(count);
  }
  render(count);

  clickForm.addEventListener("submit", function (event) {
    event.preventDefault();
    count += 1;
    writeCount(count);
    render(count);
  });

  resetBtn.addEventListener("click", function () {
    count = 0;
    writeCount(count);
    render(count);
  });
})();
