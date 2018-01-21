//@ts-check

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
/*const get_task_history =*/( function (from, to ) {
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
                        //loadHistoryList();  
                    }
                });
            }
        );
        prepareTaskContract();
        setTimeout(function(){
            loadHistoryList();
        },1000);
    });
})();

const loadTask = function (index) {
    let t = my_task_list[index];

    $("#task_id").html(t.task_id);
    $("#task_addr").html("<a href='http://18.218.112.136:8000/#/address/"+t.address+"' target='_blank'>"+t.address+"</a>");
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

const loadHistoryList = function (){                                                                    console.log(my_task_list);              
    
    $.each(my_task_list, function(index, value){   
        $('#history-loading').hide();                    
        $("ul.histList").append("<li><a href='javascript:loadTask(" + index + ")'>" + value.task_id + " - " + value.name + "</a></li>");
    });

    loadTask(0);
};



//get_task_history();

const showTaskResult = function(){
    let uuid = $("#uuid").html();                        console.log(uuid)
    let taskName = $("#task_name").html();
    if(uuid){
        window.localStorage.setItem("uuid", uuid);
        window.localStorage.setItem("taskName", taskName);
        window.open("output.html", "_self");
    }else{
        alert("There is no task available.");
    }

};