let getBasicToken = () => {
    let baseurl = "https://accounts.spotify.com/api/token"
    let encodedID = btoa(`${client_id}:${client_secret}`)

    let token = {}

    $.ajax({
        url: baseurl,
        type: "POST",
        data: {
            grant_type: 'client_credentials',
        },
        headers: {
            'Authorization': `Basic ${encodedID}`
        }
    }).then(basicTokenMethods)

}

let basicTokenMethods = (token) => {
    let baseurl = "https://api.spotify.com/v1/"
    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let filter = `${baseurl}audio-features/${testSongID}`

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${filter}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    $.ajax({
        url: filter,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then((data) => {
        console.log(data);

    })

    $('#search-box').on('keypress', () => {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            //event.preventDefault();
            // Trigger the button element with a click
            $('#search-button').click();
        }
    })
    $('#search-button').on('click', (event) => {
        event.preventDefault();
        console.log(token);

        searchPlaylists(token)

    })

}

let searchPlaylists = (token) => {
    let baseurl = "https://api.spotify.com/v1/search"
    let queryStr = encodeURIComponent($('#search-box').val())
    let typeStr = encodeURIComponent('playlist,album')
    let limit = 10
    let offset = 0
    let finalurl = `${baseurl}?q=${queryStr}&type=${typeStr}&limit=${limit}&offset=${offset}`
    
    //log below is for testing ajax query using command prompt
    //console.log(`curl -X "GET" "${baseurl}?q=${queryStr}&type=${typeStr}&limit=10&offset=5" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);
    

    $.ajax({
        type: "GET",
        url: finalurl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token.token_type} ${token.access_token}`,
        }

    }).then((data) => {
        console.log(data)
    })
}

let filter = (token) => {

}

let currentTrack = (token) => {

}

$(() => {
    getBasicToken()


});



/*
Sources:
https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://developer.spotify.com/documentation/web-api/quick-start/

https://developer.spotify.com/dashboard/applications/6a9b462fe78344ec8fe04d1bd91409b1

https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript

https://www.w3schools.com/jsref/met_win_btoa.asp

https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js

https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

https://stackoverflow.com/questions/4293495/javascript-redirect-to-dynamically-created-html

https://designmodo.com/css-graph-chart-tutorials/

http://www.cssbakery.com/2009/06/data-visualisation-flexible-bar-graphs.html

https://towardsdatascience.com/step-by-step-to-visualize-music-genres-with-spotify-api-ce6c273fb827

https://stackoverflow.com/questions/41224070/spotify-javascript-api-getting-the-genre-of-a-song-in-a-playlist

https://github.com/watsonbox/exportify

https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp

*/