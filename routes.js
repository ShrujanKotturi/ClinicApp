var actions = require('./actions');
var user = require('./user');
var connection = require('./connection');
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

    Authenticate(token).then(function (tokenData){
        res.locals.user = tokenData.UserId;
        console.log("auth token id " + res.locals.user);
        next();
    }, function () {
        console.log(err);
        res.status(401).send();
    });

}

function Authenticate(token){
    return new Promise(function(resolve, reject){
        try{
            var decodedJWT = jwt.verify(token, 'qwerty098');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#');
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
            console.log("auth token id " + tokenData);
            resolve(tokenData);
        }catch(err){
            reject();
        }
    });
}

function CheckResponses(res, next){
    connection.acquire(function (err, con) {

        var sql = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
            con.release();
            console.log('CheckResponses : ' +sql.sql);
            if(err){
                console.error(err);
                res.send({'status': 'Problem posting messages, check log for further assistance'});
            }else if(result.length === 0){
                res.send({'status' : 'You already submitted your responses'});
            }else{
                var sql = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
                    con.release();
                    console.log('CheckResponses : ' +sql.sql);
                    if(err){
                        console.error(err);
                        res.send({'status': 'Problem posting messages, check log for further assistance'});
                    }else if(result.length != 0){
                        res.send({'status' : 'You already submitted your responses'});
                    }else{
                        next();
                    }
                });
            }
        });


    });
}