function validateAmount(amount) {
  const num = Number(amount);
  if (Number.isNaN(num) || num <= 0) {
    throw new Error('Amount must be a positive number.');
  }
  return Number(num.toFixed(2));
}

function validateProductInput(body) {
  const { name, description, price } = body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new Error('Product name is required and must be at least 2 characters.');
  }
  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    throw new Error('Product description is required and must be at least 5 characters.');
  }
  const priceNum = validateAmount(price);
  return { name: name.trim(), description: description.trim(), price: priceNum };
}

module.exports = { validateAmount, validateProductInput };

