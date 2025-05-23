// functions/ton-connect-callback.js
const { saveNFTMetadata, saveUserMapping } = require("../utils/db");
const { TonClient, Address } = require('@ton/ton');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async (event) => {
  const { tc } = event.queryStringParameters;
  if (!tc) return { statusCode: 400, body: JSON.stringify({ error: 'Missing tc parameter' }) };

  try {
    const decodedTc = decodeURIComponent(tc);
    const parsedTc = JSON.parse(decodedTc);
    const address = parsedTc?.client_id?.split('_')?.[1];
    const telegramId = parsedTc?.telegram_id; // Giả sử tc chứa telegram_id
    if (!address) throw new Error('Invalid tc format');

    // Lưu mapping telegramId -> TON address
    if (telegramId) {
      await saveUserMapping(telegramId, address);
    }

    // Metadata theo TEP-64
    const nftMetadata = {
      name: "Telegram Gift NFT",
      description: "Gift converted to NFT on TON blockchain",
      image: "https://s.getgems.io/nft/gift.png",
      attributes: [{ trait_type: "Type", value: "Gift" }],
      collectionAddress: "EQD7Qtnas8qpMvT7-Z634_6G60DGp02owte5NnEjaWq6hb7v",
      index: Date.now(),
      content_url: `https://vinagift.netlify.app/nft/${address}.json`
    };

    // Mint NFT (giả lập)
    const client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: process.env.TONCENTER_API_KEY
    });
    // const collectionAddress = Address.parse(nftMetadata.collectionAddress);
    // await client.sendMessage(...);

    // Lưu metadata
    await saveNFTMetadata(address, nftMetadata);

    // Thông báo qua bot
    if (telegramId) {
      await bot.sendMessage(telegramId, `🎉 NFT Gift minted successfully!\nName: ${nftMetadata.name}\nView at: https://vinagift.netlify.app`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Open Mini App", url: "https://vinagift.netlify.app" }]]
        }
      });
    }

    return {
      statusCode: 302,
      headers: { Location: `https://t.me/VinaGiftBot?start=connected_${address}` },
      body: ''
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};