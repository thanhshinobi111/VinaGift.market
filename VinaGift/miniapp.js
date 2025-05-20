// Vinagift/miniapp.js

document.addEventListener("DOMContentLoaded", async () => {
  const Telegram = window.Telegram.WebApp;
  Telegram.ready();
  const userId = Telegram.initDataUnsafe.user ? Telegram.initDataUnsafe.user.id : null;

  const NETLIFY_DOMAIN = "https://vinagift.netlify.app";

  const connectButton = document.getElementById("connect-wallet-btn");
  const walletInfo = document.getElementById("wallet-info");
  const connector = new TonConnectUI.TonConnectUI({
    manifestUrl: `${NETLIFY_DOMAIN}/tonconnect-manifest.json`
  });

  connectButton.addEventListener("click", async () => {
    try {
      const result = await connector.connectWallet({
        universalLink: 'https://app.tonkeeper.com/ton-connect',
        jsBridgeKey: 'tonkeeper',
        requestProof: true
      });

      const { address, proof } = result.account;

      if (!address || !proof) {
        alert("Không nhận được địa chỉ hoặc proof từ ví.");
        return;
      }

      const res = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/ton-connect-callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.bounceable, proof })
      });

      if (res.status === 302) {
        const location = res.headers.get("Location");
        window.location.href = location;
        return;
      }

      const resData = await res.json();
      if (resData.error) {
        alert("Kết nối thất bại: " + resData.error);
        return;
      }

      const walletAddress = address.bounceable;
      localStorage.setItem("walletAddress", walletAddress);
      walletInfo.innerText = `Đã kết nối ví: ${walletAddress}`;
      Telegram.MainButton.setText("Đóng").show().onClick(() => Telegram.close());

      fetchWalletData(walletAddress);
      fetchNFTsForSale(walletAddress);
    } catch (err) {
      console.error("Lỗi khi kết nối ví:", err);
      alert("Lỗi khi kết nối ví: " + err.message);
    }
  });

  const savedAddress = localStorage.getItem("walletAddress");
  if (savedAddress) {
    walletInfo.innerText = `Đã kết nối ví: ${savedAddress}`;
    fetchWalletData(savedAddress);
    fetchNFTsForSale(savedAddress);
  }

  async function fetchWalletData(address) {
    try {
      const balanceRes = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/get-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      const balanceData = await balanceRes.json();
      const balance = balanceData.balance || "N/A";

      const nftsRes = await fetch(`${NETLIFY_DOMAIN}/.netlify/functions/get-nfts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      const nftData = await nftsRes.json();
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
