import { ProductModel } from "./models/Product.Models.js";

export class ProductsMongoManager {
    //Todo lo que trabaje con Mongoose es asincrono:
    static async get() {
        return await ProductModel.find().lean() //el ".lean()" es para que te muestre por pantalla los datos, si no, como estan hidratados no lo muestra en HTML
    }

    static async getBy(filtro ={}) {
        return await ProductModel.findOne(filtro).lean();
    }
    
    static async getById(id) {
        return await ProductModel.findById(id).lean();
    }

    static async save(product) {
        //VER SI EN EL ROUTER SE ESTAN VALIDANDO CORRECTAMENTE LA INFO:
        return await ProductModel.create(product);
    }

    static async update(id, product) {
        return await ProductModel.findByIdAndUpdate(id, product, {new: true}).lean();
    }

    static async delete(id) {
        return await ProductModel.findByIdAndDelete(id).lean();
    }
}