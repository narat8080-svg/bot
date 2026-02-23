const { validateAmount } = require('../utils/validate');
const { createKhqrPayment } = require('../services/khqrService');
const { markTransactionPaidAndIncreaseBalance } = require('../services/paymentService');

async function requestPayment(req, res, next) {
  try {
    const { amount } = req.body;
    if (amount == null) {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    const normalizedAmount = validateAmount(amount);

    const result = await createKhqrPayment({
      userId: req.user.sub,
      amount: normalizedAmount,
      orderMeta: {
        orderType: 'balance_topup',
        description: 'Balance top-up via KHQR'
      }
    });

    res.status(201).json({
      transaction_id: result.transaction.id,
      khqr_ref: result.khqrRef,
      qr_data: result.qrData
    });
  } catch (err) {
    next(err);
  }
}

async function confirmPayment(req, res, next) {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'transactionId is required.' });
    }

    const updatedTx = await markTransactionPaidAndIncreaseBalance({ transactionId });
    res.json({ message: 'Payment confirmed.', transaction: updatedTx });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestPayment,
  confirmPayment
};

