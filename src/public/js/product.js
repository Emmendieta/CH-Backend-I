document.addEventListener("DOMContentLoaded", () => {
    const botonAgregarACarrito = document.querySelector(".btnAddProduct");

    botonAgregarACarrito.addEventListener("click", async (event) => {
        const cartId = document.getElementById("homeDivSectCartId").value.trim();
        const quantityInput = document.getElementById("homeUlLiDivQuantityInput").value.trim();
        const quantity = parseInt(quantityInput, 10);
        const stock = parseInt(document.querySelector(".homeUlLih3Stock").textContent.trim())

        if(!cartId) {
            alert("Error: Por favor, ingrese un número de carrito!");
            return;
        }
        if (quantity <= 0) {
            alert("Error: Por favor, ingrese una cantidad mayor a 0!");
            return;
        }
        if (isNaN(quantity)) {
            alert("Error: Por favor, ingrese una número entero superior a 0!");
            return;
        }
        if (quantity > stock) {
            alert("Error: La cantidad ingresada supera el stock disponible del producto, por favor verifiquelo!");
            return;
        }
        const productId = document.querySelector("#homeUlLiH3Id").textContent.trim();
        const data = {productId, quantity};
        try {
            const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                method: "POST", 
                headers: {  
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();   
            if (response.ok) {
                alert("Producto agregado correctamente al carrito!");
            } else {
                const errorMessage = result.error || "Error desconocido al agregar el producto al carrito";
                alert(`${errorMessage}`);
            }
        } catch (error) {
            console.error("Error al agregar el producto", error);
            alert("Hubo un problema al agregar el producto!");
        }
    });
});