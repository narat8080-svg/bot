const supabase = require('../config/supabaseClient');

async function getMe(req, res, next) {
  try {
    const userId = req.user.sub;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, telegram_id, username, balance, created_at')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, product_id, created_at, products ( name, price )')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (purchasesError) throw purchasesError;

    res.json({
      user,
      purchases
    });
  } catch (err) {
    next(err);
  }
}

async function checkout(req, res, next) {
  try {
    const userId = req.user.sub;
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'productIds must be a non-empty array.' });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No valid products found.' });
    }

    const total = products.reduce((sum, p) => sum + Number(p.price), 0);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (Number(user.balance) < total) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const newBalance = Number(user.balance) - total;

    const purchaseRows = products.map((p) => ({
      user_id: userId,
      product_id: p.id
    }));

    const { error: purchaseError } = await supabase.from('purchases').insert(purchaseRows);
    if (purchaseError) throw purchaseError;

    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    res.json({ message: 'Checkout successful.', total, newBalance });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  checkout
};

