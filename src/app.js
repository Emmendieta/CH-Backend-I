const express = require("express");
const PRODUCT_ROUTER = require("./routes/Product.Router.js");
const CART_ROUTER = require("./routes/Cart.Router.js");

const PORT = 8080;
const APP = express();

APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));

// ********************** PRODUCTOS **********************
APP.use("/api/products", PRODUCT_ROUTER);

// ********************** CARRITOS **********************
APP.use("/api/carts", CART_ROUTER);

//Declaro la página de inicio:
APP.get("/", (req, res) => {
        res.setHeader('Content-Type','text/plain');
        res.status(200).send('OK');
});

//Inicializo el puerto del servidor e informo que se conecto correctamente:
APP.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
})


