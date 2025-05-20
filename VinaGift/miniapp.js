// VinaGift/miniapp.js
import TonConnectUI from '@tonconnect/ui';

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json',
  buttonRootId: 'connect-wallet-btn'
});

// Hàm hiển thị danh sách NFT
async function displayNFTs(walletAddress) {
  try {
    const response = await fetch('/.netlify/functions/db-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const nfts = data.nfts || [];

    const nftList = document.getElementById('nft-list');
    const nftsForSale = document.getElementById('nfts-for-sale');

    // Xóa nội dung cũ
    nftList.innerHTML = '';
    nftsForSale.innerHTML = '';

    if (nfts.length === 0) {
      nftList.innerText = 'No NFTs found';
      nftsForSale.innerText = 'No NFTs for sale';
      return;
    }

    nfts.forEach(nft => {
      const nftItem = document.createElement('div');
      nftItem.className = 'nft-item';
      nftItem.innerHTML = `
        <img src="${nft.image || 'https://via.placeholder.com/100'}" alt="${nft.name || 'NFT'}">
        <p>Name: ${nft.name || 'Unknown'}</p>
        <p>Price: ${nft.price ? `${nft.price} TON` : 'Not for sale'}</p>
      `;

      if (nft.forSale) {
        nftsForSale.appendChild(nftItem.cloneNode(true));
      } else {
        nftList.appendChild(nftItem);
      }
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    document.getElementById('nft-list').innerText = `Error loading NFTs: ${error.message}`;
  }
}

// Hàm kết nối ví
async function connectWallet() {
  try {
    const wallet = await tonConnectUI.connectWallet();
    console.log('Connected wallet:', wallet);
    const address = wallet.account.address;
    document.getElementById('wallet-info').innerText = `Connected: ${address}`;
    await displayNFTs(address); // Tải NFT sau khi kết nối
  } catch (error) {
    console.error('Connection error:', error);
    document.getElementById('wallet-info').innerText = `Connection failed: ${error.message}`;
  }
}

// Hàm ngắt kết nối ví
async function disconnectWallet() {
  try {
    await tonConnectUI.disconnect();
    document.getElementById('wallet-info').innerText = 'Disconnected';
    document.getElementById('nft-list').innerText = 'No NFTs loaded';
    document.getElementById('nfts-for-sale').innerText = 'No NFTs for sale';
  } catch (error) {
    console.error('Disconnect error:', error);
    document.getElementById('wallet-info').innerText = `Disconnect failed: ${error.message}`;
  }
}

// Tích hợp Telegram WebApp
function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    // Áp dụng theme Telegram
    document.body.style.backgroundColor = webApp.themeParams.bg_color || '#f3f3f3';
    document.querySelector('h1').style.color = webApp.themeParams.text_color || '#333';
  }
}

// Khởi tạo
async function init() {
  try {
    // Khởi tạo Telegram WebApp
    initTelegramWebApp();

    // Kiểm tra trạng thái ví hiện tại
    const wallet = tonConnectUI.wallet;
    if (wallet) {
      document.getElementById('wallet-info').innerText = `Connected: ${wallet.account.address}`;
      await displayNFTs(wallet.account.address);
    }

    // Theo dõi trạng thái ví
    tonConnectUI.onStatusChange(wallet => {
      console.log('Wallet status:', wallet ? wallet : 'Disconnected');
      if (wallet) {
        document.getElementById('wallet-info').innerText = `Connected: ${wallet.account.address}`;
        displayNFTs(wallet.account.address);
      } else {
        document.getElementById('wallet-info').innerText = 'Disconnected';
        document.getElementById('nft-list').innerText = 'No NFTs loaded';
        document.getElementById('nfts-for-sale').innerText = 'No NFTs for sale';
      }
    });

    // Kiểm tra môi trường Telegram Mini App
    const walletsList = await tonConnectUI.getWallets();
    const isEmbedded = walletsList.some(wallet => wallet.embedded);
    if (isEmbedded) {
      console.log('Detected embedded wallet in Telegram Mini App');
      const embeddedWallet = walletsList.find(wallet => wallet.embedded);
      await tonConnectUI.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    } else {
      console.log('Running in web environment');
      // Thêm nút ngắt kết nối
      const disconnectBtn = document.createElement('button');
      disconnectBtn.id = 'disconnect-wallet-btn';
      disconnectBtn.innerText = 'Ngắt kết nối ví';
      disconnectBtn.style.display = 'none'; // Ẩn mặc định
      document.querySelector('body').insertBefore(disconnectBtn, document.getElementById('wallet-info'));

      // Cập nhật hiển thị nút
      tonConnectUI.onStatusChange(wallet => {
        disconnectBtn.style.display = wallet ? 'block' : 'none';
        document.getElementById('connect-wallet-btn').style.display = wallet ? 'none' : 'block';
      });

      // Sự kiện click
      document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
      disconnectBtn.addEventListener('click', disconnectWallet);
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('wallet-info').innerText = `Init error: ${error.message}`;
  }
}

// Khởi chạy
window.onload = init;