var MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017"
var _db;
module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect(url, function( err, client) {
      _db = client.db('Books4u');
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};