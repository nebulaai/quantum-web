window.onload = function () {
    let browserChrome = !!window.chrome && !!window.chrome.webstore;
    let browserFirefox = typeof InstallTrigger !== 'undefined';

    if (!browserChrome && !browserFirefox ){
        window.location.href = "./notice/notice_supported/index.html";
    } else if (typeof web3 === 'undefined') {
        window.location.href = "./notice/notice_install/index.html";
    } else {
        window.web3 = new Web3(web3.currentProvider);
        if (web3.eth.defaultAccount === undefined)
            window.location.href = "./notice/notice_locked/index.html";
        else start_app();
    }
};

const scriptAddressDefault = "http://quantum.nebula-ai.network/script/Nebula_LSTM.py";
const outputAddress = "http://quantum.nebula-ai.network/nebula/scripts/";
const minimalFee = 5;
const admin_address = "0x2f1400233d6368fe3f38767a5c52775d423132fd";

function start_app() {
    window.nebula = new Nebula(web3, admin_address);

    nebula.initialize()
        .then(() => {
            nebula.task_queue_size_updater(result => {
                $("#task_count").html(result);
            });
            nebula.ai_queue_size_updater(result => {
                $("#ai_count").html(result);
            });
            nebula.submissible_updater(result => {
                $("#is_submissible").html(result);
            });
            return nebula.submissible();
        })
        .then((is_submissible) => {
            if (is_submissible) {
                //load default app.
                app_ready().then().catch();
            } else {
                //load current task. todo temp testing
                resume_task().then().catch();
            }
        });
}

function app_ready(){
    return new Promise((resolve, reject)=>{
        resolve();
    });
}

function resume_task(){
    return new Promise((resolve, reject)=>{
        nebula.get_active_task()
            .then(result => {
                result.forEach((item, index) => {
                    nebula.current_task_position_updater(item, position => {
                        $("#position_table").html("<tr><td>"+ result[index] + ":</td><td>" + position+"</td></tr>");
                    });
                });
                //load the last task if there are multiple tasks
                if (result.length > 0) {
                    let display_task = result[result.length - 1];
                    nebula.current_task["address"] = display_task;
                    return nebula.get_task_status(display_task)
                        .then(status => {
                            if (status["create_time"] === 0) {
                                throw "Create time is empty, task address is incorrect";
                            } else {
                                console.log("waiting for dispatch");
                                return nebula.wait_for_dispatch(display_task);
                            }
                        })
                        .then(() => {
                            console.log("waiting for start");
                            return nebula.wait_for_start(display_task);
                        })
                        .then(() => {
                            console.log("waiting for complete");
                            return nebula.wait_for_complete(display_task);
                        })
                        .then(()=>{

                        })
                        .catch(reject);
                } else {
                    console.log("no active task")
                }
            })
            .catch(reject);
    });
}

/**
 * Order detail parameter
 * @type {Order}
 */
let currentOrder;
const blocks = {
    submit: {},
    task: {
        task_id: 0,
        uuid: "",
        worker: "",
        has_issue: false,
        started: false,
        completed: false
    },
    dispatch: {},
    start: {},
    complete: {}
};

const useDefault = function () {
    $("#dataUri").val(scriptAddressDefault);
};

const toggleUploadPanel = function () {
    alert("The function isn't ready yet.\n Coming soon!!!");
};


function Order(uuid, name, datasetUri, script, output, param) {
    this.uuid = uuid;
    this.name = name;
    this.datasetURI = datasetUri;
    this.scriptURI = script;
    this.outputURI = output;
    this.parameters = param;
    this.fee = 10 * 10 ^ 18;
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
    // let dataUri = $("#dataUri").val();
    let taskName = $("#taskName").val();
    let params = { "epoch": $("#epoch").val() };
    let scriptAddress = $("#dataUri").val();

    currentOrder = new Order(
        uuid,
        taskName,
        "",
        scriptAddress,
        outputAddress + uuid,
        params
    );

    callback();
};


$(document).ready(function () {
    // changes ex, input placeholder to default value
    $("#dataUri").focus().attr('value', scriptAddressDefault);
    $('.data-form').validate({
        rules: {
            taskName: {
                minlength: 5,
                required: true
            },
            dataUri: {
                required: true
            },
            epoch: {
                epochNumber: true,
                // regex: "/^([0-1]?[0-9]|20)$/",
                required: true
            }
        },
        highlight: function (element) {
            $(element).closest('.input-group-lg').addClass("error");
            //.removeClass('success').addClass('error');
        },
        success: function (element) {
            $(element).closest('.input-group-lg').removeClass("error");
            let errorlabel = $(element)[0];                //console.log(errorlabel);
            $(errorlabel).remove();
            // element.addClass('valid')
            //     .closest('.control-group').removeClass('error').addClass('success');
        },
        submitHandler: function (form) {
            $("#taskName").attr("disabled", "disabled");
            $("#dataUri").attr("disabled", "disabled");
            $("#epoch").attr("disabled", "disabled");
            // form.submit();
            submitOrder(function () {
                $("#payment").show();
                $("#create_task_btn").hide();
            });
        }

    });

    $("#token").validate({
        rules: {
            tx_fee_value: {
                required: true,
                tokeNumber: true
            }
        },
        highlight: function (element) {
            $(element).closest('.input-group-lg').addClass("error");
            //.removeClass('success').addClass('error');
        },
        success: function (element) {
            $(element).closest('.input-group-lg').removeClass("error");
            let errorlabel = $(element)[0];                //console.log(errorlabel);
            $(errorlabel).remove();
        },
        submitHandler: function (form) {
            $("#tx_fee_value").attr("disabled", "disabled");
            payToken();
        }
    });
});

const payToken = function () {
    let fee = parseFloat($("#tx_fee_value").val());

    currentOrder.fee = web3.toWei(fee, "ether");
    try {
        nebulaAi.submitTask(
            currentOrder.uuid,
            currentOrder.name,
            "",
            currentOrder.scriptURI,
            currentOrder.outputURI,
            JSON.stringify(currentOrder.parameters),
            {
                value: currentOrder.fee
            },
            function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    waitingForSubmitConfirmation(result);
                }
            });
    } catch (error) {
        console.log(error);
        //alert('submit error.');
    }

};


const waitingForSubmitConfirmation = function (result) {
    console.log("Transaction Hash: ", result);
    $('#report-loading').show();

    currentOrder.setTransactionHash(result);

    web3.eth.getTransaction(result, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.submit = result;
            // $(table).css("white-space", "nowrap");
            // $(".report-content").css("overflow-y", "scroll");
            $("#sub_txhash").html(createLinkToExplorer(result.hash, "tx"));
            $("#sub_block_number").html("Not yet mined");
            $("#sub_block_hash").html("0x0");
            $("#sub_from").html(createLinkToExplorer(result.from, "address"));
            $("#sub_to").html(createLinkToExplorer(result.to, "address"));
            $("#sub_gas_spent").html(result.gas);
            $("#sub_gas_price").html((new BigNumber(toEther(result.gasPrice))).toString());
            $("#sub_fee").html((new BigNumber(toEther(result.value))).toString());
        }
    });
    console.log("waiting for submit confirmation");

    checkForSubmission(result);
};
function checkForSubmission(hash) {
    web3.eth.getTransaction(hash, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            if (result.blockNumber === null) {
                setTimeout(function () {
                    checkForSubmission(hash);
                }, 2500);
            } else {
                console.log("Transaction has been mined");
                $("#sub_block_number").html(createLinkToExplorer(result.blockNumber, "block"));
                $("#sub_block_hash").html(createLinkToExplorer(result.blockHash, "block"));

                //Task mined, go get task address
                getCurrentTask();
            }
        }
    });
}

function getCurrentTask() {
    nebulaAi.getMyActiveTasks(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            if (result.length == 0) {
                setTimeout(function () {
                    getCurrentTask();
                }, 2500);
            } else {
                console.log("Current Task address" + result[0]);
                currentOrder.taskContractAddress = result[0];

                //Load Task at address
                loadTaskContract(currentOrder.taskContractAddress);

                loadTaskContractDetails();

                //Task address found
                //check for dispatch
                //TODO constant checking will cause too much read if there is a long queue
                //TODO to change in next update
                waitingForTaskDispatch();
            }
        }
    });
}

function loadTaskContractDetails() {
    $("#task_add_cell").html(currentOrder.taskContractAddress);
    $("#task_id_cell").html(getTaskID());
    $("#uuid_cell").html(getUuid());
    $("#task_worker_cell").html(myTaskWorker());
    $("#task_ok_cell").html(isTaskOk() ? "OK" : "Issue found");
}

const waitingForTaskDispatch = function () {
    taskContractInstance.worker(function (error, result) {
        if (error) {
            console.log(error);
        } else {

            if (web3.toDecimal(result) != 0) {
                console.log("Worker address : " + result);
                $("#taskDispatched").show();

                //TODO add some info here
                //TODO use event check to find the txhash

                waitingForTaskStart();

            }
            else {
                setTimeout(function () {
                    waitingForTaskDispatch();
                }, 2500
                )
                // $("#dispatch_block").html(createLinkToExplorer(result.blockNumber, "block"));
                // $("#dispatch_block_hash").html(createLinkToExplorer(result.blockHash, "block"));
                // $("#task_disp_txhash").html(createLinkToExplorer(result.transactionHash, "tx"));
            }
        }
    });
};
const waitingForTaskStart = function () {
    taskContractInstance.started(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            if (result) {
                console.log("Task has been started");
                $('#taskStarted').show();
                waitingForTaskCompletion();
            } else {
                setTimeout(function () {
                    waitingForTaskStart();
                }, 2500);
            }
        }
    });
};

const showResult = function () {
    localStorage.setItem("completed", true);
    localStorage.setItem("uuid", currentOrder.uuid);
    localStorage.setItem("task_address", currentOrder.taskContractAddress);


    window.open("templates/output.html", "_self");
};

function waitingForTaskCompletion() {

    taskContractInstance.completed(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            if (result) {
                showResult();
                $('#taskCompleted').show();
                $('#report-loading').hide();
                $('#view-report-btn').show();
            } else {
                setTimeout(function () {
                    waitingForTaskCompletion();
                }, 2500);
            }

        }
    });
}



function isTaskStarted() {
    taskContractInstance.started(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.task.started = result;
        }
    });
}
function isTaskOk() {
    taskContractInstance.task_issue(function (error, result) {
        if (error) {
            console.log(error);
            return false;
        } else {
            blocks.task.has_issue = result;
            return result;
        }
    });
}
function isTaskCompleted() {
    taskContractInstance.completed(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.task.completed = result;
        }
    });
}

function myTaskWorker() {
    taskContractInstance.worker(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.task.worker = result;
            $("#task_worker_cell").empty().html(createLinkToExplorer(result, "address"));
        }
    });
}

function getTaskID() {
    taskContractInstance.task_id(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.task.task_id = Number(result);
            $("#task_id_cell").empty().html(blocks.task.task_id);
        }
    })
}

function getUuid() {
    taskContractInstance.uuid(function (error, result) {
        if (error) {
            console.log(error);
        } else {
            blocks.task.uuid = result;
            let output_uuid = web3.toAscii(result); console.log(output_uuid)
            $("#uuid_cell").empty().html(output_uuid);
        }
    })
}



function createLinkToExplorer(fill, type) {
    return "<a href='http://18.218.112.136:8000/#/" + type + "/" + fill + "' target='_blank'>" + fill + "</a>"
}

function toEther(value) {
    return web3.fromWei(value, 'ether');
}

$.validator.addMethod(
    "epochNumber",
    function (value, element, bolean) {
        return parseInt(value) == value && parseInt(value) > 0 && parseInt(value) < 20;
    },
    "Epoch must be Integer number between 1-20 !!!"
);

$.validator.addMethod(
    "tokeNumber",
    function (value, element, boolean) {
        return boolean && parseInt(value) == value && parseInt(value) >= minimalFee;
    },
    "Minimum token fee is less than 5<br />Use the link below to get some token to try !!!"
);

