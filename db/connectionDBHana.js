const hana = require('@sap/hana-client');
const configDB = require('../config/database');

var getConnection = function(){
    return new Promise(function(resolve, reject){
        let conn_params = {
            serverNode: configDB.dbHana.server+":"+configDB.dbHana.port,
            uid: configDB.dbHana.user,
            pwd: configDB.dbHana.password
        }

        var conn = hana.createConnection();
        conn.connect(conn_params, function (err) {
            if (err) reject(err);

            resolve(conn);
        });
    });
}
exports.getConnection = getConnection;

var closeConnection = function(conn){
    conn.disconnect();
}
exports.closeConnection = closeConnection;

var executeQuery = async function(query = "", params = []){
    var that = this;
    return new Promise(async function(resolve, reject){
        var conn = await that.getConnection();
        conn.exec(query, params, function (err, result) {    
            if (err) {
                reject(err);
            }
    
            that.closeConnection(conn);
            resolve(result);
        })
    });
}
exports.executeQuery = executeQuery;