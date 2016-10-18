/**
 * Created by shruj on 10/18/2016.
 */



function MiddleWare(){

    this.RequireAuthentication = function(req, res, next){
        var token = req.get('Auth');

        Authenticate(token).then(function (tokenData){
            res.locals.user = tokenData.UserId;
            console.log("auth token id " + util.inspect(res.locals.user));
            next();
        }, function () {
            console.log(err);
            res.status(401).send();
        });
    };

    this.RequireAdminAuthentication = function(req, res, next){
        var token = req.get('Auth');

        Authenticate(token).then(function (){
            console.log("Admin Authenticated");
            next();
        }, function () {
            console.log(err);
            console.log("Couldn't Authenticate the Admin");
            res.status(401).send();
        });
    };
}


module.exports = new MiddleWare();