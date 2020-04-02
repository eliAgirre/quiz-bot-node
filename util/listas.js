// listas
module.exports = {

    listCommand: function() {

        commands = {  // command description used in the "help" command 
            'start'       : 'Bienvenido al chatbot', 
            'help'        : 'Esta instrucción informa sobre los comandos de este bot',
            'quiz'        : 'Empezar el test',
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
    }

}