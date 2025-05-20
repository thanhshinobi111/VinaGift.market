// Vinagift/miniapp.js
document.addEventListener("DOMContentLoaded", () => {
  const Telegram = window.Telegram.WebApp;
  Telegram.ready();
  const userId = Telegram.initDataUnsafe.user ? Telegram.initDataUnsafe.user.id : null;

  const NETLIFY_DOMAIN = "https://vinagift.netlify.app";

  const connectButton = document.getElementById("connect-wallet-btn");
  connectButton.addEventListener("click", () => {
    const state = Math.random().toString(36).substring(2);
    const clientId = Date.now().toString(36); // Tạo client ID
    const connectLink = `https://app.tonkeeper.com/ton-connect?manifestUrl=${NETLIFY_DOMAIN}/tonconnect-manifest.json&returnUrl=${NETLIFY_DOMAIN}/.netlify/functions/ton-connect-callback&state=${state}&id=${clientId}`;
    console.log("Opening TON Connect link:", connectLink);
    window.location.href = connectLink;
  });

  const urlParams = new URLSearchParams(window.location.search);
  const address = urlParams.get("address");
  if (address) {
    document.getElementById("wallet-info").innerText = `Đã kết nối ví: ${address}`;
    localStorage.setItem("walletAddress", address);
    Telegram.MainButton.setText("Đóng").show().onClick(() => Telegram.close());
    fetchWalletData(address);
    fetchNFTsForSale(address);
  } else {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      document.getElementById("wallet-info").innerText = `Đã kết nối ví: ${savedAddress}`;
      fetchWalletData(savedAddress);
      fetchNFTsForSale(savedAddress);
    }
  }

  async function fetchWalletData(address) {
    try {
      const balanceResponse = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/get-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      const balanceData = await balanceResponse.json();
      const balance = balanceData.balance || "N/A";

      const nftsResponse = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/get-nfts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      const nftData = await nftsResponse.json();
      const nfts = nftData.nfts || [];

      let nftHtml = `<div>Số dư TON: ${balance} TON</div><div>NFT trong ví của bạn:</div>`;
      if (nfts.length > 0) {
        nfts.forEach((nft, index) => {
          nftHtml += `<div class="nft-item">${index + 1}. ${nft.name} (Bộ sưu tập: ${nft.collection_name})`;
          if (nft.animation_url) {
            nftHtml += `<br><img src="${nft.animation_url}" alt="${nft.name}" />`;
          }
          nftHtml += `</div>`;
        });
      } else {
        nftHtml += "<div>Bạn chưa sở hữu NFT nào.</div>";
      }
      document.getElementById("nft-list").innerHTML = nftHtml;
    } catch (error) {
      document.getElementById("nft-list").innerText = `Lỗi: ${error.message}`;
    }
  }

  async function fetchNFTsForSale(address) {
    try {
      const response = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/get-nfts-for-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_address: address })
      });
      const data = await response.json();
      const nfts = data.nfts || [];

      let nftHtml = "<div>NFT bạn đang bán:</div>";
      if (nfts.length > 0) {
        nfts.forEach((nft, index) => {
          nftHtml += `<div class="nft-item">${index + 1}. ${nft.name}: ${nft.price} TON`;
          if (nft.animation_url) {
            nftHtml += `<br><img src="${nft.animation_url}" alt="${nft.name}" />`;
          }
          nftHtml += `</div>`;
        });
      } else {
        nftHtml += "<div>Bạn chưa có NFT nào đang bán.</div>";
      }
      document.getElementById("nfts-for-sale").innerHTML = nftHtml;
    } catch (error) {
      document.getElementById("nfts-for-sale").innerText = `Lỗi: ${error.message}`;
    }
  }
});