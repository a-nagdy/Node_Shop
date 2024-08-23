const path = require("path");

const express = require("express");
const { check, body } = require('express-validator');

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// get routes
router.get("/add-product", isAuth, adminController.getAddProductPage);

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// post routes

router.post("/add-product",
    [
        body("title", "Title must be at least 3 characters long.")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body("price", "Price must be a number.")
            .isNumeric(),
        body("description", "Description must be at least 5 characters long.")
            .isLength({ min: 5, max: 400 })
            .trim(),
    ],
    isAuth,
    adminController.postAddProductPage);

router.post("/edit-product", [
    body("title", "Title must be at least 3 characters long.")
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body("price", "Price must be a number.")
        .isNumeric(),
    body("description", "Description must be at least 5 characters long.")
        .isLength({ min: 5, max: 400 })
        .trim(),
]
    , isAuth, adminController.postEditProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;