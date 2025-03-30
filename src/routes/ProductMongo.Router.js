import { Router } from "express";
import { procesaErrores } from "../utils.js";
import { ProductsMongoManager  as ProductsManager} from "../dao/ProductsMongoManager.js";
import { isValidObjectId } from "mongoose";
export const ROUTER = Router();

//Obtener todos los productos:

ROUTER.get('/', async (req, res) => {
    try {
        //Obtengo los productos con MongoDB:
        let products = await ProductsManager.get();
        res.setHeader('Content-Type', 'applicaction/json');
        //Devuelvo los productos de la BD:
        res.status(200).json({products});
    } catch (error) { procesaErrores(error, res); }
});

//Obtener un producto por su id:

ROUTER.get('/:pid', async(req, res) => {
    let { pid } =  req.params;
    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: `Error: El id: ${pid} ingresado no es válido! Por favor, verifiquelo!`});
    }
    try {
        let product = await ProductsManager.getById(pid);
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: `Error: El producto con id: ${pid} no existe en la Base de Datos!`});
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({product});
    } catch (error) { procesaErrores(error, res); }
});

//Crear un Producto:

ROUTER.post("/", async(req, res) => {
    let {title, description, code, price, status, stock, category, thumbnails} = req.body;
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
    if (!thumbnails || thumbnails.length ===  0) { thumbnails = [""]; }
    price = parseFloat(price);
    status = Boolean(status);
    stock = parseInt(stock);
    try {
        let exist = await ProductsManager.getBy({code});
        if (exist) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: `Error: Ya existe un producto con el código: ${code} en la Base de Datos!`});
        }
        let newProduct = await ProductsManager.save({title, description, code, price, status, stock, category, thumbnails});
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({message: "Producto creado correctamente la Base de datos!", newProduct});
    } catch (error) { procesaErrores(error, res); }
});

//Actualizar un producto:

ROUTER.put("/:pid", async (req, res) => {
    //Valido que el id sea correcto de MongoDB:
    let {pid} = req.params;
    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: `Error: El id para el producto no es váldo! Por favor, verifique este correcto el id: ${pid}!!`});
    }
    //Realizar despues las validaciones correspondientes para que no de ok, cuando no corresponde:
    let varModify = req.body;
    try {
        let productModify = await ProductsManager.getById(pid);
        if (!productModify) { 
            res.setHeader('Content-Type', 'application/json');  
            return res.status(404).json({error: `Error: El producto con el id: ${pid} no existe en la Base de Datos, por favor, verifique que sea correcto!!!`});
        }
        //FALTA VERIFICAR SI SE TRATA DE MODIFICAR CON LOS MISMOS VALORES QUE ESTAN EN LA BD:
        productModify = await ProductsManager.update(pid, varModify);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({message: "Producto modificado correctamente en la Base de Datos!", productModify});
    } catch (error) { procesaErrores(error, res); }
});

//Eliminar un producto:

ROUTER.delete("/:pid", async (req, res) => {
    //Valido que el id sea correcto en MongoDB:
    let {pid} = req.params;
    if (!isValidObjectId(pid)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: `Error: El id para el producto no es váldo! Por favor, verifique este correcto el id: ${pid}!!`});
    }
    let productVerify = await ProductsManager.getById(pid);
    if (!productVerify) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({error: `Error: El producto con el id: ${pid} no existe en la Base de Datos, por favor verifiquelo!`});
    }
    try {
        productVerify = await ProductsManager.delete(pid);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({message: `El producto con el id: ${pid}, se ha eliminado correctamente de la Base de Datos!`});
    } catch (error) { procesaErrores(error, res); }
});