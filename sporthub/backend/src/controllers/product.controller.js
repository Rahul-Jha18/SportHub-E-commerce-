const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../models/Product');

async function listProducts(req, res, next) {
  try {
    const { category, sport, search } = req.query;
    const products = await getProducts({
      categorySlug: category,
      sportType: sport,
      search,
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function createProductController(req, res, next) {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProductController(req, res, next) {
  try {
    const id = req.params.id;
    await updateProduct(id, req.body);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteProductController(req, res, next) {
  try {
    const id = req.params.id;
    await deleteProduct(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
};
