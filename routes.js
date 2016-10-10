var actions = require('./actions');
var user = require('./user');
//var util = require('util');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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
            user.UserLogin(req.body, res);
        });

        app.get('/GetQuestions', requireAuthentication , function (req, res){
           user.GetQuestions(req, res);
        });

        app.post('/PostResponses', requireAuthentication, function (req, res){
            user.PostResponse(req.body, res);
        });
    }
};

function requireAuthentication (req, res, next) {
    var token = req.get('Auth');

    return new Promise(function(){
        try{
            var decodedJWT = jwt.verify(token, 'qwerty098');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#');
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
            console.log(tokenData.UserId);
            req.userid = tokenData.UserId;
            next();
        }catch(err){
            console.log(err);
            res.status(401).send();
        }
    });
}
