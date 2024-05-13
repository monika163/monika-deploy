const express = require("express");
const { requireSignIn } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/authMiddleware");
const {
  createCategoryController,
  updatecategoryController,
  getallcategoryController,
  singlecategoryController,
  deletecategoryController
} = require("./../controllers/categoryController");

const router = express.Router();

//routes
//create categogy
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//update category
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updatecategoryController
);

//get all category
router.get("/get-category", getallcategoryController);

//single category
router.get("/single-category/:slug", singlecategoryController);

//delete category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deletecategoryController
);

module.exports = router;
