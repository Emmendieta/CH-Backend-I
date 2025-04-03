import { CartsModel } from "./models/Carts.Models.js";
import { ProductsMongoManager as PRODUCT_MANAGER } from "./ProductsMongoManager.js";

export class CartMongoManager {

    //Método para Traer todos los carritos: ---------- OK ----------:
    static async getCarts() {
        try {
            return await CartsModel.find().populate("products.product").lean();
        } catch (error) {console.error("Error: no se pudo recuperar los carritos de la Base de Datos!");}
    }

    //Obtener carrito por Id: ---------- OK ----------:
    static async getCartById(id) {
        try {
            let cart = undefined;
            cart = await CartsModel.findById(id).populate("products.product").lean();
            return cart;
        } catch (error) { console.error(`Error: No se pudo recueprar el carrito con el id: ${id}!!!`); }
    }

    //Método para crear un nuevo carrito: ---------- OK ----------:
    static async createCart() {
        try {
            let newCart = undefined;
            let newProducts = [];
            newCart = { products: newProducts };
            let newCartCreated = await CartsModel.create(newCart);
            return newCartCreated.toJSON();
        } catch (error) { console.error("Error: no se pudo crear correctamente el carrito!"); }
    }

    //Actualizar un Carrito: ---------- OK ----------:
    static async updateCart(id, aModificar ={}) {
        try {
            let validate = false;
            validate = await CartsModel.findByIdAndUpdate(id, aModificar, {new: true}).lean();
            if (validate === null || validate === undefined) { return validate; }
            return validate;
        } catch (error) {
            console.error("Error: No se pudo actualizar el carrito indicado!", error);
            throw error;
        }
    }

    //Método para Verificar si existe un Producto en el Carrito: ---------- OK ----------:
    static async verifyProductInCart(idCart, idProduct) {
        try {
            let cart = await this.getCartById(idCart);
            if (cart.products.length === 0 || (cart.products[0] === "")) { return false; }
            let verifyProduct = cart.products.some( pro => pro.product._id.toString() === idProduct );
            if(!verifyProduct) { return false; }
            else { return true; }
        } catch (error) {
            console.error("Error: No se pudo encontrar el producto del carrito inidcado!", error);
            throw error;
        }
    }

    //Método para Eliminar un Carrito: ---------- OK ----------:
    static async deleteCart(id) {
        try {
            return await CartsModel.findByIdAndDelete(id).lean();
        } catch (error) { console.error("Error: No se pudo eliminar correctamente el carrito indicado!"); }
    }

    //Método para Eliminar un producto del un carrito específico: ---------- OK ----------:
    static async deleteProductInCart(id, productId) {
        try {
            let cart = undefined;
            cart = await this.getCartById(id);
            //Actualizo el listado de productos en el carrito (Elimino al producto si coincide el idProduct):
            cart.products = cart.products.filter(pro => pro.product._id.toString() !== productId);
            //En caso de que no quede ningun producto en el carrito, establezco el array como vacio segun lo establecido en las consignas:
            if (cart.products.length === 0) { cart.products = []; }
            //Actualizo el carrito en la Base de Datos:
            let update = undefined;
            update = await this.updateCart(id, {products: cart.products});  
            return update;        
        } catch (error) { console.error(`Error: No se pudo eliminar el producto con el id: ${productId} del carrito con el id: ${id}!!!`); }
    }    
}

