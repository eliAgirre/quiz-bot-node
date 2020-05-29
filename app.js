// requires
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const log = require('bristol');
const palin = require('palin');
const mongo = require('mongodb');
var pdf = require('html-pdf');

// log
log.addTarget('console').withFormatter(palin);
log.info("We're up and running!", {port: 3000});

// constantes
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

// database
const clientMongo = require('./database/config.js');
clientMongo.connectToServer( function( err ) {
    if (err){
        console.log(err);
    }
    else{
        console.log("database working.");
    }
});

// modelos
const model_pregunta = require('./model/Pregunta.js');

// constantes funciones
const funciones = require('./util/funciones.js');

// constantes validaciones
const validaciones = require('./util/validaciones.js');

// constantes filenames
//const file_preguntas = "./util/preguntas.txt";
const file_log       = "./util/logs.txt";

// constantes listas/arrays
const listas = require('./util/listas.js');
const commands = listas.listCommand();
const keyboard = listas.getKeyboard();
const command = listas.arrayCommands();

// otros constantes
const coleccion_preguntas="preguntas";
const coleccion_resp_users="respuestas_user";
const markdown = "Markdown";
const error_cargar_array = "Error al cargar el array de preguntas por";
const error_no_bien_elegido = "No se ha elegido bien.\nPara ello debe escribir el comando.\nEjemplo: ";
const error_cambio_comando = "Para cambiar debes escribir el comando "+command[12]+" y después el comando correspondiente al";

// variables
//var array = funciones.readFile(file_preguntas);
//var preguntas = funciones.getPreguntas(array);
var datos = [] // enunciado y resp_correcta
var preguntasBloque = [];
var preguntasAnio = [];
var preg = [];
var user_answer = '';
var datos_score = [0,0];
var accion = '';
var bloque_anterior = '';
var anio_anterior = '';
var accion_anterior = '';

// comandos
bot.onText(/^\/start/, (msg) => {
    console.log("Comando "+command[0])
    const log_info = `El comando `+command[0]+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: command[0] });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    //let username = msg.from.username;
    let first_name = msg.chat.first_name;
    let uid = funciones.knownUsers(msg.chat.id);
    let response = "";
    if( uid == 0){
        response = "Bienvenido "+first_name+".\nEste es un chat para practicar preguntas sobre la oposición de TAI.\nAprende constestando las preguntas y tienes la opción de ver youtube (@youtube) y de realizar las búsquedas en la wikipedia (@wiki).\nPara ver los comandos de este puedes escribir "+command[1]+"."
    }
    else{
        response = "Ya te conozco, eres "+first_name+".\nPara ver los comandos puedes escribir "+command[1]+"."
    }    
    bot.sendMessage(cid, response);  
});

// help
bot.onText(/^\/help/, (msg) => {
    console.log("Comando "+command[1])
    const log_info = `El comando `+command[1]+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: command[1] });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = "Los siguientes comando están disponibles para este bot: \n" 
    for (key in commands) {  // generate help text out of the commands dictionary defined at the top 
        response += "/"+key +' : '+commands[key]+"\n"
    }
    bot.sendMessage(cid, response);  
});

// quiz
bot.onText(/^\/quiz/, (msg) => {
    console.log("Comando "+command[2])
    const log_info = `El comando `+command[2]+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: command[2] });
    funciones.writeFile(file_log, log_info);
    accion = command[2];
    const cid = msg.chat.id
    var db_questions = [];
    var db = clientMongo.getDb();

    if (accion_anterior == '' | accion == accion_anterior){
        accion_anterior = accion;
        db.collection(coleccion_preguntas).find().toArray((err, results) => {
            if (err){
                log.error(err, { scope: 'find '+coleccion_preguntas});
                console.log(err)
                funciones.writeFile(file_log, err+" in find "+coleccion_preguntas);
            }      
            results.forEach(function(obj) {
                //console.log("obj: "+ JSON.stringify(obj));
                let preg = new model_pregunta(obj.bloque, obj.autor,  obj.enunciado, obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d, obj.resp_correcta);
                db_questions.push(preg);
            });
    
            db_questions = funciones.shuffle(db_questions);
            let m_datos = funciones.getDatosPregunta(db_questions);
            //console.log(m_datos);
            response = "* "+m_datos.bloque+")* "+m_datos.enunciado+"\n "+m_datos.opcion_a+" \n "+m_datos.opcion_b+" \n "+m_datos.opcion_c+" \n "+m_datos.opcion_d+" \n\n De *"+m_datos.autor+"*"
            datos[0] = m_datos.enunciado;
            datos[1] = m_datos.resp_correcta;
            preg[0] = m_datos.bloque;
            preg[1] = m_datos.autor;
    
            bot.sendMessage(cid, response, { parse_mode: markdown, reply_markup: keyboard }).then(() => { 
                //console.log("response: "+response);
                console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
            });
        });
    }
    else{
        response = error_cambio_comando+" año o al bloque o sino al quiz."
        bot.sendMessage(cid, response);
    }
});

// test por bloque
bot.onText(/^\/b1|^\/b2|^\/b3|^\/b4/, (msg) => {
    let comando = msg.text.toString();
    console.log("comando "+comando);
    const log_info = `El comando `+comando+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: comando });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    const bloque_elegido = comando.substring(1, comando.length);
    accion = comando;
    let bloque = ''
    var db = clientMongo.getDb();

    if (accion_anterior == '' | accion == accion_anterior){
        accion_anterior = accion;

        if (bloque_anterior == '' | bloque_elegido == bloque_anterior){

            if (bloque_elegido.toLowerCase() == command[3].substring(1,command[3].length ) //b1
                || bloque_elegido.toLowerCase() == command[4].substring(1,command[4].length ) //b2
                || bloque_elegido.toLowerCase() == command[5].substring(1,command[5].length ) //b3
                || bloque_elegido.toLowerCase() == command[6].substring(1,command[6].length ) ){ //b4

                bloque_anterior = bloque_elegido;
                bloque = bloque_elegido.toUpperCase();
                db.collection(coleccion_preguntas).find({ "bloque" : bloque }).toArray((err, results) => {

                    if (err){
                        log.error(err, { scope: 'find bloque'+coleccion_preguntas});
                        console.log(err)
                        funciones.writeFile(file_log, err+" in find bloque "+coleccion_preguntas);
                    }
                    
                    results.forEach(function(obj) {
                        //console.log("obj: "+ JSON.stringify(obj));
                        let preg = new model_pregunta(obj.bloque, obj.autor,  obj.enunciado, obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d, obj.resp_correcta);
                        preguntasBloque.push(preg);

                    });
                    //preguntasBloque = funciones.getPreguntasPorBloque(array, bloque);
                    if( !validaciones.arrayVacio(preguntasBloque, "preguntasBloque") ){
            
                        preguntasBloque = funciones.shuffle(preguntasBloque);
                        let m_datos = funciones.getDatosPregunta(preguntasBloque);
                        //console.log(m_datos);
                        response = "* "+m_datos.bloque+")* "+m_datos.enunciado+"\n "+m_datos.opcion_a+" \n "+m_datos.opcion_b+" \n "+m_datos.opcion_c+" \n "+m_datos.opcion_d+" \n\n De *"+m_datos.autor+"*"
                        datos[0] = m_datos.enunciado;
                        datos[1] = m_datos.resp_correcta;
                        preg[0] = m_datos.bloque;
                        preg[1] = m_datos.autor;
                    
                        bot.sendMessage(cid, response, { parse_mode: markdown, reply_markup: keyboard }).then(() => { 
                            //console.log("response: "+response);
                            console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
                        });
                        
                    }
                    else{
                        const log_error = error_cargar_array+" bloque."
                        log.error(log_error, { scope: comando })
                        funciones.writeFile(file_log, log_error);
                    }
                });
            }
            else {
                response = error_no_bien_elegido+command[3]
                bot.sendMessage(cid, response);
            }
        }
        else {
            response = error_cambio_comando+" bloque."
            bot.sendMessage(cid, response);
        }
    }    
    else {
        response = error_cambio_comando+" año o al bloque o sino al quiz."
        bot.sendMessage(cid, response);
    }
});

// test por año
bot.onText(/^\/2014|^\/2015|^\/2016|^\/2017|^\/2018/, (msg) => {
    let comando = msg.text.toString();
    console.log("comando "+comando);
    const log_info = `El comando `+comando+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: comando });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    const anio_elegido = comando.substring(1, comando.length);
    accion = comando;
    var db = clientMongo.getDb();

    if (accion_anterior == '' | accion == accion_anterior){
        accion_anterior = accion;

        if ( anio_anterior == '' | anio_elegido == anio_anterior){

            console.log("año elegido: "+anio_elegido);

            if ( anio_elegido == command[7].substring(1,command[7].length ) //2014
                || anio_elegido == command[8].substring(1,command[8].length ) //2015
                || anio_elegido == command[9].substring(1,command[9].length ) //2016
                || anio_elegido == command[10].substring(1,command[10].length ) //2017
                || anio_elegido == command[11].substring(1,command[11].length ) ){ //2018

                anio_anterior = anio_elegido;
                let autorLI1 = "TAI-LI-"+anio_elegido+"-1";
                //let autorLI2 = "TAI-LI-"+anio_elegido+"-2";
                let autorPI1 = "TAI-PI-"+anio_elegido+"-1";
                //let autorPI2 = "TAI-PI-"+anio_elegido+"-2";

                db.collection(coleccion_preguntas).find({$or:[{ "autor" : autorLI1 },{ "autor" : autorPI1 } ]}).toArray((err, results) => {

                    if (err){
                        log.error(err, { scope: 'find autor '+autorLI1+" "+autorPI1+" "+coleccion_preguntas});
                        console.log(err)
                        funciones.writeFile(file_log, err+" in find autor "+autorLI1+" "+autorPI1+" "+coleccion_preguntas);
                    }
                    
                    results.forEach(function(obj) {
                        //console.log("obj: "+ JSON.stringify(obj));
                        let preg = new model_pregunta(obj.bloque, obj.autor,  obj.enunciado, obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d, obj.resp_correcta);
                        //preg.showPregunta();
                        preguntasAnio.push(preg);
                    });

                });

                if( !validaciones.arrayVacio(preguntasAnio, "preguntasAnio") ){
            
                    preguntasAnio = funciones.shuffle(preguntasAnio);
                    let m_datos = funciones.getDatosPregunta(preguntasAnio);
                    //console.log(m_datos);
                    response = "* "+m_datos.bloque+")* "+m_datos.enunciado+"\n "+m_datos.opcion_a+" \n "+m_datos.opcion_b+" \n "+m_datos.opcion_c+" \n "+m_datos.opcion_d+" \n\n De *"+m_datos.autor+"*"
                    datos[0] = m_datos.enunciado;
                    datos[1] = m_datos.resp_correcta;
                    preg[0] = m_datos.bloque;
                    preg[1] = m_datos.autor;
                
                    bot.sendMessage(cid, response, { parse_mode: markdown, reply_markup: keyboard }).then(() => { 
                        //console.log("response: "+response);
                        console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
                    });   
                }
                else{
                    const log_error = error_cargar_array+" año."
                    log.error(log_error, { scope: comando })
                    funciones.writeFile(file_log, log_error);
                }
            }
            else{
                response = error_no_bien_elegido+command[8]
                bot.sendMessage(cid, response);
            }
        }
        else{
            response = error_cambio_comando+" año."
            bot.sendMessage(cid, response);
        }
    }
    else {
        response = error_cambio_comando+" año o al bloque o sino al quiz."
        bot.sendMessage(cid, response);
    }
});

// Listener (handler) for callback data from /quiz or /b1 or /2015 command
bot.on('callback_query', (callbackQuery) => {
    console.log("callback_query");
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const cid = msg.chat.id;
    const log_info = `El callback_query ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'callback_query' });
    funciones.writeFile(file_log, log_info);
    let tipo_respuesta = ''
    let response = ''
    user_answer = funciones.getRespuestaUser(data);
    var db = clientMongo.getDb();

    if( user_answer == ''){
        response = "No has respondido a la pregunta";
        bot.sendMessage(cid, response); 
    }
    else if( user_answer != ''){

        datos_score = funciones.calcularScore(datos_score, datos[1], user_answer);
        tipo_respuesta = funciones.tipoRespuesta(datos[1], user_answer);
        response += "El enunciado ha sido: "+datos[0]+"\nTu respuesta ha sido la *"+user_answer+"*.\n*La respuesta correcta es: "+datos[1]+"*\n\n"
        response += "Respuestas *correctas*: "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n\n";
        console.log("accion: "+accion);
        if( accion === ''){
            accion = command[2]+" o "+command[3]+" o "+command[4]+" o "+command[5]+" o "+command[6]+" o "+command[8];
        }
        response += "Para empezar o seguir el test puedes escribir el comando "+accion+".\n"
        response += "Para parar el test puedes escribir el comando "+command[12]+"."

        let today = new Date().toLocaleDateString("es-ES", {  
            day : '2-digit',
            month : '2-digit',
            year : 'numeric'
        })
        let hoy = funciones.formatDate(today)
        console.log(hoy);
        let time = new Date().toLocaleTimeString("es-ES", {  
            hour: '2-digit',
            minute:'2-digit',
            hour12: false
        })
        console.log(time);

        let ObjectID = mongo.ObjectID;
        let doc = { "_id": new ObjectID(), "user": msg.chat.username, "accion": accion, "bloque": preg[0], "autor": preg[1], "enunciado": datos[0], "resp_correcta": datos[1], "resp_user": data, "tipo_respuesta": tipo_respuesta, "fecha": hoy+" "+time.toString()  };
        //console.log("doc: "+ JSON.stringify(doc));

        bot.sendMessage(cid, response, { parse_mode: markdown }).then(() => { 
            console.log("response: "+response);
            user_answer = '';
            db.collection(coleccion_resp_users).insertOne(doc, (err, result) => {
                if(err){
                    console.log(err);
                    log.error(err, { scope: 'insertOne '+coleccion_resp_users});
                    funciones.writeFile(file_log, err+" in inserOne "+coleccion_resp_users);
                }
                else{
                    const log_msg="Document inserted";
                    console.log(log_msg);
                    log.info(log_msg, { scope: 'insertOne '+coleccion_resp_users});
                    funciones.writeFile(file_log, log_msg);
                }
            })
        });
    }
});

// stop
bot.onText(/^\/stop/, (msg) => {
    console.log("Comando "+command[12])
    const log_info = `El comando `+command[12]+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: command[12] });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = '';
    let contador = 0;

    if( datos_score[0] > 0 || datos_score[1] > 0 ){
        contador = datos_score[0]+datos_score[1];
        if (  accion == command[3] //b1
            | accion == command[4] //b2
            | accion == command[5] //b3
            | accion == command[6]  ){ //b4

            let b = accion.substring(accion.length-1);
            response = "De las *"+contador.toString()+"* preguntas del *bloque "+b+"*.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        }
        else if ( accion == command[7] //2014
                | accion == command[8] //2015
                | accion == command[9] //2016
                | accion == command[10] //2017
                | accion == command[11] ){ //2018
            let anio = accion.substring(1,accion.length);
            response = "De las *"+contador.toString()+"* preguntas del *año "+anio+"*.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        }
        else{
            response = "De las *"+contador.toString()+"* preguntas.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        }
        bot.sendMessage(cid, response, { parse_mode: markdown }).then(() => { 
            console.log("response: "+response);
            contador = 0;
            datos_score = [0,0];
            datos = ['',''];
            user_answer = '';
            accion_anterior = '';
        });
    }
    else{
        accion = command[2]+" o "+command[3]+" o "+command[4]+" o "+command[5]+" o "+command[6]+" o "+command[8];
        response = "No hay puntuación, ya que no has respondido al test o ya habías terminado.\nPara empezar hacer el test puedes escribir el comando "+accion+" y después hacer clic en alguna de las opciones correspondientes."
        bot.sendMessage(cid, response);
    }
});

// Matches /wiki [whatever]
bot.onText(/^\/wiki (.+)/, function onWikiText(msg, match) {
    console.log("Comando "+command[13])
    const log_info = `El comando `+command[13]+` ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: command[13] });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let search = match[1];
    let response = ''
    let lang = 'es'

    if( search.length > 0 ){
        search = search.trim();
        search = funciones.replaceSpace(search,"_");
        console.log("search: "+search);
        response = "https://"+lang+".wikipedia.org/wiki/"+search
        bot.sendMessage(cid, response, { parse_mode: "HTML" }).then(() => { 
            console.log("response: "+response);
        });
    } 
});

bot.onText(/^\/searches/, (msg) => {
    //var fs = require('fs');
    logs.logSearches(msg);
    const nombreFichero = "searches.pdf";
    var contenido = `<h1>Esto es un test de html-pdf</h1><p>Estoy generando PDF a partir de este código HTML sencillo</p>`;
    pdf.create(contenido).toFile(nombreFichero, function(err, res) {
        if (err){
            console.log(err);
        } else {
            console.log(res);
        }
    });
       
    bot.sendDocument(msg.chat.id, nombreFichero, {caption: "Searches"  }).then(() => {
        console.log(msg);
    });
});

// Matches /photo
bot.onText(/\/photo/, function onPhotoText(msg) {
    // From file path
    //const photo = `${__dirname}/kitten.jpg`;
    const photo = "kitten.jpg";
    bot.sendPhoto(msg.chat.id, photo, { caption: "I'm a kitten!" }).then(() => {
        console.log(msg);
    });
});

// command default
bot.on('message', (msg) =>  {
    console.log("Comando default")
    const log_info = `El comando default ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'default' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = '';

    if( msg.text !== undefined){

        texto = msg.text.toString();
        comando = texto;
        comando = comando.trim();
        comando_wiki = texto.substring(0, 6);
        comando_wiki = comando_wiki.trim().toLowerCase();
        search = texto.substring(5, texto.length);
        
        console.log("texto: "+texto);
        console.log("comando: "+comando);
        console.log("comando wiki: "+comando_wiki);
        console.log("search: "+search);

        if ( !funciones.findCommnad(comando) & !funciones.findCommnad(comando_wiki) & comando === 'https:' ){ // si no es ningun comando

            if ( !funciones.findAutores(texto) & !funciones.findBloques(texto) & !funciones.findYears(texto) & !funciones.findPromociones(texto) ){ // si no es ningun autor o bloque o promocion
                response = "No te entiendo \"" +texto+ "\"\nPuedes escribir el comando "+command[1]+" para saber qué comando utilizar."
                bot.sendMessage(cid, response);
            }
        }
        else{

            if ( funciones.findCommnad(comando_wiki) ){ // si es el comando wiki
    
                if( comando_wiki === command[13] ){
                    if (search.length === 0)
                        response = "No has puesto nada después de "+command[13]+" para buscarlo."
                        bot.sendMessage(cid, response);
                }
                
            }
            /*
            else{
                response = "No existe el comando en este bot. Para ello puedes escribir /help.";
            }*/
        }
    }
    else{
        response = "Si necesita ayuda puedes escribir /help.";
        bot.sendMessage(cid, response);
    }

});