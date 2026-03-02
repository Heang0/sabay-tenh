const TelegramBot = require('node-telegram-bot-api');

// Get from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

const sendOrderNotification = async (order) => {
    try {
        // Format items list
        const itemsList = order.items.map(item =>
            `• ${item.nameEn} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        // Create message
        const message = `
🛍️ **NEW ORDER RECEIVED!** 🛍️

📋 **Order Number:** ${order.orderNumber}
👤 **Customer:** ${order.customer.fullName}
📞 **Phone:** ${order.customer.phone}
📍 **Address:** ${order.customer.address}
📧 **Email:** ${order.customer.email || 'N/A'}
📝 **Note:** ${order.customer.note || 'N/A'}

🛒 **Items:**
${itemsList}

💰 **Subtotal:** $${order.subtotal.toFixed(2)}
🚚 **Shipping:** Free
💵 **Total:** $${order.total.toFixed(2)}

💳 **Payment:** ${order.paymentMethod}
⏰ **Time:** ${new Date().toLocaleString('en-KH', { timeZone: 'Asia/Phnom_Penh' })}

🔗 **Payment Link:**
https://link.payway.com.kh/ABAPAYdj419233l?amount=${order.total}&orderId=${order.orderNumber}
        `;

        // Send to Telegram group
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('❌ Telegram notification error:', error);
    }
};

module.exports = { sendOrderNotification };