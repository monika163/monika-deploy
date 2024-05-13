const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");
//protected routes token base

const requireSignIn = async (req, resp, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

//admin access
const isAdmin = async (req, resp, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return resp.status(401).send({
        success: false,
        message: "unAuthorized Access"
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    resp.status(401).send({
      success: false,
      error,
      message: "error in admin middleware"
    });
  }
};

//admin access
const isUser = async (req, resp, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 0) {
      return resp.status(401).send({
        success: false,
        message: "unAuthorized Access"
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    resp.status(401).send({
      success: false,
      error,
      message: "error in user middleware"
    });
  }
};
module.exports = { requireSignIn, isAdmin };
