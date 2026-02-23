window.AppAuth = {
  userToken: null,
  userInfo: null
};

(async function initTelegramAuth() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) {
      console.warn('Telegram WebApp SDK not detected. Running in browser mode.');
      return;
    }

    tg.ready();

    const initData = tg.initData;
    if (!initData) {
      console.warn('Missing initData from Telegram WebApp.');
      return;
    }

    const resp = await apiPost('/auth/telegram', { initData });
    window.AppAuth.userToken = resp.token;
    window.AppAuth.userInfo = resp.user;

    const usernameEl = document.getElementById('username-display');
    const balanceEl = document.getElementById('balance-display');

    if (usernameEl && balanceEl) {
      usernameEl.textContent = resp.user.username || `User ${resp.user.telegram_id}`;
      balanceEl.textContent = `Balance: ${Number(resp.user.balance || 0).toLocaleString()} KHR`;
    }

    document.dispatchEvent(new CustomEvent('app:auth-ready', { detail: resp }));
  } catch (err) {
    console.error('Failed to authenticate via Telegram:', err);
  }
})();

