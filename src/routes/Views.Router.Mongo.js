import { Router } from 'express';
import { ProductsMongoManager as ProductsManager } from '../dao/ProductsMongoManager.js';
import { procesaErrores } from '../utils.js';
export const ROUTER = Router();

ROUTER.get('/products', async(req, res) => {
    try {
        let products = await ProductsManager.get();
        console.log(products);
    
        res.render("products", {
            products
        });
    } catch (error) { procesaErrores(error, res); }
});
