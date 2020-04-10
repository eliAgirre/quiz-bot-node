// listas
module.exports = {

    listCommand: function() {

        commands = {  // command description used in the "help" command 
            'start'       : 'Bienvenido al chatbot', 
            'help'        : 'Esta instrucción informa sobre los comandos de este bot',
            'quiz'        : 'Empezar el test',
            'b1'          : 'Test bloque 1 - Legislacion.',
            'b2'          : 'Test bloque 2 - Tecnología básica.',
            'b3'          : 'Test bloque 3 - Programación.',
            'b4'          : 'Test bloque 4 - Sistemas.',
            '2014'        : 'Test 2014 INAP',
            '2015'        : 'Test 2015 INAP',
            '2016'        : 'Test 2016 INAP',
            '2017'        : 'Test 2017 INAP',
            '2018'        : 'Test 2018 INAP',
            'stop'        : 'Se para el test y te da un resumen de tu puntuación.',
            'wiki'        : 'Busca información en la wikipedia en castellano.'
        }
        
        return commands;
    },

    getKeyboard: function(){

        const OPCION_A = 'a'
        const OPCION_B = 'b'
        const OPCION_C = 'c'
        const OPCION_D = 'd'

        keyboard = {"inline_keyboard": 
                        [[
                            {
                                "text": OPCION_A,
                                "callback_data": OPCION_A            
                            }, 
                            {
                                "text": OPCION_B,
                                "callback_data": OPCION_B            
                            },
                                            {
                                "text": OPCION_C,
                                "callback_data": OPCION_C            
                            },
                                            {
                                "text": OPCION_D,
                                "callback_data": OPCION_D            
                            }
                        ]]
                    }

        return keyboard;
    },

    arrayCommands: function(){

        let array_commands = [  "/start",   //0
                                "/help",    //1
                                "/quiz",    //2
                                "/b1",      //3
                                "/b2",      //4
                                "/b3",      //5
                                "/b4",      //6
                                "/2014",    //7
                                "/2015",    //8
                                "/2016",    //9
                                "/2017",    //10
                                "/2018",    //11
                                "/stop",    //12
                                "/wiki"     //13
                            ];

        return array_commands;

    }

}