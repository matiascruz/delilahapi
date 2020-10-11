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
    
    // Eliminar usuario
    app.delete('/users/delete/:userId', validarUsuario, (req, res) => {
        // Obtengo el user role y el ID del token de Authorization
        // Verifico si el usuario es Admin puede borrar cualquier usuario
        // Si el usuario no es Admin deben coincidir el ID del path con el ID del token para poder proceder
        let userRole = req.validUser.role;
        let userIdTk = req.validUser.id;
        let userIdURL = req.params.userId;
        if(userRole == 'admin' || userIdTk == userIdURL) {
            // Puede borrar
            let sqlDeleteUser = "DELETE FROM users WHERE user_id = '"+userIdURL+"'";
            con.query(sqlDeleteUser, function (err, result) {
                if (err) throw err;
                if(result.affectedRows > 0) {
                    res.statusCode = 200;
                    res.json({success: 'Usuario eliminado.'});
                } else {
                    res.statusCode = 404;
                    res.json({error: 'Usuario no encontrado.'}); 
                }
            });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

    // Editar Usuario
    /* NOTA:
        A los fines de simplificar el trabajo, para el update de usuario 
        se deben enviar todos los campos. Los campos que no se desean modificar 
        se deben enviar con los datos previos para que no cambien. 
        En el front esta tarea se podría realizar enviando al request todos los 
        campos del form de edición (los que cambian y los que no).

        Acá sólo estoy haciendo 2 consultas: si cambia el pass mando el pass nuevo 
        hasheado. Y sino cambia el pass no mando ese update en la consulta a la DB.
    */
    app.put('/users/update/:userId', validarUsuario, (req, res) => {
        // Obtengo el user ID del token de Authorization
        // Verifico que el ID del parametro coincida con el del token
        let userIdTk = req.validUser.id;
        let userIdURL = req.params.userId;
        if(userIdTk == userIdURL) {
            // Puede editar
            let userName = req.body.name;
            let userLast = req.body.last;
            let userEmail = req.body.email;
            let userPhone = req.body.phone;
            let userAddress = req.body.address;
            let userPass = req.body.pass;
            // Si modifica pass, encripto con bcrypt
            if(userPass != '') {
                // Encripto el password con bcrypt
                const hashedPass = bcrypt.hashSync(userPass, saltRounds);
                let sqlUpdateUser = "UPDATE users SET user_name = '"+userName+"', user_last = '"+userLast+"', user_email = '"+userEmail+"', user_phone = '"+userPhone+"', user_address = '"+userAddress+"', user_pass = '"+hashedPass+"' WHERE user_id = '"+userIdURL+"'";
                con.query(sqlUpdateUser, function (err, result) {
                    if (err) throw err;
                    res.statusCode = 200;
                    res.json({success: 'Usuario modificado.'});
                });
            } else {
                let sqlUpdateUser = "UPDATE users SET user_name = '"+userName+"', user_last = '"+userLast+"', user_email = '"+userEmail+"', user_phone = '"+userPhone+"', user_address = '"+userAddress+"' WHERE user_id = '"+userIdURL+"'";
                con.query(sqlUpdateUser, function (err, result) {
                    if (err) throw err;
                    res.statusCode = 200;
                    res.json({success: 'Usuario modificado.'});
                });
            }
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

    // Listar usuarios según rol
    app.get('/users/findByRole', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization y verifico el rol
        let userRole = req.validUser.role;
        if(userRole != 'admin') {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        } else {
            const queryRole = req.query.role;
            if(!queryRole){
                res.statusCode = 400;
                res.json({error: 'Debes indicar un rol de usuario como query params.'});
            } else {
                let sqlGetUsers = "SELECT user_id, user_alias, user_name, user_last, user_email, user_phone, user_address, user_role FROM users WHERE user_role = '"+queryRole+"'";
                con.query(sqlGetUsers, function (err, result) {
                    if (err) throw err;
                    if(result == '') {
                        res.statusCode = 404;
                        res.json({error: 'El rol consultado no existe.'});
                    } else {
                        res.statusCode = 200;
                        res.send(result);
                    }
                });
            }
        }
    });

    // Listar un usuario según su ID
    app.get('/users/:userId', validarUsuario, (req, res) => {
        // Obtengo el user ID del token de Authorization
        // Verifico que el ID del parametro coincida con el del token
        let userIdTk = req.validUser.id;
        let userIdURL = req.params.userId;
        if(userIdTk == userIdURL) {
            let sqlGetUser = "SELECT user_id, user_alias, user_name, user_last, user_email, user_phone, user_address, user_role FROM users WHERE user_id = '"+userIdURL+"'";
            con.query(sqlGetUser, function (err, result) {
                if (err) throw err;
                if(result == '') {
                    /* En rigo este caso no debería presentarse ya que al validar el ID de usuario
                    con el token, si el token es válido es porque el ID existe en DB, de lo contrario
                    no podría haberse logueado para obtener el token */
                    res.statusCode = 404;
                    res.json({error: 'Usuario no encontrado.'});
                } else {
                    res.statusCode = 200;
                    res.send(result);
                }
            });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }        
    });
    
    // Autenticar Usuario
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

// DISHES ENDPOINTS
    // Listar todos los platos
    app.get('/dishes', (req, res) => {
        let sqlDishes = "SELECT * FROM dishes";
        con.query(sqlDishes, function (err, result) {
            if (err) throw err;
            if(result == '') {
                res.statusCode = 200;
                res.json({error: 'No hay platos cargados en la base de datos.'});
            } else {
                res.statusCode = 200;
                res.send(result);
            }
        });
    });

    // Listar un plato según ID
    app.get('/dishes/:dishId', (req, res) => {
        let dishIdURL = req.params.dishId;
        let sqlDishes = "SELECT * FROM dishes WHERE dish_id = '"+dishIdURL+"'";
        con.query(sqlDishes, function (err, result) {
            if (err) throw err;
            if(result == '') {
                res.statusCode = 404;
                res.json({error: 'Plato no encontrado.'});
            } else {
                res.statusCode = 200;
                res.send(result);
            }
        });
    });

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

    // Eliminar plato
    app.delete('/dishes/delete/:dishId', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization
        // Verifico si el usuario es Admin puede borrar cualquier plato
        let userRole = req.validUser.role;
        let dishIdURL = req.params.dishId;
        if(userRole == 'admin') {
            // Puede borrar
            let sqlDeleteDish = "DELETE FROM dishes WHERE dish_id = '"+dishIdURL+"'";
            con.query(sqlDeleteDish, function (err, result) {
                if (err) throw err;
                if(result.affectedRows > 0) {
                    res.statusCode = 200;
                    res.json({success: 'Plato eliminado.'});
                } else {
                    res.statusCode = 404;
                    res.json({error: 'Plato no encontrado.'}); 
                }
            });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

    // Editar Plato
    /* NOTA:
        A los fines de simplificar el trabajo, para el update de plato 
        se deben enviar todos los campos. Los campos que no se desean modificar 
        se deben enviar con los datos previos para que no cambien. 
        En el front esta tarea se podría realizar enviando al request todos los 
        campos del form de edición (los que cambian y los que no).
    */
    app.put('/dishes/update/:dishId', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization
        // Verifico si el usuario es Admin puede editar cualquier plato
        let userRole = req.validUser.role;
        let dishIdURL = req.params.dishId;
        
        if(userRole == 'admin') {
            // Puede editar
            let dishName = req.body.name;
            let dishDesc = req.body.desc;
            let dishPrice = req.body.price;
            let dishAvailability = req.body.availability;
            let sqlUpdateDish = "UPDATE dishes SET dish_name = '"+dishName+"', dish_desc = '"+dishDesc+"', dish_price = '"+dishPrice+"', dish_availability = '"+dishAvailability+"' WHERE dish_id = '"+dishIdURL+"'";
                con.query(sqlUpdateDish, function (err, result) {
                    if (err) throw err;
                    if(result.affectedRows > 0) {
                        res.statusCode = 200;
                        res.json({success: 'Plato modificado.'});
                    } else {
                        res.statusCode = 404;
                        res.json({error: 'Plato no encontrado.'}); 
                    }
                });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

// ORDERS ENDPOINTS
    // Crear orden
    app.post('/orders/add', validarUsuario, (req, res) => {
        // Obtengo el user ID del token de Authorization
        let userIdTk = req.validUser.id;
        // Obtengo los datos de la orden
        let orderStatus = req.body.status;
        let orderPayment = req.body.paymentMethod;
        let orderAmmount = req.body.ammount;
        let orderComments = req.body.comments;
        // Agrego address y phone para dar posibilidad de que un usuario desee enviar un pedido
        // A una dirección diferente de la que usó para registrarse
        let orderAddress = req.body.address;
        let orderPhone = req.body.phone;
        let orderDishes = req.body.dishes;

        if(orderStatus != '' && orderPayment != '' && orderAmmount != '' && orderAddress != '' && orderPhone != '' && orderDishes != '') {
            // Primero inserto los datos de la orden en la tabla 'orders'
            let sqlAddOrder = "INSERT INTO orders (user_id, order_status, order_paymentMethod, order_ammount, order_comments, order_address, order_phone) VALUES ('"+userIdTk+"', '"+orderStatus+"', '"+orderPayment+"', '"+orderAmmount+"', '"+orderComments+"', '"+orderAddress+"', '"+orderPhone+"')";
            con.query(sqlAddOrder, function (err, result) {
                if (err) throw err;
                let orderId = result.insertId;
                // Creo un array para el detalle de la orden
                let orderDet = [];
                // Recorro orderDishes para armar el array con el detalle de platos para hacer el query
                orderDishes.forEach(element => {
                    orderDet.push([orderId, element.dishId, element.quantity, element.unitPrice]);
                });
                // Inserto el detalle de platos en la tabla "orders_det"
                let sqlOrderDet = "INSERT INTO orders_det (order_id, dish_id, dish_quantity, dish_price) VALUES ?";
                con.query(sqlOrderDet, [orderDet], function (err, resultDet) {
                    if (err) throw err;
                    res.statusCode = 200;
                    res.json({success: 'Orden creada con éxito.'});
                });
            });
        } else {
            res.statusCode = 400;
            res.json({error: 'Faltan campos requeridos para crear una orden.'});
        }
    });

    // Listar todas las órdenes
    app.get('/orders', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization
        // Verifico si el usuario es Admin, puede listar las ordenes
        let userRole = req.validUser.role;
        if(userRole == 'admin') {
            let sqlOrders = "SELECT orders.*, users.user_name, users.user_last, users.user_email FROM orders JOIN users ON orders.user_id = users.user_id ORDER BY orders.order_id DESC";
            con.query(sqlOrders, function (err, result) {
                if (err) throw err;
                if(result == '') {
                    res.statusCode = 200;
                    res.json({error: 'No hay ordenes cargadas en la base de datos.'});
                } else {
                    var ordersListing = [];
                    var limit = result.length;
                    var i = 1;
                    // Entrego el resultado cuando s termina el foreach
                    function printRes(i, limit) {
                        if(i == limit) {
                            res.statusCode = 200;
                            res.send(ordersListing);
                        }
                    }
                    result.forEach(element => {
                        let sqlOrderDet = "SELECT orders_det.dish_id, orders_det.dish_quantity, orders_det.dish_price, dishes.dish_name FROM orders_det JOIN dishes ON orders_det.dish_id = dishes.dish_id WHERE orders_det.order_id = '"+element.order_id+"'";
                        con.query(sqlOrderDet, function (err, resultDet) {
                            if (err) throw err;
                            ordersListing.push({"order_id":element.order_id, "order_datetime":element.order_datetime, "order_status":element.order_status, "user_name":element.user_name, "user_last":element.user_last, "user_email":element.user_email, "order_address":element.order_address, "order_phone":element.order_phone, "order_detail":resultDet, "order_ammount":element.order_ammount, "payment_method":element.order_paymentMethod});
                            printRes(i, limit);
                            i++;
                        });
                    });
                    
                }
            });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

    // Listar orden por ID
    app.get('/orders/:orderId', validarUsuario, (req, res) => {
        // Obtengo el user role y el user ID del token de Authorization
        // Verifico si el usuario es Admin o si el user ID coincide con el user_id del pedido
        let userRole = req.validUser.role;
        let userIdTk = req.validUser.id;
        let orderIdUrl = req.params.orderId;
        //if(userRole == 'admin' || userIdTk == userIdURL) {
        let sqlOrder = "SELECT orders.*, users.user_name, users.user_last, users.user_email FROM orders JOIN users ON orders.user_id = users.user_id WHERE orders.order_id = '"+orderIdUrl+"'";
        con.query(sqlOrder, function (err, result) {
            if (err) throw err;
            if(userRole == 'admin' || result[0].user_id == userIdTk) {
                if(result == '') {
                    // En rigor este caso no debería darse
                    res.statusCode = 404;
                    res.json({error: 'Orden no encontrada.'});
                } else {
                    var ordersListing = [];
                    var limit = result.length;
                    var i = 1;
                    // Entrego el resultado cuando s termina el foreach
                    function printRes(i, limit) {
                        if(i == limit) {
                            res.statusCode = 200;
                            res.send(ordersListing);
                        }
                    }
                    result.forEach(element => {
                        let sqlOrderDet = "SELECT orders_det.dish_id, orders_det.dish_quantity, orders_det.dish_price, dishes.dish_name FROM orders_det JOIN dishes ON orders_det.dish_id = dishes.dish_id WHERE orders_det.order_id = '"+element.order_id+"'";
                        con.query(sqlOrderDet, function (err, resultDet) {
                            if (err) throw err;
                            ordersListing.push({"order_id":element.order_id, "order_datetime":element.order_datetime, "order_status":element.order_status, "user_name":element.user_name, "user_last":element.user_last, "user_email":element.user_email, "order_address":element.order_address, "order_phone":element.order_phone, "order_detail":resultDet, "order_ammount":element.order_ammount, "payment_method":element.order_paymentMethod});
                            printRes(i, limit);
                            i++;
                        });
                    });
                }
            } else {
                res.statusCode = 403;
                res.json({error: 'Operación no permitida para este usuario.'});
            }
        });
    });

    // Eliminar orden
    app.delete('/orderes/delete/:orderId', validarUsuario, (req, res) => {
        // Obtengo el user role del token de Authorization
        // Verifico si el usuario es Admin puede borrar una orden
        let userRole = req.validUser.role;
        let orderIdUrl = req.params.orderId;
        if(userRole == 'admin') {
            // Puede borrar
            let sqlDeleteOrder = "DELETE orders, orders_det FROM orders INNER JOIN orders_det ON orders_det.order_id = orders.order_id WHERE orders.order_id = '"+orderIdUrl+"'";
            con.query(sqlDeleteDish, function (err, result) {
                if (err) throw err;
                if(result.affectedRows > 0) {
                    res.statusCode = 200;
                    res.json({success: 'Orden eliminada.'});
                } else {
                    res.statusCode = 404;
                    res.json({error: 'Orden no encontrada.'}); 
                }
            });
        } else {
            res.statusCode = 403;
            res.json({error: 'Operación no permitida para este usuario.'});
        }
    });

// Inicio la app
app.listen(5000, () => console.log("Servidor iniciado..."));