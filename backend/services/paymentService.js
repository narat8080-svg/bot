const supabase = require('../config/supabaseClient');

async function createTransaction({ userId, amount, khqrRef }) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ user_id: userId, amount, status: 'pending', khqr_ref: khqrRef }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function markTransactionPaidAndIncreaseBalance({ transactionId }) {
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (txError) throw txError;
  if (tx.status === 'paid') {
    return tx;
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', tx.user_id)
    .single();

  if (userError) throw userError;

  const newBalance = Number(user.balance || 0) + Number(tx.amount);

  const { data: updatedTx, error: updateTxError } = await supabase
    .from('transactions')
    .update({ status: 'paid' })
    .eq('id', transactionId)
    .select()
    .single();

  if (updateTxError) throw updateTxError;

  const { error: balanceError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', user.id);

  if (balanceError) throw balanceError;

  return updatedTx;
}

module.exports = {
  createTransaction,
  markTransactionPaidAndIncreaseBalance
};

