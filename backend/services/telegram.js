const TelegramBot = require('node-telegram-bot-api');

const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const adminChatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

const bot = token ? new TelegramBot(token, { polling: false }) : null;

const formatItems = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) return 'No items';
    return items
        .map((item) => {
            const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
            return `- ${item.nameEn} x${item.quantity} = $${lineTotal.toFixed(2)}`;
        })
        .join('\n');
};

const formatDateKh = () => {
    return new Date().toLocaleString('en-KH', { timeZone: 'Asia/Phnom_Penh' });
};

const sendMessage = async (chatId, message) => {
    if (!bot || !chatId) return false;
    try {
        await bot.sendMessage(chatId, message);
        return true;
    } catch (error) {
        console.error('Telegram send message error:', error.message);
        return false;
    }
};

const sendOrderNotification = async (order) => {
    if (!adminChatId) return false;

    const itemsText = formatItems(order.items);
    const message = [
        'PAID ORDER CONFIRMED',
        '',
        `Order Number: ${order.orderNumber}`,
        `Customer: ${order.customer.fullName}`,
        `Phone: ${order.customer.phone}`,
        `Address: ${order.customer.address}`,
        `Email: ${order.customer.email || 'N/A'}`,
        `Note: ${order.customer.note || 'N/A'}`,
        '',
        'Items:',
        itemsText,
        '',
        `Subtotal: $${Number(order.subtotal || 0).toFixed(2)}`,
        'Shipping: Free',
        `Total: $${Number(order.total || 0).toFixed(2)}`,
        `Payment: ${order.paymentMethod}`,
        `Payment Status: ${order.paymentStatus}`,
        `Time: ${formatDateKh()}`
    ].join('\n');

    return sendMessage(adminChatId, message);
};

const sendCustomerOrderCreatedNotification = async (order, user) => {
    const customerChatId = user?.telegramId;
    if (!customerChatId) return false;

    const itemsText = formatItems(order.items);
    const message = [
        'Order received',
        '',
        `Order Number: ${order.orderNumber}`,
        `Status: ${order.orderStatus}`,
        `Payment: ${order.paymentMethod}`,
        `Payment Status: ${order.paymentStatus}`,
        `Total: $${Number(order.total || 0).toFixed(2)}`,
        '',
        'Items:',
        itemsText,
        '',
        'Please complete your payment to confirm this order.',
        `Time: ${formatDateKh()}`
    ].join('\n');

    return sendMessage(customerChatId, message);
};

const sendCustomerPaymentConfirmedNotification = async (order, user) => {
    const customerChatId = user?.telegramId;
    if (!customerChatId) return false;

    const message = [
        'Payment confirmed',
        '',
        `Order Number: ${order.orderNumber}`,
        `Payment Status: ${order.paymentStatus}`,
        `Order Status: ${order.orderStatus}`,
        `Total: $${Number(order.total || 0).toFixed(2)}`,
        '',
        'Your order is confirmed. We are preparing it now.',
        `Time: ${formatDateKh()}`
    ].join('\n');

    return sendMessage(customerChatId, message);
};

module.exports = {
    sendOrderNotification,
    sendCustomerOrderCreatedNotification,
    sendCustomerPaymentConfirmedNotification
};
