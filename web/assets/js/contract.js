window.onload = function () {
    let isChrome = !!window.chrome && !!window.chrome.webstore;
    let isSafari = /constructor/i.test(window.HTMLElement)
        || (
            function (p) {
                return p.toString() === "[object SafariRemoteNotification]";
            })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    if(!isChrome&&!isSafari){
        window.open("../template/InvalidBrowser.html", "_self");
    }
};

// const contractAddress = "0xa38effc32e43abe7c5c320899f084338194e4c8b"; //Helix v1.0
const contractAddress = "0xd6e754b380863c725e7b99cf1b6a0d4d3e0e6619"; //Helix v1.1


const loadContract = function() {
    $.ajax({
        url: "static/ABI/NebulaAi1.1.json",
        dataType: "json",
        error: function (e) {
            console.log(e);
        },
        success: function (data) {
            let NebulaAi = web3.eth.contract(data);
            window.nebulaAi = NebulaAi.at(contractAddress);
            $("#contractReady").show();

        }
    })
};

const initiateContract = function () {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
        //Currently only support Chrome with MetaMask plugin installed
        //loginWallet using private key or JSON format

        if (web3.eth.defaultAccount === undefined) {
            alert("Please log into your MetaMask account using Chrome MetaMask Plugin");
        }

        loadContract();
    } else {
        alert('No web3? You should consider trying MetaMask! Redirecting to loginWallet page...');
        window.open('need_MetaMask.html', '_self');
    }
};

initiateContract();