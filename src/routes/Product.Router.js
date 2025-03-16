const { Router } = require("express");
const { ProductManager } = require("../dao/ProductManager.js");

const ROUTER = Router();

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);

//Obtener todos los productos:
ROUTER.get("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Establezco un límite de búsqueda en caso de que tenga muchos productos:
        let { limit } = req.query;
        //Llamo al método para recuperar todos los productos:
        let products = await PRODUCT_MANAGER.getProducts();
        if (!products || products.length === 0) { return res.status(404).json({ error: "Error: No se pudo recuperar el listado de productos de la Base de Datos!" }); }
        //Si declaro un límite que no es un valor numérico:
        if (limit) {
            limit = Number(limit);
            if (NaN(limit)) { return res.status(400).json({ error: "Error: El límite para mostrar los productos tiene que ser un valor numérico" }); }
            else if (limit <= 0) { return res.status(400).json({ error: "Error: El límite de productos a mostrar tiene que ser un valor positivo mayor a cero!!!" }); }
            products = products.slice(0, limit);
        }
        //Devuelvo todos los productos:
        res.status(200).json({ products });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Obtener la información de un product con el id:
ROUTER.get("/:pid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Obtengo el id por params:
        let { pid } = req.params;
        //Parseo el id en entero:
        pid = Number(pid);
        //Verifico que el id sea un número:
        if (isNaN(pid)) { return res.status(400).json({ error: "Error: El id del producto tiene que ser un valor numérico!" }); }
        else if (pid <= 0) { return res.status(400).json({ error: "Error: El id del producto tiene que ser un valor numérico positivo mayor a cero!!!" }); }
        //Llamo al método para traer al producto por su id:
        let product = await PRODUCT_MANAGER.getProduct(parseInt(pid));
        //En caso de que no encuentre el producto por el id indicado, devuevlo el informe:
        if (!product) { return res.status(404).json({ error: `Error: No se encontró el producto con el id: ${pid}` }); }
        //Devuelvo el producto:
        res.status(200).json({ producto: product });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: "Internal Server Error" });
    }
});

ROUTER.post("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let { title, description, code, price, status, stock, category, thumbnails } = req.body;
        //En caso de que no brinde toda los requerimientos para dar el alta a un nuevo Producto:
        if (!title || !description || !code || !price || !status || stock === undefined || !category || !thumbnails) { return res.status(400).json({ error: `Error: Todos los campos son obligatorios para poder proceder a dar el alta del producto!` }); }
        if (title.length === 0) { return res.status(400).json({ error: `Error: El nombre del producto: "${title}" no puede ser nulo!` }); }
        if (description.length === 0) { return res.status(400).json({ error: `Error: La descripción escrita del producto: "${description}" no puede ser nula!` }); }
        if (code.length === 0) { return res.status(400).json({ error: `Error: El código del producto tiene que ser un valor alfanumérico!!` }); }
        if (category.length === 0) { return res.status(400).json({ error: `Error: La categoría del producto no puede ser nulo y ud ingreso: ${category}` }); }
        price = Number(price);
        if (isNaN(price)) { return res.status(400).json({ error: `Error: El precio del producto tiene que ser un valor numérico!!` }); }
        else if (price <= 0) { return res.status(400).json({ error: `Error: El precio del producto, tiene que ser un valor numérico superior a cero y ud ingreso: ${price}` }); }
        if (isNaN(status)) { return res.status(400).json({ error: `Error: El status del producto solo acepta valores booleanos!` }); }
        stock = Number(stock);
        if (isNaN(stock)) { return res.status(400).json({ error: `Error: El stock tiene que ser un valor entero positivo!!!` }); }
        else if (stock < 0) { return res.status(400).json({ error: `Error: El stock del producto tiene que ser un valor numérico positivo mayor a cero!!` }); }
        if (!Array.isArray(thumbnails)) { return res.status(400).json({ error: `Error: El thumbnails solo acepta valores en array` }); }
        else if (thumbnails.length < 0) { return res.status(400).json({ error: `Error: El array de thumbnails no puede ser nulo!` }); }
        if (typeof thumbnails === 'string') { thumbnailsParse = thumbnails.split(',').map((thumbnails) => thumbnails.trim()); }
        price = parseFloat(price);
        status = Boolean(status);
        stock = parseInt(stock);
        //verifico si ya existe otro producto con el mismo code:
        let verify = await PRODUCT_MANAGER.verifyProduct(code);
        if (verify) { return res.status(500).json({ error: `Error: No se procedio a dar el alta al producto con el code: "${code}" porque ya existe otro con el mismo code!!!` }); }
        //Trato de generar el nuevo producto y almacenarlo:
        const product = await PRODUCT_MANAGER.addProduct(title, description, code, price, status, stock, category, thumbnails);
        res.status(201).json({ producto: product });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(`Error: No se pudo generar correctamente el producto. + ${error}`);
    }
});

//Actualizar un producto:
ROUTER.put("/:pid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        //Obtengo el id por params:
        let { pid } = req.params;
        //Valido el id:
        pid = Number(pid);
        if (isNaN(pid)) { return res.status(400).json({ error: "Error: El id del producto tiene que ser un valor numérico!!!" }); }
        else if (pid <= 0) { return res.status(400).json({ error: `Error: El id ingresado es: "${id} y obligatoriamente tiene que ser un valor numérico mayor que cero!!!` }); }
        pid = parseInt(pid);
        //Obtengo los datos del producto a actualizar:
        let { title, description, code, price, status, stock, category, thumbnails } = req.body;
        //En caso de que no brinde toda los requerimientos para actualizar al Producto:
        if (!title && !description && !code && !price && !status && !stock && !category && !thumbnails) { return res.status(400).json({ error: `Error:Tiene que ingresar al menos algun campo para modificar al producto con id: ${pid}!` }); }
        //Defiono uun objeto con las posibles propiedades a actualziar:
        let updateData = {};
        if (title !== undefined) {
            if (title.length === 0) { return res.status(400).json({ error: `Error: El nombre del producto: "${title}" no puede ser nulo!` }); }
            else { updateData.title = title; }
            }
        if (description !== undefined) {
            if (description.length === 0) { return res.status(400).json({ error: `Error: La descripción escrita del producto: "${description}" no puede ser nula!` }); }
            else { updateData.description = description; }
            }
        if (code !== undefined) {
            if (code.length === 0) { return res.status(400).json({ error: `Error: El código del producto tiene que ser un valor alfanumérico!!` }); }
            else { updateData.code = code; }
            }
        if (price !== undefined) {
            price = Number(price);
            if (isNaN(price)) { return res.status(400).json({ error: `Error: El precio del producto tiene que ser un valor numérico!!` }); }
            else if (price <= 0) { return res.status(400).json({ error: `Error: El precio del producto, tiene que ser un valor numérico superior a cero y ud ingreso: ${price}` }); }
            else { updateData.price = parseFloat(price); }
        }
        if (status !== undefined) {
            status = Boolean(status);
            if (isNaN(status)) { return res.status(400).json({ error: `Error: El status del producto solo acepta valores booleanos!` }); }
            else { updateData.status = Boolean(status); }
        }
        if (stock !== undefined) {
            stock = Number(stock);
            if (isNaN(stock)) { return res.status(400).json({ error: `Error: El stock tiene que ser un valor entero positivo!!!` }); }
            else if (stock < 0) { return res.status(400).json({ error: `Error: El stock del producto tiene que ser un valor numérico positivo mayor a cero!!` }); }
            else { updateData.stock = parseInt(stock); }            
        }
        if (category !== undefined) {
            if (category.length === 0) { return res.status(400).json({ error: `Error: La categoría del producto no puede ser nulo y ud ingreso: ${category}` }); }
            else { updateData.category = category; }            
        }
        if (thumbnails !== undefined) {
            if (!Array.isArray(thumbnails)) { return res.status(400).json({ error: `Error: El thumbnails solo acepta valores en array` }); }
            else { updateData.thumbnails = thumbnails; }
        }
        //Verifico que exista el producto:
        let product = await PRODUCT_MANAGER.getProduct(pid);
        //En caso de que no encuentre el producto por el id indicado, devuevlo el informe:
        if (!product) { return res.status(404).json({ error: `Error: No se encontró el producto con el id: ${pid}` }); }
        //Actualizo el producto:
        let verify = await PRODUCT_MANAGER.updateProduct(pid, updateData);
        if (!verify) { return res.status(500).json({error: "Error: No se pudo actualizar el producto ya que se ingreso los mismos valores que estan almacenados en la base de datos"})}
        //Recupero los datos del producto actualizado para mostrarlo:
        product = await PRODUCT_MANAGER.getProduct(pid);        
        res.status(200).json({ producto: product });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Eliminar un producto:
ROUTER.delete("/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        //Parseo el id:
        pid = Number(pid);
        //Verifico que  se ingrese correctamente el id:
        if (isNaN(pid)) { return res.status(400).json({ error: `Error: el id del producto a eliminar tiene que ser un valor númerico!!!` }); }
        else if (pid <= 0) { return res.status(400).json({ error: `Error: El valor numérico del id tiene que ser un número entero positivo mayor a 0!!!` }); }
        //En caso de que est todo ok, lo elimino:
        pid = parseInt(pid);
        let product = await PRODUCT_MANAGER.deleteProduct(pid);
        //En caso de que se elimino correctamente informo que todo se hizo correctamente:
        if (product) { res.status(200).json({ mensaje: `Felicidades! se ha eliminado correctamente el producto con el id: ${pid}!` }); }
        //En caso de que no se elimino:
        else { res.status(500).json({ error: `Error: No se pudo eliminar el producto indicado con el id: ${pid}` }); }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(`Error: No se pudo generar correctamente el producto. + ${error}`);
    }
});

module.exports = ROUTER;