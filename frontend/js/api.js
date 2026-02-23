const API_BASE_URL = `${window.location.origin}/api`;

function getAuthHeaders(token) {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

async function apiGet(path, token) {
  const res = await axios.get(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(token)
  });
  return res.data;
}

async function apiPost(path, body, token) {
  const res = await axios.post(`${API_BASE_URL}${path}`, body, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token)
    }
  });
  return res.data;
}

async function apiDelete(path, token) {
  const res = await axios.delete(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(token)
  });
  return res.data;
}

async function apiPut(path, body, token) {
  const res = await axios.put(`${API_BASE_URL}${path}`, body, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token)
    }
  });
  return res.data;
}

