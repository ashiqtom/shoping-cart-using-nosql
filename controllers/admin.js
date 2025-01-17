const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  });

  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    next(err); // Pass error to the error-handling middleware
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product
    });
  } catch (err) {
    console.error(err);
    next(err); // Pass error to the error-handling middleware
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/');
    }
    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    next(err); // Pass error to the error-handling middleware
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  } catch (err) {
    console.error(err);
    next(err); // Pass error to the error-handling middleware
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const product = await Product.findByIdAndDelete(prodId);
    if (!product) {
      throw new Error('Product not found');
    }

    await User.updateMany(
      { 'cart.items.productId': prodId },
      { $pull: { 'cart.items': { productId: prodId } } }
    );

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error deleting product or updating user carts:', err);
    next(err); // Pass error to the error-handling middleware
  }
};
