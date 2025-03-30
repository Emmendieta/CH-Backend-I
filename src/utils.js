export const procesaErrores = (error, res) => {
    console.log(error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json( {
        error:  `Error: Se ha producido un error inesperado en el servidor!`,
        detalle: `${error.message}` //En realidad no se tiene que enviar esta info porque tiene informacion sensible para ataques
    });
}