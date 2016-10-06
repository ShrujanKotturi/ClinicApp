var connection = require('./connection');
var _ = require('underscore');

function User() {

    //User
    this.UserLogin = function (req, res){
        connection.acquire(function (err,con){
           var sql = con.query('SELECT * FROM Users WHERE UserId = ? AND Password = ?', function(err, result){
               con.release();
               console.log('UserLogin :' + sql.sql);
               if(err){
                   console.error(err);
                   res.send({'status' : 'Failed to get user with the provided details'});
               }
               else if(result.length != 0) {
                   res.send({'status': 'Successfully logged in'});
               }else{
                   res.send({'status' : 'Problem logging in, kindly check again'});
               }
            });
        });
    };

    this.GetQuestions = function (req, res){
        connection.acquire(function (err, con){
           var sql = con.query('CALL sp_getAllQuestions()', function (err, result) {
                con.release();
                console.log('GetQuestions :' + sql.sql);
                if(err){
                    console.error(err);
                    res.send({'status' : 'Error getting the questions'});
                }else if(result.length != 0){
                    var jsonQuestionObject = [];
                    var jsonObject = [];
                    //var duplicateResult = new LINQ(result[0]);
                    //var types = result[0].filter((x, i, a) => a.indexOf(x) == i);

                    Array.prototype.contains = function(v) {
                        for(var i = 0; i < this.length; i++) {
                            if(this[i] === v) return true;
                        }
                        return false;
                    };

                    Array.prototype.unique = function() {
                        var arr = [];
                        for(var i = 0; i < this.length; i++) {
                            if(!arr.contains(this[i])) {
                                arr.push(this[i]);
                            }
                        }
                        return arr;
                    }


                    for(var i = 0; i < result[0].length; i++){
                        jsonQuestionObject.push({type : result[0][i].JoinType,questionId : result[0][i].QuestionId, question : result[0][i].Question, choiceType : result[0][i].ChoiceType, options : result[0][i].Options, additionalQuestion : result[0][i].AdditionalQuestion});
                    }

                    for(var i = 0; i < result[0].length; i++){
                        jsonObject.push({type: result[0][i].Type, startingQuestion : result[0][i].StartingQuestion});
                    }

                    var json = _.uniq(jsonObject);

                    //res.json(result[0]);
                    res.send(json);
                }else{
                    res.send({'status': 'Couldn\'t get the questions'});
                }
           });
        });
    };

    this.PostResponse = function (req, res){
        connection.acquire(function (err, con) {
          var sql = con.query('INSERT INTO UserResponse SET UserId = ?, Answers = ?', [req.userid, req.response], function (err, result) {
              con.release();
              console.log('PostResponse :' +sql.sql);
              if(err){
                  console.error(err);
                  res.send({'status': 'Problem posting messages, check log for further assistance'});
              }else {
                  res.send({'status' : 'Posted Successfully'});
              }
          });
        });
    }
}
module.exports = new User();