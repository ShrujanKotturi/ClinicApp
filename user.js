var connection = require('./connection');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


function User() {
    //User
    this.UserLogin = function (req, res) {
        connection.acquire(function (err, con) {
            var sql1 = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
                console.log('CheckResponses : ' + sql1.sql);
                if (err) {
                    console.error(err);
                    res.send({'status': 'Problem posting messages, check log for further assistance'});
                } else if (result.length != 0) {
                    res.send({'status': 'You have already taken the survey. Thanks again'});
                } else {
                    var sql = con.query('SELECT * FROM Users WHERE UserName = ? AND UserPassword = ?', [req.username, req.userpassword], function (err, result) {
                        con.release();
                        console.log('UserLogin : ' + sql.sql);
                        if (err) {
                            console.error(err);
                            res.send({'status': 'Failed to get user with the provided details'});
                        }
                        else if (result.length != 0) {
                            try {
                                var stringData = JSON.stringify(result[0]);
                                var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
                                var token = jwt.sign({
                                    token: encryptedData
                                }, 'qwerty098');
                                if (token)
                                    res.header('Auth', token).send({
                                        'status': 'Successfully logged in',
                                        'token': token
                                    });
                                else
                                    res.status(401).send();
                            } catch (err) {
                                console.log(err);
                                res.send();
                            }
                        } else {
                            res.send({'status': 'Problem logging in, kindly check again'});
                        }
                    });
                }
            });
        });

        this.GetQuestions = function (req, res) {
            connection.acquire(function (err, con) {
                var sql1 = con.query('SELECT * FROM UserResponse WHERE UserId = ?', [res.locals.user], function (err, result) {
                    console.log('CheckResponses : ' + sql1.sql);
                    if (err) {
                        console.error(err);
                        res.send({'status': 'Problem posting messages, check log for further assistance'});
                    } else if (result.length != 0) {
                        res.send({'status': 'You already submitted your responses'});
                    } else {
                        var sql = con.query('CALL sp_getAllQuestions(' + [res.locals.user] + ')', function (err, result) {

                            console.log('GetQuestions : ' + sql.sql);
                            if (err) {
                                console.error(err);
                                res.send({'status': 'Error getting the questions'});
                            } else if (result.length != 0) {
                                var jsonGeneralObject = [];
                                var jsonMedicationObject = [];
                                var jsonDietObject = [];
                                var jsonPhysicalObject = [];
                                var jsonSmokingObject = [];
                                var jsonWeightObject = [];
                                var jsonNoneObject = [];

                                var jsonObject = [];
                                var type;

                                // for(var i = 0; i < result[0].length; i++){
                                //     type = result[0][i].JoinType;
                                //     if(type === "General")
                                //         jsonGeneralObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //     else if(type === "Medication Usage")
                                //         jsonMedicationObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //      else if(type === "Diet")
                                //         jsonDietObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //     else if(type === "Physical Activity")
                                //         jsonPhysicalObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //     else if(type === "Smoking")
                                //         jsonSmokingObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //     else if(type === "Weight management")
                                //         jsonWeightObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                //     else if(type === "None")
                                //         jsonNoneObject.push({type : type, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                // }

                                // for(var i = 0; i < result[0].length; i++){
                                //     jsonObject.push({type: result[0][i].Type, startingQuestion : result[0][i].StartingQuestion});
                                // }
                                //
                                // for(var i = 0; i < result[0].length; i++){
                                //     jsonObject.push({{type : result[0][i].JoinType, questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                                // }

                                res.json(result[0]);

                                //res.send(jsonQuestionObject);
                            } else {
                                res.send({'status': 'Couldn\'t get the questions'});
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
                        res.send({'status': 'Problem posting messages, check log for further assistance'});
                    } else if (result.length != 0) {
                        res.send({'status': 'You already submitted your responses'});
                    } else {

                        var sql = con.query('INSERT INTO UserResponse SET UserId = ?, Answers = ?', [res.locals.user, req.response], function (err, result) {
                            con.release();
                            console.log('PostResponse : ' + sql.sql);
                            if (err) {
                                console.error(err);
                                res.send({'status': 'Problem posting messages, check log for further assistance'});
                            } else {
                                res.send({'status': 'Posted Successfully'});
                            }
                        });
                    }
                });
            });
        }


    }
}
module.exports = new User();