import MONGOOSE from "mongoose";

const cartSchema = new MONGOOSE.Schema( 
    {
        products: {
            type: [
                {
                    product: {
                        type: MONGOOSE.Schema.Types.ObjectId,
                        ref: "products", //Referencia a la collections "products" en MongoDB
                        require:true
                    },
                    quantity: {
                        type: Number,
                        require: true,
                        min: 1 //Cantidad mínima aceptada
                    }
                }
            ], 
            default: [""]
        }
    },
    {
        timestamps: true
    }
);

export const CartsModel = MONGOOSE.model(
    "carts", 
    cartSchema
);