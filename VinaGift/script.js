// Vinagift/script.js
document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connect-wallet-btn");
  connectButton.addEventListener("click", () => {
    const connectLink = "https://app.tonkeeper.com/ton-connect?v=2&manifestUrl=https://vinagift.netlify.app/tonconnect-manifest.json&returnUrl=https://vinagift.netlify.app/.netlify/functions/ton-connect-callback";
    window.location.href = connectLink;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const address = urlParams.get("address");
  if (address) {
    document.getElementById("wallet-info").innerText = "Đã kết nối ví: " + address;
  }
});