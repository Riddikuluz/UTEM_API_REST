const toggleModeButton = document.getElementById("toggle-mode-button");
const modeLabel = document.getElementById("mode-label");

toggleModeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  updateModeLabel();
});

function updateModeLabel() {
  if (document.body.classList.contains("dark-mode")) {
    //modeLabel.textContent = "Mode: Dark";
  } else {
    //modeLabel.textContent = "Mode: Light";
  }
}
