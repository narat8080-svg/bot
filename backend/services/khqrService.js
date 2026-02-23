const axios = require('axios');
const { validateAmount } = require('../utils/validate');
const { createTransaction } = require('./paymentService');

async function createKhqrPayment({ userId, amount, orderMeta = {} }) {
  const normalizedAmount = validateAmount(amount);

  const endpoint = process.env.KHQR_ENDPOINT;
  const merchantId = process.env.KHQR_MERCHANT_ID;
  const bakongWalletId = process.env.KHQR_WALLET_ID;
  const secretKey = process.env.KHQR_SECRET_KEY;

  if (!endpoint || !merchantId || !bakongWalletId || !secretKey) {
    throw new Error('KHQR configuration missing in environment variables.');
  }

  const payload = {
    amount: normalizedAmount,
    currency: 'KHR',
    description: orderMeta.description || 'Balance top-up',
    merchant_id: merchantId,
    bakong_wallet_id: bakongWalletId,
    metadata: {
      user_id: userId,
      order_type: orderMeta.orderType || 'balance_topup'
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': secretKey
  };

  const { data: khqrResponse } = await axios.post(endpoint, payload, { headers });

  const khqrRef = khqrResponse.reference || khqrResponse.ref || khqrResponse.id || null;
  const qrData = khqrResponse.qr || khqrResponse.qr_data || khqrResponse.data || null;

  if (!khqrRef || !qrData) {
    throw new Error('Unexpected KHQR response: missing reference or QR data.');
  }

  const transaction = await createTransaction({
    userId,
    amount: normalizedAmount,
    khqrRef
  });

  return {
    transaction,
    qrData,
    khqrRef
  };
}

module.exports = {
  createKhqrPayment
};

