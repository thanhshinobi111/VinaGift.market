// functions/db-connect.js
const { getNFTsByOwner } = require("../utils/db");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Only POST method supported' }) };
    }

    const { address } = JSON.parse(event.body || '{}');
    if (!address) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing address parameter' }) };
    }

    const nfts = await getNFTsByOwner(address);

    // Chuẩn hóa metadata theo TEP-64
    const formattedNFTs = nfts.map(nft => ({
      name: nft.name || 'Unknown',
      description: nft.description || 'No description',
      image: nft.image || 'https://via.placeholder.com/100',
      content_url: nft.content_url,
      attributes: nft.attributes || [],
      collection: nft.collection,
      index: nft.index
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ nfts: formattedNFTs })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};