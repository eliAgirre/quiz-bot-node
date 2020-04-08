// requires
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const log = require('bristol');
const palin = require('palin');

// logs
log.addTarget('console').withFormatter(palin);
log.info("We're up and running!", {port: 3000});

// constantes
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

// database
const clientMongo = require('./database/config.js');
clientMongo.connectToServer( function( err, client ) {
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
const file_preguntas = "./util/preguntas.txt";
const file_log       = "./util/logs.txt";

// constantes listas
const listas = require('./util/listas.js');
const commands = listas.listCommand();
const keyboard = listas.getKeyboard();

// variables
//var array = funciones.readFile(file_preguntas);
//var preguntas = funciones.getPreguntas(array);
var datos = [] // enunciado y resp_correcta
var user_answer = '';
var datos_score = [0,0];
var accion = '';
var bloque_anterior = '';


// comandos
bot.onText(/^\/start/, (msg) => {
    console.log("Comando start")
    const log_info = `El comando start ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'start' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let username = msg.from.username;
    let first_name = msg.chat.first_name;
    let uid = funciones.knownUsers(msg.chat.id);
    let response = "";
    if( uid == 0){
        response = "Bienvenido "+first_name+".\nEste es un chat para practicar preguntas sobre la oposición de TAI.\nAprende constestando las preguntas y tienes la opción de ver youtube (@youtube) y de realizar las búsquedas en la wikipedia (@wiki).\nPara ver los comandos de este puedes escribir /help."
    }
    else{
        response = "Ya te conozco, eres "+first_name+".\nPara ver los comandos puedes escribir /help."
    }    
    bot.sendMessage(cid, response);  
});

bot.onText(/^\/help/, (msg) => {
    console.log("Comando help")
    const log_info = `El comando help ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'help' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = "Los siguientes comando están disponibles para este bot: \n" 
    for (key in commands) {  // generate help text out of the commands dictionary defined at the top 
        response += "/"+key +' : '+commands[key]+"\n"
    }
    bot.sendMessage(cid, response);  
});

bot.onText(/^\/quiz/, (msg) => {
    console.log("Comando quiz")
    const log_info = `El comando quiz ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'quiz' });
    funciones.writeFile(file_log, log_info);
    accion = "/quiz";
    const cid = msg.chat.id
    let bloque = ''
    let autor = ''
    let enunciado = ''
    let opcion_a = ''
    let opcion_b = ''
    let opcion_c = ''
    let opcion_d = ''
    let resp_correcta = ''
    var db_questions = [];
    var db = clientMongo.getDb();   
    db.collection('preguntas').find().toArray((err, results) => {
        if (err){
             return console.log(err)
        }       
        results.forEach(function(obj) {
            //console.log("obj: "+ JSON.stringify(obj));
            let preg = new model_pregunta(obj.bloque, obj.autor,  obj.enunciado, obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d, obj.resp_correcta);
            db_questions.push(preg);
        });

        db_questions = funciones.shuffle(db_questions);

        for(i=1;i<db_questions.length;i++){
            //console.log(db_questions[i]);
            bloque = db_questions[i].bloque;
            autor = db_questions[i].autor;
            enunciado = db_questions[i].enunciado;
            opcion_a = db_questions[i].opcion_a;
            opcion_b = db_questions[i].opcion_b;
            opcion_c = db_questions[i].opcion_c;
            opcion_d = db_questions[i].opcion_d;
            resp_correcta = db_questions[i].resp_correcta;
        }
    
        response = "* "+bloque+")* "+enunciado+"\n "+opcion_a+" \n "+opcion_b+" \n "+opcion_c+" \n "+opcion_d+" \n\n De *"+autor+"*"
    
        datos[0] = enunciado;
        datos[1] = resp_correcta;
    
        bot.sendMessage(cid, response, { parse_mode: "Markdown", reply_markup: keyboard }).then(() => { 
            //console.log("response: "+response);
            console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
        });

    });

});

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
    let autor = ''
    let enunciado = ''
    let opcion_a = ''
    let opcion_b = ''
    let opcion_c = ''
    let opcion_d = ''
    let resp_correcta = ''
    var db = clientMongo.getDb();
    var preguntasBloque = [];

    if (bloque_anterior == '' | bloque_elegido == bloque_anterior){

        if (bloque_elegido.toLowerCase() == "b1" || bloque_elegido.toLowerCase() == "b2" || bloque_elegido.toLowerCase() == "b3" || bloque_elegido.toLowerCase() == "b4"){

            bloque_anterior = bloque_elegido;
            bloque = bloque_elegido.toUpperCase();

            db.collection('preguntas').find({"bloque":bloque}).toArray((err, results) => {

                if (err){
                    return console.log(err)
                }
                
                results.forEach(function(obj) {
                    //console.log("obj: "+ JSON.stringify(obj));
                    let preg = new model_pregunta(obj.bloque, obj.autor,  obj.enunciado, obj.opcion_a, obj.opcion_b, obj.opcion_c, obj.opcion_d, obj.resp_correcta);
                    preguntasBloque.push(preg);

                });

                //preguntasBloque = funciones.getPreguntasPorBloque(array, bloque); 
        
                if( !validaciones.arrayVacio(preguntasBloque, "preguntasBloque") ){
        
                    preguntasBloque = funciones.shuffle(preguntasBloque);
        
                    for(i=0;i<preguntasBloque.length;i++){
                        //console.log(preguntasBloque[i]);
                        bloque = preguntasBloque[i].bloque;
                        autor = preguntasBloque[i].autor;
                        enunciado = preguntasBloque[i].enunciado;
                        opcion_a = preguntasBloque[i].opcion_a;
                        opcion_b = preguntasBloque[i].opcion_b;
                        opcion_c = preguntasBloque[i].opcion_c;
                        opcion_d = preguntasBloque[i].opcion_d;
                        resp_correcta = preguntasBloque[i].resp_correcta;
                    }
                
                    response = "* "+bloque+")* "+enunciado+"\n "+opcion_a+" \n "+opcion_b+" \n "+opcion_c+" \n "+opcion_d+" \n\n De *"+autor+"*"
                    
                    datos[0] = enunciado;
                    datos[1] = resp_correcta;
                
                    bot.sendMessage(cid, response, { parse_mode: "Markdown", reply_markup: keyboard }).then(() => { 
                        //console.log("response: "+response);
                        console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
                    });
                    
                }
                else{
                    const log_error = "Error al cargar el array de preguntas por bloque.";
                    log.error(log_error, { scope: comando })
                    funciones.writeFile(file_log, log_error);
                }

            });
        }
        else {
            response = "No se ha elegido bien el bloque.\nPara ello debe escribir el comando /bloque.\nEjemplo: /b1"
            bot.sendMessage(cid, response);
        }
    }
    else {
        response = "Para cambiar de bloque debes escribir el comando /stop y después el comando correspondiente al bloque."
        bot.sendMessage(cid, response);
    }
    

});

// Listener (handler) for callback data from /quiz command
bot.on('callback_query', (callbackQuery) => {
    console.log("callback_query");
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const cid = msg.chat.id;
    const log_info = `El callback_query ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'callback_query' });
    funciones.writeFile(file_log, log_info);
    let response = ''
    user_answer = funciones.getRespuestaUser(data);

    if( user_answer == ''){
        response = "No has respondido a la pregunta";
        bot.sendMessage(cid, response); 
    }
    else if( user_answer != ''){

        datos_score = funciones.calcularScore(datos_score, datos[1], user_answer);
        response += "El enunciado ha sido: "+datos[0]+"\nTu respuesta ha sido la *"+user_answer+"*.\n*La respuesta correcta es: "+datos[1]+"*\n\n"
        response += "Respuestas *correctas*: "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n\n";
        console.log("accion: "+accion);
        if( accion === ''){
            accion = "/quiz o /b1 o /b2 o /b3 o /b4";
        }
        response += "Para empezar o seguir el test puedes escribir el comando "+accion+".\n"
        response += "Para parar el test puedes escribir el comando /stop."

        bot.sendMessage(cid, response, { parse_mode: "Markdown" }).then(() => { 
            console.log("response: "+response);
            user_answer = '';
        });
    }
});

bot.onText(/^\/stop/, (msg) => {
    console.log("Comando stop")
    const log_info = `El comando stop ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'stop' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = '';
    let contador = 0;

    if( datos_score[0] > 0 || datos_score[1] > 0 ){
        contador = datos_score[0]+datos_score[1];
        if (accion == '/b1' | accion == '/b2' | accion == '/b3' | accion == '/b4'  ){
            let b = accion.substring(accion.length-1);
            response = "De las *"+contador.toString()+"* preguntas del *bloque "+b+"*.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        }
        else{
            response = "De las *"+contador.toString()+"* preguntas.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        }
        bot.sendMessage(cid, response, { parse_mode: "Markdown" }).then(() => { 
            console.log("response: "+response);
            contador = 0;
            datos_score = [0,0];
            datos = ['',''];
            user_answer = '';
        });
    }
    else{
        accion = "/quiz o /b1 o /b2 o /b3 o /b4";
        response = "No hay puntuación, ya que no has respondido al test o ya habías terminado.\nPara empezar hacer el test puedes escribir el comando "+accion+" y después hacer clic en alguna de las opciones correspondientes."
        bot.sendMessage(cid, response);
    }
    
});

// Matches /wiki [whatever]
bot.onText(/^\/wiki (.+)/, function onWikiText(msg, match) {
    console.log("Comando wiki")
    const log_info = `El comando wiki ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'wiki' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let search = match[1];
    let response = ''
    let lang = 'es'

    if( search.length > 0 ){

        search = search.trim();
        search = search.replace(" ", "_");
        console.log("search: "+search);
        response = "https://"+lang+".wikipedia.org/wiki/"+search
        bot.sendMessage(cid, response, { parse_mode: "HTML" }).then(() => { 
            console.log("response: "+response);
        });
    }
    
});

bot.on('message', (msg) =>  {
    console.log("Comando default")
    const log_info = `El comando default ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'default' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    response = ''

    texto = msg.text.toString();
    comando = texto.substring(0, 6);
    comando = comando.trim().toLowerCase();
    search = texto.substring(5, texto.length);

    console.log("texto: "+texto)
    console.log("comando: "+comando)
    console.log("search: "+search)
    console.log("tam search: "+search.length)

    if ( !funciones.findCommnad(comando) ){ // si no es ningun comando
        
        response = "No te entiendo \"" +texto+ "\"\nPuedes escribir el comando /help para saber qué comando utilizar."
        bot.sendMessage(cid, response);
    }
    else{

        if ( funciones.findCommnad(comando) ){ // si es el comando wiki

            if( comando === "/wiki"){
                if (search.length === 0){
                    response = "No has puesto nada después de /wiki para buscarlo."
                    bot.sendMessage(cid, response);
                }
            }
        }
    }
    
});