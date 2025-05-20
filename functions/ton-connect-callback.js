const { TonConnectServer } = require('@tonconnect/sdk');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { address, proof } = body;

  const tonConnect = new TonConnectServer({
    manifestUrl: 'https://vinagift.netlify.app/tonconnect-manifest.json' // Đảm bảo domain đúng
  });

  const isValid = await tonConnect.verifyProof(proof);
  if (!isValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid proof' })
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: `https://t.me/VinaGiftBot?start=connected_${address}` // Sửa tên bot
    },
    body: ''
  };
};