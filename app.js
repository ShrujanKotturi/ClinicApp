var express = require('express');
var bodyparser = require('body-parser');
var app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

var connection = require('./coonection');
var routes = require('./routes');

connection.init();
routes.configure(app);

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});
