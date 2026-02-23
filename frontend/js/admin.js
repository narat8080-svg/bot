const AdminState = {
  token: null
};

function setAdminView(viewId) {
  document.querySelectorAll('.admin-view').forEach((v) => v.classList.remove('active-view'));
  const el = document.getElementById(viewId);
  if (el) el.classList.add('active-view');
}

async function adminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  const errorEl = document.getElementById('admin-login-error');
  errorEl.textContent = '';

  try {
    const resp = await apiPost('/auth/admin/login', { username, password });
    AdminState.token = resp.token;

    document.getElementById('admin-login-section').classList.add('hidden');
    document.getElementById('admin-panel-section').classList.remove('hidden');

    await loadAdminProducts();
    await loadAdminUsers();
    await loadAdminTransactions();
  } catch (err) {
    console.error('Admin login failed', err);
    const msg = err?.response?.data?.message || 'Login failed.';
    errorEl.textContent = msg;
  }
}

async function loadAdminProducts() {
  if (!AdminState.token) return;
  try {
    const products = await apiGet('/products', AdminState.token);
    const container = document.getElementById('admin-products-list');
    container.innerHTML = '';

    products.forEach((p) => {
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

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '6px';

      const editBtn = document.createElement('button');
      editBtn.className = 'secondary-btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => fillProductForm(p));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'secondary-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteProduct(p.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      footer.appendChild(price);
      footer.appendChild(actions);

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(footer);

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

function fillProductForm(product) {
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-price').value = product.price;
}

async function saveProduct(e) {
  e.preventDefault();
  if (!AdminState.token) return;

  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const price = Number(document.getElementById('product-price').value);

  try {
    if (id) {
      await apiPut(`/products/${id}`, { name, description, price }, AdminState.token);
    } else {
      await apiPost('/products', { name, description, price }, AdminState.token);
    }
    resetProductForm();
    await loadAdminProducts();
  } catch (err) {
    console.error('Failed to save product', err);
    const msg = err?.response?.data?.message || 'Failed to save product.';
    alert(msg);
  }
}

function resetProductForm() {
  document.getElementById('product-id').value = '';
  document.getElementById('product-name').value = '';
  document.getElementById('product-description').value = '';
  document.getElementById('product-price').value = '';
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiDelete(`/products/${id}`, AdminState.token);
    await loadAdminProducts();
  } catch (err) {
    console.error('Failed to delete product', err);
    alert('Failed to delete product');
  }
}

async function loadAdminUsers() {
  if (!AdminState.token) return;
  try {
    const users = await apiGet('/admin/users', AdminState.token);
    const container = document.getElementById('admin-users-list');
    if (!users.length) {
      container.innerHTML = '<p class="small-text">No users yet.</p>';
      return;
    }

    let html =
      '<table><thead><tr><th>ID</th><th>Telegram ID</th><th>Username</th><th>Balance</th><th>Created</th></tr></thead><tbody>';
    users.forEach((u) => {
      html += `<tr>
        <td>${u.id}</td>
        <td>${u.telegram_id}</td>
        <td>${u.username || ''}</td>
        <td>${Number(u.balance || 0).toLocaleString()} KHR</td>
        <td>${new Date(u.created_at).toLocaleString()}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load users', err);
  }
}

async function loadAdminTransactions() {
  if (!AdminState.token) return;
  try {
    const txs = await apiGet('/admin/transactions', AdminState.token);
    const container = document.getElementById('admin-transactions-list');
    if (!txs.length) {
      container.innerHTML = '<p class="small-text">No transactions yet.</p>';
      return;
    }

    let html =
      '<table><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>KHQR Ref</th><th>Created</th></tr></thead><tbody>';
    txs.forEach((t) => {
      html += `<tr>
        <td>${t.id}</td>
        <td>${t.user_id}</td>
        <td>${Number(t.amount).toLocaleString()} KHR</td>
        <td>${t.status}</td>
        <td>${t.khqr_ref || ''}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load transactions', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('admin-login-form');
  loginForm.addEventListener('submit', adminLogin);

  const productForm = document.getElementById('product-form');
  productForm.addEventListener('submit', saveProduct);

  document.getElementById('product-form-reset').addEventListener('click', resetProductForm);

  document.querySelectorAll('.nav-btn[data-admin-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.adminView;
      setAdminView(view);
      if (view === 'users-admin-view') {
        loadAdminUsers();
      } else if (view === 'transactions-admin-view') {
        loadAdminTransactions();
      } else if (view === 'products-admin-view') {
        loadAdminProducts();
      }
    });
  });
});

