const admin_abi_json = "./contract/abi/getter/admin_interface.json";
const client_abi_json = "./contract/abi/submitter/ClientInterfaceSubmitter.json";
const dispatcher_abi_json = "./contract/abi/submitter/DispatcherInterfaceSubmitter.json";
const distributor_abi_json = "./contract/abi/submitter/DistributorInterfaceSubmitter.json";
const queue_task_abi_json = "";
const queue_ai_abi_json = "";
const taskpool_abi_json = "./contract/abi/getter/TaskPoolInterfaceGetter.json";
const account_abi_json = "./contract/abi/getter/AccountInterfaceGetters.json";


class Status {
    constructor() {
        this.create_time = 0;
        this.dispatch_time = 0;
        this.start_time = 0;
        this.complete_time = 0;
        this.error_time = 0;
        this.cancel_time = 0;
    }

    set(result) {
        this.create_time = Number(result[0]);
        this.dispatch_time = Number(result[1]);
        this.start_time = Number(result[2]);
        this.complete_time = Number(result[3]);
        this.error_time = Number(result[4]);
        this.cancel_time = Number(result[5]);
    }
}

class Nebula {

    constructor(web3, admin_address, app_id) {
        this.admin_address = admin_address;
        this.web3 = web3;
        this.task(app_id);
    }

    contracts() {
        this.client = {};
        this.distributor = {};
        this.dispatcher = {};
        this.queue_ai = {};
        this.queue_task = {};
        this.account = {};
        this.taskpool = {};
        this.admin = {};
    }

    task(app_id = 0) {
        this.current_task = {
            app_id: app_id,
            name: "",
            script: "",
            data: "",
            output: "",
            params: "",
            fee: {},
            address: "",
            creation_hash: "",
            status: new Status(),
            reassigned: false
        };
        this.task_history = [];
        this.active_tasks = [];
        this.job_history = [];
        this.active_job = "";
    }


    initialize() {
        let _this = this;
        this.current_task["app_id"] = 1;
        return new Promise(function (resolve, reject) {
            return _this.load_admin()
                .then(function () {
                    return _this.admin_get_client();
                }).then(function () {
                    return _this.admin_get_dispatcher();
                }).then(function () {
                    return _this.admin_get_distributor();
                }).then(function () {
                    return _this.admin_get_account();
                }).then(function () {
                    return _this.admin_get_taskpool();
                }).then(resolve).catch(reject);
        });
        // .then(function () {
        //     return _this.admin_get_queue_ai_address();
        // }).then(function () {
        //     return _this.admin_get_queue_task_address();
        // })
    }

    load_admin() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin = new Contract(_this.web3, "Admin", _this.admin_address, admin_abi_json);
            _this.admin.prepare_contract().then(resolve).catch(reject);
        });
    }

    admin_get_client() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.client_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.client = new Contract(_this.web3, "Client", result, client_abi_json);
                    _this.client.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_dispatcher() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.dispatcher_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.dispatcher = new Contract(_this.web3, "Dispatcher", result, dispatcher_abi_json);
                    _this.dispatcher.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_distributor() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.distributor_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.distributor = new Contract(_this.web3, "Distributor", result, distributor_abi_json);
                    _this.distributor.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_account() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.account_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.account = new Contract(_this.web3, "Account", result, account_abi_json);
                    _this.account.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_taskpool() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.taskpool_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.taskpool = new Contract(_this.web3, "Taskpool", result, taskpool_abi_json);
                    _this.taskpool.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_queue_ai_address() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.queue_ai_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.queue_ai = new Contract(_this.web3, "Ai Queue", result, queue_ai_abi_json);
                    _this.queue_ai.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    admin_get_queue_task_address() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.admin.instance.queue_task_address(function (error, result) {
                if (error) reject(error);
                else {
                    _this.queue_task = new Contract(_this.web3, "Task Queue", result, queue_task_abi_json);
                    _this.queue_task.prepare_contract().then(resolve).catch(reject);
                }
            });
        });
    }

    /*
     * Client functions
     */
    create_account(passphrase) {

    }

    import_key(private_key) {

    }

    /*
     * Task related
     */

    /*
     * Getters
     */
    /**
     *
     * @param task
     * @returns {Promise<any>}
     */
    get_task_status(task = this.current_task["address"]) {
        //taskpool#get_status
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.taskpool.instance.get_status(
                task,
                (error, result) => {
                    if (error) reject(error);
                    else {
                        _this.current_task["status"].set(result);
                        resolve(_this.current_task["status"]);
                    }
                });
        });
    }

    reassignable(task = this.current_task["address"]) {
        //taskpool#reassignable
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.taskpool.instance.reassignable(
                task,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
        });
    }

    get_task_info(task = this.current_task["address"]) {
        //taskpool#get_task
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.taskpool.instance.get_task(
                task,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
        });
    }

    get_task_history(app_id = this.current_task["app_id"]) {
        //account#task_history
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.account.instance.task_history(
                app_id,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
        });
    }

    get_active_task(app_id = this.current_task["app_id"]) {
        //account#active_tasks
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.account.instance.active_tasks(
                app_id,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
        });
    }

    get_client_info() {
        //CIS#get_client_c
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.client.instance.get_client_c(
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
        });
    }

    submissible(client = this.web3.eth.defaultAccount, app_id = this.current_task["app_id"]) {
        //CIS#submissible
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.client.instance.submissible(
                client,
                app_id,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
        });
    }

    get_task_position(task = this.current_task["address"]) {
        //Dispatcher#task_position
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.dispatcher.instance.task_position(
                task,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
        });
    }

    /**
     * Get the size of the task queue
     * @returns {Promise<any>}
     */
    get_task_queue_size() {
        //dispatcher#task_queue_size
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.dispatcher.instance.task_queue_length(
                (error, result) => {
                    if (error) reject(error);
                    else resolve(Number(result));
                });
        });
    }

    /**
     * Get the size of AI miner queue
     * @returns {Promise<any>}
     */
    get_ai_queue_size() {
        //dispatch#ai_queue_size
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.dispatcher.instance.ai_queue_length(
                (error, result) => {
                    if (error) reject(error);
                    else resolve(Number(result));
                }
            );
        })
    }

    submit_task() {
    }
    /**
     * Create a task
     */
    create_task() {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.distributor.instance.create_task(
                _this.current_task["app_id"],
                _this.current_task["name"],
                _this.current_task["script"],
                _this.current_task["data"],
                _this.current_task["output"],
                _this.current_task["params"],
                {
                    value: _this.current_task["fee"]
                },
                (error, result) => {
                    if (error) reject(error);
                    else {
                        console.log("Create task txHash : ", _this.current_task["creation_hash"] = result);
                        _this.get_blockNumber(result)
                            .then((tx_details) => {
                                console.log("Creation transaction details");
                                console.log(tx_details); //print transaction details
                                _this.get_active_task(_this.current_task["app_id"])
                                    .then((task_list) => {
                                        let size = task_list.length;
                                        if (size === 0) reject("Active task is missing, should not be reached");
                                        else {
                                            let task_address = task_list[size - 1];
                                            _this.current_task["address"] = task_address;
                                            resolve(task_address);
                                        }
                                    }).catch(reject);
                            })
                            .catch(reject);
                    }
                });
        });
    }

    get_blockNumber(txHash) {
        let _this = this;
        let block_number = null;
        return new Promise((resolve, reject) => {
            _this.get_transaction(txHash)
                .then(result => {
                    if ((block_number = result["blockNumber"]) !== null) {
                        console.log("Block mined at ", block_number);
                        resolve(result);
                    } else setTimeout(() => _this.get_blockNumber(txHash).then(resolve).catch(reject), 2000);
                }).catch(reject);
        })
    }

    get_transaction(txHash) {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.web3.eth.getTransaction(
                txHash,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
        });
    }

    get_latest_block(block = "lastest") {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.web3.eth.getBlock(
                block,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
        });
    }

    /**
     *
     * @param task
     * @returns {Promise<any>}
     */
    wait_for_dispatch(task = this.current_task["address"]) {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.get_task_status(task)
                .then(result => {
                    if (result["dispatch_time"] !== 0) {
                        console.log("Task dispatched at block " + result["dispatch_time"]);
                        resolve(result);
                    } else setTimeout(() => _this.wait_for_dispatch(task).then(resolve).catch(reject), 2000);
                }).catch(reject);
        });
    }

    wait_for_start(task = this.current_task["address"]) {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.get_task_status(task)
                .then(result => {
                    if (result["start_time"] !== 0) {
                        console.log("Task Started at block " + result["start_time"]);
                        resolve(result);
                    } else {
                        if (result["error_time"] !== 0) {
                            console.log("error");
                            //todo
                        } else if (result["cancel_time"] !== 0) {
                            console.log("cancel");
                            //todo
                        } else {
                            _this.reassignable(task)
                                .then(result => {
                                    if (result) {
                                        console.log("Task has not been started on time, and it is now reassignable");
                                        console.log("this task is now paid by the miner's credit as its penalty");
                                        _this.reassign_task(task).then(resolve).catch(reject);
                                        //todo this will not be automatically called
                                    } else setTimeout(() => _this.wait_for_start(task).then(resolve).catch(reject), 2000)
                                }).catch(reject);
                        }
                    }
                })
                .catch(reject);
        })
    }

    wait_for_complete(task = this.current_task["address"]) {
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.get_task_status(task)
                .then(result => {
                    if (result["complete_time"] !== 0) {
                        console.log("Task Completed at block " + result["complete_time"]);
                        resolve(result);
                    } else {
                        if (result["error_time"] !== 0) {
                            console.log("error");
                            //todo
                        } else if (result["cancel_time"] !== 0) {
                            console.log("cancel");
                            //todo
                        } else setTimeout(() => _this.wait_for_complete(task).then(resolve).catch(reject), 2000)
                    }
                })
                .catch(reject);
        })
    }

    /**
     *
     * @param task, task address default to the current task
     * @param app_id, app id, default to the current app id
     * @returns {Promise<any>}
     */
    cancel_task(task = this.current_task["address"], app_id = this.current_task["app_id"]) {
        //distributor#cancel_task
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.get_task_status(task)
                .then((result) => {
                    if (result["start_time"] === 0
                        && result["complete_time"] === 0
                        && result["error_time"] === 0
                        && result["cancel_time"] === 0) {
                        return _this.distributor.instance.cancel_task(
                            task,
                            app_id,
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            });
                    } else {
                        //TODO temp
                        if (result["start_time"] !== 0) {
                            console.log("Task has been started");
                        } else if (result["complete_time"] !== 0) {
                            console.log("Task has been completed");
                        } else if (result["error_time"] !== 0) {
                            console.log("Task has been reported containing error");
                        } else if (result["cancel_time"] !== 0) {
                            console.log("Task has been cancelled already");
                        } else {
                            console.log("???")
                        }
                    }
                })
                .catch(reject);
        });
    }

    reassign_task(task = this.current_task.address) {
        //distributor#reassign_task_request
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.reassignable(task)
                .then(result => {
                    if (!result) {
                        console.log("Task is no longer reassignable");
                        _this.get_task_status(task)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        _this.distributor.instance.reassign_task_request(
                            task,
                            (error, result) => {
                                if (error) reject(error);
                                else {
                                    console.log("reassignment txHash", result);
                                    _this.get_blockNumber(result)
                                        .then(tx_details => {
                                            console.log("Tx details:");
                                            console.log(tx_details);
                                            _this.wait_for_start(task).then(resolve).catch(reject);
                                        })
                                        .catch(reject);
                                }
                            }
                        )
                    }
                })
                .catch(reject);
        })
    }

    pay_completion_fee() {
        //distributor#pay_completion_fee
        let _this = this;
    }

    /*
    Miner info pages
     */
    get_miner_info(worker) {
        //CIM#get_client_m
        let _this = this;
    }

    get_ai_position(worker) {
        //dispatcherInterfaceMiner#ai_position
        let _this = this;
    }

    get_ai_queue_size_m() {
        //dispatcherInterfaceMiner#ai_queue_length
        let _this = this;
    }

    get_active_job(task) {
        //account#active_job
        let _this = this;
    }

    get_job_history(task) {
        //account#job_history
        let _this = this;
    }

    get_credits(worker) {
        //account#get_credits
        let _this = this;
    }

    get_penalty() {
        //CIM#get_penalty
        let _this = this;
    }

    get_minimal_credit() {
        //CIM#get_minimal_credit
        let _this = this;
    }

    apply_eligibility(worker) {
        //CIM#apply_eligibility
        let _this = this;
    }

    withdraw_credits(worker, amount) {
        //CIM#withdrawal
        let _this = this;
    }


    /*
    Queue updaters
     */
    task_queue_size_updater(callback) {
        let _this = this;
        _this.get_task_queue_size().then(result => callback(result)).catch(console.log);
        setTimeout(() => {
            _this.task_queue_size_updater(callback)
        }, 5000);
    }

    ai_queue_size_updater(callback) {
        let _this = this;
        _this.get_ai_queue_size().then(result => callback(result)).catch(console.log);
        setTimeout(() => _this.ai_queue_size_updater(callback), 5000);
    }

    // client_status_updater(){
    //     let _this = this;
    //     _this.get_client_info().then(result=>callback(result)).catch(console.log);
    //     setTimeout(()=>_this.client_status_updater(),5000);
    // }
    submissible_updater(callback) {
        let _this = this;
        this.submissible(this.web3.eth.defaultAccount, this.current_task["app_id"])
            .then(result => {
                callback(result);
                setTimeout(() => _this.submissible_updater(callback), 5000);
            })
            .catch(console.log);
    }

    current_task_position_updater(task = this.current_task["address"], callback) {
        let _this = this;
        _this.get_task_position(task).then(result => {
            let position = Number(result);
            if (position !== 0) {
                callback(position);
                setTimeout(() => _this.current_task_position_updater(task, callback), 5000);
            }
        }).catch(console.log);
    }




}

