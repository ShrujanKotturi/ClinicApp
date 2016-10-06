var connection = require('./connection');
var delimiter = ',';

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
                    //var types = result.filter((x, i, a) => a.indexOf(x) == i);

                    for(var i = 0; i < result.length; i++){
                        jsonQuestionObject.push({questionId : result[i].QuestionId});
                        jsonQuestionObject.push({question : result[i].Question});
                        jsonQuestionObject.push({choiceType : result[i].ChoiceType});
                        jsonQuestionObject.push({options : result[i].Options});
                        jsonQuestionObject.push({additionalQuestion : result[i].AdditionalQuestion});
                        jsonQuestionObject.push(result[i]);

                    }

                    // for(var i = 0; i < result.length; i++){
                    //     jsonObject.push({type: result.})
                    // }

                    //res.send(result);
                    res.send(JSON.stringify(jsonQuestionObject));
                }else{
                    res.send({'status': 'Couldn\'t get the questions'});
                }
           });
        });
    };


    this.get = function (res) {
        connection.acquire(function (err, con) {
            var sql = 'SELECT * FROM data';
            console.log("SQL : " + sql);
            con.query(sql, function (err, result) {
                con.release();
                if(err){
                    console.error(err);
                    return;
                }                if(result.length != 0){
                    res.send(result);
                }
                else{
                    res.send({'status' : 'No Result'});
                }
                console.log(statement.sql);
            });

        });
    };

    this.post = function (point, res){
        connection.acquire(function (err, con) {
                if ((typeof(point.id) != 'undefined' && point.id != null) && (typeof(point.sales) != 'undefined' && point.sales != null) && (typeof(point.cost) != 'undefined' && point.cost != null)) {
                    var statement = con.query('update data set cost = ?, sales = ? where id = ?', [point.cost, point.sales, point.id], function (err, result) {
                        con.release();
                        if (err) {
                            res.send({'status': 'Error', 'message': 'Unable to store new value'});
                            console.error(err);
                            return;
                        }
                        if (result.length != 0) {
                            res.send({'status': 'Success'});
                        }
                        else {
                            res.send({'status': 'No Result'});
                        }
                        console.log(statement.sql);
                    });

                }else{
                    res.send({'status': 'Error', 'message': 'Unable to store new value'});
                }
            }
        );

    };

}
module.exports = new User();