/**
 * Created by shruj on 10/18/2016.
 */
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

function requireAdminAuthentication (req, res, next) {
    var token = req.get('Auth');

    Authenticate(token).then(function (){
        next();
    }, function () {
        console.log(err);
        res.status(401).send();
    });

}


function MiddleWare(){

    this.Authenticate = function(token){
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

    this.RequireAuthentication = function(req, res, next){
        var token = req.get('Auth');

        this.Authenticate(token).then(function (tokenData){
            res.locals.user = tokenData.UserId;
            console.log("auth token id " + res.locals.user);
            next();
        }, function () {
            console.log(err);
            res.status(401).send();
        });
    }

    this.RequireAdminAuthentication = function(req, res, next){
        var token = req.get('Auth');

        this.Authenticate(token).then(function (){
            next();
        }, function () {
            console.log(err);
            res.status(401).send();
        });
    }
}

module.exports = new MiddleWare();