var actions = require('./actions');
var user = require('./user');
var connection = require('./connection');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var middleware = require('./middleware');

module.exports = {
    configure: function(app) {
        //Admin
        app.post('/AdminLogin', function (req, res) {
            actions.AdminLogin(req.body, res);
        });

        app.post('/CreateUser', middleware.RequireAdminAuthentication, function (req, res) {
           actions.CreateUser(req.body, res);
        });

        app.get('/GetAllUsers', middleware.RequireAdminAuthentication, function (req, res) {
           actions.GetAllUsers(res);
        });

        app.get('/GetUserResponse', middleware.RequireAdminAuthentication, function (req, res){
           actions.GetUserResponse(req, res);
        });
        
        app.get('/GetRequestedUsersList', middleware.RequireAdminAuthentication, function (req, res) {
           actions.GetRequestedUsersList(req, res);
        });

        //Users
        app.post('/Authenticate', function (req, res){
            user.UserLogin(req.body, res);
        });

        app.get('/GetQuestions', middleware.RequireAuthentication, function (req, res){
            user.GetQuestions(req, res);
        });

        app.post('/PostResponses', middleware.RequireAuthentication, function (req, res){
            user.PostResponse(req.body, res);
        });

        app.post('/RegisterDevice', function (req, res){
            user.Register(req.body, res);
        });

        app.post('/RegisterUser', function (req, res) {
            user.RegisterUser(req.body, res);
        });
    }
};



