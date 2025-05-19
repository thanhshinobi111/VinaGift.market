
#menu chính
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    main_menu = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton("📥 Ví của bạn"), KeyboardButton("📤 Đăng NFT lên chợ")],
            [KeyboardButton("📦 Các NFT đang được bán"), KeyboardButton("⚙️ Cài đặt")]
        ],
        resize_keyboard=True
    )
    
    await update.message.reply_text(
        "Xin chào! Đây là ViNaGift Market ! Mời bạn chọn một tính năng:",
        reply_markup=main_menu
    )
async def handle_menu_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_choice = update.message.text

    if user_choice == "👛 Ví của bạn":
        await update.message.reply_text("🔐 Đây là ví của bạn...")
    elif user_choice == "📤 Đăng NFT lên chợ":
        await update.message.reply_text("🖼 Hãy gửi ảnh hoặc thông tin NFT của bạn...")
    elif user_choice == "🛍 Các NFT đang được bán":
        await update.message.reply_text("📦 Danh sách NFT đang được bán...")
    elif user_choice == "⚙️ Cài đặt":
        await update.message.reply_text("⚙️ Đây là phần cài đặt.")
    else:
        await update.message.reply_text("❓ Mình không hiểu lựa chọn đó. Hãy chọn từ menu.")

if __name__ == '__main__':
    app = ApplicationBuilder().token("7596478230:AAGfbq2dSS_N4rGWfyJ8cYjEfFkEIgzfs4Y").build()

    app.add_handler(CommandHandler("start", start))

    print("Bot đang chạy...")
    app.run_polling()

# khởi tạo bot
if __name__ == "__main__":
    app = ApplicationBuilder().token("7596478230:AAGfbq2dSS_N4rGWfyJ8cYjEfFkEIgzfs4Y").build()
    app.add_handler(CommandHandler("start", start))

    print("Bot đang chạy...")
    app.run_polling()
    