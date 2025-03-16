const express = require("express");
const {engine} = require("express-handlebars");
const {Server} = require('socket.io');
const PRODUCT_ROUTER = require("./routes/Product.Router.js");
const CART_ROUTER = require("./routes/Cart.Router.js");
const VIEW_ROUTER = require("./routes/Views.Router.js");

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
/*         //DESPUES BORRAR:
        let testUser = {
                nombre: "Emiliano",
                apellido: "Mendieta"
        }
        res.render("main", testUser); */

        //VER SI ESTO DESPUES QUEDA:
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


