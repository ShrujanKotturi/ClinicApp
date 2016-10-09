var mysql = require('mysql');

function Connection() {
    this.pool = null;

    this.init = function() {
        this.pool = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'root',
            password: 'password',
            //password: '',
            //database: 'clinicapplication',
            database: 'ClinicApplication',
            multipleStatements : true
        });
    };

    this.acquire = function (callback) {
        this.pool.getConnection(function(err, connection) {
            callback(err, connection);
        });
    };
}

module.exports = new Connection();


