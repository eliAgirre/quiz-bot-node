const listas = require('./listas.js');
const validaciones = require('./validaciones.js');
const commands = listas.listCommand();
var knownUsers = [];
var userStep = [];

module.exports = {

    knownUsers: function(uid){

      if( !validaciones.arrayVacio(userStep, "userStep")){

        for (i=0;i<userStep.length;i++) {
          if( uid == userStep[i] ){
            return userStep[i];
          }
          else{
            knownUsers.push(uid);
            return 0;
          }
        }
      }

    },

    findCommnad: function(text) {

        var encontrado = false;
        var comandos = [];

        for (key in commands) {
            comandos.push("/"+key);
        }

        if( !validaciones.arrayVacio(comandos, "comandos")){
          for (i=0;i<comandos.length;i++) {
            //console.log(comandos[i])
            if( text == comandos[i] ){
                encontrado = true;
            }
          }          
        }

        return encontrado;
        
    },

    readFile: function(filename){

      let fs = require('fs');
      //let path = process.cwd();
      //var content = fs.readFileSync(path + filename);
      var content = fs.readFileSync(filename);
      var array = []
      //console.log(content.toString());
      array.push(content.toString())
      return array;

    },

    writeFile: function(filename, content){

      let fs = require('fs');
      var guardado = false;
      //var content = fs.readFileSync(filename);
      fs.appendFile(filename, content, function (err) {
        if (err){
          //throw err;
          console.log(err);
        }
        else{
          console.log('Saved!');
          guardado = true;
        }
        
      });
      return guardado;

    },

    getPreguntas: function(array){

      var fila = []
      var datos = []

      if( !validaciones.arrayVacio(array, "array")){

        for(i=0;i<array.length;i++){
          fila = array[i].split(";;");
        }
      }

      if( !validaciones.arrayVacio(fila, "fila")){

        for(i=1;i<fila.length;i++){
          datos[i-1] = fila[i].split(";",8);
        }
      }
      /*
      if( !validaciones.arrayVacio(datos, "datos")){
        for(i=1;i<datos.length;i++){
          console.log(datos[i])
        }
      }*/
      return datos;
    },

    getPreguntasPorBloque: function(array, bloque){

      var fila = []
      var datos = []
      var x = 0;
      let b = ""
      
      if ( bloque.length > 0){

        if( !validaciones.arrayVacio(array, "array")){

          for(i=0;i<array.length;i++){
            fila = array[i].split(";;");
          }
        }
  
        console.log("bloque: "+bloque);

        if( !validaciones.arrayVacio(fila, "fila")){

          for(i=1;i<fila.length;i++){
  
            block = fila[i].split(";",1);
            
            for(j=0;j<block.length;j++){
  
              let b = block[j];
              b = b.replace("\r\n", "");
              b = b.trim();
              //console.log("variable b: "+b);
              if( bloque ==  b ){
                //console.log(fila[i]);
                datos[x] = fila[i].split(";",8);
                x++;
              }
            }          
          }
        }

      }

      return datos;
    },

    shuffle: function(a){
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
    },

    getRespuestaUser: function(data){

      const OPCION_A = 'a'
      const OPCION_B = 'b'
      const OPCION_C = 'c'
      const OPCION_D = 'd'
      var respuesta = ''

      switch(data){
        case OPCION_A:
          respuesta = OPCION_A;
          break;
        case OPCION_B:
          respuesta = OPCION_B;
          break;
        case OPCION_C:
          respuesta = OPCION_C;
          break;
        case OPCION_D:
          respuesta = OPCION_D;
          break;
        default:
          respuesta = ''
          break;
        }

        return respuesta;
    },

    calcularScore: function(datos_score, resp_correcta, resp_user){

      if( resp_user != ''){
        if( resp_user === resp_correcta ){
          datos_score[0] += 1;
        }
        else if( resp_user !== resp_correcta ){
          datos_score[1] += 1;
        }
      }
      
      return datos_score;

    }
    
  }