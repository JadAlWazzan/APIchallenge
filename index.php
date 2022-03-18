<?php
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    
    <title>Home Challenge</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <div id="header">
        <a id="title" href="/">
            <h2><strong>API</strong> - Challenge </h2>
        </a>
        <nav class="hide">
            <span id="username"></span> | <button type="button" id="logout">Logout</button>
        </nav>
    </div>
    <div id="loginContent">
        <!-- Add your login form here -->
        <?php
        require_once 'login.php';
        ?>
    </div>

    <div class="hide" id="transactionTable">
        <h1><strong>Transactions:</strong></h1>
        <table>

            <thead>
                <tr>
                    <th> Transaction Date </th>
                    <td width="6%"></td>
                    <th> Amount </th>
                    <td width="22%"></td>
                    <th> Merchant </th>
                </tr>
            </thead>
 
            <tbody id="transactionTableBody">
                <!-- Add the transaction rows here -->
                <?php
                //require 'table.php';
                if($_SESSION==NULL){
                    
                }else{
                    require_once 'table.php';
                }
                ?>
            </tbody>
        </table>
    </div>
    <div id="transactionForm">
        <!-- Add your create transaction form here -->
        <?php
        
        ?>
       
    </div>
            
        <!-- Javascript Files, we've included JQuery here, feel free to use at your discretion. Add whatever else you may need here too.
            I only update the JQuery to the latest stable version. 
        -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script type="text/javascript" src="script.js"></script>

</body>
</html>
