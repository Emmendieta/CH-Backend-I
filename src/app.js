const express = require("express");
const {engine} = require("express-handlebars");
const {Server} = require('socket.io');
const PRODUCT_ROUTER = require("./routes/Product.Router.js");
const CART_ROUTER = require("./routes/Cart.Router.js");
const VIEW_ROUTER = require("./routes/Views.Router.js");

const { ProductManager } = require("../src/dao/ProductManager.js");
const PATH_PRODUCT_MANAGER = "./src/data/products.json";
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);


const PORT = 8080;
const APP = express();

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
APP.use("/api/products", PRODUCT_ROUTER);

// ********************** CARRITOS **********************
APP.use("/api/carts", CART_ROUTER);

// ********************** HANDLEBARS **********************

APP.use("/", VIEW_ROUTER);

//Declaro la página de inicio:
APP.get("/", (req, res) => {
        res.setHeader('Content-Type','text/plain');
        res.status(200).send('OK');
        
});

/* //Inicializo el puerto del servidor e informo que se conecto correctamente:
APP.listen(PORT, () => { 
        console.log(`Servidor escuchando en el puerto ${PORT}`);
});
 */

const SERVER_HTTP = APP.listen(PORT, () => {//Mi servidor HTTP:
        console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const IO = new Server(SERVER_HTTP); //Server webSocket montado sobre serverHTTP

IO.on('connection',async (socket) => {
        try{
                console.log('Un cliente se ha conectado!');
                //Obtengo los productos:
                const products = await PRODUCT_MANAGER.getProducts();
                //Recargo la lista de productos:
                IO.emit('updateProducts', products);
                //Pongo a escuchar cuando se cree un producto nuevo:
                socket.on('newProduct', async (product) => {
                        //Desesctruturo el producto:
                        const { title, description, code, price, status, stock, category, thumbnails } = product;
                        //Creo el producto:
                        await PRODUCT_MANAGER.addProduct(title, description, code, parseFloat(price), Boolean(status), parseInt(stock), category, thumbnails);
                        //Obtengo los productos:
                        products = await PRODUCT_MANAGER.getProducts();
                        //Recargo la lista de productos:
                        IO.emit('updateProducts', products);
                });
        
                //Escucho cuando se elimina un producto:
                socket.on('deleteProduct', async (productId) => {
                        //Elimino el producto:
                        await PRODUCT_MANAGER.deleteProduct(parseInt(productId));
                        //Obtengo los productos:
                        const products = await PRODUCT_MANAGER.getProducts();
                        //Recargo la lista de productos:
                        IO.emit('updateProducts', products);
                });
        
                //En caso de que se desconecte el cliente:
                socket.on('disconnect', () => {
                        console.log('Se ha desconectado el cliente!');
                });
        } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.status(500).send(`Error: No se pudo generar correctamente el producto. + ${error}`);
        }
});



