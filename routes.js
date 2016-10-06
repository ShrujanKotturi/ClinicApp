var actions = require('./actions');
var user = require('./user');
var util = require('util');

module.exports = {
    configure: function(app) {
        //Admin
        app.post('/AdminLogin', function (req, res) {
            actions.AdminLogin(req.body, res);
        });

        app.post('/CreateUser', function (req, res) {
           actions.CreateUser(req.body, res);
        });

        app.get('/GetAllUsers', function (req, res) {
           actions.GetAllUsers(res);
        });

        app.get('/GetUserResponse', function (req, res){
           actions.GetUserResponse(req, res);
        });

        //Users
        app.post('/Authenticate', function (req, res){
            user.UserLogin(req, res);
        });

        app.get('/GetQuestions', function (req, res){
           user.GetQuestions(req, res);
        });
        app.post('/update/', function (req, res){
            actions.post(req.body, res);
        });
    }
};

