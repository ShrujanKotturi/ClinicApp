var connection = require('./connection');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var FCM = require('fcm-node');
var util = require('util');
var SERVER_API_KEY = 'AIzaSyCnk1CzkySQolNRbzdwqvFhPutctzVvQjQ';
var fcmCli = new FCM(SERVER_API_KEY);


function Admin() {

    //Admin
    this.AdminLogin = function (req, res){
      connection.acquire(function (err, con) {
         var sql = con.query('SELECT AdminName, AdminPassword FROM Admin WHERE AdminName = ? AND AdminPassword = ?', [req.adminname, req.adminpassword] , function (err, result){
             con.release();
            if(err){
                console.error(err);
                res.status(401).send({'status': 'Admin Name and Password combination failed'});
            } else if(result.length != 0){
                var stringData = JSON.stringify(result[0]);
                var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
                var token = jwt.sign({
                    token: encryptedData
                }, 'qwerty098');
                if (token) {
                    res.header('Auth', token).send({'status': 'Admin authenticated','token': token});
                }
                else
                    res.status(401).send();
            } else{
                res.send({'status': 'Admin Name and Password combination failed'});
            }
            console.log("AdminQuery : " + sql.sql);
         });
      });
    };

    this.CreateUser = function (req, res){
      connection.acquire(function (err, con){
          var sql1 = con.query('SELECT * FROM Users WHERE UserName = ?', [req.username], function (err, result) {
              console.log('CheckUserExists : ' + sql1.sql);
              if (err) {
                  console.error(err);
                  res.status(401).send({'status': 'Failed to get user with the provided details'});
              }
              else if (result.length != 0) {
                  res.status(401).send({'status': 'User already exists, Try creating a user with another username credentials'});
              }else{
                  var user = {
                      'User Name' : req.username,
                      'User Password' : req.password
                  };

                  var sql = con.query('INSERT INTO Users SET UserName = ?, UserPassword = ?, DeviceId = ?', [req.username, req.password, req.deviceid], function (err, result2) {
                      if (err) {
                          console.error(err);
                          res.status(401).send({'status': 'Failed to create a user'});
                      } else if(result2.length != 0){
                          var sql2 = con.query('SELECT DeviceId, TokenId FROM Devices WHERE DeviceId = ?', [req.deviceid], function (err, result3) {
                               console.log('CheckDeviceId : ' + sql2.sql);
                               if(err){
                                   console.error(err);
                                   res.status(401).send({'status': 'Failed to map the correct device id'});
                               }else{
                                   console.log('Device Notification : ' + util.inspect(user));

                                   fcmCli = new FCM(SERVER_API_KEY);

                                   var payloadOk = {
                                       to : result3[0].TokenId,
                                       priority : 'high',
                                       notification: {
                                           title : 'Clinic App',
                                           body : user
                                       }
                                   };

                                   fcmCli.send(payloadOk, function (err, res2) {
                                       if(err){
                                           console.error(err)
                                       }else{
                                           console.log(res2);
                                           var sql3 = con.query('UPDATE Devices SET Requested = false WHERE DeviceId = ?', [req.deviceid], function (err, result4) {
                                               console.log('Update Device Id : ' + sql3.sql);
                                                if(err){
                                                    console.error(err);
                                                    res.status(401).send({'status':'Unable to update the request'});
                                                }else{
                                                    res.status(200).send({status : 0, message: 'Message sent to the user' });
                                                }

                                           });

                                       }
                                   });
                              }
                          });

                          res.send({'status': 'User created successfully'});
                      }
                      console.log("UserCreated : " + sql.sql);
                  });
              }
              con.release();
          })
      });
    };

    this.GetAllUsers = function(res){
      connection.acquire(function (err, con) {
        var sql = con.query('SELECT * FROM Users', function (err, result) {
            con.release();
          if(err){
              console.error(err);
              res.status(401).send({'status' : 'Failed to get all Users, Can you try again'});
          }  else{
              if(result.length != 0){
                res.status(200).send(result);
              }
              else{
                res.status(401).send({'status' : 'No users created until now'});
              }
              console.log("GetAllUsers : " + sql.sql);
          }
        });
      });
    };

    this.GetUserResponse = function (req, res){
      connection.acquire(function (err, con){
        var sql = con.query('CALL sp_getUserResponse(' +[req.query.UserId] + ')', function (err, result) {
            con.release();
            if(err){
                console.error(err);
                res.status(401).send({'status': 'Something went wrong, kindly check again'});
            }else if (result[0].length != 0){
                res.status(200).send(result[0]);
            }else{
                res.status(200).send({'status': 'The user didn\'t record any response'});
            }
            console.log('GetUserResponse : ' + sql.sql);
        });
      });
    };

    this.GetRequestedUsersList = function (req, res) {
        connection.acquire(function (err, con) {
            var sql = con.query('SELECT DeviceId, DeviceName FROM Devices WHERE Requested=true', function (err, result) {
                con.release();
                if(err){
                    console.error(err);
                    res.status(401).send({'status' : 'Failed to get devices, Can you try again'});
                }  else{
                    if(result.length != 0){
                        res.status(200).send(result);
                    }
                    else{
                        res.status(401).send({'status' : 'No users requested until now'});
                    }
                    console.log("GetAllUsers : " + sql.sql);
                }
            });
        });
    }

}
module.exports = new Admin();



