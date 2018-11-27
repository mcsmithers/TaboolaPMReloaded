<?php
/* Access Gemini API: Fetch advertiser information, create a job id and read performance data*/

require "YahooOAuth2.class.php"; #Download here: https://github.com/saurabhsahni/php-yahoo-oauth2/

/*Yahoo API consumer key & secret with access to Gemini data */

// // // // Prod env
// define("CONSUMER_KEY","dj0yJmk9RkVLa3BYbnoxNDNDJmQ9WVdrOWFuQlJibE56TjJrbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD03Ng--");
// define("CONSUMER_SECRET","3ff9f361c62a687c96003bc1febe80294a0c180a");

// $redirect_uri="https://tapstone.com/tools/HONeY/getGeminiRequest.php";//must match the callback domain 


// Dev env
define("CONSUMER_KEY","dj0yJmk9ZzVMQTdSWmw4SEI0JmQ9WVdrOU1sRXhaMUJOTlRnbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD04OA--");
define("CONSUMER_SECRET","33d405c40cdb8d8e1711f28c6716f9f6074c5bdc");

// Dev
$redirect_uri="https://local.tapstone.com/tools/HONeY/getGeminiRequest.php";//must match the callback domain 

// // Prod
// $redirect_uri="https://tapstone.com/tools/HONeY/getGeminiRequest.php";//must match the callback domain 


$gemini_api_endpoint="https://api.gemini.yahoo.com/v3/rest";

$oauth2client=new YahooOAuth2();

//we need to get a code passed in so we can get the access and refresh tokens
if (isset($_GET['code'])){
	$code=$_GET['code'];	
} 
else {
	$code=0;
}

if($code){
	 #oAuth 3-legged authorization is successful, fetch access token 	
	//  $refresh_token=$oauth2client->get_refresh_token(CONSUMER_KEY,CONSUMER_SECRET,$redirect_uri,$code);
	 $access_token=$oauth2client->get_access_token(CONSUMER_KEY,CONSUMER_SECRET,$redirect_uri,$code);

	// $refresh_cookie_name = "RefreshTokenCookie";
	// $refresh_cookie_value = $refresh_token;
	// setcookie($refresh_cookie_name, $refresh_cookie_value, time() + (86400 * 180), "/"); // 86400 = 1 day

	$access_cookie_name = "AccessTokenCookie";
	$access_cookie_value = $access_token;
	// $access_cookie_value = $jsonResponse;
	// setcookie($access_cookie_name, $access_cookie_value, time() + (3600), "/"); // 86400 = 1 day

	if(!isset($_COOKIE[$access_cookie_name])) {
		echo "Cookie named '" . $access_cookie_name . "' is not set!";
		json_encode($access_token);
		json_encode($jsonResponse);
		setcookie($access_cookie_name, $access_cookie_value, time() + (3600), "/"); 
		// // Prod
		header("Location: https://tapstone.com/tools/HONeY/"); /* Redirect browser */
		// // Dev
		// header("Location: https://local.tapstone.com"); /* Redirect browser */
		// 86400 = 1 day
	} else {
		json_encode($access_token);
		json_encode($jsonResponse);
		echo "Cookie '" . $access_cookie_name . "' is set!<br>";
		// echo "Cookie '" . $refresh_cookie_name . "' is set!<br>";

		echo "Value is: " . $_COOKIE[$access_cookie_name];
		// echo "Value is: " . $_COOKIE[$refresh_cookie_name];
		// // Dev
		// header("Location: https://local.tapstone.com"); /* Redirect browser */
		// // Prod
		header("Location: https://tapstone.com/tools/HONeY/"); /* Redirect browser */
		exit();
		
	}
}
else {
    /* no valid access token available, go to authorization server */
    header("HTTP/1.1 302 Found");
    header("Location: " . $oauth2client->getAuthorizationURL(CONSUMER_KEY,$redirect_uri));
    exit;
}

?>
