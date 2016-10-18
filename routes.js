var actions = require('./actions');
var user = require('./user');
var connection = require('./connection');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var util = require('util');

module.exports = {
    configure: function(app) {
        //Admin
        app.post('/AdminLogin', function (req, res) {
            actions.AdminLogin(req.body, res);
        });

        app.post('/CreateUser', requireAdminAuthentication, function (req, res) {
           actions.CreateUser(req.body, res);
        });

        app.get('/GetAllUsers', requireAdminAuthentication, function (req, res) {
           actions.GetAllUsers(res);
        });

        app.get('/GetUserResponse', requireAdminAuthentication, function (req, res){
           actions.GetUserResponse(req, res);
        });
        
        app.get('/GetRequestedUsersList', requireAdminAuthentication, function (req, res) {
           actions.GetRequestedUsersList(req, res);
        });

        //Users
        app.post('/Authenticate', function (req, res){
            user.UserLogin(req.body, res);
        });

        app.get('/GetQuestions', requireAuthentication, function (req, res){
            user.GetQuestions(req, res);
        });

        app.post('/PostResponses', requireAuthentication, function (req, res){
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


function requireAuthentication (req, res, next) {
    var token = req.get('Auth');

    Authenticate(token).then(function (tokenData){
        res.locals.user = tokenData.UserId;
        console.log("auth token id " + util.inspect(res.locals));
        next();
    }, function () {
        console.log(err);
        res.status(401).send();
    });

}

function requireAdminAuthentication (req, res, next) {
    var token = req.get('Auth');

    Authenticate(token).then(function (){
        next();
    }, function () {
        console.log(err);
        res.status(401).send();
    });

}

function Authenticate(token){
    return new Promise(function(resolve, reject){
        try{
            var decodedJWT = jwt.verify(token, 'qwerty098', function (err, decoded) {
                if(err){
                    reject();
                }else{
                    var bytes = cryptojs.AES.decrypt(decoded.token, 'abc123!@#');
                    var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                    console.log("auth token id " + tokenData);
                    resolve(tokenData);
                }
            });

        }catch(err){
            reject();
        }
    });
}