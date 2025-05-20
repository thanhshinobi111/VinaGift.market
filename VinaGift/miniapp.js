// VinaGift/miniapp.js
import TonConnectUI from '@tonconnect/ui';

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json',
  buttonRootId: 'connect-wallet-btn'
});

async function connectWallet() {
  try {
    const wallet = await tonConnectUI.connectWallet();
    console.log('Connected wallet:', wallet);
    document.getElementById('wallet-info').innerText = `Connected: ${wallet.account.address}`;
  } catch (error) {
    console.error('Connection error:', error);
    document.getElementById('wallet-info').innerText = `Error: ${error.message}`;
  }
}

tonConnectUI.onStatusChange(wallet => {
  console.log('Wallet status:', wallet ? wallet : 'Disconnected');
  if (wallet) {
    document.getElementById('wallet-info').innerText = `Connected: ${wallet.account.address}`;
    // TODO: Tải danh sách NFT nếu cần
  } else {
    document.getElementById('wallet-info').innerText = 'Disconnected';
  }
});

async function init() {
  try {
    const walletsList = await tonConnectUI.getWallets();
    const isEmbedded = walletsList.some(wallet => wallet.embedded);
    if (isEmbedded) {
      console.log('Detected embedded wallet in Telegram Mini App');
      const embeddedWallet = walletsList.find(wallet => wallet.embedded);
      await tonConnectUI.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    } else {
      console.log('Running in web environment');
      document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('wallet-info').innerText = `Init error: ${error.message}`;
  }
}

window.onload = init;