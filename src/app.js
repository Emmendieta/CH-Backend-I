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

//Obtener todos los productos:
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

//Obtener la información de un product con el id:
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

//Almacenar un producto:
APP.post("/api/products/", async(req, res) => {
        const {title, description, code, price, status, stock, category, thumbnails} = req.body;
        //En caso de que no brinde toda los requerimientos para dar el alta a un nuevo Producto:
        if (!title || !description || !code || !price || !status ||!stock ||!category || !thumbnails) { return res.send(`Error: Todos los campos son obligatorios para poder proceder a dar el alta del producto!`); }
        //Verifico que los valores ingresados sean en el formato Correcto:
        const priceParse = parseFloat(price);
        if (isNaN(priceParse)) { return res.send(`Error: El precio del producto tiene que ser un valor numérico!!!`); }
        const statusBool = Boolean(status);
        const stockParse = parseInt(stock);
        if (isNaN(stock)) { return res.send(`Error: El stock tiene que ser un valor entero positivo!!!`); }
        let thumbnailsParse = [];
        if (Array.isArray(thumbnails)) { thumbnailsParse = thumbnails; }
        else if (typeof thumbnails === 'string') { thumbnailsParse = thumbnails.split(',').map((thumbnails) => thumbnails.trim()); }

        //Trato de generar el nuevo producto y almacenarlo:

        try {
                const newProduct = {title, description, code, price, status, stock, category, thumbnails};
                const product = await PRODUCT_MANAGER.addProduct(newProduct);
                res.send(product);
        } catch (error) { res.status(500).send(`Error: No se pudo generar correctamente el producto. + ${error}`); }       
});

//Eliminar un producto:
APP.delete("/api/products/:pid", async(req, res) => {
        let {pid} = req.params;
        //Parseo el id:
        pid = Number(pid);
        //Verifico que  se ingrese correctamente el id:
        if (isNaN(pid)) { return res.send(`Error: el id del producto a eliminar tiene que ser un valor númerico!!!`); }
        else if(pid <= 0) { return res.send(`Error: El valor numérico del id tiene que ser un número entero positivo mayor a 0!!!`); }
        //En caso de que est todo ok, lo elimino:
        let product = await PRODUCT_MANAGER.deleteProduct(pid);
        //En caso de que se elimino correctamente informo que todo se hizo correctamente:
        if(product) { res.send(`Felicidades! se ha eliminado correctamente el producto con el id: ${pid}!`); }
        //En caso de que no se elimino:
        else { res.send(`Error: No se pudo eliminar el producto indicado con el id: ${pid}`); }
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
        cid = Number(cid);
        if(isNaN(cid)) { return res.send("Error: Recuerde que solo se aceptan valores numéricos enteros positivos mayores a 0!!");}
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


