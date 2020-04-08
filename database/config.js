const MongoClient = require('mongodb').MongoClient;
const user = process.env.USER;
const pass = process.env.PASS;
const url = "mongodb+srv://"+user+":"+pass+"@cluster0-faeim.mongodb.net/test?retryWrites=true&w=majority";
//const client = new MongoClient(url, { useNewUrlParser: true });
    
var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( url,  { useNewUrlParser: true }, function( err, client ) {
      _db  = client.db('quiz');
      //console.log(_db);
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }

};