const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
const JWT = require("jsonwebtoken");

const registerController = async (req, resp) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validation
    if (!name) {
      return resp.send({
        message: "name is required"
      });
    }
    if (!email) {
      return resp.send({
        message: "email is required"
      });
    }
    if (!password) {
      return resp.send({
        message: "password is required"
      });
    }
    if (!phone) {
      return resp.send({
        message: "phone is required"
      });
    }
    if (!address) {
      return resp.send({
        message: "address is required"
      });
    }

    if (!answer) {
      return resp.send({
        message: "Answer is required"
      });
    }

    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return resp.status(200).send({
        success: false,
        message: "already registered please login"
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer
    }).save();
    resp.status(201).send({
      success: true,
      message: "user registered successfully",
      user
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "error in registration",
      error
    });
  }
};

//login
const loginController = async (req, resp) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      resp.status(404).send({
        success: false,
        message: "inValid Email and Password"
      });
    }
    //get user
    const user = await userModel.findOne({ email });
    if (!user) {
      return resp.status(404).send({
        success: false,
        message: "email is not registered"
      });
    }
    const match = comparePassword(password, user.password);
    if (!match) {
      return resp.status(200).send({
        success: false,
        message: "invalid password"
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    resp.status(200).send({
      success: true,
      message: "login successfullty",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "error in login",
      error
    });
  }
};

//test controller
const testController = (req, resp) => {
  resp.send("Protected Route");
};

//forgot password controller
const forgotpasswordController = async (req, resp) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      resp.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      resp.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      resp.status(400).send({ message: "newPassword is required" });
    }
    //check
    const user = await userModel({ email, answer });
    //validation
    if (!user) {
      return resp.status(404).send({
        success: false,
        message: "Wrong email or answer"
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    resp.status(200).send({
      success: true,
      message: "Password Reset Successfully"
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      sucees: false,
      message: "Something Went Wrong",
      error
    });
  }
};

//update profile
const updateProfileController = async (req, resp) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return resp.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address
      },
      { new: true }
    );
    resp.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error
    });
  }
};

module.exports = {
  registerController,
  loginController,
  testController,
  forgotpasswordController,
  updateProfileController
};
