let getBasicToken = () => {
    let baseurl = "https://accounts.spotify.com/api/token"
    let encodedID = btoa(`${client_id}:${client_secret}`)

    //log below is for testing ajax query using command prompt
    //console.log(`curl -X "POST" -H "Authorization: Basic ${encodedID}" -d grant_type=client_credentials ${baseurl}`);

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

    $('#search-box').on('keypress', () => {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            $('#search-button').click();
        }
    })
    $('#search-button').on('click', (event) => {
        event.preventDefault();
        searchPlaylists(token)

    })

}

let searchPlaylists = (token) => {
    let baseurl = "https://api.spotify.com/v1/search"
    let queryStr = encodeURIComponent($('#search-box').val())
    let typeStr = encodeURIComponent('album,artist,playlist,track')
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

    }).then(displaySearchResults)
}

let displaySearchResults = (itemsObj) => {
    console.log(itemsObj);



    for (let i = 0; i < 10; i++) {

        displayOneAlbum(itemsObj, i)
        displayOneArtist(itemsObj, i)
        displayOnePlaylist(itemsObj, i)
        displayOneTrack(itemsObj, i)

    }

}

let displayOneAlbum = (itemsObj, i) => {
    $('#albums-header').text(`Albums (first ${itemsObj.albums.limit} out of ${itemsObj.albums.total} matches)`)
    let $album = $('<tr>').addClass('album-row')
    let $albumLink = $('<a>').text('View in Spotify').attr('target', 'blank')
    let allArtists = ''

    $album.append($('<td>').text(itemsObj.albums.items[i].name))

    for (const itr of itemsObj.albums.items[i].artists) {
        if (allArtists.length < 1) {
            allArtists = itr.name
        } else {
            allArtists += ', ' + itr.name
        }
    }
    $album.append($('<td>').text(allArtists))
    $album.append($('<td>').text(itemsObj.albums.items[i].release_date))
    $albumLink.attr('href', itemsObj.albums.items[i].external_urls.spotify)
    $album.append($('<td>').append($albumLink))

    $('#albums-table').append($album)
}

let displayOneArtist = (itemsObj, i) => {
    $('#artists-header').text(`Artists (first ${itemsObj.artists.limit} out of ${itemsObj.artists.total} matches)`)
    let $artist = $('<tr>').addClass('artist-row')
    let $artistLink = $('<a>').text('View in Spotify').attr('target', 'blank')

    $artist.append($('<td>').text(itemsObj.artists.items[i].name))
    $artist.append($('<td>').text('empty'))
    $artist.append($('<td>').text(itemsObj.artists.items[i].followers.total))
    $artistLink.attr('href', itemsObj.artists.items[i].external_urls.spotify)
    $artist.append($('<td>').append($artistLink))

    $('#artists-table').append($artist)
}

let displayOnePlaylist = (itemsObj, i) => {
    $('#playlists-header').text(`Playlists (first ${itemsObj.playlists.limit} out of ${itemsObj.playlists.total} matches)`)
    let $playlist = $('<tr>').addClass('playlist-row')
    let $playlistLink = $('<a>').text('View in Spotify').attr('target', 'blank')

    $playlist.append($('<td>').text(itemsObj.playlists.items[i].name))
    $playlist.append($('<td>').text(itemsObj.playlists.items[i].owner.display_name))
    $playlist.append($('<td>').text(itemsObj.playlists.items[i].tracks.total))
    $playlistLink.attr('href', itemsObj.playlists.items[i].external_urls.spotify)
    $playlist.append($('<td>').append($playlistLink))

    $('#playlists-table').append($playlist)
}

let displayOneTrack = (itemsObj, i) => {
    $('#tracks-header').text(`Tracks (first ${itemsObj.tracks.limit} out of ${itemsObj.tracks.total} matches)`)
    let $track = $('<tr>').addClass('track-row')
    let $trackLink = $('<a>').text('View in Spotify').attr('target', 'blank')
    let allArtists = ''

    $track.append($('<td>').text(itemsObj.tracks.items[i].name))

    for (const itr of itemsObj.tracks.items[i].artists) {
        if (allArtists.length < 1) {
            allArtists = itr.name
        } else {
            allArtists += ', ' + itr.name
        }
    }
    $track.append($('<td>').text(allArtists))
    $track.append($('<td>').text(itemsObj.tracks.items[i].album.name))
    $trackLink.attr('href', itemsObj.tracks.items[i].external_urls.spotify)
    $track.append($('<td>').append($trackLink))

    $('#tracks-table').append($track)
}

let audioAnalysis = (token) => {
    let baseurl = "https://api.spotify.com/v1/"
    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let finalurl = `${baseurl}audio-features/${testSongID}`

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${filter}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    $.ajax({
        url: finalurl,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then((data) => {
        console.log(data);

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

https://freebiesbug.com/code-stuff/spotify-ui-html-css/

https://jsonformatter.org/scss-to-css

*/