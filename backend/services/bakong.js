const axios = require('axios');
const { BakongKHQR, IndividualInfo, khqrData } = require('bakong-khqr');

const cleanEnvValue = (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const normalizeSiteCode = (value) => {
    const normalized = String(cleanEnvValue(value) || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    return normalized || 'A';
};

class BakongService {
    constructor() {
        const env = cleanEnvValue(process.env.BAKONG_ENV || 'sandbox');
        const normalizedEnv = String(env).toLowerCase();
        const isProduction = ['production', 'prod', 'live'].includes(normalizedEnv);
        const siteCode = normalizeSiteCode(process.env.SITE_CODE || 'A');

        this.accountId = cleanEnvValue(process.env.BAKONG_ACCOUNT_ID);
        this.merchantName = cleanEnvValue(process.env.BAKONG_MERCHANT_NAME);
        this.merchantCity = cleanEnvValue(process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh');
        this.storeLabel = cleanEnvValue(process.env.BAKONG_STORE_LABEL || `SITE-${siteCode}`);
        this.terminalLabel = cleanEnvValue(process.env.BAKONG_TERMINAL_LABEL || `WEB-${siteCode}`);
        this.accessToken = cleanEnvValue(process.env.BAKONG_TOKEN);
        this.baseUrl = isProduction
            ? 'https://api-bakong.nbc.gov.kh/v1'
            : 'https://sit-api-bakong.nbc.gov.kh/v1';
        this.isMock = process.env.BAKONG_MOCK === 'true';
        this.exchangeRate = Number(process.env.BAKONG_EXCHANGE_RATE || 4100);
        this.currency = (process.env.BAKONG_CURRENCY || 'USD').toUpperCase();
        this.khqr = new BakongKHQR();
    }

    // Generate a dummy QR image (base64 PNG) for development
    _generateMockQR() {
        // 1x1 blue pixel PNG (minimal valid PNG)
        const pngHeader = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        return `data:image/png;base64,${pngHeader}`;
    }

    _getAuthHeaders() {
        if (!this.accessToken) {
            throw new Error('Missing BAKONG_TOKEN in environment');
        }

        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': 'my-ecommerce-site-bakong-check/1.0'
        };
    }

    // Generate dynamic KHQR locally using bakong-khqr
    async generateKHQR(order) {
        try {
            const amountInUSD = Number(order.total);
            if (!Number.isFinite(amountInUSD) || amountInUSD <= 0) {
                throw new Error('Invalid order total for KHQR generation');
            }
            const isUSD = this.currency !== 'KHR';
            const khqrCurrency = isUSD ? khqrData.currency.usd : khqrData.currency.khr;
            const khqrAmount = isUSD
                ? Number(amountInUSD.toFixed(2))
                : Math.round(amountInUSD * this.exchangeRate);
            const amountInKHR = isUSD ? null : khqrAmount;

            // Set QR valid for 3 minutes
            const validUntil = new Date(Date.now() + 3 * 60 * 1000).toISOString();

            if (this.isMock) {
                // Mock mode: return dummy data
                return {
                    success: true,
                    qrCode: 'mock_qr_123',
                    qrImage: this._generateMockQR(),
                    md5: 'mock_md5_' + Math.random().toString(36).substring(2, 10),
                    amountUSD: amountInUSD,
                    amountKHR: amountInKHR,
                    currency: isUSD ? 'USD' : 'KHR',
                    validUntil: validUntil
                };
            }

            if (!this.accountId || !this.merchantName) {
                throw new Error('Missing BAKONG_ACCOUNT_ID or BAKONG_MERCHANT_NAME in environment');
            }

            const optionalData = {
                currency: khqrCurrency,
                amount: khqrAmount,
                billNumber: order.orderNumber,
                mobileNumber: String(order.customer?.phone || '').replace(/^0+/, '855'),
                storeLabel: this.storeLabel,
                terminalLabel: this.terminalLabel,
                expirationTimestamp: new Date(validUntil).getTime()
            };

            const individualInfo = new IndividualInfo(
                this.accountId,
                this.merchantName,
                this.merchantCity,
                optionalData
            );
            const khqrResponse = this.khqr.generateIndividual(individualInfo);

            const statusCode = khqrResponse?.status?.code;
            if (statusCode !== 0 || !khqrResponse?.data?.qr || !khqrResponse?.data?.md5) {
                throw new Error(khqrResponse?.status?.message || 'Failed to generate KHQR locally');
            }

            const qrCode = khqrResponse.data.qr;
            const md5 = khqrResponse.data.md5;
            const qrImage = [
                'https://quickchart.io/qr',
                `?size=320`,
                `&ecLevel=M`,
                `&margin=2`,
                `&text=${encodeURIComponent(qrCode)}`
            ].join('');

            return {
                success: true,
                qrCode,
                qrImage,
                md5,
                amountUSD: amountInUSD,
                amountKHR: amountInKHR,
                currency: isUSD ? 'USD' : 'KHR',
                validUntil: validUntil
            };
        } catch (error) {
            console.error('KHQR Generation Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Check payment status using MD5
    async checkPaymentStatus(md5) {
        try {
            if (!md5) {
                return {
                    success: false,
                    status: 'ERROR',
                    error: 'Missing payment reference (md5)'
                };
            }

            const response = await axios.post(
                `${this.baseUrl}/check_transaction_by_md5`,
                { md5 },
                {
                    headers: this._getAuthHeaders(),
                    timeout: 15000
                }
            );

            const responseCode = response.data?.responseCode ?? response.data?.response_code;
            const isPaid = responseCode === 0 || responseCode === '0';

            // Response code 0 means payment found
            if (isPaid) {
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
            const httpStatus = error.response?.status;
            const responseBody = error.response?.data;
            const responseBodyText = typeof responseBody === 'string'
                ? responseBody
                : JSON.stringify(responseBody || {});
            const looksLikeCloudFrontBlock =
                httpStatus === 403 &&
                /cloudfront|request blocked|could not be satisfied/i.test(responseBodyText);
            const isTemporary = [401, 403, 408, 429, 500, 502, 503, 504].includes(httpStatus);
            console.error('Payment check error:', error.response?.data || error.message);

            if (isTemporary) {
                return {
                    success: true,
                    status: 'UNPAID',
                    transient: true,
                    blocked: looksLikeCloudFrontBlock,
                    retryAfterMs: looksLikeCloudFrontBlock ? 45000 : 15000,
                    error: looksLikeCloudFrontBlock
                        ? 'Bakong verification is temporarily blocked by upstream network protection (HTTP 403).'
                        : `Bakong check temporarily unavailable (HTTP ${httpStatus})`
                };
            }

            return {
                success: false,
                status: 'ERROR',
                error: error.message
            };
        }
    }
}

module.exports = new BakongService();
