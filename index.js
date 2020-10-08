// Definiciones
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());

// Inicio la app
app.listen(5000, () => console.log("Servidor iniciado."));