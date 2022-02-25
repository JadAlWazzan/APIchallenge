<div id="login_con">
    <form id="login_form" action="get_proxy.php">
        <input type="hidden" name="command" value="Authenticate" />
        <table>
            <tr>
                <td>
                    <input required type="text" name="partnerUserID" placeholder="Username" />
                </td>
            </tr>
            <tr>
                <td>
                    <input required type="password" name="partnerUserSecret" placeholder="Password"/>
                </td>
            </tr>
            <tr>
                <td>
                    <button type="submit">Login</button>
                </td>
            </tr>
            <tr>
                <td>
                    <span id="message"></span>
                </td>
            </tr>
        </table>
    </form>
</div>
