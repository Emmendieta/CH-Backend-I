const {Router} = require("express");
const { CartManager } = require("../dao/CartManager.js");

const ROUTER = Router();
const PATH_CART_MANAGER = "./src/data/cart.json"
const CART_MANAGER = new CartManager(PATH_CART_MANAGER);


//Método para traer todos los carritos:
ROUTER.get("/", async (req, res) => {
    //Puedo establecer un limite en caso de que tenga muchos carritos:
    let { limit } = req.query;
    //Llamo al método para traer todos los carritos:
    let carts = await CART_MANAGER.getCarts();
    console.log(carts)
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
ROUTER.get("/:cid", async (req, res) => {
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

module.exports = ROUTER;
