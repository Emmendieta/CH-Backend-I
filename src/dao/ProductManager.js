const fs = require('fs');

class ProductManager {

    //Constructor:
    constructor(rutaArchivo) { this.path = rutaArchivo; }

    //Método para Traer todos los productos:
    async getProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        } else {
            // En caso de que no haya ningún producto cargado, devuelvo un array vacío:
            return [];
        }
    }

    // Método para agregar un nuevo producto:
    async addProduct(title, description, code, price, status, stock, category, thumbnails) {
        try {
            let products = await this.getProducts();
            if (products != null) {
                let id = 1;
                if (products.length > 0) {
                    id = Math.max(...products.map(pro => pro.id)) + 1;
                }
                const valid = this.validateProduct(title, description, code, price, status, stock, category, thumbnails);
                // Validar los datos del producto:
                if (!valid) {

                    throw new Error("Error: Los datos del producto no son válidos! Por favor, verifiquelos!");
                }
                else {
                    //Verifico si ya existe un producto con el mismo code ingresado:
                    const exist = await this.verifyProduct(code);
                    if (exist) { throw new Error(`Error: El código ${code} ingresado ya existe, por lo que no se creara nuevamente!!!`); }
                    else {
                        // Creo el nuevo producto con las propiedades correspondientes:
                        let newProduct = { id, title, description, code, price, status, stock, category, thumbnails };
                        // Agrego el producto al array de products:
                        products.push(newProduct);
                        // Guardo el array de products en el archivo que sirve como Base de Datos:
                        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"));
                        //Informo que se agrego correctamente el producto:
                        console.log(`Producto agregado correctamente!`);
                        return newProduct;
                    }
                }
            } else { throw new Error("Error: No se pudo recuperar el listado de productos para proceder a dar el alta al producto indicado!"); }
        } catch (error) { console.error("Error al tratar de agregar el Producto!", error); }
    }

    // Método de validación de datos del producto:
    validateProduct(title, description, code, price, status, stock, category, thumbnails) {
        // Validaciones para que se ingresen correctamente los datos:
        if (typeof title !== 'string' || title.trim().length === 0) { return false; }
        else if (typeof description !== 'string' || description.trim().length === 0) { return false; }
        else if (typeof code !== 'string' || code.trim().length === 0) { return false; }
        else if (typeof price !== 'number' || price <= 0) { return false; }
        else if (typeof status !== 'boolean') { return false; }
        else if (typeof stock !== 'number' || stock < 0) { return false; }
        else if (typeof category !== 'string' || category.trim().length === 0) { return false; }
        else if (!Array.isArray(thumbnails) || thumbnails.length < 0) { return false; }
        else {
            for (let i = 0; i < thumbnails.length; i++) {
                if (typeof thumbnails[i] !== 'string' || thumbnails[i].trim().length < 0) { return false; }
            }
        }
        return true;
    }

    async verifyProduct(code) {
        try {
            let products = await this.getProducts();
            if (products.length === 0) { return false; }
            else {
                let product = products.find(pro => String(pro.id).trim() === String(code).trim());
                if (product) { return true; }
                else { return false; }
            }
        } catch (error) { console.error("Error: No se pudo verificar si existe o no el producto!"); }
    }

    //Método para devolver un Producto por id:
    async getProduct(id) {
        try {
            let newProduct = null;
            if (typeof id !== 'number' || id <= 0) { throw new Error(`Error: El id ${id} no es válido! Por favor verifique que el dato ingresado sea un valor numérico!`); }
            else {
                let products = await this.getProducts();
                if (products.length === 0) { throw new Error("Error: No hay productos almacenados por lo que no existe el producto que indico!"); }
                else {
                    let product = products.find(pro => pro.id === id);
                    if (!product) { throw new Error("Error: No se encontro el producto indicado!"); }
                    else {
                        newProduct = {
                            id: Number(product.id),
                            title: String(product.title),
                            description: String(product.description),
                            code: String(product.code),
                            price: Number(product.price),
                            status: Boolean(product.status),
                            stock: Number(product.stock),
                            category: String(product.category),
                            thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : []
                        };
                        return newProduct;
                    }
                }
            }
        } catch (error) { console.log("Error al tratar de devolver un producto por id", error); }
    }

    //Método para actualizar un Producto existente:
    async updateProduct(id, updateData) {
        try {
            let verify = false;
            //Verico que el id ingresado sea un numero superior a 0:
            if (typeof id !== 'number' || id < 0) {
                console.error(`El id ingresado: ${id} no es válido (tiene que ser superior a 0 y tiene que ser un número!)`);
                return verify;
            }
            else {
                let products = await this.getProducts();
                //Verifico que haya al menos un producto almacenado:
                if (products.length === 0) {
                    console.error("Error: No existen productos almacenados!!! Primero cree al menos uno y luego intente modificarlo!");
                    return verify;
                } else {
                    //Verifico que se recupere el id correctamente del producto:
                    let productIndex = products.findIndex(pro => pro.id === id);
                    if (productIndex === -1) {
                        console.error(`Error: No se encontró el producto indicado con el id: ${id}!!!`);
                        return verify;
                    }
                    else {
                        let product = products[productIndex];
                        // Actualizo solo los campos que vienen en updatedData
                        for (let key in updateData) {
                            if (updateData.hasOwnProperty(key)) {
                                product[key] = updateData[key];
                            }
                        }
                        //Actualizo el producto en la Base de Datos:
                        products[productIndex] = product;
                        //Guardo la información actualizada del producto:
                        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"));
                        //informo que se actualizo correctamente el producto:
                        console.log(`Felicidades el producto con el id: ${product.id} y el nombre: ${product.title} se ha actualizado correctamente!`);
                        verify = true;
                        return verify;
                    }
                }
            }
        } catch (error) { console.error("Error al tratar de actualizar los datos del producto!", error); }
    }

    //Método para eliminar un producto:
    async deleteProduct(id) {
        let verificacion = false;
        try {
            //Verifico que el id sea un número mayor a 0:
            if (typeof id !== 'number' || id <= 0) { throw new Error(`Error: El id: ${id} para eliminar un producto solo acepta valores númericos positivos mayores a 0!!!`); }
            else {
                let products = await this.getProducts();
                //Verifico que haya al menos un producto almacenado:
                if (products.length === 0) { throw new Error("Error: No existen productos almacenados, por favor almacene al menos un producto y ahí intente eliminar el producto que requiera!!!"); }
                else {
                    //Verifico que se recupere el id correctamente del producto:
                    let productIndex = products.findIndex(pro => pro.id === id);
                    if (productIndex === -1) { throw new Error(`Error: No existe ningun producto con el id: ${id}!!!`); }
                    else {
                        //Elimino el producto del arreglo:
                        products.splice(productIndex, 1);
                        //Guardo la información actualizada del arreglo de productos:
                        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"));
                        //informo que se elimino correctamente el producto:
                        console.log(`Felicidades el producto con el id: ${id} se ha eliminado correctamente!`);
                        verificacion = true;
                        return verificacion;
                    }
                }
            }
        } catch (error) { console.error("Error: No se pudo eliminar el producto indicado!", error); }
        finally { return verificacion; }
    }
}

module.exports = { ProductManager };
