

function TaskInfo(contract){
    this.contract = contract;
    this.error = false;
    this.address ="";
    this.task_id = 0;
    this.uuid = "";
    this.started = false;
    this.has_issue = false;
    this.completed = false;
    this.name = "";
    this.data_address ="";
    this.script_address = "";
    this.output_address = "";
    this.parameters = {};
}

let my_task_list = [];
let complete_task_history_address = [];





/**
 * Leave empty to load the first 15 items
 * todo find a way to save txHash and price
 * @param from
 * @param to
 */
const get_task_history = function (from, to ) {
    initiateContract(function () {                                                              
        loadContract(
            function () {
                nebulaAi.showTasks(function (error, result) {                   console.log(result);       
                    if (error) {
                        console.log(error);
                    } else {

                        complete_task_history_address = result;

                        let show_num = from;

                        if(from === undefined) {
                            if (to === undefined) to = 15;
                            show_num = result.length - 1 >= to ? to : result.length - 1;
                        }

                        //only show 15 if more than 15
                        //the rest will be loaded if needed

                        for (let i = show_num; i >= 0; i--) {

                            let index = result.length - i -1;

                            let taskInfo = new TaskInfo(window.taskContract.at(result[i]));
                            my_task_list.push(taskInfo);

                            taskInfo.contract.task_id(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].task_id = Number(result);
                            });
                            taskInfo.contract.uuid(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].uuid = web3.toAscii(result);
                            });
                            taskInfo.contract.started(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].started = result;
                            });
                            taskInfo.contract.task_issue(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].has_issue = result;
                            });
                            taskInfo.contract.completed(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].completed = result;
                            });
                            taskInfo.contract.worker(function (error, result) {
                                if (error) console.log(error);
                                else my_task_list[index].worker = result;
                            });
                            taskInfo.contract.task_name(function (error, result) {
                                if(error) console.log(error);
                                else my_task_list[index].name = web3.toAscii(result);
                            });
                            taskInfo.contract.data_address(function (error, result) {
                                if(error) console.log(error);
                                else my_task_list[index].data_address = result;
                            });
                            taskInfo.contract.script_address(function (error, result) {
                                if(error) console.log(error);
                                else my_task_list[index].script_address = result;
                            });
                            taskInfo.contract.output_address(function (error, result){
                                if(error) console.log(error);
                                else my_task_list[index].output_address = result;
                            });
                            taskInfo.contract.parameters(function (error, result) {
                                if(error) console.log(error);
                                else {
                                    my_task_list[index].parameters = result;
                                }
                            });
                            my_task_list[index].address = result[i];                
                        }
                    }
                });
            }
        );
        prepareTaskContract();
        setTimeout(function(){
            loadHistoryList();
        },1000);
    });
};

const loadTask = function (index) {
    let t = my_task_list[index];

    $("#task_id").html(t.task_id);
    $("#task_addr").html("<a href='http://ec2-18-218-114-50.us-east-2.compute.amazonaws.com:8000/#/address/"+t.address+"' target='_blank'>"+t.address+"</a>");
    $("#uuid").html(t.uuid);
    $("#task_name").html(t.name);
    $("#data_addr").html(t.data_address);
    $("#scpt_addr").html(t.script_address);
    $("#outp_addr").html(t.output_address);
    $("#started").html(t.started);
    $("#completed").html(t.completed);
    $("#error").html(t.has_issue);
    $("#params").html(t.parameters);
    $("#btnChart").attr("href", "output.html");

};

const loadHistoryList = function (){                       
    console.log(my_task_list);
    $.each(my_task_list, function(index, value){   
        $('#history-loading').hide();                    
        $("ul.histList").append("<li><a href='javascript:loadTask(" + index + ")'>" + value.task_id + " - " + value.name + "</a></li>");
    });

    loadTask(0);
};



get_task_history();



//let base_url = "";
// Temporarily unavailable
// $.each(my_task_list, function (index, value) {
//     let uuid = web3.toAscii(value.uuid);
    // if (!isUnicode(uuid)) {
    //     $.ajax({
    //         url: "findByUuid?uuid=" + uuid,
    //         type: "GET",
    //         error: function (XMLHttpRequest, textStatus, errorThrown) {
    //             console.log(textStatus);
    //         },
    //         success: function (data) {                  //console.log(data);
    //             if (data) {
    //                 //let result = JSON.parse(data);
    //
    //                 $("ul.histList").append("<li><a href='javascript:showChart(" + index + ")'>" + data.name + "</a></li>");
    //                 if (index === my_task_list.length - 1) showChart(index);
    //             }
    //         }
    //     });

//     }
//
// });

// function showChart(index) {                                                             //console.log(index);
//
//     let task = tasks[index];
//     let output = JSON.parse(task.outputJson); console.log(task);
//     let dataUri = task.datasetURI;                                                      //console.log(dataUri);
//     if (!output || !output.forecast) {
//         alert("data corrupted"); return;
//     }
//     if (dataUri && dataUri.indexOf(".csv") > 0)
//         $.get("http://192.168.88.192:8080/data/usdbtc11261203unix.csv", function (data) { //console.log(data);
//             let jsonData = csvJSON(data);                       //console.log(jsonData);
//
//             let timeInMs = Date.now();                          //console.log(timeInMs);
//             let interval = 1000 * 60 * 5;                        //console.log(interval);
//             let forecast = output.forecast.map((x, i) => [timeInMs + interval * i, x]);                        //console.log(forecast);
//             //let series = jsonData.concat(forecast);
//             let seriesOptions = [];
//             seriesOptions[0] = {
//                 name: task.name,
//                 data: jsonData
//             };
//             seriesOptions[1] = {
//                 name: task.name + " - forecast",
//                 data: forecast
//             };
//             createChart(seriesOptions);
//         });
//     $("#taskName").html(task.name);
//     $("#script").html(task.script);
//     //$("#mse").html(output.mse);
//     //$("#avg_error_rate").html(output.avg_error_rate);
//
// }
// function isUnicode(str) {
//     for (var i = 0; i < str.length; i++) {
//         if (str.charCodeAt(i) > 127) return true;
//     }
//     return false;
// }
// function csvJSON(csv) {
//
//     var lines = csv.split("\n"), result = [];
//     for (var i = 1; i < lines.length; i++) {
//         var currentline = lines[i].replace(/\r/g, "").split(",").map((x, i) => i == 0 ? parseInt(x) * 1000 : parseInt(x));
//         result.push(currentline);
//     }
//     return result; //JSON
// }
// const getParams = query => {
//     if (!query) {
//         return {};
//     }
//
//     return (/^[?#]/.test(query) ? query.slice(1) : query)
//         .split('&')
//         .reduce((params, param) => {
//             let [key, value] = param.split('=');
//             params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
//             return params;
//         }, {});
// };
//
// function createChart(seriesOption) {
//     let seriesOptions = [];
//     if (seriesOption.length > 1) seriesOptions = seriesOption;
//     else seriesOptions.push(seriesOption);
//     Highcharts.stockChart('chart', {
//
//         rangeSelector: {
//             selected: 4
//         },
//
//         yAxis: {
//             title: {
//                 text: 'Price'
//             },
//             labels: {
//                 formatter: function () {
//                     return (this.value > 0 ? ' + ' : '') + this.value + '%';
//                 }
//             },
//             plotLines: [{
//                 value: 0,
//                 width: 2,
//                 color: 'silver'
//             }]
//         },
//
//         plotOptions: {
//             series: {
//                 compare: 'percent',
//                 showInNavigator: true
//             }
//         },
//
//         tooltip: {
//             pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
//             valueDecimals: 2,
//             split: true
//         },
//
//         series: seriesOptions
//     });
// }