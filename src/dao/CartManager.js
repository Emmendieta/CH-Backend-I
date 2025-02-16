const fs = require('fs');
const { ProductManager } = require('./ProductManager.js');

const PATH_PRODUCT_MANAGER = "./src/data/products.json"
const PRODUCT_MANAGER = new ProductManager(PATH_PRODUCT_MANAGER);

class CartManager {

    //Constructor:
    constructor(rutaArchivo) { this.path = rutaArchivo; }

    //Método para Traer todos los carritos:
    async getCarts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        } else {
            //En caso de que no haya ningun carrito cargado, devuelvo un array vacío:
            return [];
        }
    }

    //Método para crear un nuevo carrito:
    async createCart(products) {
        try {
            //Valido los datos para crear el carrito:
            let valid = await this.validateData(products);
            if (!valid) {throw new Error("Error: Por favor verifique los datos ingresados del producto o la cantidad!"); }
            else {
                let carts = await this.getCarts();
                let id = 1;
                if (carts.length > 0) { id = Math.max(...carts.map (cart => cart.id)) + 1; }
                else {
                    //Creo el arreglo vacio para los productos a agregar en el carrito nuevo:
                    let newProductos = [];
                    //Recorro el array de productos brindados:
                    for (let product of products) {
                        //btengo los datos del producto de la Base de Datos:
                        let productBD = await PRODUCT_MANAGER.getProduct(product.id);
                        if (productBD) {
                            //Creo el nuevo producto para luego almacenarlo:
                            let newProduct = { id: productBD.id, quantity: product.quantity};
                            //Almaceno el nuevo producto en el array:
                            newProductos.push(newProduct);
                        } else { throw new Error(`Error: No se encontró el producto con el id: ${product.id}!!!`); }
                    }
                    //Creo el nuevo carrito con los datos requeridos:
                    let newCart = {id, products};
                    //Pusheo el carrito al arreglo de carritos:
                    carts.push(newCart);
                    //Guardo el array de carritos en el archivo que sirve como Base de datos:
                    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
                    //Informo que se agrego correctamente el carrito:
                    console.log("Carrito agregado correctamente!");
                    return newCart;
                }
            }          
        } catch (error) { console.error("Error: No se pudo crear correctamente el carrito!"); }
    }

    //Método para validar la información ingresada:
    async validateData(products) {
        try {
            //Recorro a los productos dentro del array:
            for (let product of products) {
                if (typeof product.id !== 'number' || product.id <= 0) { return false; }
                else if (typeof product.quantity !== 'number' || product.quantity <= 0) { return false; }
                //Verifico que exista el producto en la Base de Datos:
                let productBD = await PRODUCT_MANAGER.getProduct(product.id);
                if (productBD === null || productBD === undefined) { return false; }
                //Si los datos ingresados estan correctos y el producto existe en la Base de Datos devuelvo true:
                else { return true; }
            }
        } catch (error) { console.error("Error: No se pudo verificar correctamente la información con respecto al id del producto o la cantidad!"); }
    }

    async getCartById(id) {
        try {
            let newCart = null;
            let carts = await this.getCarts();
            if (carts.length === 0) { throw new Error(`Error: No se puedo recuperar el carrito con el id: ${id} porque no existe ningun carrito en la Base de Datos!!!`); }
            else {
                let cart = carts.find (cartDB => parseInt(cartDB.id) === parseInt(id));
                if (!cart) { throw new Error(`Error: No existe el carrito con el id: ${id}!!!`); }
                else {
                    newCart = {
                        id: Number(cart.id),
                        products: cart.products
                    };
                    return newCart;
                }
            }
        } catch (error) { console.error(`Error: No se pudo recuperar la información del carrito con el id: ${id}!!!`); }
    }

    //Método para verificar si existe el producto o no:
    async verifyProductInCart(id, product) {
        try {
            //Verifico que los datos ingresados sean correctos:
            if (typeof id !== 'number' || id <= 0) { return false; }
            else if (typeof product.id !== 'number' || product.id <= 0) { return false; }
            let cart = await this.getCartById(id);
            if (cart === null) { throw new Error(`Error: No existe el carrito con el id: ${id} por lo que no se puede verificar si existe el producto!`); }
            else {
                let productInCart = cart.products.find(productDB => productDB.id === product.id);
                return productInCart ? true : false;
            }
        } catch (error) { console.error("Error: No se pudo verificar si el producto existe en el carrito!"); }
    }

    //Método para actualizar Carrito:
    async updateCart(id, products) {
        try {
            //Verifico que los datos ingresado sean correctos:
            if (typeof id !== 'number'|| id <= 0) { throw new Error("Error: El id del carrito solo acepta valores numéricos superiores a 0!"); }
            let cart = await this.getCartById(id);
            if (cart === null || cart === undefined) { throw new Error("Error: No se encontró el carrito con el id brindado para actualizar!"); }
            else {
                let productsInCart = cart.products;
                //Itero sobre los productos a agregar o actualizar en el carrito:
                for (let product in products) {
                    //Verifico si el producto ya existía en el carrito:
                    const productIndex = productsInCart.findIndex(pro => pro.id === product.id);
                    //En caso de que no este el producto en el carrito:
                    if (productIndex === -1) { 
                        products.push({ id: product.id, quantity: product.quantity}); 
                        //Informo que se agrego el producto al carrito:
                        console.log(`Feliciades! Se agrego el producto con el ${product.id} con la cantidad ${product.quantity} al carrito con el id: ${id}!!`);
                    }
                    //En caso de que el producto si este en el carrito, incremento en 1 la cantidad:
                    else { 
                        productsInCart[productIndex].quantity += 1; 
                        //Informo que se actualizo la cantidad del producto en el carrito:
                        console.log(`Feliciades! Como el producto con el id: ${product.id} ya existía en el carrito con id: ${id}, se le actualizó la cantidad en 1, por lo que ahora tiene ${product.quantity}`);
                    }
                }
                //Guardo los cambios en la base de datos:
                await fs.promises.writeFile(this.path, JSON.stringify(cart, null, "\t"));
                //Informo que el carrito se actualizo en su totalidad:
                console.log("Felicidades! El carrito se ha actualizado en su totalidad!");
                return;
            }
        } catch (error) { console.error("Error: No se pudo actualizar el carrito indicado!"); }
    }


    //Método para Eliminar un Carrito:
    async deleteCart(id) {
        try{ 
            //Verifico que los datos ingresados sean correctos:
            if (typeof id !== 'number' || id <= 0) { throw new Error("Error: El id del carrito tiene que ser un valor numérico positivo, mayor que 0!!!"); }
            else if (typeof product.id !== 'number' || product.id <= 0) { throw new  Error(`Error: El código de id: ${id} del carrito no es válido, solo se aceptan números superiores a 0!!!`); }
            else {
                let carts = await this.getCarts();
                if (carts.length === 0) { throw new Error("Error: No existen carritos por lo que no se puede eliminar lo indicado!"); }
                else {
                    //Verifico que se recupere el id correctamente del carrito:
                    let cartIndex = carts.findIndex(ca => ca.id === id);
                    if (cartIndex === -1) { throw new Error(`Error: No existe el carrito con el id: ${id}`); }
                    else {
                        //Elimino el carrito del array:
                        carts.splice(cartIndex, 1);
                        //Guardo los cambios en la base de datos:
                        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
                        //Informo que se elimno correctamente el carrito:
                        console.log("Feliciades! Se ha eliminado correctamente el carrito indicado!");
                        return;
                    }
                }
            }
        } catch (error) { console.error("Error: No se pudo eliminar correctamente el carrito indicado!"); }
    }

    //Método para Eliminar un producto del un carrito específico:
    async deleteProductInCart(id, product){
        try {
            //Verifico que el producto este en el carrito:
            if (await verifyProductInCart(id, product) === true) { 
                //Recupera la información del carrito:
                let cart = await this.getCartById(id);
                if (cart === null || cart === undefined) {throw new Error("Error: No se pudo recuperar el carrito seleccionado!"); }
                else {
                    //Verifico que haya productos en el carrito:
                    if (cart.products && cart.products.length > 0) {
                        //Verifico que el producto a eliminar este en el carrito:
                        const productIndex = cart.products.findIndex(pro => pro.id === product.id);
                        if (productIndex === -1) { throw new Error("Error: El producto indicado no se encuentra en el carrito!"); }
                        else {
                            //Verifico si es el único producto en el carrito, si es asi, elimino directamente el carrito, si no elimino solo el producto:
                            if (cart.products.length === 1) { await deleteCart(id); }
                            else {
                                //Elimino el producto del carrito:
                                cart.products.splice(productIndex, 1);
                                //Guardo los cambios en la base de datos:
                                await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
                                //Informo que se elimino correctamente el producto del carrito:
                                console.log("Feliciades! Se ha eliminado correctamente el producto del carrito indicado");
                                return;
                            }
                        }
                    } else {throw new Error("Error: No hay productos en carrito para eliminar!"); }
                }
            }
        } catch(error) { console.error(`Error: No se pudo eliminar el producto con el id: ${product.id} del carrito con el id: ${id}!!!`); }
    }

}

module.exports = { CartManager };


/*
Rutas para Manejo de Carritos (/api/carts/)
POST /:
Debe crear un nuevo carrito con la siguiente estructura:
id: Number/String (Autogenerado para asegurar que nunca se dupliquen los ids).

products: Array que contendrá objetos que representen cada producto.



GET /:cid:
Debe listar los productos que pertenecen al carrito con el cid proporcionado.


POST /:cid/product/:pid:
Debe agregar el producto al arreglo products del carrito seleccionado, utilizando el siguiente
formato:
product: Solo debe contener el ID del producto.

quantity: Debe contener el número de ejemplares de dicho producto (se agregará de uno en uno).


Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho 
producto.*/