const socket = io();

// Escuchar errores del servidor
socket.on('errorMessage', (message) => {
    alert(`❌ Error: ${message}`);
});
// Actualizar la lista de productos en el cliente
function updateProducts(products) {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';  //Limpio la lista para que no duplique

    //En caso de que no hayan productos:
    if (products.length === 0) {
        productsList.innerHTML = '<li>No hay productos disponibles.</li>';
        return;
    }

    products.forEach(product => {
        const li = document.createElement('li');
        li.id = `productRealTime${product.id}`;
        li.innerHTML = `
        <h2 class= "productRealTimeH2">${product.title}</h2>
        <h3 class= "productRealTimeH3">Code: ${product.code}</h3>
        <h4 class= "productRealTimeH4">Description: ${product.description}</h4>
        <h4 class= "productRealTimeH4">$${product.price}</h4>
        <h4 class= "productRealTimeH4">Stock: ${product.stock}</h4>
        <h4 class= "productRealTimeH4">Status: ${product.status}</h4>
        <h4 class= "productRealTimeH4">${product.thumbnails}</h4>
        <button id = "btnDeleteProduct${product.id}" onclick="deleteProduct('${product.id}')">Eliminar Producto</button>
        `;
        productsList.appendChild(li);
    });
}

// Escuchar el evento 'updateProducts' para actualizar la lista
socket.on('updateProducts', (products) => {
    updateProducts(products);
});

// Creo un nuevo producto cuando se agrega a través del formulario:
const form = document.getElementById('addProductForm');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const productTitle = document.getElementById('productTitle').value;
    const productDescription = document.getElementById('productDescription').value;
    const productCode = document.getElementById('productCode').value;
    const productPrice = document.getElementById('productPrice').value;
    const productStock = document.getElementById('productStock').value;
    const productCategory = document.getElementById('productCategory').value;
    const productThumbnails = document.getElementById('productThumbnails').value.split(',');  // Convierte las URLs en un array
    const productStatus = document.getElementById('productStatus').value;

    //Emito el evento para agregar el producto con todos los campos:
    socket.emit('newProduct', {
        title: productTitle,
        description: productDescription,
        code: productCode,
        price: productPrice,
        stock: productStock,
        category: productCategory,
        thumbnails: productThumbnails,
        status: productStatus
    });
    //Limpio el formulario:
    form.reset();
});

//Elimino un producto:
function deleteProduct(productId) {
    socket.emit('deleteProduct', productId );
}