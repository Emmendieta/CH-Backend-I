const { ProductManager } = require('../dao/ProductManager.js');
const Router = require('express').Router;
const router = Router();

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);


router.get('/home', async (req, res) => {
        //Obtengo a los productos:
        let products = await PRODUCT_MANAGER.getProducts();
        res.render("home", { products });
});

module.exports = router