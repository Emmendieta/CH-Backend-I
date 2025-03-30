import Mongoose from "mongoose";

export const conectarDB = async (uriMongoDB, dbName) => {
    try {
        await Mongoose.connect(
            uriMongoDB,
            { 
                dbName: dbName
            }
        );
        console.log("Felicidades! Se ha conectado correctamente a la Base de Datos!");
    } catch (error) { console.error(`Error: No se pudo conectar a la Base de Datos! ${error.message}`); }
};