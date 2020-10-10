// Servidor
const express = require('express');
const app = express();
const bodyparser = require('body-parser');

// Bcrypt para encriptar passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

// JWT para requests que requieren token
const jwt = require('jsonwebtoken');
const firma = "Tokenizador2020";

// Middleware BodyParser    
app.use(bodyparser.json());

// Conexión a la DB
const mysql = require('mysql'); 
const e = require('express');
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
            let sqlCheckAlias = "SELECT user_alias FROM users WHERE user_alias = '"+userAlias+"'";
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

    // Autenticar Usuario (Agregar al Swagger)
    app.post('/login', (req, res) => {
        let userAlias = req.body.alias;
        let userPass = req.body.pass;
        if(userAlias != '' || userPass != '') {
            // Check si existe el usuario
            // Hago un SELECT * para traer toda la info del usuario para firma el JWT en caso de ser valido
            let sqlCheckAlias = "SELECT * FROM users WHERE user_alias = '"+userAlias+"'";
            con.query(sqlCheckAlias, function (err, result) {
                if (err) throw err;
                if(result != '') {
                    // existe el usuario
                    // valido contraseña
                    let passCompare = bcrypt.compareSync(userPass, result[0].user_pass);
                    if(passCompare == true) {
                        // Pass correcto. Genero Token
                        let dataPayload = {
                            id: result[0].user_id,
                            alias: result[0].user_alias,
                            name: result[0].user_name,
                            last: result[0].user_last,
                            email: result[0].user_email,
                            phone: result[0].user_phone,
                            address: result[0].user_address,
                            role: result[0].user_role
                        }
                        let accessToken = jwt.sign(dataPayload, firma);
                        res.statusCode = 200;
                        // Imprimo el token a fines de poder hacer el test e incluirlo en los request necesarios
                        res.json({success: 'Usuario logueado con éxito.', token: accessToken});
                    } else {
                        // Pass incorrecto
                        res.statusCode = 400;
                        // Ya sea que el nombre de usuario o la contraseña esté mal indicamos el mismo mensaje para evitar dar indicios de usuario/pass.
                        res.json({error: 'Usuario o contraseña incorrectos.'});
                    }
                } else {
                    // No existe el usuario
                    res.statusCode = 400;
                    // Ya sea que el nombre de usuario o la contraseña esté mal indicamos el mismo mensaje para evitar dar indicios de usuario/pass.
                    res.json({error: 'Usuario o contraseña incorrectos.'});
                }
            });
        } else {
            res.statusCode = 400;
            res.json({error: 'Faltan campos requeridos.'});
        }
    });

    // Middleware para validar usuario
    const validarUsuario = (req, res, next) => {
        try {
                const token = req.headers.authorization.split(' ')[1];
                const verificarToken = jwt.verify(token, firma);
                if(verificarToken) {
                    req.validUser = verificarToken;
                    return next();
                }
            } catch(err) {
                res.json({error: 'Error al validar usuario. Falta el token de autorización.'});
            }
    };
    // Hacer el login
    // Hacer el logout
    // Gets
    // Delete
    // Update

// DISHES ENDPOINTS
    // Crear plato
    app.post('/dishes/add', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization y verifico el rol
        let userRole = req.validUser.role;
        if(userRole != 'admin') {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        } else {
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
        }
    });

// Inicio la app
app.listen(5000, () => console.log("Servidor iniciado..."));