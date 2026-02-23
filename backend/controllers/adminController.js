const supabase = require('../config/supabaseClient');

async function listUsers(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, telegram_id, username, balance, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function listTransactions(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, amount, status, khqr_ref, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  listTransactions
};

