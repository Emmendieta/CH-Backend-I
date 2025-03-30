//const express = require("express");
import express from "express";
//const { engine } = require("express-handlebars");
import { engine } from "express-handlebars";
//const { Server } = require('socket.io');
import { Server } from "socket.io";
//const PRODUCT_ROUTER = require("./routes/Product.Router.js");
import PRODUCT_ROUTER from "./routes/Product.Router.js";
//const CART_ROUTER = require("./routes/Cart.Router.js");
import CART_ROUTER from "./routes/Cart.Router.js";
//const VIEW_ROUTER = require("./routes/Views.Router.js");
import { VIEW_ROUTER } from "./routes/Views.Router.js";

//const { ProductManager } = require("../src/dao/ProductManager.js");
import { ProductManager } from '../src/dao/ProductManager.js';
//const { conectarDB } = require("./connectionDB.js");
import { conectarDB } from "./connectionDB.js";
import { CONFIG } from "./config/config.js";
const PATH_PRODUCT_MANAGER = "./src/data/products.json";
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);


const PORT = CONFIG.PORT;
const APP = express();
let IO = undefined;

APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
//Configuro para que tome los archivos en la carpeta public:
APP.use(express.static("src/public"));

// ********************** HANDLEBARS **********************
APP.engine('handlebars', engine());
//Motor de plantillas:
APP.set('view engine', 'handlebars');
//Indico la direccion:
APP.set('views', './src/views');

// ********************** PRODUCTOS **********************
APP.use("/api/products",
        (req, res, next) => {
                req.IO = IO;
                next();
        },
        PRODUCT_ROUTER);

// ********************** CARRITOS **********************
APP.use("/api/carts", CART_ROUTER);

// ********************** HANDLEBARS **********************

APP.use("/", VIEW_ROUTER);

//Declaro la página de inicio:
APP.get("/", (req, res) => {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send('OK');

});

const SERVER_HTTP = APP.listen(PORT, () => {//Mi servidor HTTP:
        console.log(`Servidor escuchando en el puerto ${PORT}`);
});

IO = new Server(SERVER_HTTP); //Server webSocket montado sobre serverHTTP

IO.on('connection', async (socket) => {
        console.log('Un cliente se ha conectado!');

        try {
                //Obtengo los productos:
                let products = await PRODUCT_MANAGER.getProducts();
                //Recargo la lista de productos:
                IO.emit('updateProducts', products);
        } catch (error) {
                console.error("Error: Ocurrio un error al enviar los productos!", error);
                socket.emit('errorMessage', 'Error al cargar los productos!');
        }
        socket.on('newProduct', async (product) => {
                try {
                        //Desesctruturo el producto:
                        const { title, description, code, price, status, stock, category, thumbnails } = product;
                        //Creo el producto:
                        let newProduct = undefined;
                        newProduct = await PRODUCT_MANAGER.addProduct(title, description, code, parseFloat(price), Boolean(status), parseInt(stock), category, thumbnails);
                        if (newProduct === undefined) {
                                socket.emit('errorMessage', 'Error al agregar el producto.');
                                return;
                        }
                        //Obtengo los productos:
                        products = await PRODUCT_MANAGER.getProducts();
                        //Recargo la lista de productos:
                        IO.emit('updateProducts', products);
                } catch (error) {
                        console.error('Error al agregar producto:', error);
                        socket.emit('errorMessage', 'No se pudo agregar el producto.');
                }
        });
        //Escucho cuando se elimina un producto:
        socket.on('deleteProduct', async (productId) => {
                try {
                        //Elimino el producto:
                        const productDeleted = await PRODUCT_MANAGER.deleteProduct(parseInt(productId));
                        if (!productDeleted) {
                                socket.emit('errorMessage', `No se encontró el producto con ID ${productId}.`);
                                return;
                        }
                        //Obtengo los productos:
                        const products = await PRODUCT_MANAGER.getProducts();
                        //Recargo la lista de productos:
                        IO.emit('updateProducts', products);
                } catch (error) {
                        console.error('Error al eliminar producto:', error);
                        socket.emit('errorMessage', 'No se pudo eliminar el producto.');
                }
        });
        //En caso de que se desconecte el cliente:
        socket.on('disconnect', () => {
                console.log('Se ha desconectado el cliente!');
        });
});

//Conexion a la BD MongoDB:

conectarDB(CONFIG.URIDB, CONFIG.NAMEDB);



