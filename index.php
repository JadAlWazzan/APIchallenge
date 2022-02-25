<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Expensify Take-Home Challenge</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <div id="header">
        <a id="title" href="/">
            <h2><strong>Expensify</strong> - Jad's Edition</h2>
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

    <div id="transactionTable">
        <h1>Transactions:</h1>
        <table>

            <thead>
                <tr>
                    <th>Transaction Date</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                </tr>
            </thead>
 
            <tbody class="hide" id="transactionTableBody">
                <!-- Add the transaction rows here -->
                <?php
                require_once 'table.php';
                //require_once "transactions.php";
                ?>
            </tbody>
        </table>
    </div>
    <div id="transactionForm">
        <!-- Add your create transaction form here -->
        <?php
        require_once 'table.php';
        //require_once "add_transactions.php"
        ?>
       
    </div>
            
        <!-- Javascript Files, we've included JQuery here, feel free to use at your discretion. Add whatever else you may need here too.
            I only update the JQuery to the latest stable version. 
        -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script type="text/javascript" src="script.js"></script>

</body>
</html>
