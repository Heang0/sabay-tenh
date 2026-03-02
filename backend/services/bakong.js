const axios = require('axios');

class BakongService {
    constructor() {
        this.accountId = process.env.BAKONG_ACCOUNT_ID; // hak_chhaiheag@bkrt
        this.merchantName = process.env.BAKONG_MERCHANT_NAME; // Saby Tenh
        this.accessToken = process.env.BAKONG_ACCESS_TOKEN; // Your token
        this.baseUrl = process.env.BAKONG_ENV === 'production'
            ? 'https://api-bakong.nbc.gov.kh/v1'
            : 'https://api-bakong-sandbox.nbc.gov.kh/v1';
    }

    // Generate KHQR code using official Bakong API
    async generateKHQR(order) {
        try {

            const amountInUSD = order.total;
            const amountInKHR = Math.round(amountInUSD * 4100); // Convert to KHR

            const payload = {
                amount: amountInKHR,
                currency: 'KHR',
                billNumber: order.orderNumber,
                mobileNumber: order.customer.phone.replace(/^0+/, '855'), // Format: 85512345678
                storeLabel: 'Online Store',
                terminalLabel: 'Web',
                accountInformation: this.accountId,
                merchantName: this.merchantName,
                merchantCity: 'Phnom Penh'
            };


            const response = await axios.post(
                `${this.baseUrl}/khrq/generate`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );


            if (response.data && response.data.qrImage) {
                return {
                    success: true,
                    qrCode: response.data.qr,
                    qrImage: `data:image/png;base64,${response.data.qrImage}`, // Has Bakong logo!
                    md5: response.data.md5,
                    amountUSD: amountInUSD,
                    amountKHR: amountInKHR
                };
            } else {
                throw new Error('Failed to generate QR code');
            }
        } catch (error) {
            console.error('KHQR Generation Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Check payment status using MD5
    async checkPaymentStatus(md5) {
        try {

            const response = await axios.post(
                `${this.baseUrl}/check_transaction_by_md5`,
                { md5 },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );


            // Response code 0 means payment found
            if (response.data && response.data.responseCode === 0) {
                return {
                    success: true,
                    status: 'PAID',
                    data: response.data
                };
            } else {
                return {
                    success: true,
                    status: 'UNPAID',
                    data: null
                };
            }
        } catch (error) {
            console.error('Payment check error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'ERROR',
                error: error.message
            };
        }
    }
}

module.exports = new BakongService();