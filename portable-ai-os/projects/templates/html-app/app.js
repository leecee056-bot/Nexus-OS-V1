const title = document.getElementById("title");
const status = document.getElementById("status");
const action = document.getElementById("action");
let taps = 0;
action.addEventListener("click", () => {
  taps += 1;
  status.textContent = taps === 1 ? "It works offline." : `Taps: ${taps}`;
});
// Agent / user can rewrite title via DOM or by editing this file.
if (window.TRI_CASS_APP_TITLE) title.textContent = window.TRI_CASS_APP_TITLE;
