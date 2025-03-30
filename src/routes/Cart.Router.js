//const { Router } = require("express");
import { Router } from "express";
//const { CartManager } = require("../dao/CartManager.js");
import CartManager from "../dao/CartManager.js";
//const { ProductManager } = require("../dao/ProductManager.js");
import ProductManager from "../dao/ProductManager.js";

const ROUTER = Router();

const PATH_CART_MANAGER = "./src/data/cart.json";
const PATH_PRODUCT_MANAGER = "./src/data/products.json";
const CART_MANAGER = new CartManager(PATH_CART_MANAGER);
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER)

//Método para traer todos los carritos:
ROUTER.get("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Puedo establecer un limite en caso de que tenga muchos carritos:
        let { limit } = req.query;
        //Llamo al método para traer todos los carritos:
        let carts = await CART_MANAGER.getCarts();
        //Verifico que limit es un numero:
        if (limit) {
            limit = Number(limit);
            //Si no devuelvo el error:
            if (NaN(limit)) {
                return res.status(400).json({ error: "Error: El límite para mostrar los carritos tiene que ser un valor numérico!" });
            }
            carts = carts.slice(0, limit);
        }
        //Devuelvo todos los carritos:
        res.status(200).json({ carts });
    }
    catch (error) { 
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
});

//Método para traer un carrito por el id:
ROUTER.get("/:cid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //recupero el id indicado por navegador:
        let { cid } = req.params;
        //Lo parseo en entero:
        cid = Number(cid);
        if (isNaN(cid)) { return res.status(400).json({error: "Recuerde que solo se aceptan valores numéricos enteros positivos mayores a 0!!"}); }
        //Llamo al método para recuperar la información del carrito por el id:
        let cart = await CART_MANAGER.getCartById(cid);
        //En caso de que no exista 
        if (!cart) { return res.status(404).json({error: `No se encontró el carrito con el carrito con el id: ${cid}`}); }
        //Devuelvo el carrito:
        res.status(200).json({cart});
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
});

//Método para crear un nuevo carrito:
ROUTER.post("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Creo el nuevo carrito:
        let cart = await CART_MANAGER.createCart();
        //Verifico que se creo correctamente:
        if(cart === undefined) { return res.status(500).json({error: "Error: Internal Server Error: No se pudo crear el carrito!"});}
        //Si se creo correctamente:
        return res.status(201).json({mensaje: `Carrito creado correctamente con el id: ${cart.id}!!`, carrito: cart});
    } catch(error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }       
});

//Método para agregar un producto al carrito especificado:

ROUTER.post("/:cid/product/:pid", async (req, res) =>  {
    try {
        res.setHeader('Content-Type', 'application/json');  
        //Obtengo los datos de los parametros:
        let {cid, pid} = req.params;
        //Verifico que el id del carrito sea un valor numérico:
        cid = Number(cid);
        if (isNaN(cid)) { return res.status(400).json({error: "Error: El id del carrito tiene que ser un valor numérico!!!"});}
        else if (cid <= 0) { return res.status(400).json({error: "Error: El id del carrito tiene que ser un valor numérico superior a 0!!!"}); }
        if (isNaN(pid)) { return res.status(400).json({error: "Error: El id del producto tiene que ser un valor numérico!!!"});}
        else if (cid <= 0) { return res.status(400).json({error: "Error: El id del producto tiene que ser un valor numérico superior a 0!!!"}); }
        //Verifico que el carrito exista:
        let cart = await CART_MANAGER.getCartById(parseInt(cid));
        if (!cart) { return res.status(404).json({error: `Error: No existe el carrito con el id: ${cid}`}); }
        let products = [];
        //Verifico si el producto existe:
        let verifyProduct = await PRODUCT_MANAGER.verifyProductById(parseInt(pid));
        //Creo el nuevo producto con lo indicado en la consigna:
        let product = {id: parseInt(pid), quantity: 1};
        if (!verifyProduct) { return res.status(400).json({error: "Error: No existe el producto indicado en la base de datos!"}); }
        products.push(product);
        //Actualizo el carrito:
        cart = await CART_MANAGER.updateCart(parseInt(cid), products);
        return res.status(200).json({mensaje: `Feliciades! Se ha actualizado correctamente el carrito con el id: ${cid}`, carrito: cart});        
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
});

//module.exports = ROUTER;
//export const CART_ROUTER = Router
export default ROUTER;
