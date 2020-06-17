
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

    }).then(parseData)

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

let parseData = (data) => {
    console.log(data);

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
    let encodedID = btoa(`${client_id}:${client_secret}`)

    console.log(`user client: ${client_id}`);
    

    $.ajax({
        url: baseurl,
        type: "GET",
        client_id: client_id,
        response_type: 'code',
        redirect_uri: 'https://spk2dc.github.io/SpotifyPlaylist/',
        scope: 'user-read-private user-read-email user-library-modify playlist-read-collaborative playlist-modify-public playlist-modify-private'
        
    }).then(userTokenMethods)

}

$(() => {
    getBasicToken()
    getUserToken()

});



/*
Sources:
https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://stackoverflow.com/questions/45053624/convert-hex-to-binary-in-javascript

https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript

https://www.w3schools.com/jsref/met_win_btoa.asp
*/