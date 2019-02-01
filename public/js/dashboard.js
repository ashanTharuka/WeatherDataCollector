const electron = nodeRequire('electron');
let ipcRenderer = nodeRequire('electron').ipcRenderer;
var log = nodeRequire('electron-log');
var schedule = nodeRequire('node-schedule');
var internetAvailable = nodeRequire("internet-available");
const util = nodeRequire('util');
var CronJob = nodeRequire('cron').CronJob;

// time scheduler
//var rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [0, new schedule.Range(1, 6)];
//rule.hour = 17;
//rule.minute =43;

$(document).ready(function () {

    
     
       



    


    callOpenWeather();
    $('[data-toggle="tooltip"]').tooltip();
    let tbl = $('#example').DataTable();
    $('#locationText').focus();

    loadTableData();

    //table data load
    function loadTableData() {
        var dat=ipcRenderer.sendSync('getLastUpdateDate','').recordset[0].DATE_TIME;
        $('#time').text("Last Updated : "+dat);


        tbl.clear().draw();
        var check = "getAllCities";
        var response = ipcRenderer.sendSync('getAllCities', check);
        var v = 0;

        for (var i = 0; i < response.recordset.length; i++) {


            if (response.recordset[i].STATUS == 'ONLINE') {
                tbl.row.add([++v, response.recordset[i].CITY_NAME, ' <img class="delete"  title="Delete" src="../public/img/delete.png" alt="delete" width="25px" style="margin-left:10%; margin-right:18%;">']).draw();
            } else {
                tbl.row.add([++v, response.recordset[i].CITY_NAME, ' <img class="delete dark"  title="Delete" src="../public/img/delete.png" alt="delete" width="25px" style="margin-left:10%; margin-right:18%;">']).draw();

            }
        }
        $('.dark').parent('td').parent('tr').css('backgroundColor', 'gray');
    }



//schedule method
    // var j = schedule.scheduleJob(rule, function () {
    // });

//20 20 * * 0-6
//     new CronJob('5 * * * 0-6', function() {
//
//         internetAvailable().then(function () {
//             callOpenWeather();
//
//             console.log("Internet available : " + new Date().toLocaleString());
//         }).catch(function () {
//             console.log("No internet :  " + new Date().toLocaleString());
//         });
//     }, null, true, 'Asia/Colombo');



    new CronJob('0 11 * * 0-6', function() {
        callOpenWeather();
    }, null, true, 'Asia/Colombo');




    function callOpenWeather() {
        var today=new Date().toLocaleString();
        var check = "";
        var data = ipcRenderer.sendSync('getAllCitiesToCallWeather', check);

        for (var i = 0; i < data.recordset.length; i++) {
            $.ajax({
                url: "http://api.openweathermap.org/data/2.5/weather?q=" + data.recordset[i].CITY_NAME + "&APPID= [add app id]",
                type: 'GET',
                async: false,
                dataType: 'json',
                success: function (response) {
                    let jsonObj = response;
                    var smartJSON = {};
                    smartJSON.temp = jsonObj.main.temp;
                    smartJSON.humidity = jsonObj.main.humidity;
                    smartJSON.pressure = jsonObj.main.pressure;
                    smartJSON.description = ((jsonObj.weather[0]).description);
                    smartJSON.weathercode = ((jsonObj.weather[0]).id);
                    // return the rain in mm if present
                    if (jsonObj.precipitation) {
                        smartJSON.rain = jsonObj.precipitation.value;
                    } else {
                        smartJSON.rain = 0;
                    }
                    if (jsonObj.rain) {
                        var rain3h = jsonObj.rain;
                        smartJSON.rain = Math.round(rain3h['3h'] / 3);
                    }
                    var val = ipcRenderer.sendSync('addWeatherData', data.recordset[i].CITY_ID, data.recordset[i].CITY_NAME, today, smartJSON.temp, smartJSON.humidity, smartJSON.pressure, smartJSON.description, smartJSON.weathercode, smartJSON.rain);
              if(val!=null){

                  // console.log(smartJSON.temp)
              }


                },
                error: function (error) {
                    console.log('oops');
                }
            })
        }
        //refresh time update

        var dataa = ipcRenderer.sendSync('refresh', today);
        var dat=ipcRenderer.sendSync('getLastUpdateDate','').recordset[0].DATE_TIME;
        $('#time').text("Last Updated : "+dat);



    }


    //table click to delete brand
    $('#example tbody').on('click', '.delete', function () {
        var location = $(this).closest('tr').children('td:first-child + td').text();

        ipcRenderer.sendSync('deleteLocationHistory', location);
        var response = ipcRenderer.sendSync('deleteLocation', location);
        loadTableData();
        if (response.rowsAffected[0] > 0) {
            // $(this).closest('tr').remove();
            // swal("Delete Success!", "You clicked the button!", "success");
        } else {
            swal("Delete Fail!", "You clicked the button!", "warning");
        }
    });


//add button click function
    $(".form #addBtn").click(function () {

        var location = $('#locationText').val();


        if (location === '') {
            swal("Added Fail!", "Input Location Name!", "warning");
            $('#locationText').focus();
        } else {
            // var val = false;
            //
            // $('#example tr td:first-child').each(function () {
            //     if ($(this).html() === location.toUpperCase()) {
            //         val = true;
            //         return;
            //     }
            // });


            var res1 = ipcRenderer.sendSync('isExsist', location.toUpperCase());

            if (res1.recordset.length > 0) {
                // console.log(JSON.stringify(res1.recordset));
                if (res1.recordset[0].STATUS == "ONLINE") {
                    swal("Already Exsist!", "You clicked the button!", "warning");
                } else {
                    var res2 = ipcRenderer.sendSync('enableLocation', location.toUpperCase());
                    if (res2.rowsAffected[0] > 0) {
                        $('#locationText').val('');
                        // swal("Added Success!", "You clicked the button!", "success");
                    } else {
                        $('#locationText').val('');
                        swal("Added Fail!", "You clicked the button!", "warning");
                    }
                    $('#locationText').focus();
                }


            } else {
                var response = '';

                response = ipcRenderer.sendSync('addLocation', location.toUpperCase());


                if (response.rowsAffected[0] > 0) {
                    $('#locationText').val('');
                    // swal("Added Success!", "You clicked the button!", "success");
                } else {
                    $('#locationText').val('');
                    swal("Added Fail!", "You clicked the button!", "warning");
                }
                $('#locationText').focus();
            }

            loadTableData();
        }
    });


    ///hit enter on textbox//
    $('#locationText').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            var location = $('#locationText').val();


            if (location === '') {
                swal("Added Fail!", "Input Location Name!", "warning");
                $('#locationText').focus();
            } else {
                // var val = false;
                //
                // $('#example tr td:first-child').each(function () {
                //     if ($(this).html() === location.toUpperCase()) {
                //         val = true;
                //         return;
                //     }
                // });


                var res1 = ipcRenderer.sendSync('isExsist', location.toUpperCase());

                if (res1.recordset.length > 0) {
                    // console.log(JSON.stringify(res1.recordset));
                    if (res1.recordset[0].STATUS == "ONLINE") {
                        swal("Already Exsist!", "You clicked the button!", "warning");
                    } else {
                        var res2 = ipcRenderer.sendSync('enableLocation', location.toUpperCase());
                        if (res2.rowsAffected[0] > 0) {
                            $('#locationText').val('');
                            // swal("Added Success!", "You clicked the button!", "success");
                        } else {
                            $('#locationText').val('');
                            swal("Added Fail!", "You clicked the button!", "warning");
                        }
                        $('#locationText').focus();
                    }


                } else {
                    var response = '';

                    response = ipcRenderer.sendSync('addLocation', location.toUpperCase());


                    if (response.rowsAffected[0] > 0) {
                        $('#locationText').val('');
                        // swal("Added Success!", "You clicked the button!", "success");
                    } else {
                        $('#locationText').val('');
                        swal("Added Fail!", "You clicked the button!", "warning");
                    }
                    $('#locationText').focus();
                }

                loadTableData();
            }

        }
    });


});




