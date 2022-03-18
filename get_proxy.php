<?php
function getResponseHeaders($response, $header_size) {
    $header_str = substr($response, 0, $header_size);
    $headers = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $header_str));
    return $headers;
}
// function proxies an asynchronous request to the API
// curl library
function proxyRequest($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    $response = curl_exec($ch);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $headers = getResponseHeaders($response, $header_size);
    $body = substr($response, $header_size);
    foreach($headers as $hdr){
        if (strpos($hdr, "Set-Cookie") === 0){
            continue;
        }
        else {
            header($hdr);
        }
    }
    echo $body;
}
//Script body
if ($_GET['command']){
    $qs = $_SERVER['QUERY_STRING'];
    //enter api link bellow
    $api_url = "https://www.enteryourapihere.test/api?";
    if ($_GET['command'] == "Authenticate"){
        //enter partner name and password bellow
        $partnerName = "test";
        $partnerPassword = "test";
        $useExpensifyLogin = "false";
        $qs = $qs . "&partnerName=" . $partnerName . "&partnerPassword=" . $partnerPassword;
        //change "test" to you api name
        $qs = $qs . "&useTestLogin=" . $useTestLogin;
        $api_url = $api_url . $qs;
        proxyRequest($api_url);
    }
    else if ($_COOKIE['authToken']){
        $authToken = $_COOKIE['authToken'];
        $qs = $qs . "&authToken=" . $authToken;
        $api_url = $api_url . $qs;
        proxyRequest($api_url);
    }
}
?>
