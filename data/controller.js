'use strict'
const sql = require("mssql/msnodesqlv8");


const pool = new sql.ConnectionPool({
    database: 'ZKEWED_WEATHER',
    server: 'ASHAN\\ASHAN',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
})

function connect() {
    pool.connect();
}


function addLocation(location, callback) {
    pool.request().query("INSERT INTO CITY VALUES('" + location + "','ONLINE')", (err, result) => {
        if (err) {
            console.log("addLocation : "+err);
            
        }
        // console.log("add new");
        callback(result);
    })
}

var addWeatherData = function (cityId, cityName, date, temp, humidity, pressure, description, weathercode, rain) {
    return new Promise((resolve, reject) => {
        pool.request().query("INSERT INTO WEATHER_C VALUES('" + cityId + "','" + cityName + "','" + date + "','" + temp + "','" + humidity + "','" + pressure + "','" + description + "','" + weathercode + "','" + rain + "')", (err, result) => {
            if (err) {
                console.log(cityName+"---"+date+"---"+temp+"---"+humidity+"---"+pressure+"---"+description+"---"+weathercode+"---"+rain);
                console.log("addWeatherData : "+err);
               
            }
            resolve(result);
        })
    })
}

function getAllCities(callback) {
    pool.request().query("SELECT * FROM CITY", (err, result) => {
        if (err) {
            console.log("getAllCities : "+err);
           
        }
        callback(result);
    })
}

function getLastUpdateDate(callback) {
    pool.request().query("select DATE_TIME FROM REFRESH_TIME", (err, result) => {
        if (err) {
            console.log("getLastUpdateDate : "+err);
            
        }
        callback(result);
    })
}
function getAllCitiesToCallWeather(callback) {
    pool.request().query("SELECT * FROM CITY  WHERE STATUS='ONLINE'", (err, result) => {
        if (err) {
            console.log("getAllCitiesToCallWeather : "+err);
        }
        callback(result);
    })
}
function isExsist(city,callback) {
    pool.request().query("SELECT * FROM CITY  WHERE CITY_NAME='"+city+"'", (err, result) => {
        if (err) {
            console.log("isExsist : "+err);
        }
        callback(result);
    })
}

function updateRefreshTime(date, callback) {
    pool.request().query("UPDATE REFRESH_TIME SET DATE_TIME='" + date + "'  where REFRESH_ID='1'", (err, result) => {
        if (err) {
            console.log("updateRefreshTime : "+err);
        }
        callback(result);
    })
}

function deleteLocation(location, callback) {

    pool.request().query("UPDATE CITY SET STATUS='OFFLINE'  where CITY_NAME='" + location + "'", (err, result) => {
        if (err) {
            console.log("deleteLocation : "+err);
        }
        callback(result);
    })
}


function setOnline(location, callback) {

    pool.request().query("UPDATE CITY SET STATUS='ONLINE'  where CITY_NAME='" + location + "'", (err, result) => {
        if (err) {
            console.log("setOnline : "+err);
        }
        callback(result);
    })
}

function deleteLocationHistory(location, callback) {
    pool.request().query("DELETE FROM WEATHER_C WHERE CITY_NAME='" + location + "'", (err, result) => {
        if (err) {
            console.log("deleteLocationHistory : "+err);
        }
        callback(result);
    })
}



module.exports.addLocation = addLocation;
module.exports.getAllCities = getAllCities;
module.exports.deleteLocation = deleteLocation;
module.exports.deleteLocationHistory = deleteLocationHistory;
module.exports.addWeatherData = addWeatherData;
module.exports.updateRefreshTime = updateRefreshTime;
module.exports.getAllCitiesToCallWeather = getAllCitiesToCallWeather;
module.exports.isExsist = isExsist;
module.exports.getLastUpdateDate= getLastUpdateDate;
module.exports.setOnline = setOnline;
module.exports.connect = connect;
