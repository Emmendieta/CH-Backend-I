//const { ProductManager } = require('../dao/ProductManager.js');
import ProductManager from '../dao/ProductManager.js';
//const Router = require('express').Router;
import { Router } from 'express';
const router = Router();

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);

router.get('/products', async (req, res) => {
        //Obtengo a los productos:
        let products = await PRODUCT_MANAGER.getProducts();
        res.render("home", { products });
});

router.get('/realtimeproducts', async (req, res) => {
        let products = await PRODUCT_MANAGER.getProducts();
        res.render("realTimeProducts", { products }); 
});

//module.exports = router
export const VIEW_ROUTER = router;