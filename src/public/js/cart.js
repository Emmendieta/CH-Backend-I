document.addEventListener("DOMContentLoaded", () => {
    const botonesAgregar = document.querySelectorAll(".btnAddProductToCart");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", async (event) => {
            const li = event.target.closest("li"); // Encuentro el <li> del producto
            const cartId = document.getElementById("homeDivSectCart").value.trim(); // Obtenmgo el número de carrito
            const quantityInput = li.querySelector("#homeUlLiDivBottomQuantityInput"); // Campo cantidad
            const quantity = parseInt(quantityInput.value, 10); 
            const stock = parseInt(li.querySelector(".homeUlLih5:nth-of-type(2)").textContent, 10); //Obtengo el stock

            if (!cartId) {
                alert("Error: Por favor, ingrese un número de carrito.");
                return;
            }
            if(isNaN(quantity)) {
                alert("Error: Por favor, ingrese una cantidad válida.");
                return;
            }
            if (quantity <= 0) {
                alert("Error: La cantidad ingresada no puede ser un valor negativo o nulo!");
                return;
            }
            if (quantity > stock) {
                alert("Error: La cantidad ingresada supera el stock disponible.");
                return;
            }
            const productCode = li.querySelector(".homeUlLih3:nth-of-type(2)").textContent; //Obtengo el código del producto
            const data = { productCode, quantity };
            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productCode}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Producto agregado al carrito correctamente.");
                } else {
                    const errorMessage = result.error || "Error desconocido al agregar el producto.";
                    alert(`${errorMessage}`);
                }
            } catch (error) {
                console.error("Error al agregar producto:", error);
                alert("Hubo un problema al agregar el producto.");
            }
        });
    });
});