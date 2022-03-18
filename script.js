// Script for TEST API WebApp 

// A function that makes the ajax call to an API

function ajaxJSON(url, params, callback, before){
    $.ajax({
        beforeSend: before,
        dataType: "json",
        url: url,
        data: params,
        success: function(data) {
            callback(data);
        },
        //Added this to check status of site after the site was down 
        error: function(jqXHR, clientStatus, httpStatus){
            if (clientStatus){
                console.log(clientStatus);
                alert("Uh oh! An exception occured.");
            }
            else if (httpStatus) {
                alert("Uh oh! A server error occurred: " + httpStatus + ". Try again later.");
            }
        },
    });
}

// function creates a cookie (name, value, time)

function createCookie(cookie_name, value, hours) {
    var expires;
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours*60*60*1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = cookie_name+"="+value+expires+"; path=/";
}

// function gets the value of a cookie if it exists 

function getCookieValue(cookie_name) {
    
    var cookie_name_eq = cookie_name + "=";
    var cookie_array = document.cookie.split(';');
    
    for(var i=0; i < cookie_array.length; i += 1) {
        var cookie = cookie_array[i];

        while ( cookie.charAt(0) == ' ' ){
            cookie = cookie.substring(1,cookie.length);
        } 

        if (cookie.indexOf(cookie_name_eq) === 0){
            return cookie.substring(cookie_name_eq.length,cookie.length);
        }
    }
    // otherwise the return will be null
    return null;
}

// function resets cookie that expired 

function deleteCookie(cookie_name) {
    createCookie(cookie_name, "", -1);
}

function queryStringToJSON(qs) {
    var pairs = qs.split('&');
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return JSON.parse(JSON.stringify(result));
}


//DOM

// this class abstracts DOM form elements

function Form(formElmt, errorElmt){
    if (!(this instanceof Form)){
        return new Form(formElmt, errorElmt);
    }
    this.formElmt = formElmt;
}

// class method to ajaxify's form submission on a form

Form.prototype.ajaxifySubmit = function(responseHandler, before) {
    var self = this;
    var formElmt = self.formElmt;
    var url = formElmt.action;
    $(self.formElmt).submit(function(event){
        var params = $(formElmt).serialize();
        console.log(params);
        var $fields = $(formElmt).find("input, button");
        $fields.attr("disabled", true);
        ajaxJSON(url, params, function(data){
            formElmt.reset();
            $fields.attr("disabled", false);
            var paramsObject = queryStringToJSON(params);
            responseHandler(paramsObject, data);
        }, before);
        return false;
    });
};



// Bellow specific code for WEBAPP

// The app code is made up of modules that encapsulate the functionalities 
// appMod module --> encapsulates all application specific code used in other application modules

function appMod(){
    function errorInvalidInput(){
        alert("Invalid user input. Try again!");
    }
    function errorPrivileges(){
        alert("Oops! You do not have the privileges to do that!");
    }
    function errorServer(){
        alert("Oops! Expensify is experiencing some issues on their end. Try again later.");
    }
    // function logs out the user by deleting the authentication cookie and redirecting him to the login page
    function logoutUser(){
        deleteCookie("authToken");
        location.reload(true);
    }

    // function that handles login json error codes

    function errorLogin(error, errorElmt){
        var message = "";
        var errorCode = Number(error.jsonCode);
        switch(errorCode){
            case 401:
                message = "Wrong password, please try again.";
                break;
            case 404:
                message = "Account not found, please try again.";
                break;
            case 407:
                message = "AuthToken expired, please login again.";
                break;
        }
        errorElmt.innerHTML = message;
    }
    // object that handles the default set of json error codes
    var errorCodeHandlers = {
        // 401 Wrong password
        "401": errorLogin,
        // 404 account not found
        "404": errorLogin,
        // 407 authToken expired
        "407": logoutUser,
    };

    // function that takes in a callback for a successful ajax form submission and the argument of an element to display errors 
    function expensifyFormHandler(successCallback, errorElmt){
        return function(params, data){
            if (data.jsonCode == "200"){
                successCallback(params, data);
            }
            else {
                errorCodeHandlers[data.jsonCode](data, errorElmt);
            }
        };
    }
    function cancelAddButtonBehavior(formElmt){
        var buttons = document.getElementById("buttons");
        buttons.classList.toggle("hide");
        formElmt.classList.toggle("hide");
        formElmt.reset();
    }
    function fadeOutElmt(elmt, mils){
        elmt.classList.toggle("fade_hide");
        elmt.classList.toggle("visible");
        setTimeout(function(){
            elmt.classList.toggle("visible");
            elmt.classList.toggle("fade_hide");
        }, mils);
    }
    // function parses date in YYYY-MM-DD
    function UTCDate(UTCdate){
        var array = UTCdate.split("-");
        var year = array[0];
        var month = array[1];
        var day = array[2];
        return year + "-" + month + "-" + day;
    }
    
    // function of monetary amounts in CENTS 
    function parseMoney(string){
        if (string) {
            var amount = Number(string)/100;
            if ( amount < 0){
                amount = Math.abs(amount);
                amount = "-$" + amount;
                return amount;
            }
            else {
                return "$" + amount;
            }
        } 
        return "void";
    }
    // module exports
    return {
        parseMoney: parseMoney,
        UTCDate: UTCDate,
        fadeOutElmt: fadeOutElmt,
        cancelAddButtonBehavior: cancelAddButtonBehavior,
        logoutUser: logoutUser,
        formHandler: expensifyFormHandler,
    };
}

// Transaction module devoted to displaying and creating user transactions

function Transactions(Table, Adder){
    var containerElmt = document.getElementById("transactions_content");
    function showTransactions(){
        if(containerElmt){
            containerElmt.classList.toggle("hide");
        }
    }
    return {
        show: showTransactions,
        Adder: Adder,
        Table: Table,
    };
}

// Table // displays transactions

function Table(appMod){
    var bodyElmt = document.getElementById("trans_body");
    var formElmt = document.getElementById("show_form");
    var form = new Form(formElmt);
    var moreButtonElmt = document.getElementById("see_more");
    var cancelButtonElmt = document.getElementById("cancel_show");
    var showMonthButtonELmt = document.getElementById("show_ThisMonth");
    function clearTable(){
        $(bodyElmt).children().remove();
    }

    //function to show all the transactions dates and then return a param object to pass to an ajax call requesting transactions
    function all_TransactionsHistory(){
        var start = ("1900" + '-' + "01" + '-' + '01');
        var end= ("2999" + '-' + "12" + '-' + "31");
        return {
            command: "Get",
            returnValueList: "transactionList",
            startDate: start,
            endDate: end
        };
    }

    //function gets the current date and then return a param object to pass to an ajax call requesting transactions from the current month
    function currentMonthParams(){
        var currentdate_date = new Date();
        var month = currentdate_date.getMonth()+1;
        month = month < 10 ? '0' + month : month;
        var day = currentdate_date.getDate();
        day = day < 10 ? '0' + day : day;
        var year = currentdate_date.getFullYear();
        var start = (year + '-' + month + '-' + '01');
        var end = (year + '-' + month + '-' + day);
        return {
            command: "Get",
            returnValueList: "transactionList",
            startDate: start,
            endDate: end
        };
    }

    // function to displays a string into a box in the center of the transactions table body

    function insertTableMessage(message){
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        row.id = "message_row";
        var messageElmt = document.createElement("div");
        messageElmt.innerHTML = message;
        row.appendChild(cell);
        cell.appendChild(messageElmt);
        bodyElmt.appendChild(row);
    }
    // function inserts html string into the message while fetching DATA

    function dataLoading(){
        clearTable();
        var htmlString = "<p id='loading'>Loading Data, Please wait...</p>";
        insertTableMessage(htmlString);
    }
    // function loads a single transaction into a table

    function addTransaction(tableBody, transaction){
        var row = document.createElement("tr");
        tableBody.appendChild(row);
        var date_cell = document.createElement("td");
        date_cell.innerHTML = appMod.UTCDate(transaction.created);
        row.appendChild(date_cell);
        var amount_cell = date_cell.cloneNode(false);
        console.log(!transaction.amount);
        amount_cell.innerHTML = appMod.parseMoney(transaction.amount);
        row.appendChild(amount_cell);
        var merchant_cell = date_cell.cloneNode(false);
        merchant_cell.innerHTML = transaction.merchant;
        row.appendChild(merchant_cell);
        var comment_cell = date_cell.cloneNode(false);
        comment_cell.innerHTML = transaction.comment;
        row.appendChild(comment_cell);
    }
    // functions that loads the data responses received from the ajax call into API into tables 

    function showSuccessConstructor(params, response){
        var transactions = response.transactionList;
        console.log(transactions);
        clearTable();
        if (transactions.length < 1) {
            var message = "No transactions to show.";
            console.log(params);
            if (params.startDate && params.endDate){
                var startDate = appMod.UTCDate(params.startDate);
                var endDate = appMod.UTCDate(params.endDate);
                message = "No transactions in the period " + startDate + " – " + endDate + ".";
            }
            insertTableMessage("<p>" + message + "</p>");
        }
        transactions.forEach(addTransaction.bind(undefined, bodyElmt));
    }
    
    // binds handler to click event on showMonth button

    var showMonthHandler = appMod.formHandler(showSuccessConstructor).bind(undefined, null);
    var showMonthParams = currentMonthParams();
    function showMonthButtonBehavior(){
        ajaxJSON("get_proxy.php", showMonthParams, showMonthHandler, dataLoading);
    }

    function configTable(){
        // attach event handler to see more and cancel buttons
        $([moreButtonElmt, cancelButtonElmt]).on("click", function (event){
            console.log(event.target);
            appMod.cancelAddButtonBehavior(formElmt);
        });

        // show the current month's transactions
        var formHandler = appMod.formHandler(showSuccessConstructor);
        // set handler for form submission that fetches user transactions
        form.ajaxifySubmit(formHandler, dataLoading);
        // configure the transactions display table
        $(showMonthButtonELmt).on("click", showMonthButtonBehavior);

        
        var allTransactionsHistory = all_TransactionsHistory();
        var allTransactionsHistoryHandler = formHandler.bind(undefined, allTransactionsHistory);
        // When page loads initially, get ALL transactions available and display them
        ajaxJSON("get_proxy.php", allTransactionsHistory, allTransactionsHistoryHandler, dataLoading);
    }
    return {
        config: configTable,
    };
}

// Adder Module --> adds transactions to a user's account

function  Adder(appMod){
    var formElmt = document.getElementById("add_form");
    var addButtonElmt = document.getElementById("add_trans");
    var cancelButtonElmt = document.getElementById("cancel_add");
    var form = new Form(formElmt);
    var userFeedbackElmt = document.getElementById("add_message");
    function addSuccessHandler(params, response){
        appMod.fadeOutElmt(userFeedbackElmt, 3000);
        console.log("transaction added");
    }
    var formHandler = appMod.formHandler(addSuccessHandler);
    function configAdder(){
        // attach behavior to add transaction and cancel buttons
        $([addButtonElmt, cancelButtonElmt]).on("click", function (event){
            appMod.cancelAddButtonBehavior(formElmt);
        });
        // set handlers for form submission for fetching user transactions
        form.ajaxifySubmit(formHandler);
    }
    return {
        config: configAdder,
    };
}


// NavBar module --> handles the navigation bar

function NavBar(appMod){
    var navElmt = document.getElementsByTagName("nav")[0];
    var usernameElmt = document.getElementById("username");
    var logoutButton = document.getElementById("logout");
    var logoutButtonBehavior = appMod.logoutUser;
    function configNavBar(email){
        var username = email || getCookieValue("email");
        navElmt.classList.toggle("hide");
        usernameElmt.innerHTML = username;
        $(logoutButton).on("click", logoutButtonBehavior);
    }
    return {
        config: configNavBar,
    };
}


// Login module --> handles user authentication

function Login(Transactions, NavBar, appMod){
    var containerElmt = document.getElementById("login_con");
    var formElmt = document.getElementById("login_form");
    var messageElmt  = document.getElementById("message");
    var form = new Form(formElmt);
    function loginSuccessHandler(params, response) {
        $(containerElmt).remove();
        var email;
        if(response){
            email = response.email;
            createCookie("email", email, 1);
            createCookie("authToken", response.authToken, 1);
        }
        NavBar.config(email);
        Transactions.show();
        Transactions.Table.config();
        Transactions.Adder.config();
        
    }
    var formHandler = appMod.formHandler(loginSuccessHandler, messageElmt);
    function configLogin(){
        form.ajaxifySubmit(formHandler);
    }
    return {
       config: configLogin,
       success: loginSuccessHandler,
    };
}


// DOM.Ready Code 


$(document).ready(function (){
    var authToken = getCookieValue("authToken");
    // loads the modules
    var apptools = appMod();
    var transactions = Transactions(Table(apptools), Adder(apptools));
    var navbar = NavBar(apptools);
    var login = Login(transactions, navbar, apptools);
    if (!authToken){
        login.config();
    }
    else {
        login.success();
    }
});
