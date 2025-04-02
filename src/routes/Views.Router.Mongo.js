import { Router } from 'express';
import { ProductsMongoManager as ProductsManager } from '../dao/ProductsMongoManager.js';
import { procesaErrores } from '../utils.js';
export const ROUTER = Router();

ROUTER.get('/', async (req, res) => {
    let {page, limit} = req.query;
    if(!page) { page = 1};
    if (!limit) { limit = 10};
    //Obtengo a los productos:
    let {docs:products, totalPages, hasNextPage, nextPage, hasPrevPage, prevPage } = await ProductsManager.get(page, limit);

    res.render("products", { 
        products,
        totalPages, 
        hasNextPage, 
        nextPage, 
        hasPrevPage, 
        prevPage
    });
});

ROUTER.get('/products', async (req, res) => {
        let {page, limit} = req.query;
        if(!page) { page = 1};
        if (!limit) { limit = 10};
        //Obtengo a los productos:
        let {docs:products, totalPages, hasNextPage, nextPage, hasPrevPage, prevPage } = await ProductsManager.get(page, limit);

        res.render("products", { 
            products,
            totalPages, 
            hasNextPage, 
            nextPage, 
            hasPrevPage, 
            prevPage
        });
});
