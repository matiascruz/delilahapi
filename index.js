// Servidor
const express = require('express');
const app = express();
const bodyparser = require('body-parser');

// Bcrypt para encriptar passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

// JWT para requests que requieren token
const jwt = require('jsonwebtoken');
const firma = "Tokenizador";

// Middleware BodyParser    
app.use(bodyparser.json());

// Conexión a la DB
const mysql = require('mysql'); 
const con = mysql.createConnection({
    host: 'localhost',
    port: '',
    user: 'root',
    password: 'root',
    database: 'delilah',
    multipleStatements: true
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Conectado a la DB.");
});

/// USERS ENDPOINTS
    // Crear usuario
    app.post('/users/add', (req, res) => {
        let userAlias = req.body.alias;
        let userName = req.body.name;
        let userLast = req.body.last;
        let userEmail = req.body.email;
        let userPhone = req.body.phone;
        let userAddress = req.body.address;
        let userPass = req.body.pass;
        let userRole = req.body.role;
        if(userAlias != '' && userName != '' && userLast != '' && userEmail != '' && userPhone != '' && userAddress != '' && userPhone != '' && userRole != '') {
            // Check si el uerAlias ya está utilizado
            let sqlCheckAlias = "SELECT * FROM users WHERE user_alias = '"+userAlias+"'";
            con.query(sqlCheckAlias, function (err, result) {
                if (err) throw err;
                if(result != '') {
                    // userAlias ocupado
                    res.statusCode = 400;
                    res.json({error: 'Nombre de usuario ocupado.'});
                } else {
                    // Se puede registrar
                    // Encripto el password con bcrypt
                    const hashedPass = bcrypt.hashSync(userPass, saltRounds);
                    let sqlInsertUser = "INSERT INTO users (user_alias, user_name, user_last, user_email, user_phone, user_address, user_pass, user_role) VALUES ('"+userAlias+"', '"+userName+"', '"+userLast+"', '"+userEmail+"', '"+userPhone+"', '"+userAddress+"', '"+hashedPass+"', '"+userRole+"')";
                    con.query(sqlInsertUser, function (err, result) {
                        if (err) throw err;
                        res.statusCode = 200;
                        res.json({success: 'Usuario creado con éxito.'});
                    });
                }
            });
        } else {
            res.statusCode = 400;
            res.json({error: 'Faltan campos requeridos.'});
        }
    });

    // Hacer el login
    // Hacer el logout
    // Gets
    // Delete
    // Update

// DISHES ENDPOINTS
    // Crear plato
    app.post('/dishes/add', (req, res) => {
        let devToken = req.headers["access-token"];
        let dishName = req.body.name;
        let dishDesc = req.body.desc;
        let dishPrice = req.body.price;
        let dishAvailability = req.body.availability;
        let sql = "INSERT INTO dishes (dish_name, dish_desc, dish_price, dish_availability) VALUES ('"+dishName+"', '"+dishDesc+"', '"+dishPrice+"', '"+dishAvailability+"')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.statusCode = 200;
            res.json({success: 'Plato agregado con éxito.'});
        });
    });

// Inicio la app
app.listen(5000, () => console.log("Servidor iniciado..."));