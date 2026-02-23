const state = {
  products: [],
  cart: [],
  me: null
};

function setActiveView(viewId) {
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('active-view'));
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active-view');
}

function renderProducts() {
  const container = document.getElementById('products-list');
  container.innerHTML = '';

  state.products.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = p.name;

    const desc = document.createElement('div');
    desc.className = 'card-description';
    desc.textContent = p.description;

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const price = document.createElement('span');
    price.textContent = `${Number(p.price).toLocaleString()} KHR`;

    const btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.textContent = 'Details';
    btn.addEventListener('click', () => openProductModal(p));

    footer.appendChild(price);
    footer.appendChild(btn);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

function openProductModal(product) {
  const modal = document.getElementById('product-modal');
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-description').textContent = product.description;
  document.getElementById(
    'modal-product-price'
  ).textContent = `${Number(product.price).toLocaleString()} KHR`;

  const addBtn = document.getElementById('modal-add-to-cart-btn');
  addBtn.onclick = () => {
    addToCart(product);
    closeProductModal();
  };

  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function addToCart(product) {
  state.cart.push(product);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  container.innerHTML = '';

  let total = 0;

  state.cart.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'cart-item';

    const name = document.createElement('span');
    name.textContent = p.name;

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '8px';

    const price = document.createElement('span');
    price.textContent = `${Number(p.price).toLocaleString()} KHR`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'secondary-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.cart.splice(idx, 1);
      renderCart();
    });

    right.appendChild(price);
    right.appendChild(removeBtn);

    row.appendChild(name);
    row.appendChild(right);

    container.appendChild(row);

    total += Number(p.price);
  });

  totalEl.textContent = total.toLocaleString();
}

async function loadProducts() {
  try {
    const products = await apiGet('/products');
    state.products = products;
    renderProducts();
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

async function loadDashboard() {
  try {
    if (!window.AppAuth.userToken) return;
    const me = await apiGet('/user/me', window.AppAuth.userToken);
    state.me = me;

    const dash = document.getElementById('dashboard-content');
    const balance = me.user.balance || 0;

    let html = `
      <div class="form-card">
        <h3>Account</h3>
        <p><strong>User:</strong> ${me.user.username || me.user.telegram_id}</p>
        <p><strong>Telegram ID:</strong> ${me.user.telegram_id}</p>
        <p><strong>Balance:</strong> ${Number(balance).toLocaleString()} KHR</p>
      </div>
      <div class="form-card">
        <h3>Purchases</h3>
    `;

    if (!me.purchases || me.purchases.length === 0) {
      html += '<p class="small-text">No purchases yet.</p>';
    } else {
      html += '<ul>';
      me.purchases.forEach((p) => {
        html += `<li>${new Date(p.created_at).toLocaleString()} – ${
          p.products?.name || 'Product'
        } (${Number(p.products?.price || 0).toLocaleString()} KHR)</li>`;
      });
      html += '</ul>';
    }

    html += '</div>';

    dash.innerHTML = html;

    const balanceEl = document.getElementById('balance-display');
    if (balanceEl) {
      balanceEl.textContent = `Balance: ${Number(balance).toLocaleString()} KHR`;
    }
  } catch (err) {
    console.error('Failed to load dashboard', err);
  }
}

async function handleCheckout() {
  if (!window.AppAuth.userToken) {
    alert('Please open this app from Telegram.');
    return;
  }

  if (!state.cart.length) {
    alert('Your cart is empty.');
    return;
  }

  const productIds = state.cart.map((p) => p.id);

  try {
    const resp = await apiPost('/user/checkout', { productIds }, window.AppAuth.userToken);
    alert(`Checkout successful. Total: ${resp.total.toLocaleString()} KHR`);
    state.cart = [];
    renderCart();
    await loadDashboard();
  } catch (err) {
    console.error('Checkout failed', err);
    const msg = err?.response?.data?.message || 'Checkout failed.';
    alert(msg);
  }
}

async function handleAddBalance(e) {
  e.preventDefault();
  if (!window.AppAuth.userToken) {
    alert('Please open this app from Telegram.');
    return;
  }

  const amountInput = document.getElementById('topup-amount');
  const amount = amountInput.value;

  if (!amount || Number(amount) <= 0) {
    alert('Amount must be positive.');
    return;
  }

  try {
    const resp = await apiPost(
      '/payment/request',
      { amount: Number(amount) },
      window.AppAuth.userToken
    );
    const qrSection = document.getElementById('khqr-result');
    const qrDataEl = document.getElementById('khqr-data');
    qrDataEl.value = resp.qr_data;
    qrSection.classList.remove('hidden');
    alert('KHQR generated. Please scan with your Bakong wallet.');
  } catch (err) {
    console.error('Failed to create KHQR', err);
    const msg = err?.response?.data?.message || 'Failed to create KHQR payment.';
    alert(msg);
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      setActiveView(view);
      if (view === 'dashboard-view') {
        loadDashboard();
      }
    });
  });

  const closeBtn = document.getElementById('modal-close-btn');
  closeBtn.addEventListener('click', closeProductModal);

  const modal = document.getElementById('product-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProductModal();
  });

  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
  document.getElementById('add-balance-form').addEventListener('submit', handleAddBalance);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadProducts();
});

document.addEventListener('app:auth-ready', () => {
  loadDashboard();
});

