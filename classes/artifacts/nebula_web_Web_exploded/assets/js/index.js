const taskServerUrl = "http://192.168.88.187:8080/nebula-task/task/";

const minimalFee = 10;

/**
 * Temporary solution, this must move to backend
 * @return {*|XML|string|void}
 */
const uuidv4 = function() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    ).replace(/-/g, "");
};

/**
 * Order detail parameter
 * @type {Order}
 */
let currentOrder;
const blocks = {
    submit : {},
    task : {
        task_id:0,
        uuid:"",
        worker:"",
        has_issue:false,
        started:false,
        completed:false
    },
    dispatch : {},
    start : {},
    complete : {}
};

const loadPreTrainedPage = function () {

};

const toggleUploadPanel = function () {
    $(".data-form").slideToggle();
    $(".testedModel").slideToggle();
    $("#uploadPanel").slideToggle();
};

function Order(uuid, name, datasetUri, script, output, param) {
    this.uuid = uuid;
    this.name = name;
    this.datasetURI = datasetUri;
    this.scriptURI = script;
    this.outputURI = output;
    this.parameters = param;
    this.fee = 10 * 10^18;
    this.progress = 0;
    this.status = 0;
    this.transactionHash = "";
    this.taskContractAddress = "";
}
Order.prototype.setTransactionHash = function (hash) {
    this.transactionHash = hash;
};
Order.prototype.setTaskContractAddress = function (address) {
    this.taskContractAddress = address;
};

const submitOrder = function (callback) {
    let uuid = uuidv4();
    let dataUri = $("#dataUri").val();
    let taskName = $("#taskName").val();
    let params = { "epoch" : $("#epoch").val() };

    currentOrder = new Order(
        uuid,
        taskName,
        dataUri,
        scriptAddress,
        outputAddressBase + uuid,
        params
    );

    callback();
};


const waitingForSubmitConfirmation = function (result) {

    currentOrder.setTransactionHash(result);

    let txHash = result;
    getTransaction("#transactionHash", blocks.submit, txHash);

    console.log("Transaction Hash: ", result);
    console.log("waiting for submit confirmation");

    let submitEvent = nebulaAi.TaskSubmitted();


    submitEvent.watch(function (error, result) {
        if(result.args._sender_address.toLowerCase() === web3.eth.defaultAccount.toLowerCase()) {
            submitEvent.stopWatching();
            if (error) {
                console.log("error: ", error);
            } else {
                getTransaction("#transactionHash", blocks.submit, txHash);
                currentOrder.setTaskContractAddress(result.args._task_address);
                loadTaskContract(result.args._task_address);

                $("#taskReceived").show();
                $("#task_add_cell").empty().html(createLinkToExplorer(result.args._task_address, "address"));

                getTaskID();
                getUuid();
                myTaskWorker();
                taskContractInstance.task_issue(function (error, result) {
                    if (error) {
                        console.log(error);
                        $('#task_ok_cell').empty().html('error');
                        $('#task_issue_txhash').empty().html(error ? "ERROR_HASH" : "N/A");
                    } else {
                        $('#task_ok_cell').empty().html('ok');
                        blocks.task.has_issue = result;
                    }
                });

                console.log("Task submitted @ address : ", currentOrder.taskContractAddress);

                // waitingForTaskDispatch();
            }
        }
    });
};
const waitingForTaskDispatch = function () {

    console.log("waiting for task @ ", currentOrder.taskContractAddress, " to be dispatched");

    let dispatchEvent = nebulaAi.TaskDispatched();

    dispatchEvent.watch(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            if (result.args._sender_address.toLowerCase() === web3.eth.defaultAccount.toLowerCase()) {

                dispatchEvent.stopWatching();
                $("#taskDispatched").show();


                $("#dispatch_block").html(createLinkToExplorer(result.blockNumber,"block"));
                $("#dispatch_block_hash").html(createLinkToExplorer(result.blockHash,"block"));
                $("#task_disp_txhash").html(createLinkToExplorer(result.transactionHash,"tx"));
                myTaskWorker();
            }
        }
    });
};
const waitingForTaskStart = function(){
    //wait for start
    console.log("Waiting for task @ ", currentOrder.taskContractAddress, " to start");
    let startEvent = nebulaAi.TaskConfirmed();
    startEvent.watch(
        function (error, result) {
            if (error) {
                console.log(error);
            } else {
                if(result.args._task_owner.toLowerCase() === web3.eth.defaultAccount.toLowerCase()){
                    startEvent.stopWatching();
                    $('#taskStarted').show();
                    console.log('Task '+currentOrder.taskContractAddress+' started');
                    $('#start_block').html(createLinkToExplorer(result.blockNumber,"block"));
                    $('#start_block_hash').html(createLinkToExplorer(result.blockHash,"tx"));
                    $('#task_start_txhash').html(createLinkToExplorer(result.transactionHash,"tx"));
                }
            }
        }
    );
};

const showResult = function(fee, hash){
    console.log("Completion fee : " + fee +hash);
    localStorage.setItem("completed", true);
    localStorage.setItem("uuid",currentOrder.uuid);
    localStorage.setItem("task_address", currentOrder.taskContractAddress);

    console.log(localStorage.completed);
    console.log(localStorage.uuid);
    console.log(localStorage.task_address);
    window.open("output.html"); //, "_self"
};

const waitingForTaskCompletion = function(){

    //wait for completion
    console.log("Waiting for task @ ", currentOrder.taskContractAddress, " to complete");
    let completionEvent = nebulaAi.TaskCompleted();
    completionEvent.watch(
        function (error, result) {
            if(error){
                console.log(error);
            }else{
                if(result.args._task_owner.toLowerCase() === web3.eth.defaultAccount.toLowerCase()){
                    completionEvent.stopWatching();
                    let completion_fee = result.args._completion_fee;
                    showResult(completion_fee,"--", result.transactionHash, "--",result);
                    $('#taskCompleted').show();
                    $("#complete_block").html(createLinkToExplorer(result.blockNumber, "block"));
                    $('#complete_block_hash').html(createLinkToExplorer(result.blockHash, "block"));
                    $('#task_compl_txhash').html(createLinkToExplorer(result.transactionHash, "tx"));
                }

            }
        }
    )
};

const payToken = function () {
    let fee = parseFloat($("#tx_fee_value").val());
    if (fee >= minimalFee) {

        currentOrder.fee = web3.toWei(fee, "ether");

        nebulaAi.submitTask(
            currentOrder.uuid,
            currentOrder.name,
            currentOrder.datasetURI,
            currentOrder.scriptURI,
            currentOrder.outputURI,
            JSON.stringify(currentOrder.parameters),
            {
                value: currentOrder.fee
            },
            function (error, result) {
                if(error){
                    console.log(error);
                }else{
                    waitingForSubmitConfirmation(result);
                    waitingForTaskDispatch();
                    waitingForTaskStart();
                    waitingForTaskCompletion();
                }
            });
    }else alert("Minimum fee is less than 10 token, if you need more use the link below to get some token to try");
};

function isTaskStarted(){
    taskContractInstance.started(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.started = result;
        }
    });
}
function isTaskOk(){
    taskContractInstance.task_issue(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.has_issue = result;
        }
    });
}
function isTaskCompleted(){
    taskContractInstance.completed(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.completed = result;
        }
    });
}

function myTaskWorker(){
    taskContractInstance.worker(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.worker = result;
            $("#task_worker_cell").empty().html(createLinkToExplorer(result,"address"));
        }
    });
}

function getTaskID() {
    taskContractInstance.task_id(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.task_id = Number(result);
            $("#task_id_cell").empty().html(blocks.task.task_id);
        }
    })
}

function getUuid(){
    taskContractInstance.uuid(function (error, result) {
        if(error){
            console.log(error);
        }else{
            blocks.task.uuid = result;
            $("#uuid_cell").empty().html(result);
        }
    })
}



function getTransaction(panel, block, hash) {
    web3.eth.getTransaction(hash,function (error, result) {
        if(error){
            console.log(error);
        }else{
            block = result;
            $(panel).show().empty().append(
                "<h5>Transaction Details</h5>" +
                "<table>" +
                "<tr><td>Tx Hash : </td><td>"+createLinkToExplorer(result.hash,"tx")+"</td></tr>" +
                "<tr><td>Block Number : </td><td>" + result.blockNumber+"</td></tr>" +
                "<tr><td>Block Hash : </td><td>"+createLinkToExplorer(result.blockHash,"block")+"</td></tr>" +
                "<tr><td>From Wallet : </td><td>"+createLinkToExplorer(result.from,"address")+"</td></tr>" +
                "<tr><td>To Nebula Contract @: </td><td>"+createLinkToExplorer(result.to,"address")+"</td></tr>" +
                "<tr><td>Gas Spent : </td><td>"+result.gas+"</td></tr>" +
                "<tr><td>Gas Price : </td><td>"+ toEther(result.gasPrice) + "</td></tr>" +
                "<tr><td>Fee : </td><td>"+ toEther(result.value)+"</td></tr>" +
                "</table>"
            );
        }
    });
}
function createLinkToExplorer(fill, type){
    return "<a href='http://ec2-18-218-114-50.us-east-2.compute.amazonaws.com:8000/#/"+type+"/"+fill+"' target='_blank'>"+fill+"</a>"
}

function toEther(value){
    return web3.fromWei(value, 'ether');
}


// function Order(uuid, datasetUri, name,  script, output, params) {
//     this.uuid = uuid;
//     this.datasetURI = datasetUri;
//     this.name = name;
//     this.script = script;
//     this.outputURI = output;
//     this.parameters = params;
//     this.fee = 10*10^18;
//     this.progress = 0;
//     this.status = 0;
//     this.transactionHash = "";
// }
// Order.prototype.setTransactionHash = function (hash) {
//     this.transactionHash = hash;
// };
//
// const submitOrder = function (callback) {
//     let uuid = uuidv4();
//     let dataUri = $("#dataUri").val();
//     let scriptAddress = $("#script").val();
//     let outputAddress = $("#output").val();
//     let taskName = $("#taskName").val();
//
//     currentOrder = new Order(
//         uuid,
//         dataUri,
//         taskName,
//         scriptAddress,
//         outputAddress,
//         ""
//     );
//     callback();
//
// };
// const attachLink = function (type, hash) {
//     $("#status")
//         .append("<div>Task ( " + currentOrder.name + " ) " + type + " ... <div>")
//         .append(
//             "<div>Transaction Hash: " +
//             "<a href='http://192.168.88.192:8000/#/tx/" + hash +"' target='_blank'>" +hash+"</a>" +
//             "</div>");
// };
//
// const payToken = function () {
//     let fee = parseFloat($("#amount").val());
//     if (fee >= minimalFee) {
//         currentOrder.fee = web3.toWei(fee, "ether");
//         nebulaAi.submitTask(
//             currentOrder.uuid,
//             currentOrder.name,
//             currentOrder.datasetURI,
//             currentOrder.script,
//             currentOrder.outputURI,
//             currentOrder.params);
//             // {
//             //     value : currentOrder.fee
//             // },
//             // function(error, result){
//             //     console.log("error: ",error);
//             //     console.log("result: ",result);
//             //     $("#status").empty();
//             //
//             //     console.log("waiting for submit confirmation");
//             //
//             //     let uuidHex = web3.fromAscii(currentOrder.uuid);
//             //     console.log("uuid:", uuidHex);
//             //
//             //     let submitEvent = nebulaAi.TaskSubmitted({"_sender_address" : web3.eth.defaultAccount});
//             //     submitEvent.watch(function (error, result) {
//             //
//             //     submitEvent.stopWatching();
//             //     console.log("Current Task submitted" , result.args._task_address);
//             //     console.log("result:" , result);
//             //
//             //     attachLink("receipt", result.transactionHash);
//
//                         // let dispatchEvent = nebulaAi.taskDispatched(function (error, result) {
//                         //
//                         //     if(result.args.uuid === uuidHex){
//                         //         dispatchEvent.stopWatching();
//                         //         console.log("Current Task Dispatched : " , result.args.uuid);
//                         //         console.log("result:" , result);
//                         //
//                         //         attachLink("dispatched" , result.transactionHash);
//                         //
//                         //         let completeEvent = nebulaAi.taskCompleted(function (error, result) {
//                         //
//                         //             if(result.args.uuid === uuidHex){
//                         //                 completeEvent.stopWatching();
//                         //                 console.log("Current Task Completed : " , result.args.uuid);
//                         //                 console.log("result:" , result);
//                         //
//                         //                 attachLink("completed" , result.transactionHash);
//                         //
//                         //                 $("#payment").append("<div>We are going to transfer you to the output page<div>");
//                         //                 setTimeout(function () { window.open("history.html?uuid=" + currentOrder.uuid, "_self"); }, 500);
//                         //             }else{
//                         //                 console.log("not me yet");
//                         //             }
//                         //         });
//                         //     }else{
//                         //         console.log("not me yet");
//                         //     }
//                         // });
//     } else alert("Minimum fee is less than 2.06");
//
//     //window.open("output.html", "_self");
// };