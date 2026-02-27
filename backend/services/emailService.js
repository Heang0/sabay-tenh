const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps with some hosting issues
    }
});

// Generate professional receipt HTML
const generateReceiptHTML = (order) => {
    const itemsList = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eaeaea;">
            <td style="padding: 12px 8px; font-family: 'Arial', sans-serif;">${item.nameEn}</td>
            <td style="padding: 12px 8px; font-family: 'Arial', sans-serif; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; font-family: 'Arial', sans-serif; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 12px 8px; font-family: 'Arial', sans-serif; text-align: right; font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header with Brand Color -->
                <tr>
                    <td style="background: linear-gradient(135deg, #005E7B 0%, #0078A0 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sabay Tenh</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
                    </td>
                </tr>
                
                <!-- Order Status Badge -->
                <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                        <div style="background-color: #e8f5e9; border-radius: 50px; padding: 12px 20px; text-align: center;">
                            <span style="color: #2e7d32; font-weight: 600; font-size: 18px;">✓ Order Placed Successfully</span>
                        </div>
                    </td>
                </tr>
                
                <!-- Order Details -->
                <tr>
                    <td style="padding: 0 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 10px 0;">
                                    <span style="color: #666; font-size: 14px;">Order Number</span>
                                    <h3 style="margin: 5px 0 0 0; color: #005E7B; font-size: 20px;">${order.orderNumber}</h3>
                                </td>
                                <td style="padding: 10px 0; text-align: right;">
                                    <span style="color: #666; font-size: 14px;">Order Date</span>
                                    <h3 style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${orderDate}</h3>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Items Table -->
                <tr>
                    <td style="padding: 20px 30px;">
                        <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">Order Summary</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 12px 8px; text-align: left; color: #666; font-size: 14px;">Item</th>
                                    <th style="padding: 12px 8px; text-align: center; color: #666; font-size: 14px;">Qty</th>
                                    <th style="padding: 12px 8px; text-align: right; color: #666; font-size: 14px;">Price</th>
                                    <th style="padding: 12px 8px; text-align: right; color: #666; font-size: 14px;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>
                    </td>
                </tr>
                
                <!-- Totals -->
                <tr>
                    <td style="padding: 0 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #eaeaea;">
                            <tr>
                                <td style="padding: 15px 0 5px 0; text-align: right;">
                                    <span style="color: #666; font-size: 16px;">Subtotal:</span>
                                </td>
                                <td style="padding: 15px 0 5px 15px; text-align: right; width: 100px;">
                                    <span style="color: #333; font-size: 16px;">$${order.subtotal.toFixed(2)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; text-align: right;">
                                    <span style="color: #666; font-size: 16px;">Shipping:</span>
                                </td>
                                <td style="padding: 5px 0 5px 15px; text-align: right;">
                                    <span style="color: #4caf50; font-size: 16px;">FREE</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 15px 0; text-align: right; border-top: 2px solid #eaeaea;">
                                    <span style="color: #333; font-size: 20px; font-weight: bold;">Total:</span>
                                </td>
                                <td style="padding: 15px 0 15px 15px; text-align: right; border-top: 2px solid #eaeaea;">
                                    <span style="color: #005E7B; font-size: 24px; font-weight: bold;">$${order.total.toFixed(2)}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Payment Section - Clean & Professional (No Emojis) -->
                <tr>
                    <td style="padding: 20px 30px;">
                        <div style="background-color: #f0f9ff; border-left: 4px solid #005E7B; border-radius: 6px; padding: 16px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px 0; color: #005E7B; font-weight: 600; font-size: 15px;">Complete Your Payment</p>
                                        <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">Click the link below to pay via ABA:</p>
                                        <a href="https://link.payway.com.kh/ABAPAYdj419233l?amount=${order.total}&orderId=${order.orderNumber}" 
                                           style="display: inline-block; background: #005E7B; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">
                                            Pay Now with ABA
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                
                <!-- Shipping Address (No Emojis) -->
                <tr>
                    <td style="padding: 20px 30px;">
                        <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">Shipping Address</h3>
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px;">
                            <p style="margin: 5px 0; color: #333; font-size: 15px;"><strong>${order.customer.fullName}</strong></p>
                            <p style="margin: 5px 0; color: #666; font-size: 14px;">Phone: ${order.customer.phone}</p>
                            <p style="margin: 5px 0; color: #666; font-size: 14px;">Address: ${order.customer.address}</p>
                            ${order.customer.email ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">Email: ${order.customer.email}</p>` : ''}
                            ${order.customer.note ? `<p style="margin: 5px 0; color: #666; font-size: 14px; font-style: italic;">Note: ${order.customer.note}</p>` : ''}
                        </div>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eaeaea;">
                        <p style="color: #666; font-size: 13px; margin: 0 0 5px 0;">Need help? Contact us at <a href="mailto:support@sabaytenh.com" style="color: #005E7B; text-decoration: none;">support@sabaytenh.com</a></p>
                        <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Sabay Tenh. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

// Send order receipt email
const sendOrderReceipt = async (order) => {
    try {
        if (!order.customer.email) {
            console.log('No email provided, skipping receipt');
            return;
        }

        const mailOptions = {
            from: `"Sabay Tenh" <${process.env.EMAIL_USER}>`,
            to: order.customer.email,
            subject: `Order Confirmation #${order.orderNumber}`,
            html: generateReceiptHTML(order)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Professional receipt sent to ${order.customer.email}:`, info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

module.exports = { sendOrderReceipt };