const express = require("express");
const {
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
} = require("../controllers/productController.js");
const { isAdmin, requireSignIn } = require("../middlewares/authMiddleware.js");
const formidable = require("express-formidable");

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//get products
// router.get("/get-product/:keyword", getproductController);
router.get("/get-product", getproductController);

//single products
router.get("/get-product/:slug", getsingleproductController);

//get photo
router.get("/product-photo/:pid", productphotoController);

//delete products
router.delete("/delete-product/:pid", deleteproductController);

//update products
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateproductController
);

//filter products
router.post("/product-filter", productFilterController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", relatedProductController);

//category wise products
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

module.exports = router;
