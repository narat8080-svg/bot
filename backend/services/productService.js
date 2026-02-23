const supabase = require('../config/supabaseClient');

async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function createProduct({ name, description, price }) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateProduct(id, { name, description, price }) {
  const { data, error } = await supabase
    .from('products')
    .update({ name, description, price })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

