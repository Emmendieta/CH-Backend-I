import { ProductModel } from "./models/Product.Models.js";

export class ProductsMongoManager {
    //Todo lo que trabaje con Mongoose es asincrono:
    static async get() {
        try {
            return await ProductModel.find().lean() //el ".lean()" es para que te muestre por pantalla los datos, si no, como estan hidratados no lo muestra en HTML
        } catch (error) { console.error("Error: No se pudo recueprar la información de los Productos de la Base de Datos!"); }
    }
//FALTAN LAS VALIDACIONES!!!!
    static async getBy(filtro ={}) {
        try{
            return await ProductModel.findOne(filtro).lean();
        } catch(error) { console.error(`Error: No se pudo recuperar los datos del/los productos con el filtro : ${filtro} de la Base de Datos!`); }
    }
    
    static async getById(id) {
        try {
            return await ProductModel.findById(id).lean();
        } catch (error) { console.error(`Error: No se pudo recuperar el Producto con el id: ${id} de la Base de Datos!`); }
    }

    static async save(product) {
        //VER SI EN EL ROUTER SE ESTAN VALIDANDO CORRECTAMENTE LA INFO:
        try{
            return await ProductModel.create(product);
        } catch (error) { console.error(`Error: No se pudo guardar el producto ${product} en la Base de Datos!`);}
    }

    static async update(id, product) {
        try {
            return await ProductModel.findByIdAndUpdate(id, product, {new: true}).lean();
        } catch (error) {console.error(`Error: No se pudo actualizar el producto con el id: ${id} en la Base de Datos!`); }
    }

    static async delete(id) {
        try {
            return await ProductModel.findByIdAndDelete(id).lean();
        } catch (error) {console.error(`Error: No se pudo eliminar el producto con el id: ${id} de la Base de Datos!!`); }
    }
}