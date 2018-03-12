const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydb');

var db = mongoose.connection;
   db.on('error', console.error.bind(console, 'DB connection error:'));
   db.once('open', function() {
       // we're connected!
       console.log("DB connection successful");
       // console.log(server);
   });
