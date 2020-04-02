// requires
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const log = require('bristol');
const palin = require('palin');
log.addTarget('console').withFormatter(palin);
log.info("We're up and running!", {port: 3000});

// constantes
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

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
var array = funciones.readFile(file_preguntas);
var preguntas = funciones.getPreguntas(array);
var datos = [] // enunciado y resp_correcta
var preguntasBloque = [];
var user_answer = '';
var datos_score = [0,0];
var accion = '';
var bloque_global = '';

bot.onText(/\/start/, (msg) => {
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

bot.onText(/\/help/, (msg) => {
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

bot.onText(/\/quiz/, (msg) => {
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
    preguntas = funciones.shuffle(preguntas);
    for(i=1;i<preguntas.length;i++){
        //console.log(preguntas[i]);
        bloque = preguntas[i][0];
        autor = preguntas[i][1];
        enunciado = preguntas[i][2];
        opcion_a = preguntas[i][3];
        opcion_b = preguntas[i][4];
        opcion_c = preguntas[i][5];
        opcion_d = preguntas[i][6];
        resp_correcta = preguntas[i][7];
    }

    response = "* "+bloque+")* "+enunciado+"\n "+opcion_a+" \n "+opcion_b+" \n "+opcion_c+" \n "+opcion_d+" \n\n De *"+autor+"*"

    datos[0] = enunciado;
    datos[1] = resp_correcta;

    bot.sendMessage(cid, response, { parse_mode: "Markdown", reply_markup: keyboard }).then(() => { 
        //console.log("response: "+response);
        console.log("datos: \nenunciado: "+datos[0]+"\n resp_correcta: "+datos[1]);
    });
});

// Matches /test [whatever]
bot.onText(/\/test (.+)/, function onTestText(msg, match) {
    console.log("comando test");
    const log_info = `El comando test ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'test' });
    funciones.writeFile(file_log, log_info);
    const message = msg;
    const cid = msg.chat.id
    const bloque_elegido = match[1];
    accion = "/test "+bloque_elegido.toLowerCase();
    let bloque = ''
    let autor = ''
    let enunciado = ''
    let opcion_a = ''
    let opcion_b = ''
    let opcion_c = ''
    let opcion_d = ''
    let resp_correcta = ''
    
    if (bloque_elegido.toLowerCase() == "b1" || bloque_elegido.toLowerCase() == "b2" || bloque_elegido.toLowerCase() == "b3" || bloque_elegido.toLowerCase() == "b4"){

        bloque_global = bloque_elegido;
        bloque = bloque_elegido.toUpperCase();
        preguntasBloque = funciones.getPreguntasPorBloque(array, bloque); 

        if( !validaciones.arrayVacio(preguntasBloque, "preguntasBloque") ){

            preguntasBloque = funciones.shuffle(preguntasBloque);

            for(i=0;i<preguntasBloque.length;i++){
                //console.log(preguntasBloque[i]);
                autor = preguntasBloque[i][1];
                enunciado = preguntasBloque[i][2];
                opcion_a = preguntasBloque[i][3];
                opcion_b = preguntasBloque[i][4];
                opcion_c = preguntasBloque[i][5];
                opcion_d = preguntasBloque[i][6];
                resp_correcta = preguntasBloque[i][7];
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
            log.error(log_error, { scope: 'test' })
            funciones.writeFile(file_log, log_error);
        }
    }
    else {
        response = "No se ha elegido bien el bloque.\nPara ello debe escribir el comando /test bloque.\nEjemplo: /test b1"
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
        response += "Para empezar hacer el test puedes escribir el comando "+accion+".\n"
        response += "Para parar el test puedes escribir el comando /stop."

        bot.sendMessage(cid, response, { parse_mode: "Markdown" }).then(() => { 
            console.log("response: "+response);
            user_answer = '';
        });
    }
});

bot.onText(/\/stop/, (msg) => {
    console.log("Comando stop")
    const log_info = `El comando stop ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'stop' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = '';
    let contador = 0;
    if( datos_score[0] > 0 || datos_score[1] > 0 ){
        contador = datos_score[0]+datos_score[1];
        response = "De las *"+contador.toString()+"* preguntas.\nRespuestas *correctas* : "+datos_score[0].toString()+".\nRespuestas *incorrectas*: "+datos_score[1].toString()+".\n"
        bot.sendMessage(cid, response, { parse_mode: "Markdown" }).then(() => { 
            console.log("response: "+response);
            contador = 0;
            datos_score = [0,0];
            datos = ['',''];
            user_answer = '';
        });
    }
    else{
        response = "No hay puntuación, ya que no has respondido al test o ya habías terminado.\nPara empezar hacer el test puedes escribir el comando "+accion+" y después hacer clic en alguna de las opciones correspondientes."
        bot.sendMessage(cid, response);
    }
    
});


bot.onText(/\/wiki/, (msg) => {
    console.log("Comando wiki")
    const log_info = `El comando wiki ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'wiki' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    let response = ''
    let lang = 'es'
    let texto = msg.text.toString();

    if( texto.length > 0 ){

        texto = texto.trim();
        let comando = texto.substring(0, 5);
        let search = texto.substring(5, texto.length);

        if( search.length > 0 ){

            search = search.trim();
            search = search.replace(" ", "_");
            console.log("search: "+search);
            response = "https://"+lang+".wikipedia.org/wiki/"+search
            bot.sendMessage(cid, response, { parse_mode: "HTML" }).then(() => { 
                console.log("response: "+response);
            });
        }
        /*
        else{
            response = "No has puesto nada después de /wiki para buscarlo."
            bot.sendMessage(cid, response);
        }*/
    }
});


bot.on('message', (msg) => {
    console.log("Comando default")
    const log_info = `El comando default ha recibido el dato del chat: \n{\nid: ${msg.chat.id}\ntype: ${msg.chat.type}\nusername: ${msg.chat.username}\nfirst_name: ${msg.chat.first_name}\n}\n`
    log.info(log_info, { scope: 'default' });
    funciones.writeFile(file_log, log_info);
    const cid = msg.chat.id
    response = ''

    texto = msg.text.toString();
    comando = texto.substring(0, 6);
    comando = comando.trim();
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
            else if( comando === "/test"){
                if (search.length === 0){
                    response = "No se ha elegido el bloque.\nPara ello debe escribir el comando /test bloque.\nEjemplo: /test b1"
                    bot.sendMessage(cid, response);
                }
            }
        }
    }
    
});