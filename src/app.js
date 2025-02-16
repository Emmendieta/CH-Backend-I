const express = require("express");
const { ProductManager } = require("./dao/ProductManager.js");
const { CartManager } = require("./dao/CartManager.js");

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);
const PATH_CART_MANAGER = "./src/data/cart.json"    
const CART_MANAGER = new CartManager(PATH_CART_MANAGER);

const PORT = 8080;

const APP = express();

//VER VALIDACIONES A PARTIR DE ACA:
APP.get("/", (req, res) => {
    res.send("Home Page");
})

// ********************** PRODUCTOS **********************
APP.get("/api/products/", async(req, res) => {
    let {limit} = req.query;
    let products = await PRODUCT_MANAGER.getProducts();

    if (limit) {
        limit = Number(limit);
        if (NaN(limit)) {
            return res.send("Error: El límite para mostrar los productos tiene que ser un valor numérico!");
        }
        products = products.slice(0, limit);
    }
    res.send(products);
});

// ********************** CARRITOS **********************

APP.get("/api/carts/", async(req, res) => {
    let {limit} = req.query;
    let carts = await CART_MANAGER.getCarts();

    if (limit) {
        limit = Number(limit);
        if (NaN(limit)) { 
            return res.send("Error: El límite para mostrar los carritos tiene que ser un valor numérico!");
        }
        carts = carts.slice(0, limit);
    }
    res.send(carts);
});

const cargarCarritos = async() => {
    const CARTS_MANAGER2 = new CartManager(PATH_CART_MANAGER);
    try {

/*         //Obtener todos los carritos:
        console.log("********************************************************");
        console.log(await CARTS_MANAGER2.getCarts()); */
                
/*         //Crear un carrito con datos invalidos:
        console.log("********************************************************");
        console.log(await CARTS_MANAGER2.createCart(["1", "5"]));
        console.log(await CARTS_MANAGER2.createCart([1, "a"]));
        console.log(await CARTS_MANAGER2.createCart(["a", 5])); 
        console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1)); */

        //Crear un carrito con un producto que no existe:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.createCart([{id: 7, quantity: 6}])); */

/*         //Crear un carrito:
        console.log("********************************************************");
        const products = [
                { id: 2, quantity: 5 },  // Producto con id 1 y cantidad 1
                { id: 3, quantity: 5 }   // Producto con id 2 y cantidad 1
        ];
        console.log(await CARTS_MANAGER2.createCart(products));
        //console.log(await CARTS_MANAGER2.createCart([{id: 1, quantity: 5}, {id: 2 , quantity: 5}]));
        //console.log(await CARTS_MANAGER2.createCart([{id: 1, quantity: 5}, {id: 2 , quantity: 5}]));
        console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1)); */
        


        //Obtener un carrito con un id invalido:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.getCartById("a")) */

        //Obtener un carrito con un id que no existe:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.getCartById(5)); */

        //Obtener un carrito por id:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.getCartById(1)); */

        //Actualizar carrito con id invalido:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.updateCart("2", [{id: 1, quantity: 5}])); */

        //Actualizar carrito con un id que no existe:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.updateCart(7, [{id: 1, quantity: 5}])); */

        //Actualizar un carrito con el mismo producto y la misma cantidad (HAY QUE CODIFICAR ESTO)
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.updateCart(1, [{id: 1, quantity: 5}]));
        //console.log(await CARTS_MANAGER2.getCarts())
 */
/*         //Actualizar un carrito con un producto que no esta dentro del carrito:
        console.log("********************************************************");
        console.log(await CARTS_MANAGER2.updateCart(1, [{id: 3, quantity: 5}]));
        console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1)); */

        //Actualizar un carrito con un producto que existe pero se ingresa una cantidad diferente:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.updateCart(1, [{id: 2, quantity: 9}])); 
        console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1)); */

        //Eliminar producto de carrito con id del carrito invalido:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteProductInCart("1", 2)); */

        //Eliminar producto con un id del producto invalido:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteProductInCart(1, "a")); */


        //Eliminar producto de carrito con un id que no esta en el carrito:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteProductInCart(1, 2)); */


        //Eliminar un producto del carrito con id que existe:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteProductInCart(1, 3));  */
        //console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1));


        //Eliminar un carrito con id invalido:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteCart("a")); */


        //Eliminar carrito con id que no existe:
/*         console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteCart(11)); */


/*         //Eliminar carrito con id:
        console.log("********************************************************");
        console.log(await CARTS_MANAGER2.deleteCart(2));
        console.log(JSON.stringify(await CARTS_MANAGER2.getCarts(), null, 1)); */

    } catch(error) { console.error(error); }
}

cargarCarritos();

const cargarProductos = async() => {
    const PRODUCT_MANAGER2 = new ProductManager("./src/data/products.json");

    try {
/*         console.log(await PRODUCT_MANAGER2.getProducts());
        console.log("********************************************************"); */



/*         console.log(await PRODUCT_MANAGER2.getProduct(1));
        console.log("********************************************************"); */




/*         //Trato de obtener un producto con un id invalido:
        console.log(await PRODUCT_MANAGER2.getProduct("2"));
        console.log("********************************************************"); */



        //Trato de duplicar un producto
/*         const result0 = await PRODUCT_MANAGER2.addProduct("titulo0", "descripcion0", "codigo0", 1.00, true, 100, "categoria0", ["imagen0"]);
        console.log("********************************************************"); */




        //Agrego un producto nuevo con valores no permitido:
/*         const result1 = await PRODUCT_MANAGER2.addProduct("titulo3", "descripcion3", "codigo3", "algo", true, 100, "categoria0", ["imagen0"]);
        console.log("********************************************************"); */



        //Trato de actualizar un producto con los mismos datos
/*         console.log(await PRODUCT_MANAGER2.updateProduct(1,"titulo0", "descripcion0", "codigo0", 1.00, true, 100, "categoria0", ["imagen0"]));
        console.log("********************************************************"); */



        //Actualizo un producto:
/*         console.log(await PRODUCT_MANAGER2.updateProduct(1,"tituloNuevo", "descripcionNuevo", "codigo0", 1.00, true, 100, "categoria0", ["imagen0"]));
        console.log(await PRODUCT_MANAGER2.getProduct(1));
        console.log("********************************************************"); */


        //Elimino producto con id invalido:
/*         console.log(await PRODUCT_MANAGER2.deleteProduct("2"));
        console.log("********************************************************"); */


        //Elimino producto con id que no existe:
/*         console.log(await PRODUCT_MANAGER2.deleteProduct(7));
        console.log("********************************************************"); */


        
        //Elimino producto:
/*         const result0 = await PRODUCT_MANAGER2.addProduct("titulo5", "descripcion5", "codigo5", 1.00, true, 100, "categoria5", ["imagen5"]);
        console.log(await PRODUCT_MANAGER2.deleteProduct(5));
        console.log("********************************************************"); */


        // Intento agregar productos, pero manejo los errores con 'try-catch'
/*         try {
            const result0 = await PRODUCT_MANAGER2.addProduct("titulo0", "descripcion0", "codigo0", 1.00, true, 100, "categoria0", ["imagen0"]);
            if (result0) { 
                console.log(result0);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        }

        try {
            const result1 = await PRODUCT_MANAGER2.addProduct("titulo1", "descripcion1", "codigo1", 1.01, true, 101, "categoria1", ["imagen1"]);
            if (result1) {
                console.log(result1);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        }

        try {
            const result2 = await PRODUCT_MANAGER2.addProduct("titulo2", "descripcion2", "codigo2", 1.02, true, 102, "categoria2", ["imagen2"]);
            if (result2) {
                console.log(result2);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        }

        try {
            const result3 = await PRODUCT_MANAGER2.addProduct("titulo3", "descripcion3", "codigo3", 1.03, true, 103, "categoria3", ["imagen3"]);
            if (result3) {
                console.log(result3);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        }
 */
    } catch (error) {
        console.error("Error en cargarProductos:", error);
    }

}



cargarProductos()

//Inicializo el puerto del servidor e informo que se conecto correctamente:
APP.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})


