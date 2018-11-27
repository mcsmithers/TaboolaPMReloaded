

<?php
/*
Example class to access Yahoo OAuth2 protected APIs, based on https://developer.yahoo.com/oauth2/guide/
Find documentation and support on Yahoo Developer Network: https://developer.yahoo.com/forums
*/
class YahooOAuth2
{
    const AUTHORIZATION_ENDPOINT  = 'https://api.login.yahoo.com/oauth2/request_auth';

    const TOKEN_ENDPOINT   = 'https://api.login.yahoo.com/oauth2/get_token';

    public function fetch($url, $postdata="", $auth="", $headers="")
    {
        $curl = curl_init($url);

        if ($postdata) {
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($postdata));
        } else {
            curl_setopt($curl, CURLOPT_POST, false);
        }

        if ($auth) {
            curl_setopt($curl, CURLOPT_USERPWD, $auth);
        }

        if ($headers) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        }

        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($curl);

        // TODO: Instead of killing the script, throw an error that can be handled downstream
        if (empty($response)) {
            // some kind of an error happened
            die(curl_error($curl));
            curl_close($curl); // close cURL handler
        } else {
            $info = curl_getinfo($curl);
            curl_close($curl); // close cURL handler

            if ($info['http_code'] != 200 && $info['http_code'] != 201) {
                echo "Received error: " . $info['http_code']. "\n";
                echo "Raw response:".$response."\n";
                die();
            }
        }

        return $response;
    }
  
    public function getAuthorizationURL($clientId, $redirectUri, $language="en-us")
    {
        return self::AUTHORIZATION_ENDPOINT . '?' . 'client_id=' . $clientId . '&redirect_uri=' . $redirectUri . '&language=' . $language . '&response_type=code';
    }
  
    public function getAccessTokenUsingAuthorizationCode($clientId, $clientSecret, $redirectUri, $code)
    {
        $url = self::TOKEN_ENDPOINT;

        $postdata = [
            "redirect_uri" => $redirectUri,
            "code" => $code,
            "grant_type" => "authorization_code",
        ];
        
        $auth = $clientId . ":" . $clientSecret;

        $response = self::fetch($url, $postdata, $auth);

        return json_decode($response);
    }

    public function getAccessTokenUsingRefreshToken($clientId, $clientSecret, $redirectUri, $refreshToken)
    {
        $url = self::TOKEN_ENDPOINT;

        $postdata = [
            "client_id" => $clientId,
            "client_secret" => $clientSecret,
            "redirect_uri" => $redirectUri,
            "refresh_token" => $refreshToken,
            "grant_type" => "refresh_token",
        ];

        $auth = $clientId . ":" . $clientSecret;

        $response = self::fetch($url, $postdata, $auth);

        return json_decode($response);
    }
}
?>