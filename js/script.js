(function () {
  var clickForm = document.getElementById("click-form");
  var countEl = document.getElementById("click-count");
  var resetBtn = document.getElementById("reset-btn");
  var saveInfo = document.getElementById("save-info");
  var submitBtn = clickForm ? clickForm.querySelector('input[type="submit"]') : null;

  if (!clickForm || !countEl || !resetBtn || !saveInfo || !submitBtn) {
    return;
  }

  var isBusy = false;
  var isSyncing = false;

  function setBusy(value) {
    isBusy = value;
    submitBtn.disabled = value;
    resetBtn.disabled = value;
  }

  function render(count) {
    countEl.textContent = String(count);
  }

  function setStatus(message, isError) {
    saveInfo.textContent = message;
    saveInfo.style.color = isError ? "#bf2925" : "#333";
  }

  async function requestJson(path, options) {
    var response = await fetch(path, options || {});
    var payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      var message = payload && payload.error ? payload.error : "Request failed with status " + response.status;
      var requestError = new Error(message);
      requestError.status = response.status;
      throw requestError;
    }

    return payload || {};
  }

  async function syncCount(showErrors) {
    if (isSyncing) {
      return;
    }

    isSyncing = true;

    try {
      var data = await requestJson("/api/count");
      render(data.count);

      if (showErrors) {
        setStatus("Stored on server. Shared with all users.", false);
      }
    } catch (error) {
      if (showErrors) {
        setStatus("Cannot reach server. Start with: python server.py", true);
      }
    } finally {
      isSyncing = false;
    }
  }

  clickForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setBusy(true);

    try {
      var data = await requestJson("/api/click", { method: "POST" });
      render(data.count);
      setStatus("Stored on server. Shared with all users.", false);
    } catch (error) {
      setStatus("Could not save click. Please try again.", true);
    } finally {
      setBusy(false);
    }
  });

  resetBtn.addEventListener("click", async function () {
    if (isBusy) {
      return;
    }

    var password = window.prompt("Enter reset password:");
    if (password === null) {
      return;
    }

    setBusy(true);

    try {
      var data = await requestJson("/api/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: password })
      });

      render(data.count);
      setStatus("Shared counter reset to 0.", false);
    } catch (error) {
      if (error.status === 401) {
        setStatus("Wrong password. Counter was not reset.", true);
      } else {
        setStatus("Could not reset shared counter.", true);
      }
    } finally {
      setBusy(false);
    }
  });

  syncCount(true);

  window.setInterval(function () {
    if (!isBusy) {
      syncCount(false);
    }
  }, 2500);
})();
