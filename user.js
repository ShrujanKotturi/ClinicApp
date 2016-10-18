var connection = require('./connection');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


function User() {
    //User
    this.UserLogin = function (req, res) {
        connection.acquire(function (err, con) {
            var sql = con.query('SELECT * FROM Users WHERE UserName = ? AND UserPassword = SHA1(?)', [req.username, req.userpassword], function (err, result) {
                console.log('UserLogin : ' + sql.sql);
                if (err) {
                    console.error(err);
                    res.status(400).send({'status': 'Failed to get user with the provided details'});
                }
                else if (result.length != 0) {
                    try {
                        var sql1 = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [result[0].UserId], function (err, result2) {
                            console.log('CheckResponses : ' + sql1.sql);
                            if (err) {
                                console.error(err);
                                res.status(400).send({'status': 'Problem logging in , check log for further assistance'});
                            } else if (result2.length != 0) {
                                res.status(200).send({'status': 'You have already taken the survey. Thanks again'});
                            } else {
                                var stringData = JSON.stringify(result[0]);
                                var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
                                var token = jwt.sign({
                                    token: encryptedData
                                }, 'qwerty098');
                                if (token)
                                    res.header('Auth', token).status(200).send({
                                        'status': 'Successfully logged in',
                                        'token': token
                                    });
                                else
                                    res.status(400).send();
                            }
                        });

                    } catch (err) {
                        console.log(err);
                        res.status(400).send();
                    }
                }else {
                    res.status(200).send({'status': 'Problem logging in, kindly check username and password'});
                }

                con.release();
            });

        });
    };

    this.GetQuestions = function (req, res) {
        connection.acquire(function (err, con) {
            var sql1 = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
                console.log('CheckResponses : ' + sql1.sql);
                if (err) {
                    console.error(err);
                    res.status(400).send({'status': 'Problem posting messages, check log for further assistance'});
                } else if (result.length != 0) {
                    res.status(200).send({'status': 'You already submitted your responses'});
                } else {
                    var sql = con.query('CALL sp_getAllQuestions()', function (err, result2) {

                        console.log('GetQuestions : ' + sql.sql);
                        if (err) {
                            console.error(err);
                            res.status(400).send({'status': 'Error getting the questions'});
                        } else if (result2.length != 0) {
                            res.status(200).json(result[0]);
                        } else {
                            res.status(200).send({'status': 'Couldn\'t get the questions'});
                        }
                    });
                }
                con.release();
            });
        });
    };

    this.PostResponse = function (req, res) {
        connection.acquire(function (err, con) {
            var sql1 = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
                console.log('CheckResponses : ' + sql1.sql);
                if (err) {
                    console.error(err);
                    res.status(400).send({'status': 'Problem posting messages, check log for further assistance'});
                } else if (result.length != 0) {
                    res.status(200).send({'status': 'You already submitted your responses'});
                } else {
                    var sql = con.query('INSERT INTO UserResponse SET UserId = ?, Answers = ?', [res.locals.user, req.response], function (err, result) {
                        con.release();
                        console.log('PostResponse : ' + sql.sql);
                        if (err) {
                            console.error(err);
                            res.status(400).send({'status': 'Problem posting messages, check log for further assistance'});
                        } else {
                            res.status(200).send({'status': 'Posted Successfully'});
                        }
                    });
                }
            });
        });
    };

    this.Register = function (req, res) {
        connection.acquire(function (err, con){

            console.log('deviceid: ' + req.deviceid);
            console.log('devicename: '+ req.devicename);
            console.log('tokenid: ' + req.tokenid);

            var devices = {
                'DeviceId' : req.deviceid,
                'DeviceName' : req.devicename,
                'TokenId' : req.tokenid
            };

            var sql = con.query('INSERT INTO Devices SET ?', devices, function (err, result) {
                if(err){
                    console.error(err);
                    res.status(400).send({'status' : 'Error in registering the device'});
                }else{
                    console.log(result);
                    res.status(200).send({status: 0, message: 'Requested for registration'});
                }
                console.log('Register Device : ' + sql.sql);
            });

            con.release();
        });
    };

    this.RegisterUser = function (req, res){
        connection.acquire(function (err, con){

            console.log('deviceid: ' + req.deviceid);
            console.log('requested: '+ true);

            var sql1 = con.query('SELECT * FROM Devices WHERE DeviceId = ?', [req.deviceid], function (err, result) {
                console.log('DeviceCheck : ' + sql1.sql);
                if (err) {
                    console.error(err);
                    res.status(400).send({'status': 'Problem Registering, check log for further assistance'});
                } else if(result.length != 0) {
                    var sql = con.query('UPDATE Devices SET Requested = ? WHERE DeviceId = ? ', [true, req.deviceid], function (err, result2) {
                        if(err){
                            console.error(err);
                            res.status(400).send({'status' : 'Error in Requesting credentials'});
                        }else{
                            res.status(200).send({status: 0, message: 'Your request has been sent to the admin. Please wait till you get Notification of your credentials'});
                        }
                        console.log('Requested Credentials : ' + sql.sql);
                    });
                } else{
                    res.status(200).send({'status' : 'Try reinstalling the app'});
                }
            });



            con.release();
        });
    };

}

module.exports = new User();