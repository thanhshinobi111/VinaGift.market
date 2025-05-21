// script/connect.js
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json',
  buttonRootId: 'connect-button'
});

tonConnectUI.onStatusChange((walletInfo) => {
  if (walletInfo && walletInfo.account) {
    document.getElementById('wallet-info').innerText =
      'Đã kết nối ví: ' + walletInfo.account.address;
  } else {
    document.getElementById('wallet-info').innerText = '';
  }
});
