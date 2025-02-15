const express = require("express");
const { ProductManager } = require("./dao/ProductManager.js");

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);

const PORT = 8080;

const APP = express();

//VER VALIDACIONES A PARTIR DE ACA:
APP.get("/", (req, res) => {
    res.send("Home Page");
})

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
})

 const cargarProductos = async() => {
    const PRODUCT_MANAGER2 = new ProductManager("./src/data/products.json");

    try {
        //console.log(await PRODUCT_MANAGER2.getProducts());
        console.log(await PRODUCT_MANAGER2.getProduct(2));

/*         // Intento agregar productos, pero manejo los errores con 'try-catch'
        try {
            const result0 = await PRODUCT_MANAGER2.addProduct("titulo0", "descripcion0", "codigo0", 1.00, true, 100, "categoria0", ["imagen0"]);
            if (result0) {
                console.log(result0);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        } */

/*         try {
            const result1 = await PRODUCT_MANAGER2.addProduct("titulo1", "descripcion1", "codigo1", 1.01, true, 101, "categoria1", ["imagen1"]);
            if (result1) {
                console.log(result1);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        } */

/*         try {
            const result2 = await PRODUCT_MANAGER2.addProduct("titulo2", "descripcion2", "codigo2", 1.02, true, 102, "categoria2", ["imagen2"]);
            if (result2) {
                console.log(result2);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        } */

/*         try {
            const result3 = await PRODUCT_MANAGER2.addProduct("titulo3", "descripcion3", "codigo3", 1.03, true, 103, "categoria3", ["imagen3"]);
            if (result3) {
                console.log(result3);  // Producto agregado correctamente
            }
        } catch (error) {
            console.log(error.message);  // Imprimir el error si el código ya existe
        } */

    } catch (error) {
        console.error("Error en cargarProductos:", error);
    }

}



cargarProductos()

//Inicializo el puerto del servidor e informo que se conecto correctamente:
APP.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})


