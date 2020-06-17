
let callSpotify = (token) => {
    let baseurl = "https://api.spotify.com/v1/"
    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let filter = `${baseurl}audio-features/${testSongID}`
    
    $.ajax({
        url: filter,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then(parseData)

}

let parseData = (data) => {
    console.log(data);

}

let getToken = () => {
    let baseurl = "https://accounts.spotify.com/api/token"
    let encodedID = btoa(`${client_id}:${client_secret}`)
    console.log(encodedID);

    $.ajax({
        url: baseurl,
        type: "POST",
        data: {
            grant_type: 'client_credentials',
        },
        headers: {
            'Authorization': `Basic ${encodedID}`
        }
    }).then(callSpotify)

}

$(() => {
    getToken()


});



/*
Sources:
https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://stackoverflow.com/questions/45053624/convert-hex-to-binary-in-javascript

https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript

https://www.w3schools.com/jsref/met_win_btoa.asp
*/