const express = require("express");
const { ProductManager } = require("./dao/ProductManager.js");
const { CartManager } = require("./dao/CartManager.js");

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);
const PATH_CART_MANAGER = "./src/data/cart.json"
const CART_MANAGER = new CartManager(PATH_CART_MANAGER);

const PORT = 8080;

const APP = express();

//Declaro la página de inicio:
APP.get("/", (req, res) => {
        res.send("Home Page");
});

// ********************** PRODUCTOS **********************
APP.get("/api/products/", async (req, res) => {
        //Establezco un límite de búsqueda en caso de que tenga muchos productos:
        let { limit } = req.query;
        //Llamo al método para recuperar todos los productos:
        let products = await PRODUCT_MANAGER.getProducts();
        //Si declaro un límite que no es un valor numérico:
        if (limit) {
                limit = Number(limit);
                if (NaN(limit)) { return res.send("Error: El límite para mostrar los productos tiene que ser un valor numérico!"); }
                products = products.slice(0, limit);
        }
        //Devuelvo todos los productos:
        res.send(products);
});

APP.get("/api/products/:pid", async (req, res) => {
        //Obtengo el id por params:
        let {pid} = req.params;
        //Parseo el id en entero:
        pid = parseInt(pid);
        //Llamo al método para traer al producto por su id:
        let product = await PRODUCT_MANAGER.getProduct(pid);
        //En caso de que no encuentre el producto por el id indicado, devuevlo el informe:
        if(!product) { return res.send(`Error: No se encontró el producto con el id: ${pid}!!!`); }
        //Devuelvo el producto:
        res.send(product);
});

// ********************** CARRITOS **********************

//Método para traer todos los carritos:
APP.get("/api/carts/", async (req, res) => {
        //Puedo establecer un limite en caso de que tenga muchos carritos:
        let { limit } = req.query;
        //Llamo al método para traer todos los carritos:
        let carts = await CART_MANAGER.getCarts();
        //Verifico que limit es un numero:
        if (limit) {
                limit = Number(limit);
                //Si no devuelvo el error:
                if (NaN(limit)) { return res.send("Error: El límite para mostrar los carritos tiene que ser un valor numérico!");}
                carts = carts.slice(0, limit);
        }
        //Devuelvo todos los carritos:
        res.send(carts);
});

//Método para traer un carrito por el id:
APP.get("/api/carts/:cid", async (req, res) => {
        //recupero el id indicado por navegador:
        let {cid} = req.params;
        //Lo parseo en entero:
        cid = parseInt(cid);
        //Llamo al método para recuperar la información del carrito por el id:
        let cart = await CART_MANAGER.getCartById(cid);
        //En caso de que no exista 
        if(!cart) { return res.send(`Error: No se encontró el carrito con el id: ${cid}!!!`);}
        //Devuelvo el carrito:
        res.send(cart);
});


//Inicializo el puerto del servidor e informo que se conecto correctamente:
APP.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
})


