
let basicTokenMethods = (token) => {
    let baseurl = "https://api.spotify.com/v1/"
    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let filter = `${baseurl}audio-features/${testSongID}`
    console.log(token);


    $.ajax({
        url: filter,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then((data) => {
        console.log(data)
    })

}

let userTokenMethods = (token) => {
    let baseurl = "https://api.spotify.com/v1/"
    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let filter = `${baseurl}audio-features/${testSongID}`
    console.log(`user: ${token}`);


    $.ajax({
        url: filter,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then((data) => {
        console.log(data)
    })

}

let userInfo = (token) => {

}

let userPlaylists = (token) => {

}

let searchPlaylists = (token) => {

}

let filterPlaylists = (token) => {

}

let addPlaylist = (token) => {

}

let currentTrack = (token) => {

}

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

let getUserToken = () => {
    let baseurl = "https://accounts.spotify.com/authorize"
    let redirect = "https://spk2dc.github.io/SpotifyPlaylist/"
    let permissions = "user-read-private user-read-email user-library-modify playlist-read-collaborative playlist-modify-public playlist-modify-private"
    let str = `GET ${baseurl}?client_id=${client_id}&response_type=code&redirect_uri=${redirect}&scope=${permissions}`

    console.log(`cmd: ${str}`);


    $.ajax({
        //this website fixes the CORS no Access-Control-Allow-Origin header issue. Works for now but might need to create my own proxy server with Express.js for final solution
        url: `https://cors-anywhere.herokuapp.com/${baseurl}`,
        type: "GET",
        client_id: client_id,
        response_type: 'code',
        redirect_uri: redirect,
        scope: permissions,
        // headers: {
        //     'Access-Control-Allow-Origin': '*'
        // }

    }).then((data) => {
        console.log(data);

        var win = window.open("") //open new window and write to it

        win.document.write(data)
        // win.document.close();
        //userTokenMethods(data)
    })

}

$(() => {
    getBasicToken()
    getUserToken()

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

*/