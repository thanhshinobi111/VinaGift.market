from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
import aiohttp

# Tạo menu chính
main_menu = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton("Ví của bạn 📥")],
        [KeyboardButton("Các NFT đang được bán 📦"), KeyboardButton("Profile của bạn 👤")],
        [KeyboardButton("Cài đặt ⚙️")]
    ],
    resize_keyboard=True
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.args and context.args[0].startswith("connected_"):
        wallet_address = context.args[0].replace("connected_", "")
        context.user_data["wallet"] = wallet_address
        await update.message.reply_text(
            f"Đã kết nối ví TON: {wallet_address}",
            reply_markup=main_menu
        )
    else:
        await update.message.reply_text(
            "Xin chào! Đây là ViNaGift Market! Mời bạn chọn một tính năng:",
            reply_markup=main_menu
        )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text

    # Xử lý trạng thái (state)
    if "state" in context.user_data:
        if context.user_data["state"] == "selecting_nft_to_list":
            user_input = user_text.lower()
            if user_input == "hủy":
                context.user_data["state"] = None
                context.user_data.pop("nfts_in_wallet", None)
                await update.message.reply_text("Đã thoát khỏi chế độ chọn NFT.", reply_markup=main_menu)
                return
            try:
                choice = int(user_input) - 1
                nfts = context.user_data["nfts_in_wallet"]
                if 0 <= choice < len(nfts):
                    selected_nft = nfts[choice]
                    context.user_data["selected_nft"] = selected_nft
                    context.user_data["state"] = "entering_nft_price"
                    await update.message.reply_text(
                        f"Bạn đã chọn NFT: {selected_nft['name']}.\nVui lòng nhập giá bán (TON), ví dụ: 5.0:",
                        reply_markup=main_menu
                    )
                else:
                    await update.message.reply_text("Số thứ tự không hợp lệ. Vui lòng thử lại!", reply_markup=main_menu)
            except ValueError:
                await update.message.reply_text("Vui lòng nhập số thứ tự hợp lệ hoặc 'hủy' để thoát!", reply_markup=main_menu)
            return
        elif context.user_data["state"] == "entering_nft_price":
            user_input = user_text.lower()
            if user_input == "hủy":
                context.user_data["state"] = None
                context.user_data.pop("selected_nft", None)
                context.user_data.pop("nfts_in_wallet", None)
                await update.message.reply_text("Đã thoát khỏi chế độ đăng bán NFT.", reply_markup=main_menu)
                return
            try:
                price = float(user_input)
                if price <= 0:
                    await update.message.reply_text("Giá phải lớn hơn 0. Vui lòng nhập lại!", reply_markup=main_menu)
                    return
                selected_nft = context.user_data["selected_nft"]
                wallet_address = context.user_data["wallet"]
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        "https://vinagift.netlify.app/.netlify/functions/list-nft",
                        json={
                            "wallet_address": wallet_address,
                            "nft_address": selected_nft["address"],
                            "name": selected_nft["name"],
                            "description": selected_nft.get("description", ""),
                            "animation_url": selected_nft["animation_url"],
                            "price": price
                        }
                    ) as response:
                        data = await response.json()
                        if "message" in data:
                            await update.message.reply_text(
                                f"Đã đăng bán NFT thành công!\nNFT: {selected_nft['name']}\nGiá: {price} TON",
                                reply_markup=main_menu
                            )
                        else:
                            await update.message.reply_text("Có lỗi xảy ra. Vui lòng thử lại!", reply_markup=main_menu)
                context.user_data["state"] = None
                context.user_data.pop("selected_nft", None)
                context.user_data.pop("nfts_in_wallet", None)
            except ValueError:
                await update.message.reply_text("Vui lòng nhập giá hợp lệ (ví dụ: 5.0) hoặc 'hủy' để thoát!", reply_markup=main_menu)
            return
        elif context.user_data["state"] == "viewing_nfts_for_sale":
            user_input = user_text.lower()
            if user_input == "hủy":
                context.user_data["state"] = None
                context.user_data.pop("nfts_for_sale", None)
                await update.message.reply_text("Đã thoát khỏi danh sách NFT đang bán.", reply_markup=main_menu)
                return
            try:
                choice = int(user_input) - 1
                nfts = context.user_data["nfts_for_sale"]
                if 0 <= choice < len(nfts):
                    nft = nfts[choice]
                    message = f"Chi tiết NFT:\nTên: {nft['name']}\nGiá: {nft['price']} TON\nNgười bán: {nft['seller_address']}"
                    await update.message.reply_text(message, reply_markup=main_menu)
                else:
                    await update.message.reply_text("Số thứ tự không hợp lệ. Vui lòng thử lại!", reply_markup=main_menu)
            except ValueError:
                await update.message.reply_text("Vui lòng nhập số thứ tự hợp lệ hoặc 'hủy' để thoát!", reply_markup=main_menu)
            return

    # Xử lý lựa chọn từ menu
    if user_text == "Ví của bạn 📥":
        if "wallet" in context.user_data:
            wallet_address = context.user_data["wallet"]
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://vinagift.netlify.app/.netlify/functions/get-balance",
                    json={"address": wallet_address}
                ) as response:
                    balance_data = await response.json()
                    balance = balance_data.get("balance", "N/A")

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://vinagift.netlify.app/.netlify/functions/get-nfts",
                    json={"address": wallet_address}
                ) as response:
                    nft_data = await response.json()
                    nfts = nft_data.get("nfts", [])

            message = f"Ví của bạn: {wallet_address}\nSố dư TON: {balance} TON\n\nNFT trong ví của bạn:\n"
            if nfts:
                for idx, nft in enumerate(nfts):
                    message += f"{idx + 1}. {nft['name']} (Bộ sưu tập: {nft['collection_name']})\n"
                    if nft['animation_url']:
                        await update.message.reply_animation(
                            animation=nft['animation_url'],
                            caption=f"{idx + 1}. {nft['name']} (Bộ sưu tập: {nft['collection_name']})"
                        )
                context.user_data["nfts_in_wallet"] = nfts
                context.user_data["state"] = "selecting_nft_to_list"
                message += "\nNhập số thứ tự NFT để đăng bán hoặc 'hủy' để thoát:"
            else:
                message += "Bạn chưa sở hữu NFT nào."
            await update.message.reply_text(message, reply_markup=main_menu)
        else:
            connect_link = "https://app.tonkeeper.com/ton-connect?v=2&manifestUrl=https://vinagift.netlify.app/tonconnect-manifest.json&returnUrl=https://vinagift.netlify.app/.netlify/functions/ton-connect-callback"
            await update.message.reply_text(
                f"Vui lòng kết nối ví TON của bạn:\n{connect_link}",
                reply_markup=main_menu
            )
    elif user_text == "Các NFT đang được bán 📦":
        if "wallet" not in context.user_data:
            await update.message.reply_text("Vui lòng kết nối ví TON trước!", reply_markup=main_menu)
            return
        wallet_address = context.user_data["wallet"]
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://vinagift.netlify.app/.netlify/functions/get-nfts-for-sale",
                json={"seller_address": wallet_address}
            ) as response:
                data = await response.json()
                nfts = data.get("nfts", [])
        if nfts:
            message = "NFT bạn đang bán:\n"
            for idx, nft in enumerate(nfts):
                message += f"{idx + 1}. {nft['name']}: {nft['price']} TON\n"
                if nft['animation_url']:
                    await update.message.reply_animation(
                        animation=nft['animation_url'],
                        caption=f"{idx + 1}. {nft['name']}: {nft['price']} TON"
                    )
            context.user_data["nfts_for_sale"] = nfts
            context.user_data["state"] = "viewing_nfts_for_sale"
            message += "\nNhập số thứ tự NFT để xem chi tiết hoặc 'hủy' để thoát:"
        else:
            message = "Bạn chưa có NFT nào đang bán."
        await update.message.reply_text(message, reply_markup=main_menu)
    elif user_text == "Profile của bạn 👤":
        if "wallet" not in context.user_data:
            await update.message.reply_text("Vui lòng kết nối ví TON trước!", reply_markup=main_menu)
            return
        user_id = str(update.effective_user.id)
        wallet_address = context.user_data["wallet"]
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://vinagift.netlify.app/.netlify/functions/get-user-nfts",
                json={"user_id": user_id, "wallet_address": wallet_address}
            ) as response:
                data = await response.json()
                nfts = data.get("nfts", [])
        if nfts:
            message = "NFT trong profile của bạn:\n"
            for idx, nft in enumerate(nfts):
                message += f"{idx + 1}. {nft['name']}\n"
                if nft['animation_url']:
                    await update.message.reply_animation(
                        animation=nft['animation_url'],
                        caption=f"{idx + 1}. {nft['name']}"
                    )
        else:
            message = "Bạn chưa có NFT nào trong profile."
        await update.message.reply_text(message, reply_markup=main_menu)
    elif user_text == "Cài đặt ⚙️":
        await update.message.reply_text("Đây là phần cài đặt (chưa triển khai).", reply_markup=main_menu)
    else:
        await update.message.reply_text("❓ Mình không hiểu lựa chọn đó. Hãy chọn từ menu.", reply_markup=main_menu)

if __name__ == '__main__':
    app = ApplicationBuilder().token("7596478230:AAGfbq2dSS_N4rGWfyJ8cYjEfFkEIgzfs4Y").build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot đang chạy...")
import asyncio
asyncio.run(app.run_polling())