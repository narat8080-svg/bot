const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const { verifyTelegramInitData } = require('../utils/telegramAuth');

async function telegramAuth(req, res, next) {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ message: 'initData is required.' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ message: 'Bot token not configured.' });
    }

    const result = verifyTelegramInitData(initData, botToken);
    if (!result.ok) {
      return res.status(401).json({ message: 'Invalid Telegram initData.', detail: result.error });
    }

    const { user } = result.data;
    if (!user || !user.id) {
      return res.status(400).json({ message: 'Telegram user data missing.' });
    }

    const telegramId = user.id.toString();
    const username = user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim();

    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    let dbUser = existing;

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (!dbUser) {
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([{ telegram_id: telegramId, username }])
        .select()
        .single();

      if (insertError) throw insertError;
      dbUser = inserted;
    }

    const tokenPayload = {
      sub: dbUser.id,
      telegram_id: telegramId,
      role: 'user'
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      token,
      user: {
        id: dbUser.id,
        telegram_id: dbUser.telegram_id,
        username: dbUser.username,
        balance: dbUser.balance
      }
    });
  } catch (err) {
    next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return res.status(500).json({ message: 'Admin credentials not configured.' });
    }

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ sub: 'admin', role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  telegramAuth,
  adminLogin
};

