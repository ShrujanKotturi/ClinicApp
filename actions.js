var connection = require('./connection');
var delimiter = ',';

function Admin() {

    //Admin
    this.AdminLogin = function (req, res){
      connection.acquire(function (err, con) {
         var sql = con.query('SELECT AdminName, AdminPassword FROM Admin WHERE AdminName = ? AND AdminPassword = ?', [req.adminname, req.adminpassword] , function (err, result){
             con.release();
            if(err){
                console.error(err);
                res.send({'status': 'Admin Name and Password combination failed'});
            } else if(result.length != 0){
                res.send({'status': 'Admin authenticated'});
            } else{
                res.send({'status': 'Admin Name and Password combination failed'});
            }
            console.log("AdminQuery : " + sql.sql);
         });
      });
    };

    this.CreateUser = function (req, res){
      connection.acquire(function (err, con){
        var sql = con.query('INSERT INTO Users SET UserName = ?, UserPassword = ?', [req.username, req.password], function (err,result) {
            con.release();
           if(err){
               console.error(err);
               res.send({'status' : 'Failed to create a user'});
           } else{
               res.send({'status' : 'User created successfully'});
           }
           console.log("UserCreated : " + sql.sql);
        });
      });
    };

    this.GetAllUsers = function(res){
      connection.acquire(function (err, con) {
        var sql = con.query('SELECT * FROM Users', function (err, result) {
            con.release();
          if(err){
              console.error(err);
              res.send({'status' : 'Failed to get all Users, Can you try again'});
          }  else{
              if(result.length != 0){
                res.send(result);
              }
              else{
                res.send({'status' : 'No users created until now'});
              }
              console.log("GetAllUsers : " + sql.sql);
          }
        });
      });
    };

    this.GetUserResponse = function (req, res){
      connection.acquire(function (err, con){
        var sql = con.query('',[req.query.UserId], function (err, result) {
            con.release();
            if(err){
                console.error(err);
                res.send({'status': 'The user didn\'t record any response'});
            }else{
                res.send(result);
            }
            console.log('GetUserResponse : ' + sql.sql);
        });
      });
    };

}
module.exports = new Admin();



