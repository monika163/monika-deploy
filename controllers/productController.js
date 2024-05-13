const productModel = require("../models/productModel.js");
const categoryModel = require("../models/categoryModel.js");
const orderModel = require("../models/orderModel.js");
const fs = require("fs");
const slugify = require("slugify");
const braintree = require("braintree");
const dotenv = require("dotenv");

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

const createProductController = async (req, resp) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return resp.status(500).send({ error: "Name is Required" });
      case !description:
        return resp.status(500).send({ error: "Description is Required" });
      case !price:
        return resp.status(500).send({ error: "Price is Required" });
      case !category:
        return resp.status(500).send({ error: "Category is Required" });
      case !quantity:
        return resp.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return resp
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    resp.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      error,
      message: "Error in crearing product"
    });
  }
};

//get all products
const getproductController = async (req, resp) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    resp.status(200).send({
      success: "All Products",
      products,
      Count_Total: products.length
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "error in getting products",
      error: error.message
    });
  }
};

const getsingleproductController = async (req, resp) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    resp.status(200).send({
      success: true,
      message: "Single Products Fetched",
      product
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting single products",
      error
    });
  }
};

//get photo
const productphotoController = async (req, resp) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      resp.set("Content-type", product.photo.contentType);
      return resp.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "error while getting product photo",
      error
    });
  }
};

//delete product
const deleteproductController = async (req, resp) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    resp.status(200).send({
      success: true,
      message: "Product Deleted Succesfully"
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while deleting products",
      error
    });
  }
};

//update product
const updateproductController = async (req, resp) => {
  try {
    try {
      const { name, description, price, category, quantity, shipping } =
        req.fields;
      const { photo } = req.files;
      //alidation
      switch (true) {
        case !name:
          return resp.status(500).send({ error: "Name is Required" });
        case !description:
          return resp.status(500).send({ error: "Description is Required" });
        case !price:
          return resp.status(500).send({ error: "Price is Required" });
        case !category:
          return resp.status(500).send({ error: "Category is Required" });
        case !quantity:
          return resp.status(500).send({ error: "Quantity is Required" });
        case photo && photo.size > 1000000:
          return resp
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
      }

      const products = await productModel.findByIdAndUpdate(
        req.params.pid,
        {
          ...req.fields,
          slug: slugify(name)
        },
        { new: true }
      );

      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      }
      await products.save();
      resp.status(201).send({
        success: true,
        message: "Product Created Successfully",
        products
      });
    } catch (error) {
      console.log(error);
      resp.status(500).send({
        success: false,
        error,
        message: "Error in crearing product"
      });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while updating products",
      error
    });
  }
};

//product filter controller
const productFilterController = async (req, resp) => {
  try {
    const { checked, radio } = req.body;
    const args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    resp.status(200).send({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error While Filtering Products",
      error
    });
  }
};

//product count controller
const productCountController = async (req, resp) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    resp.status(200).send({
      success: true,
      total
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in Product Count",
      error
    });
  }
};

//product list based on pages
const productListController = async (req, resp) => {
  try {
    //product per pages
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    resp.status(200).send({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error
    });
  }
};

//search Product
const searchProductController = async (req, resp) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          {
            description: { $regex: keyword, $options: "i" }
          }
        ]
      })
      .select("-photo");
    resp.json(results);
    // resp.status(200).send({
    //   success: true,
    //   products
    // });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in search product api",
      error
    });
  }
};
//similar products
const relatedProductController = async (req, resp) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    resp.status(200).send({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "error while getting related products",
      error
    });
  }
};

//get product by categories
const productCategoryController = async (req, resp) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    resp.status(200).send({
      success: true,
      category,
      products
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error While Getting Products"
    });
  }
};

//payment gateway api
const braintreeTokenController = async (req, resp) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        resp.status(500).send(err);
      } else {
        resp.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payments
const brainTreePaymentController = async (req, resp) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true
        }
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id
          }).save();
          resp.json({ ok: true });
        } else {
          resp.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createProductController,
  getproductController,
  getsingleproductController,
  productphotoController,
  deleteproductController,
  updateproductController,
  productFilterController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController
};
