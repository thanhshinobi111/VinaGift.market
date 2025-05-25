// index.js

require('dotenv').config(); // Load biến từ .env

const TelegramBot = require('node-telegram-bot-api');

// ✅ Danh sách các biến cần thiết
const requiredEnv = ['TELEGRAM_BOT_TOKEN', 'MONGODB_URI', 'NETLIFY_API_URL', 'TONCENTER_API_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Thiếu biến môi trường: ${key}`);
    process.exit(1);
  }
}

// ✅ Lấy biến từ .env
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const netlifyUrl = process.env.NETLIFY_API_URL;
const tonApiKey = process.env.TONCENTER_API_KEY;

// 🔁 Khởi động bot Telegram
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🤖 Chào bạn! Bot đã hoạt động.\n\n🌐 Netlify URL: ${netlifyUrl}`);
});

bot.on('message', (msg) => {
  console.log(`📩 Message từ ${msg.chat.username || msg.chat.first_name}: ${msg.text}`);
});
