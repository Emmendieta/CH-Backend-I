import { CartsModel } from "./models/Carts.Models.js";

export class CartMongoManager {

    //Método para Traer todos los carritos:
    static async getCarts() {
        try {
            return await CartsModel.find().lean();
        } catch (error) {console.error("Error: no se pudo recuperar los carritos de la Base de Datos!");}
    }

    //Método para crear un nuevo carrito:

    static async createCart() {
        try {
            let newCart = undefined;
            let newProducts = [];
            newCart = { products: newProducts };
            newCart = await CartsModel.create(newCart);
            return newCart.toJSON();
        } catch (error) { console.error("Error: no se pudo crear correctamente el carrito!"); }
    }

/*     //Método para crear un nuevo carrito:
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
    } */

    //Método para validar la información ingresada: VER SI VA
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


    //Obtener carrito por Id: VER SI VA
    static async getCartById(id) {
        try {
            let cart = undefined;
            cart = await CartsModel.findById(id).populate("products.product").lean();
            return cart;
        } catch (error) { console.error(`Error: No se pudo recueprar el carrito con el id: ${id}!!!`); }
    }
/*     async getCartById(id) {
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
    } */

    //Método para verificar si existe el producto o no: FALTAAAA
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

    static async updateCart(id, aModificar ={}) {
        try {
            return await CartsModel.findByIdAndUpdate(id, aModificar, {new: true}).lean();
        } catch (error) {
            console.error("Error: No se pudo actualizar el carrito indicado!", error);
            throw error;
        }
    }


    //Método para Eliminar un Carrito:
    static async deleteCart(id) {
        try {
            return await CartsModel.findByIdAndDelete(id).lean();
        } catch (error) { console.error("Error: No se pudo eliminar correctamente el carrito indicado!"); }
    }

    //Método para Eliminar un producto del un carrito específico: FALTAAAAA
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

