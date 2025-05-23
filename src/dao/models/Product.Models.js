import MONGOOSE from "mongoose";
import PAGINATE from "mongoose-paginate-v2";

const productSchema = new MONGOOSE.Schema(
    {
        title: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        code: {
            type: String,
            require: true,
            unique: true
        },
        price: {
            type: Number,
            require: true,
            default: 0
        },
        status: {
            type: Boolean,
            require: true
        },
        stock: {
            type: Number,
            require: true, 
            default: 0
        },
        category: {
            type: String,
            require: true
        },
        thumbnails: []
    },
    {
        timestamps: true //Agrega automatica la fecha cuando se crea y modifico un producto.
    }
);

//Plugin de Paginate:
productSchema.plugin(PAGINATE);

export const ProductModel = MONGOOSE.model(
    "products",
    productSchema
);