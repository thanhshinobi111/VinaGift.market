const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { address } = JSON.parse(event.body);

  try {
    const response = await fetch(
      `https://toncenter.com/api/v2/getItems?owner=${address}`,
      {
        headers: {
          'X-API-Key': '7fbde468e0056d1a6f04aa78032f237890923efd62bff334b142f6381d1405ee' // Thay bằng API key thực
        }
      }
    );
    const data = await response.json();

    const nfts = data.nft_items.map(nft => ({
      address: nft.address,
      name: nft.metadata?.name || 'Unknown NFT',
      animation_url: nft.metadata?.image || '',
      collection_name: nft.collection?.name || 'Unknown Collection'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ nfts })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};