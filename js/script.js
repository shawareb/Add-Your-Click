(function () {
  var clickForm = document.getElementById("click-form");
  var countEl = document.getElementById("click-count");
  var resetBtn = document.getElementById("reset-btn");
  var saveInfo = document.getElementById("save-info");
  var tasbihBtn = document.getElementById("tasbih-btn");

  if (!clickForm || !countEl || !resetBtn || !saveInfo || !tasbihBtn) {
    return;
  }

  var localCount = 0;
  var pendingRequests = 0;
  var isBusyReset = false;
  var isSyncing = false;

  function render(count) {
    localCount = count;
    countEl.textContent = String(count);
  }

  function animateCounter() {
    countEl.classList.remove("pop");
    void countEl.offsetWidth; // force reflow to restart animation
    countEl.classList.add("pop");
  }

  function animateRipple() {
    var rc = tasbihBtn.querySelector(".ripple-container");
    if (!rc) { return; }
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    var size = tasbihBtn.offsetWidth;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = "0";
    ripple.style.top = "0";
    rc.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  function setStatus(message, isError) {
    saveInfo.textContent = message;
    saveInfo.className = isError ? "error" : "";
  }

  async function requestJson(path, options) {
    var response = await fetch(path, options || {});
    var payload = null;
    try {
      payload = await response.json();
    } catch (_e) {
      payload = null;
    }
    if (!response.ok) {
      var msg = payload && payload.error ? payload.error : "Request failed with status " + response.status;
      var err = new Error(msg);
      err.status = response.status;
      throw err;
    }
    return payload || {};
  }

  async function syncCount(showErrors) {
    if (isSyncing) { return; }
    isSyncing = true;
    try {
      var data = await requestJson("/api/count");
      if (pendingRequests === 0) {
        render(data.count);
      }
      if (showErrors) {
        setStatus("Stored on server. Shared with all users.", false);
      }
    } catch (_e) {
      if (showErrors) {
        setStatus("Cannot reach server. Start with: python server.py", true);
      }
    } finally {
      isSyncing = false;
    }
  }

  // Fast click: optimistic update → fire request in background, no UI blocking
  clickForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Optimistic update — instant feedback
    localCount += 1;
    countEl.textContent = String(localCount);
    animateCounter();
    animateRipple();

    pendingRequests += 1;
    requestJson("/api/click", { method: "POST" })
      .then(function (data) {
        pendingRequests -= 1;
        if (pendingRequests === 0) {
          render(data.count);
        }
        setStatus("Stored on server. Shared with all users.", false);
      })
      .catch(function () {
        pendingRequests -= 1;
        localCount -= 1; // revert optimistic increment on failure
        countEl.textContent = String(localCount);
        setStatus("Could not save click. Please try again.", true);
      });
  });

  resetBtn.addEventListener("click", async function () {
    if (isBusyReset) { return; }

    var password = window.prompt("Enter reset password:");
    if (password === null) { return; }

    isBusyReset = true;
    resetBtn.disabled = true;

    try {
      var data = await requestJson("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      isBusyReset = false;
      resetBtn.disabled = false;
    }
  });

  syncCount(true);

  window.setInterval(function () {
    if (pendingRequests === 0) {
      syncCount(false);
    }
  }, 2500);
})();
