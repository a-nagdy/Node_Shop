const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
const Product = require("../models/product");
const { mongoose } = require("mongoose");

exports.getAddProductPage = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-products",
        activeAddProduct: true,
        editing: false,
        oldInput: {
            title: "",
            imageUrl: "",
            price: "",
            description: "",
        },
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
}

exports.postAddProductPage = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image);
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-products",
            activeAddProduct: true,
            editing: false,
            hasError: true,
            product: {
                title,
                price,
                description,
            },
            validationErrors: [],
            errorMessage: 'Attached file is not an image.',
        });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-products",
            activeAddProduct: true,
            editing: false,
            hasError: true,
            product: {
                title,
                image,
                price,
                description,
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg,
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user,

    });
    product
        .save()
        .then(result => {
            console.log("Created Product");
            res.redirect("/admin/products");
        })
        .catch(err => {
            // return res.status(500).render("admin/edit-product", {
            //     pageTitle: "add Product",
            //     path: "/admin/add-products",
            //     activeAddProduct: true,
            //     editing: true,
            //     hasError: true,
            //     product: {
            //         title,
            //         imageUrl,
            //         price,
            //         description,
            //     },
            //     validationErrors: [],
            //     errorMessage: "Database operation failed, please try again.",
            // });
            // res.redirect("/500");

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("admin/edit-product", {
                pageTitle: "Add Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("admin/edit-product", {
            pageTitle: "edit Product",
            path: "/admin/edit-products",
            activeAddProduct: true,
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId,
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg,
        });
    }
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            return product
                .save().then(result => {
                    console.log("UPDATED PRODUCT");
                    res.redirect("/admin/products");
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .populate("userId")
        .then(products => {
            console.log(products)
            res.render("admin/products", {
                prods: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error("Product not found"))
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: prodId, userId: req.user._id })
    }).then(result => {
        console.log("Deleted PRODUCT");
        res.status(200).json({ message: "Success!" });
    }).catch(err => {
        res.status(500).json({ message: "Deleting product failed." })
    });
}