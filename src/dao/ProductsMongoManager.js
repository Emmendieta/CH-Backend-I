import { ProductModel } from "./models/Product.Models.js";

export class ProductsMongoManager {
    //Todo lo que trabaje con Mongoose es asincrono:
    
    //Get con paginate
    static async get(page = 1, limit = 10, sort = {}, filter = {}) {
        try {
            return await ProductModel.paginate(filter,{
                page, 
                limit,
                sort,
                lean:true}) //el ".lean()" es para que te muestre por pantalla los datos, si no, como estan hidratados no lo muestra en HTML
        } catch (error) { console.error("Error: No se pudo recueprar la información de los Productos de la Base de Datos!"); }
    }
    //Recuperar un producto con filtro:
    static async getBy(filtro = {}) {
        try{
            return await ProductModel.findOne(filtro).lean();
        } catch(error) { console.error(`Error: No se pudo recuperar los datos del/los productos con el filtro : ${filtro} de la Base de Datos!`); }
    }
    
    //Método para recuperar un producto por id:
    static async getById(id) {
        try {
            return await ProductModel.findById(id).lean();
        } catch (error) { console.error(`Error: No se pudo recuperar el Producto con el id: ${id} de la Base de Datos!`); }
    }

    //Método para guardar un producto:
    static async save(product) {
        try{
            return await ProductModel.create(product);
        } catch (error) { console.error(`Error: No se pudo guardar el producto ${product} en la Base de Datos!`);}
    }

    //Método para actualizar un producto:
    static async update(id, product) {
        try {
            return await ProductModel.findByIdAndUpdate(id, product, {new: true}).lean();
        } catch (error) {console.error(`Error: No se pudo actualizar el producto con el id: ${id} en la Base de Datos!`); }
    }

    //Método para eliminar un Producto por id:
    static async delete(id) {
        try {
            return await ProductModel.findByIdAndDelete(id).lean();
        } catch (error) {console.error(`Error: No se pudo eliminar el producto con el id: ${id} de la Base de Datos!!`); }
    }
}