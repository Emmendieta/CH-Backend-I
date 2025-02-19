const { Router } = require("express");
const { CartManager } = require("../dao/CartManager.js");

const ROUTER = Router();

const PATH_CART_MANAGER = "./src/data/cart.json"
const CART_MANAGER = new CartManager(PATH_CART_MANAGER);

//Método para traer todos los carritos:
ROUTER.get("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Puedo establecer un limite en caso de que tenga muchos carritos:
        let { limit } = req.query;
        //Llamo al método para traer todos los carritos:
        let carts = await CART_MANAGER.getCarts();
        console.log(carts)
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
        //Obtengo los datos del body para crear un nuevo carrito:
        let {products} = req.body;
        //Verifico que products sea en el formato array y que no este vacio:   
        if(!Array.isArray(products) || products.length === 0) { return res.status(400).json({error: "Error: Tiene que brindar un array de productos y que éste no este vacio!!!"}); }
        //Verifico que solo se haya ingresado el id del producto y la cantidad:
        for (let product of products) {
            product.id = Number(product.id);
            if (isNaN(product.id)) {  return res.status(400).json({error: "Error: Error: El id del producto tiene que ser un valor numérico!"});}
            else if (product.id <= 0) { return res.status(400).json( { error: "Error: Error: El id del producto tiene que ser un valor numérico superior a 0!!!"}); }
            product.quantity = Number(product.quantity);
            if (isNaN(product.quantity)) { return res.status(400).json({error: "Error: La cantidad del producto tiene que ser un valor numérico!!!"}); }
            else if (product.quantity <= 0) { return res.status(400).json({error: "Error: La cantidad del producto tiene que ser un valor numérico superior a 0!!!"})}
        }
        //Si esta todo correcto, creo el nuevo carrito:
        let cart = await CART_MANAGER.createCart(products);
        //Verifico que se creo correctamente:
        if(!cart) { return res.status(500).json({error: "Error: Internal Server Error: No se pudo crear el carrito!"});}
        //Si se creo correctamente:
        return res.status(201).json({mensaje: `Carrito creado correctamente con el id: ${cart.id}!!`, carrito: cart});
    } catch(error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
})

module.exports = ROUTER;
