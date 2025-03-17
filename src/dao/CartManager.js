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
    async createCart() {
        try {
            let newCart = undefined;
            let carts = await this.getCarts();
            let id = 1;
            if (carts.length > 0) { id = Math.max(...carts.map(cart => cart.id)) + 1; }
            //Creo el arreglo vacio para los productos a agregar en el carrito nuevo:
            let newProductos = [];
            //Creo el nuevo carrito con los datos requeridos:
            newCart = { id: id, products: newProductos };
            //Pusheo el carrito al arreglo de carritos:
            carts.push(newCart);
            //Guardo el array de carritos en el archivo que sirve como Base de datos:
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
            //Informo que se agrego correctamente el carrito:
            console.log("Carrito agregado correctamente!");
            return newCart;
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
                let cart = carts.find(cartDB => parseInt(cartDB.id) === parseInt(id));
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
    async verifyProductInCart(id, productId) {
        try {
            //Verifico que los datos ingresados sean correctos:
            if (typeof id !== 'number' || id <= 0) { return false; }

            else if (typeof productId !== 'number' || productId <= 0) { return false; }
            let cart = await this.getCartById(id);
            if (!cart) {
                console.error(`Error: No existe el carrito con el id: ${id}`);
                return false;
            }
            else {
                let productInCart = cart.products.find(productDB => productDB.id === productId);
                if (productInCart) { return true; }
                else { return false; }
            }
        } catch (error) {
            console.error("Error: No se pudo verificar si el producto existe en el carrito!");
            return false;
        }
    }

    async updateCart(id, products) {
        try {
            // Verifico que los datos ingresados sean correctos:
            if (typeof id !== 'number' || id <= 0) { throw new Error("Error: El id del carrito solo acepta valores numéricos superiores a 0!"); }
            // Obtener todos los carritos
            let carts = await this.getCarts();
            // Buscar el carrito por su id
            let cart = carts.find(cart => cart.id === id);
            if (!cart) { throw new Error("Error: No se encontró el carrito con el id brindado para actualizar!"); }
            let productsInCart = cart.products;
            // Itero sobre los productos a agregar o actualizar en el carrito:
            for (let product of products) {
                //Verifico que el producto exista:
                let productExist = await PRODUCT_MANAGER.getProduct(product.id);
                if (!productExist) { return console.log(`El producto con el id: ${product.id} No existe en la Base de Datos!`); }
                // Verifico si el producto ya existía en el carrito:
                const productIndex = productsInCart.findIndex(pro => pro.id === product.id);
                // En caso de que no esté el producto en el carrito:
                if (productIndex === -1) {
                    productsInCart.push({ id: product.id, quantity: 1 });
                    // Informo que se agregó el producto al carrito:
                    console.log(`¡Felicitaciones! Se agregó el producto con el id ${product.id} y cantidad ${product.quantity} al carrito con el id: ${id}!!`);
                }
                // En caso de que el producto sí esté en el carrito, incremento la cantidad correctamente:
                else {
                    productsInCart[productIndex].quantity += 1;
                    // Informo que se actualizó la cantidad del producto en el carrito:
                    console.log(`¡Felicitaciones! Como el producto con el id ${product.id} ya existía en el carrito con el id ${id}, se le actualizó la cantidad a ${productsInCart[productIndex].quantity}`);
                }
            }
            // Ahora guardo el arreglo de carritos completo con el carrito actualizado:
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
            // Informo que el carrito se actualizó correctamente:
            console.log("¡Felicitaciones! El carrito se ha actualizado en su totalidad!");
            // Retorno el carrito actualizado para que puedas ver el resultado
            return cart;
        } catch (error) {
            console.error("Error: No se pudo actualizar el carrito indicado!", error);
            throw error;
        }
    }


    //Método para Eliminar un Carrito:
    async deleteCart(id) {
        try {
            //Verifico que los datos ingresados sean correctos:
            if (typeof id !== 'number' || id <= 0) { throw new Error("Error: El id del carrito tiene que ser un valor numérico positivo, mayor que 0!!!"); }
            else {
                let carts = await this.getCarts();
                if (carts.length === 0) { throw new Error("Error: No existen carritos por lo que no se puede eliminar lo indicado!"); }
                else {
                    //Verifico que se recupere el id correctamente del carrito:
                    let cartIndex = carts.findIndex(ca => ca.id === id);
                    if (cartIndex == -1) {
                        console.error(`Error: No existe el carrito con el id: ${id}`);
                        return;
                    } else {
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
    async deleteProductInCart(id, productId) {
        try {
            //Verifico que el producto este en el carrito:
            let isProductInCart = await this.verifyProductInCart(id, productId);
            if (isProductInCart === true) {

                //Recupera la información del carrito:
                let cart = await this.getCartById(id);
                if (cart === null || cart === undefined) { throw new Error("Error: No se pudo recuperar el carrito seleccionado!"); }
                else {
                    //Verifico que haya productos en el carrito:
                    if (cart.products && cart.products.length > 0) {
                        //Verifico que el producto a eliminar este en el carrito:
                        let productIndex = -1;
                        productIndex = cart.products.findIndex(pro => pro.id === productId);
                        if (productIndex === -1) { throw new Error("Error: El producto indicado no se encuentra en el carrito!"); }
                        else {
                            //Verifico si es el único producto en el carrito, si es asi, elimino directamente el carrito, si no elimino solo el producto:
                            if (cart.products.length === 1) {
                                await this.deleteCart(id);
                                return;
                            } else {
                                //Elimino el producto del carrito:
                                cart.products.splice(productIndex, 1);
                                //Actualizo el Array de Carritos:
                                let carts = await this.getCarts();
                                let cartIndex = carts.findIndex(c => c.id === id);
                                if (cartIndex !== -1) { carts[cartIndex] = cart; }
                                else { throw new Error("Error: No se pudo encontrar el carrito en la base de datos para poder eliminar correctamente al producto!"); }
                                //Guardo los cambios en la base de datos:
                                await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
                                //Informo que se elimino correctamente el producto del carrito:
                                console.log("Feliciades! Se ha eliminado correctamente el producto del carrito indicado");
                                return;
                            }
                        }
                    } else { throw new Error("Error: No hay productos en carrito para eliminar!"); }
                }
            }
        } catch (error) { console.error(`Error: No se pudo eliminar el producto con el id: ${productId} del carrito con el id: ${id}!!!`); }
    }

}

module.exports = { CartManager };
