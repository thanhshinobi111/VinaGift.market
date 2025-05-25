// functions/ton-connect-callback.js

const { saveNFTMetadata, saveUserMapping } = require("../utils/db");
const { TonClient } = require('@ton/ton');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

exports.handler = async (event) => {
  try {
    const { tc } = event.queryStringParameters || {};
    if (!tc) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing tc parameter" }) };
    }

    const decodedTc = decodeURIComponent(tc);
    const parsedTc = JSON.parse(decodedTc);

    const address = parsedTc?.client_id?.split('_')?.[1];
    const telegramId = parsedTc?.telegram_id;

    if (!address || !telegramId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid tc format or missing data" }) };
    }

    // Save mapping
    await saveUserMapping(telegramId, address);

    // Fake NFT metadata
    const nftMetadata = {
      name: "Telegram Gift NFT",
      description: "Gift converted to NFT on TON blockchain",
      image: "https://s.getgems.io/nft/gift.png",
      attributes: [{ trait_type: "Type", value: "Gift" }],
      collectionAddress: "EQD7Qtnas8qpMvT7-Z634_6G60DGp02owte5NnEjaWq6hb7v",
      index: Date.now(),
      content_url: `https://vinagift.netlify.app/nft/${address}.json`
    };

    // Save NFT metadata to DB (no real minting)
    await saveNFTMetadata(address, nftMetadata);

    // Notify user
    await bot.sendMessage(telegramId, `🎉 NFT Gift minted successfully!\nName: ${nftMetadata.name}\nView at: https://vinagift.netlify.app`, {
      reply_markup: {
        inline_keyboard: [[{ text: "🛍 Open Mini App", url: "https://vinagift.netlify.app" }]]
      }
    });

    // Redirect to bot with start param
    return {
      statusCode: 302,
      headers: {
        Location: `https://t.me/VinaGiftBot?start=connected_${address}`
      },
      body: ''
    };

  } catch (error) {
    console.error("Error in ton-connect-callback:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
