const scriptAddressDefault = "http://quantum.nebula-ai.network/script/Nebula_LSTM.py";
const outputAddress = "http://quantum.nebula-ai.network/nebula/scripts/";
const minimalFee = 5;
const admin_address = "0x2f1400233d6368fe3f38767a5c52775d423132fd";

window.onload = function () {
    let browserChrome = !!window.chrome && !!window.chrome.webstore;
    let browserFirefox = typeof InstallTrigger !== 'undefined';

    if (!browserChrome && !browserFirefox) {
        window.location.href = "./notice/notice_supported/index.html";
    } else if (typeof web3 === 'undefined') {
        window.location.href = "./notice/notice_install/index.html";
    } else {
        window.web3 = new Web3(web3.currentProvider);
        if (web3.eth.defaultAccount === undefined)
            window.location.href = "./notice/notice_locked/index.html";
        else {
            start_app();
            nebula.initialize()
                .then(() => {
                    nebula.get_task_history()
                        .then((result) => {
                            showTasks(result)
                                .then(() => {
                                    loadHistoryList();
                                    loadTask(0);
                                })
                        })
                })
        }
    }
};

function start_app() {
    window.nebula = new Nebula(
        web3,
        admin_address,
        1,
        "",
        scriptAddressDefault,
        "real time",
        outputAddress,
        {},
        new BigNumber(minimalFee)
    );


    // showTasks();
    var tasks;
    // nebula.get_task_history().then((result)=>{tasks=result});

    // console.log(tasks.toString())
    // showTasks()

}


// const initiateContract = function (callback) {
//
//     window.addEventListener('load', function () {
//
//         // Checking if Web3 has been injected by the browser (Mist/MetaMask)
//         if (typeof web3 !== 'undefined') {
//             //Currently only support Chrome with MetaMask plugin installed
//             //loginWallet using private key or JSON format
//             web3 = new Web3(web3.currentProvider);
//
//             if (web3.eth.defaultAccount === undefined) {
//                 window.location.href = "./notice/notice_locked/index.html"
//                 // alert("Please log into your MetaMask account using MetaMask Plugin");
//             }
//             callback();
//
//         } else {
//             window.location.href = "./notice/notice_install/index.html"
//             console.log('No web3? You should consider trying MetaMask!')
//             // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
//             web3 = new Web3(new Web3.providers.HttpProvider("http://18.221.71.211:8545"));
//         }
//
//         // // Now you can start your app & access web3 freely:
//         // startApp()
//
//     })
// };

function TaskInfo() {
    this.index = 0;
    this.error = false;
    this.address = "";
    this.nounce = 0;
    this.started = false;
    this.has_issue = false;
    this.completed = false;
    this.name = "";
    this.data_address = "";
    this.script_address = "";
    this.output_address = "";
    this.parameters = {};
    this.from = "";
    this.to = "";
    this.gas = "";
    this.blockHash = "";
    this.blockNumber = 0;

}

let my_task_list = [];
let complete_task_history_address = [];

let showTasks = function (result) {
    return new Promise(function (resolve) {
        console.log(result);
        complete_task_history_address = result;
        let length = result.length;


        // if(from === undefined) {
        //     if (to === undefined) to = 15;
        //     show_num = length - 1 >= to ? to : length - 1;
        // }

        //only show 15 if more than 15
        //the rest will be loaded if needed
        let index = 0;
        let end = length > 15 ? length - 15 : 0;
        for (let i = length - 1; i >= end; i--) {
            let taskInfo = new TaskInfo();
            nebula.get_task_info(result[i])
                .then((task) => {

                    taskInfo.address = result[i];
                    taskInfo.name = task[1];
                    taskInfo.script_address = task[2];
                    taskInfo.data_address = task[3];
                    taskInfo.output_address = task[4];
                    taskInfo.index = index;
                    let taskStatus = nebula.get_task_status(result[i])
                        .then((task) => {

                            taskInfo.started = task.start_time;
                            nebula.get_block(task.start_time)
                                .then((block) => {
                                    return new Promise(function (resolve) {
                                        let transactions = block.transactions;
                                        // console.log(transactions)
                                        // console.log(transactions[0])
                                        for (let j in transactions) {
                                            let transaction = transactions[j]
                                            if ((transaction.input).includes((result[i]).substr(2))) {
                                                console.log(transaction)
                                                taskInfo.nounce = Number(transaction.nonce);
                                                taskInfo.from = transaction.from;
                                                taskInfo.to = transaction.to;
                                                taskInfo.blockNumber = transaction.blockNumber;
                                                taskInfo.blockHash = transaction.blockHash;
                                                taskInfo.gas = transaction.gas;
                                                // taskInfo.address = result[i];
                                                // taskInfo.name = task[1];
                                                // taskInfo.script_address = task[2];
                                                // taskInfo.data_address = task[3];
                                                // taskInfo.output_address = task[4];
                                                // taskInfo.index = index;
                                                resolve(taskInfo)
                                            }
                                        }
                                    })
                                }).then((a)=>{

                                    my_task_list.push(a);
                                    console.log(a);
                                    index++;
                                    if (index==15){
                                        resolve();
                                    }
                            })
                        })

                })
            // if (my_task_list.length == length || my_task_list.length == 15) {
            //     console.log("exit")
            //     resolve();
            // }
        }

    })

};

/**
 * Leave empty to load the first 15 items
 * todo find a way to save txHash and price
 * @param from
 * @param to
 */
/*const get_task_history =*/
// ( function () {
//     initiateContract(function () {
//         loadContract(
//             function () {
//                 nebulaAi.showTasks(function (error, result) {                   console.log(result);
//                     if (error) {
//                         console.log(error);
//                     } else {
//
//                         complete_task_history_address = result;
//
//                         let length = result.length;
//
//                         // if(from === undefined) {
//                         //     if (to === undefined) to = 15;
//                         //     show_num = length - 1 >= to ? to : length - 1;
//                         // }
//
//                         //only show 15 if more than 15
//                         //the rest will be loaded if needed
//                         let index = 0;
//                         let end = length > 15 ? length - 15 : 0;
//                         for (let i = length - 1; i >= end; i--) {
//
//                             let taskInfo = new TaskInfo(window.taskContract.at(result[i]));
//                             taskInfo.index = index;
//                             my_task_list.push(taskInfo);
//
//                             taskInfo.contract.task_id(function (error, result) {
//                                 if (error) console.log(error);
//                                 else {
//                                     my_task_list[taskInfo.index].task_id = Number(result);
//                                 }
//                             });
//                             taskInfo.contract.uuid(function (error, result) {
//                                 if (error) console.log(error);
//                                 else my_task_list[taskInfo.index].uuid = web3.toAscii(result);
//                             });
//                             taskInfo.contract.started(function (error, result) {
//                                 if (error) console.log(error);
//                                 else my_task_list[taskInfo.index].started = result;
//                             });
//                             taskInfo.contract.task_issue(function (error, result) {
//                                 if (error) console.log(error);
//                                 else my_task_list[taskInfo.index].has_issue = result;
//                             });
//                             taskInfo.contract.completed(function (error, result) {
//                                 if (error) console.log(error);
//                                 else my_task_list[taskInfo.index].completed = result;
//                             });
//                             taskInfo.contract.worker(function (error, result) {
//                                 if (error) console.log(error);
//                                 else my_task_list[taskInfo.index].worker = result;
//                             });
//                             taskInfo.contract.task_name(function (error, result) {
//                                 if(error) console.log(error);
//                                 else my_task_list[taskInfo.index].name = web3.toAscii(result);
//                             });
//                             taskInfo.contract.data_address(function (error, result) {
//                                 if(error) console.log(error);
//                                 else my_task_list[taskInfo.index].data_address = result;
//                             });
//                             taskInfo.contract.script_address(function (error, result) {
//                                 if(error) console.log(error);
//                                 else my_task_list[taskInfo.index].script_address = result;
//                             });
//                             taskInfo.contract.output_address(function (error, result){
//                                 if(error) console.log(error);
//                                 else my_task_list[taskInfo.index].output_address = result;
//                             });
//                             taskInfo.contract.parameters(function (error, result) {
//                                 if(error) console.log(error);
//                                 else my_task_list[taskInfo.index].parameters = result;
//
//                             });
//                             my_task_list[taskInfo.index].address = result[i];
//
//                             index++;
//                         }
//                         //loadHistoryList();
//                     }
//                 });
//             }
//         );
//         prepareTaskContract();
//         setTimeout(function(){
//             loadHistoryList();
//         },1000);
//     });
// })();

const loadTask = function (index) {
    let t = my_task_list[index];


    console.log(t)
    // $("#task_id").html(t.task_id);
    $("#task_addr").html("<a href='http://18.218.112.136:8000/#/address/" + t.address + "' target='_blank'>" + t.address + "</a>");
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

const loadHistoryList = function () {
    $.each(my_task_list, function (index, value) {
        $('#history-loading').hide();
        $("ul.histList").append("<li><a href='javascript:loadTask(" + index + ")'>" + 0 + " - " + value.name + "</a></li>");
    });
};


//get_task_history();

const showTaskResult = function () {
    let uuid = $("#uuid").html();
    console.log(uuid)
    let taskName = $("#task_name").html();
    if (uuid) {
        window.localStorage.setItem("uuid", uuid);
        window.localStorage.setItem("taskName", taskName);
        window.open("output.html", "_self");
    } else {
        alert("There is no task available.");
    }

};