import { Router } from 'express';
import { ProductsMongoManager as ProductsManager } from '../dao/ProductsMongoManager.js';
import { procesaErrores } from '../utils.js';
import { isValidObjectId } from 'mongoose';
import { CartMongoManager  as CartManager } from '../dao/CartMongoManager.js';
export const ROUTER = Router();

ROUTER.get('/products', async (req, res) => {
    let { page, limit, sort, query } = req.query;
    if (!page) { page = 1 };
    if (!limit) { limit = 10 };
    //Ordenamiento descendiente o asendente:
    const sortOption = sort === 'asc' ? {price: 1} : sort === 'desc' ? {price: -1} : {};
    //Armado del filtro:
    const filter = {};
    if (query) {
        if(query === 'disponible' || query === 'true') {
            filter.status = true; //filtro de disponibilidad
        } else if (query === 'false') {
            filter.status = false;  
        } else {
            filter.category = query; // filtro por categoria
        }
    }

    //Obtengo a los productos:
    let { docs: products, totalPages, hasNextPage, nextPage, hasPrevPage, prevPage } = await ProductsManager.get(page, limit, sortOption,  filter);

    const prevLink = hasPrevPage ? `/products?page=${prevPage}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/products?page=${nextPage}&limit=${limit}` : null;

    res.render("products", {
        products,
        totalPages,
        hasNextPage,
        nextPage,
        hasPrevPage,
        prevPage,
        prevLink,
        nextLink, 
        page
    });
});

//Mostrar un solo producto:
ROUTER.get('/products/:pid', async (req, res) => {
    try {
        let {pid} = req.params;
        if (!isValidObjectId(pid)) {
            return res.status(400).render('error', {mensaje: `El id: ${pid} del producto no es un formato válido, por favor verifiquelo!`});
        };
        const product = await ProductsManager.getById(pid);
        if (!product) {
            return res.status(400).render('error', {mensaje: `Error: El id :${pid} no existe en la Base de Datos, por favor, verifiquelo!`});
        };
        res.render('product', { ...product });
    } catch (error) { procesaErrores(error, res); }
});

//Método para traer un carrito por el id: 
ROUTER.get('/carts/:cid', async (req, res) => {
    try {
        let { cid } =  req.params;
        if (!isValidObjectId(cid)) {
            return res.status(400).render('error', { mensaje: `El id: ${cid} del carrito no es un formato válido, por favor verifiquelo!` });
        }
        const cart = await CartManager.getCartById(cid);
        if (!cart) {
            return res.status(400).render('error', {mensaje: `Error: No existe ningun carrito con el id: ${cid}, por favor verifiquelo!`});
        };
        if (cart.products.length === 0) {
            return res.status(400).render('error', {mensaje: `Error: No existen productos en el carrito con id: ${cid}!`});
        }
        let products = [];
        for (let pro of cart.products) {
            const completeProduct = pro.product;
            const cantidad = pro.quantity; 
            products.push({
                title: completeProduct.title,
                quantity: cantidad
            });
        }
        res.render("cart", {cart, products});
    } catch (error) {procesaErrores(error, res);}
});