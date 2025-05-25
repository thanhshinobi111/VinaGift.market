# bot.py
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
import requests
from dotenv import load_dotenv

# Tải biến môi trường từ .env
load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
NETLIFY_API_URL = os.getenv('NETLIFY_API_URL', 'https://vinagift.netlify.app')

# Khởi tạo bot
application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý lệnh /start"""
    user = update.effective_user
    keyboard = [
        [InlineKeyboardButton("Ví của bạn", url=f"{NETLIFY_API_URL}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        f"Chào {user.first_name}! Chào mừng bạn đến với Vina Gift Marketplace.\n"
        "Nhấn 'Ví của bạn' để xem số dư và NFT của bạn!",
        reply_markup=reply_markup
    )

async def wallet(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý lệnh /wallet"""
    keyboard = [
        [InlineKeyboardButton("Mở ví", url=f"{NETLIFY_API_URL}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Nhấn nút dưới để mở ví và xem NFT của bạn!",
        reply_markup=reply_markup
    )

async def nfts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Xử lý lệnh /nfts: Lấy danh sách NFT từ API"""
    telegram_id = str(update.effective_user.id)
    
    try:
        # Lấy TON address từ telegramId (gọi API hoặc MongoDB trực tiếp)
        response = requests.post(
            f"{NETLIFY_API_URL}/api/get-user-address",
            json={"telegramId": telegram_id},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            await update.message.reply_text("Không tìm thấy địa chỉ ví của bạn. Vui lòng kết nối ví trong Mini App!")
            return
        
        address_data = response.json()
        ton_address = address_data.get("address")
        if not ton_address:
            await update.message.reply_text("Không tìm thấy địa chỉ ví của bạn. Vui lòng kết nối ví trong Mini App!")
            return

        # Gọi API /api/get-nfts để lấy NFT
        response = requests.post(
            f"{NETLIFY_API_URL}/api/get-nfts",
            json={"address": ton_address},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            await update.message.reply_text("Lỗi khi lấy danh sách NFT. Vui lòng thử lại sau!")
            return

        data = response.json()
        nfts = data.get("nfts", [])
        
        if not nfts:
            await update.message.reply_text("Bạn chưa sở hữu NFT nào!")
            return

        # Tạo danh sách NFT
        nft_list = "\n\n".join([
            f"📦 *{nft['name']}*\n"
            f"Mô tả: {nft['description']}\n"
            f"Hình ảnh: {nft['image']}\n"
            f"Index: {nft['index']}"
            for nft in nfts
        ])
        await update.message.reply_text(
            f"Danh sách NFT của bạn:\n\n{nft_list}",
            parse_mode="Markdown"
        )
    except Exception as e:
        await update.message.reply_text(f"Lỗi: {str(e)}")

def main() -> None:
    """Chạy bot"""
    # Thêm các handler
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("wallet", wallet))
    application.add_handler(CommandHandler("nfts", nfts))

    # Chạy bot
    print("Bot is running...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()