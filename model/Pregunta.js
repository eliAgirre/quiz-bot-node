class Pregunta {
    /*
    constructor() {
      
    }*/

    constructor(bloque, autor, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, resp_correcta) {
      this._bloque = bloque;
      this._autor = autor;
      this._enunciado = enunciado
      this._opcion_a = opcion_a;
      this._opcion_b = opcion_b;
      this._opcion_c = opcion_c;
      this._opcion_d = opcion_d;
      this._resp_correcta = resp_correcta;
    }
    set bloque(bloque) {
      this._bloque = bloque;
    }
    get bloque() {
      return this._bloque;
    }
    set autor(autor){
        this._autor = autor;
    }
    get autor(){
        return this._autor;
    }
    set enunciado(enunciado){
        this._enunciado = enunciado
    }
    get enunciado(){
      return this._enunciado;
    }

    set opcion_a(opcion_a){
      this._opcionA = opcion_a;
    }

    get opcion_a(){
      return this._opcion_a;
    }

    set opcion_b(opcion_b){
      this._opcionB = opcion_b;
    }

    get opcion_b(){
      return this._opcion_b;
    }

    set opcion_c(opcion_c){
      this._opcionC = opcion_c;
    }

    get opcion_c(){
      return this._opcion_c;
    }

    set opcion_d(opcion_d){
      this._opcionD = opcion_d;
    }

    get opcion_d(){
      return this._opcion_d;
    }

    set resp_correcta(resp_correcta){
      this._resp_correcta = resp_correcta;
    }

    get resp_correcta(){
      return this._resp_correcta;
    }
    
    showPregunta() {
      console.log('Bloque: ' + this.bloque + 
                  '\nAutor: ' + this.autor + 
                  '\nEnunciado: '+this.enunciado+
                  "\nOpcion a: "+this.opcion_a+
                  "\nOpcion b: "+this.opcion_b+
                  "\nOpcion c: "+this.opcion_c+
                  "\nOpcion d: "+this.opcion_d+
                  "\nResp correcta: "+this.resp_correcta
                  );
    }
  }

  module.exports = Pregunta;