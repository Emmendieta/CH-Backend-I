import { Router } from "express";
import { CartMongoManager as CART_MANAGER } from "../dao/CartMongoManager.js";
import { ProductsMongoManager as PRODUCT_MANAGER } from "../dao/ProductsMongoManager.js";
import { isValidObjectId } from "mongoose";
import { procesaErrores } from "../utils.js";

export const ROUTER = Router();

//Método para traer todos los carritos: VERIFICAR!!! FALTAN CONDICIONES!
ROUTER.get("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Puedo establecer un limite en caso de que tenga muchos carritos:
        let { limit } = req.query;
        //Llamo al método para traer todos los carritos:
        let carts = await CART_MANAGER.getCarts();
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

//Método para traer un carrito por el id: ---------- OK ----------:
ROUTER.get("/:cid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //recupero el id indicado por navegador:
        let { cid } = req.params;
        //Verifico que sea un id válido:
        if (!isValidObjectId(cid)) { return res. status(400).json({error: "Error: Tiene que ingresar un id de carrito valido!"}); }
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

//Método para crear un nuevo carrito: ---------- OK ----------:
ROUTER.post("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Creo el nuevo carrito:
        let cart = await CART_MANAGER.createCart();
        //Verifico que se creo correctamente:
        if(cart === undefined) { return res.status(500).json({error: "Error: Internal Server Error: No se pudo crear el carrito!"});}
        //Si se creo correctamente:
        return res.status(201).json({mensaje: `Carrito creado correctamente con el id: ${cart._id}!!`, carrito: cart});
    } catch(error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }       
});

//Método para agregar un producto al carrito especificado: ---------- OK ----------:
ROUTER.post("/:cid/product/:pid", async (req, res) =>  {
    try {
        res.setHeader('Content-Type', 'application/json');  
        //Obtengo los datos de los parametros:
        let {cid, pid} = req.params;
        let {quantity} = req.body;
        //Valido que el id del carrito sea valido:
        if (!isValidObjectId(cid)) { 
            res.setHeader('Content-Type', 'application/json'); 
            return res.status(400).json({error: `Error: El id: ${cid} del carrito no es un formato válido, por favor verifiquelo!`});
        }
        //Verifico que el id del producto sea valido:
        if(!isValidObjectId(pid)){
            res.setHeader('Content-Type', 'application/json'); 
            return res.status(400).json({error: `Error: El id: ${pid} del producto no es un formato válido, por favor verifiquelo!`});
        }
        //verifico que la cantidad sea un valor numerico:
        quantity = Number(quantity);
        if (isNaN(quantity)) { return res.status(400).json({error: "Error: La CANTIDAD del producto tiene que ser un valor numérico!!!"}); }
        else if (quantity <= 0) { return res.status(400).json({error: "Error: La CANTIDAD del producto tiene que ser un valor positivo mayor que Cero!"}); }
        //Verifico que el carrito exista:
        let cart = await CART_MANAGER.getCartById(cid);
        if (!cart) { 
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Error: No existe el carrito con el id: ${cid}`}); 
        }
        //Verifico que el id del producto exista en la BD:
        let verifyProduct = await PRODUCT_MANAGER.getById(pid);
        if (verifyProduct == null) { 
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: `El producto con id: ${pid} no existe en la Base de Datos`}); 
        }
        if(quantity > verifyProduct.stock) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: `Error: La cantidad indicada: ${quantity} no puede superar el stock: ${verifyProduct.stock} que existe del producto con id: ${pid}`});
        }
        //Verifico si existe el producto en el carrito:
        let verifyProductInCart = await CART_MANAGER.verifyProductInCart(cid, pid);
        if (verifyProductInCart === false) {
            cart.products.push({product: pid, quantity: quantity});
            cart = await CART_MANAGER.updateCart(cid, { products: cart.products });
            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({mensaje: `Producto con id: ${pid} agregado correctamente al carrito con id: ${cid} en la Base de Datos!`});
        } else {
            //Verifico si existe el producto en el carrito:
            let productIndex = cart.products.findIndex(pro => pro.product._id.equals(pid));
            //En caso de que exista en el carrito, pero tiene la misma cantidad:
            if (cart.products[productIndex].quantity === quantity) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({error: `Error: Por favor, ingrese una cantidad: ${quantity} del producto diferente, ya que la misma ya esta almacenada en la Base de Datos!`});
            }
            cart.products[productIndex].quantity = quantity;
            //Guardo los cambios en la BD:
            cart = await CART_MANAGER.updateCart(cid, { products: cart.products });
            return res.status(200).json({ message: "Felicidades se actualizo correctamente el carrito!", carrito: cart});    
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
});

//Método para agregar varios productos al carrito especificado: SERGUIR ACAAAAAAAAAAA:
ROUTER.put("/:cid", async (req, res) =>  {
    try {
        res.setHeader('Content-Type', 'application/json');  
        //Obtengo los datos de los parametros:
        let {cid} = req.params;
        let {products} = req.body;
        //Valido que el id del carrito sea valido:
        if (!isValidObjectId(cid)) { 
            res.setHeader('Content-Type', 'application/json'); 
            return res.status(400).json({error: `Error: El id: ${cid} del carrito no es un formato válido, por favor verifiquelo!`});
        }
        //Verifico que sea un array que se envia en el body:
        if(!Array.isArray(products) || products.length === 0) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: "Debe enviar un Array de productos o en su defecto, el array no debe ser vacio!"});
        }
        //Verifico que el carrito exista:
        let cart = await CART_MANAGER.getCartById(cid);
        if (!cart) { 
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Error: No existe el carrito con el id: ${cid}`}); 
        }
        //Itero sobre cada producto enviado en el body:
        for (let pro of products) {
            let {product, quantity} = pro;
            let pid = product
            //Valido que el id sea valido:
            if (!isValidObjectId(pid)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(404).json({error: `Error: El id: "${pid}" no válido, por favor, verifiquelo!`});
            }
            //Recupero la información del producto:
            let recoveryProduct = await PRODUCT_MANAGER.getById(pid);
            if (!recoveryProduct) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({error: `Error: No existe el producto con el id: ${pid} en la Base de Datos!`});
            }
            //Verifico que la cantidad sea un número entero:
            quantity = Number(quantity);
            if (isNaN(quantity)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({error: "Error: La cantidad tiene que ser un valor numérico!"});
            }
            if (quantity <= 0 || quantity > recoveryProduct.stock) {
                res.setHeader('Content-Type', 'application/json');  
                return res.status(400).json({error: `Error: La cantidad tiene que ser superior a Cero (0) y no puede superar el stock del producto: ${recoveryProduct.stock}. Ud ingreso: ${quantity}, por favor verifiquelo!`});
            }
            //Verifico si existe el producto en el carrito:
            let verifyProductInCart = await CART_MANAGER.verifyProductInCart(cid, pid);
            if (verifyProductInCart === false) {
                cart.products.push({product: pid, quantity: quantity});
            } else {
                //Verifico si existe el producto en el carrito:
                let productIndex = cart.products.findIndex(pro => pro.product._id.equals(pid));
                //En caso de que exista en el carrito, pero tiene la misma cantidad:
                if (cart.products[productIndex].quantity === quantity) {
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(400).json({error: `Error: Por favor, ingrese para el producto con id: ${pid}, una cantidad diferente a: ${quantity}, ya que la misma ya esta almacenada en la Base de Datos!`});
                }
                cart.products[productIndex].quantity = quantity;
            }
        }
        //Guardo los cambios en la BD:
        cart = await CART_MANAGER.updateCart(cid, { products: cart.products });
        return res.status(200).json({ message: "Felicidades se actualizo correctamente el carrito!", carrito: cart});    
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({error: "Internal Server Error"});
    }
});


//Elimino un Carrito: No esta en la consgina pero se hizo:
ROUTER.delete("/:cid", async(req, res) => {
    let { cid } = req.params;
    if(!isValidObjectId(cid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: `Error: el id: ${cid} no es válido en la Base de Datos, por favor verifiquelo!`});
    };
    try {
        let verifyCart = await CART_MANAGER.getCartById(cid);
        if (!verifyCart) {
            res.setHeader('Content-Type', 'application/json');  
            return res.status(404).json({error: `Error: No existe el carrito con el id: ${cid} en la Base de Datos!`});
        }
        verifyCart = await CART_MANAGER.deleteCart(cid);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({mensaje: `Se ha eliminado correctamente el carrito con el id: ${cid} de la Base de Datos!`});
    } catch(error) { procesaErrores(error, res); }
});

//Eliminar un Producto del Carrito: ---------- OK ----------:
ROUTER.delete("/:cid/product/:pid", async(req, res) => {
    let {cid, pid} = req.params;
    //Verifico que el id del Carrito sea valido:
    if(!isValidObjectId(cid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: `Error: el carrito con id: ${cid} no es válido en la Base de Datos, por favor, verifiquelo!`});
    };
    //Verifico que el id del Producto sea valido:
    if(!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');  
        return res.status(400).json({error: `Error: el producto con id: ${pid} no es válido en la Base de Datos, por favor, verifiquelo!`});
    }
    try {
        //Verifico que exista el Carrito:
        let verifyCart = await CART_MANAGER.getCartById(cid);
        if (!verifyCart) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Error: No existe ningun carrito con el id: ${cid} en la Base de Datos, por favor, verifiquelo!`});
        }
        //Verifico que exista el Producto:
        let verifyProduct = await PRODUCT_MANAGER.getById(pid);
        if (!verifyProduct) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Error: No existe ningun producto con el id: ${pid} en la Base de Datos, por favor, verifiquelo!`});
        }
        //Verifico que el Producto este en el carrito:
        let verifyProductInCart = await CART_MANAGER.verifyProductInCart(cid, pid);
        if(verifyProductInCart === false) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Error: No existe ningun producto con el id: ${pid} en el carrito con el id: ${cid}, por favor verifiquelo!`});
        }
        //En caso de que exista, elimino el producto en carrito:
        verifyCart = await CART_MANAGER.deleteProductInCart(cid, pid);
        if(verifyCart === false) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: "Error: Ocurrio un error al tratar de eliminar el producto del carrito!"});
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({message: `Felicidades! Se elimino el producto con el id: ${pid} en el carrito con id: ${cid} de la Base de Datos!`});
    } catch(error) {procesaErrores(error, res); }
});
