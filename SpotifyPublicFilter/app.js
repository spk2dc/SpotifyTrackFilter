//gets a valid client credentials token from spotify for authentication purposes
let getBasicToken = (clientID, secretID, event) => {
    let baseurl = "https://accounts.spotify.com/api/token"
    let encodedID = btoa(`${clientID}:${secretID}`)
    console.log(`client: ${clientID} \nsecret: ${secretID} \nencoded: ${encodedID}`);

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
    }).then((token) => {
        console.log(`token:`, token);
        basicTokenMethods(token, event)
    })

}

//true main method of program, only operates if token is valid
let basicTokenMethods = (token, oldEvent) => {

    //listeners for search box and button
    $('#search-button').on('click', (event) => {
        event.preventDefault();
        searchUserInput(token)

    })
    $('#search-box').on('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#search-button').click();
        }
    })

    //listener for filter button
    $('#filter-button').on('click', (event) => {
        event.preventDefault();
        //disable filter button after clicked once so method has time to finish and it can't be spammed
        $('#filter-button').prop('disabled', true);

        runFilters(token)
        //re-enable filter button after all tracks have finished filtering
        $('#filter-button').prop('disabled', false)

    })

    //if apikeys already exist and user clicks search button without providing them, then go straight to executing search so don't have to click it twice when click event is reassigned
    if (oldEvent.currentTarget.id === 'search-button') {
        searchUserInput(token)
    }

}

//main search method, for when usere inputs normal text. searches the first 10 results for albums, artists, playlists, and tracks
let searchUserInput = (token) => {
    let baseurl = "https://api.spotify.com/v1/search"
    let queryStr = $('#search-box').val()
    let typeStr = encodeURIComponent('album,artist,playlist,track')
    let limit = 10
    let offset = 0
    let finalurl = `${baseurl}?q=${queryStr}&type=${typeStr}&limit=${limit}&offset=${offset}`

    $('#results-tables').empty()
    $('#filtered-table tbody').empty()
    $('#filtered-header-total').text('0')
    $('#track-analysis-table tbody').empty()

    //if user inputs a spotify url call different search function and end this function
    if (queryStr.includes('open.spotify.com')) {
        searchURL(token, queryStr)
        return;
    }
    queryStr = encodeURIComponent(queryStr)

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

    }).then((itemsObj) => {
        $('#results-tables').html(`
            <div id="albums-div">
                <div id="albums-header" class="sub-header">Albums</div>
                <div id="albums-results" class="results-div">
                    <table id="albums-table" class="results-table">
                        <thead class="results-thead">
                            <tr>
                                <th>Album Name</th>
                                <th>Artists</th>
                                <th>Release Date</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div id="artists-div">
                <div id="artists-header" class="sub-header">Artists</div>
                <div id="artists-results" class="results-div">
                    <table id="artists-table" class="results-table">
                        <thead class="results-thead">
                            <tr>
                                <th>Artist Name</th>
                                <th>Albums (3 most recent)</th>
                                <th>Followers</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div id="playlists-div">
                <div id="playlists-header" class="sub-header">Playlists</div>
                <div id="playlists-results" class="results-div">
                    <table id="playlists-table" class="results-table">
                        <thead class="results-thead">
                            <tr>
                                <th>Playlist Name</th>
                                <th>Owner</th>
                                <th>Total Tracks</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <div id="tracks-div">
                <div id="tracks-header" class="sub-header">Tracks</div>
                <div id="tracks-results" class="results-div">
                    <table id="tracks-table" class="results-table">
                        <thead class="results-thead">
                            <tr>
                                <th>Track Name</th>
                                <th>Artists</th>
                                <th>Duration (ms)</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `)

        displaySearchResults(token, itemsObj, limit)
    })
}

//separate search method for when user inputs a spotify URL
let searchURL = (token, queryStr) => {
    let baseurl = "https://api.spotify.com/v1"
    let queryURL = new URL(queryStr)
    let path = queryURL.pathname.split('/')
    let finalurl = `${baseurl}/${path[1]}s/${path[2]}`

    if (path[1] === 'artist') {
        finalurl += `/top-tracks?country=from_token`
    } else if (path[1] !== 'track') {
        finalurl += `/tracks`
    }

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${finalurl}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    $.ajax({
        type: "GET",
        url: finalurl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token.token_type} ${token.access_token}`,
        }

    }).then((itemsObj) => {
        // console.log(itemsObj);

        $('#results-tables').empty()
        $('#results-tables').html(`
            <div id="tracks-div">
                <div id="tracks-header" class="sub-header">Tracks</div>
                <div id="tracks-results" class="results-div">
                    <table id="tracks-table" class="results-table">
                        <thead class="results-thead">
                            <tr>
                                <th>Track Name</th>
                                <th>Artists</th>
                                <th>Duration (ms)</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `)

        for (let i = 0; i < itemsObj.items.length; i++) {
            displayOneTrack(itemsObj, i)
        }
    })
}

//display all search results using 1 loop and calling a separate display function on each item
let displaySearchResults = (token, itemsObj, limit) => {
    console.log(itemsObj);
    for (let i = 0; i < limit; i++) {
        displayOneAlbum(itemsObj, i)
        displayOneArtist(token, itemsObj, i)
        displayOnePlaylist(itemsObj, i)
        displayOneTrack(itemsObj, i)
    }
}

//display one album in the search results table
let displayOneAlbum = (itemsObj, i) => {
    $('#albums-header').text(`Albums (first ${itemsObj.albums.limit} out of ${itemsObj.albums.total} matches)`)
    let $album = $('<tr>').addClass('album-row').attr('id', itemsObj.albums.items[i].id)
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

//display one artist in the search results table
let displayOneArtist = (token, itemsObj, i) => {
    $('#artists-header').text(`Artists (first ${itemsObj.artists.limit} out of ${itemsObj.artists.total} matches)`)
    let $artist = $('<tr>').addClass(`artist-row r${i}`).attr('id', itemsObj.artists.items[i].id)
    let $artistLink = $('<a>').text('View in Spotify').attr('target', 'blank')

    $artist.append($('<td>').text(itemsObj.artists.items[i].name))

    //add placeholder cell to row
    $artist.append($('<td>').text('NULL'))
    //send another ajax request to set each artist's albums in the placeholder cell
    setOneArtistsAlbums(token, itemsObj, i)

    $artist.append($('<td>').text(itemsObj.artists.items[i].followers.total))
    $artistLink.attr('href', itemsObj.artists.items[i].external_urls.spotify)
    $artist.append($('<td>').append($artistLink))

    $('#artists-table').append($artist)
}

//need to make a separate ajax query to get the albums from an individual artist
let setOneArtistsAlbums = (token, itemsObj, i) => {
    let baseurl = `https://api.spotify.com/v1/artists/${itemsObj.artists.items[i].id}/albums`
    let groups = 'album,single'
    //limit to 3 albums so does not try to display too many in the table
    let limit = 3
    let offset = 0
    let finalurl = `${baseurl}?include_groups=${groups}&limit=${limit}&offset=${offset}`
    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${baseurl}?include_groups=${groups}&limit=${limit}&offset=${offset}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    $.ajax({
        type: "GET",
        url: finalurl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token.token_type} ${token.access_token}`,
        }

    }).then((artistsAlbums) => {
        // console.log(artistsAlbums);
        let allAlbums = ''
        for (const itr of artistsAlbums.items) {
            if (allAlbums.length < 1) {
                allAlbums = itr.name
            } else {
                allAlbums += ', ' + itr.name
            }
        }
        //select 2nd cell from current row in artists-table
        $(`#artists-table .r${i} td`).eq(1).text(allAlbums)
    })
}

//display one playlist in the search results table
let displayOnePlaylist = (itemsObj, i) => {
    $('#playlists-header').text(`Playlists (first ${itemsObj.playlists.limit} out of ${itemsObj.playlists.total} matches)`)
    let $playlist = $('<tr>').addClass('playlist-row').attr('id', itemsObj.playlists.items[i].id)
    let $playlistLink = $('<a>').text('View in Spotify').attr('target', 'blank')

    $playlist.append($('<td>').text(itemsObj.playlists.items[i].name))
    $playlist.append($('<td>').text(itemsObj.playlists.items[i].owner.display_name))
    $playlist.append($('<td>').text(itemsObj.playlists.items[i].tracks.total))
    $playlistLink.attr('href', itemsObj.playlists.items[i].external_urls.spotify)
    $playlist.append($('<td>').append($playlistLink))

    $('#playlists-table').append($playlist)
}

//display one track in the search results table
let displayOneTrack = (itemsObj, i) => {
    //if object contains multiple objects only select the track object, else it's only a track object so go straight to items    
    if ('tracks' in itemsObj) {
        $('#tracks-header').text(`Tracks (first ${itemsObj.tracks.limit} out of ${itemsObj.tracks.total} matches)`)
        oneItem = itemsObj.tracks.items[i]
    } else {
        $('#tracks-header').text(`Tracks (first ${itemsObj.items.length} out of ${itemsObj.items.length} matches)`)
        oneItem = itemsObj.items[i]
    }
    let $track = $('<tr>').addClass('track-row').attr('id', oneItem.id)
    let $trackLink = $('<a>').text('View in Spotify').attr('target', 'blank')
    let allArtists = ''
    $track.append($('<td>').text(oneItem.name))

    for (const itr of oneItem.artists) {
        if (allArtists.length < 1) {
            allArtists = itr.name
        } else {
            allArtists += ', ' + itr.name
        }
    }
    $track.append($('<td>').text(allArtists))
    $track.append($('<td>').text(oneItem.duration_ms))
    $trackLink.attr('href', oneItem.external_urls.spotify)
    $track.append($('<td>').append($trackLink))

    $('#tracks-table tbody').append($track)
}

//get audio feature values for a track
let getTrackAudioFeatures = (token, trackID, allFilteredTracks, boolAdd) => {
    let baseurl = "https://api.spotify.com/v1/audio-features"

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${baseurl}/${track}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    return $.ajax({
        url: `${baseurl}/${trackID}`,
        type: "GET",
        data: {

        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token.token_type} ${token.access_token}`
        }

    }).then((track) => {
        allFilteredTracks[trackID] = track
        if (boolAdd) {
            addFilteredResultsTrack(trackID, track)
        }
        return track
    })
}

//add track to filtered results if it meets all user input criteria
let addFilteredResultsTrack = (trackID, track) => {
    //names correspond to both spotify object keys and ids in various html input elements
    let filterNames = ['acousticness', 'danceability', 'duration_ms', 'energy', 'instrumentalness', 'liveness', 'loudness', 'speechiness', 'tempo', 'valence']
    //set default boolean to add track as true
    let addTrack = true

    filterNames.forEach((name) => {
        // console.log(`${name} is checked: ${$('#check-' + name).is(':checked')}`);
        if ($(`#check-${name}`).is(':checked')) {

            // console.log(`${name} above is : ${$('#radio-' + name + '-above').is(':checked')}`);
            // console.log(`${name} below is : ${$('#radio-' + name + '-below').is(':checked')}`);

            if ($(`#radio-${name}-above`).is(':checked')) {
                // console.log(`${track[name]} < ${$('#' + name).get(0).value}`);

                if (track[`${name}`] < $(`#${name}`).get(0).value) {
                    //if filter is checked and radio is set to above but track value is less than filter value then do not add track
                    addTrack = false
                }
            } else {
                // console.log(`${track[name]} < ${$('#' + name).get(0).value}`);

                if (track[`${name}`] > $(`#${name}`).get(0).value) {
                    //if filter is checked and radio is set to below but track value is greater than filter value then do not add track
                    addTrack = false
                }
            }
        }
    });

    if (addTrack) {
        //clone html row containing track to add. do not copy event handlers
        let $tr = $(`#${trackID}`).clone(false)
        //cannot have duplicate id's, must change new one
        $tr.attr('id', `filtered_${trackID}`)
        $('#filtered-table tbody').append($tr)
        //increase total number in header by 1
        let $total = $('#filtered-header-total')
        $total.text(parseInt($total.text(), 10) + 1)
    }
}

//add each track in search results table to filtered results table based on current filter settings
let runFilters = (token) => {
    //clear any filtered results that are already displayed
    $('#filtered-table tbody').empty()
    $('#filtered-header-total').text('0')

    if ($('#results-tables tbody').length < 1) {
        alert('Please search for tracks before filtering the results.')
        return;
    }

    //note that .get() does NOT return a jquery object like .eg() does. this is necessary to get the rows since they seem to only be accessible with vanilla javascript
    let rows = $('#results-tables tbody').get(0).rows
    let allFilteredTracks = {}
    let arrPromise = []

    for (let i = 0; i < rows.length; i++) {
        arrPromise[i] = getTrackAudioFeatures(token, rows[i].id, allFilteredTracks, true)
    }

    //when all tracks have finished getting audio features and being displayed then add click event
    Promise.allSettled(arrPromise).then((data) => {
        $('tbody').on('click', (event) => {
            displayAudioFeatures(event, allFilteredTracks)
        })
    })

}

//display all audio feature properties for the selected track
let displayAudioFeatures = (event, allFilteredTracks) => {
    //do not display if selected element is not a track row
    if (!event.target.parentElement.matches('tr.track-row')) {
        return;
    }
    
    let row = event.target.parentElement
    let trackID = row.id.split('_')[1]
    let $tbody = $('#track-analysis-table tbody')
    let $tdTrackName = $('<td>').text($(row).children().eq(0).text())
    let $tdArtist = $('<td>').text($(row).children().eq(1).text())
    let $trName = $('<tr>').append($('<td>').text('Track Name'), $tdTrackName)
    let $trArtist = $('<tr>').append($('<td>').text('Artist'), $tdArtist)

    $('.highlight-row').removeClass('highlight-row')
    $(row).addClass('highlight-row')
    $tbody.empty()
    $tbody.append($trName)
    $tbody.append($trArtist)

    for (const key in allFilteredTracks[trackID]) {
        let $tr = $('<tr>')
        $tr.append($('<td>').text(key))
        $tr.append($('<td>').text(allFilteredTracks[trackID][key]))
        $tbody.append($tr)
    }
}

$(() => {
    //scroll to the top of the page when page is reloaded
    $(window).scrollTop(0);

    let clientID = ''
    let secretID = ''

    //if client and secret ids already exist in environment variables then go straight to token method and reassign click event
    $('#search-button').on('click', (event) => {
        event.preventDefault();
        if (typeof (client_id) === 'string' && typeof (client_secret) === 'string') {
            clientID = client_id
            secretID = client_secret
            getBasicToken(clientID, secretID, event)
        }
    })
    $('#search-box').on('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#search-button').click();
        }
    })

    //if need to get client and secret ids from user then wait until they are entered and go to token method
    $('#apikeys').on('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            let userID = $('#apikeys').val().split(':')
            clientID = userID[0]
            secretID = userID[1]

            //get spotify authentication token before any other method can work
            getBasicToken(clientID, secretID, event)
        }
    })

});



/*
Sources:
https://developer.spotify.com/documentation/general/guides/authorization-guide/

https://developer.spotify.com/documentation/web-api/quick-start/

https://developer.spotify.com/dashboard/applications/6a9b462fe78344ec8fe04d1bd91409b1

https://developer.mozilla.org/en-US/

https://stackoverflow.com/

https://www.w3schools.com/

https://api.jquery.com/

https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript

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

https://stackoverflow.com/questions/901712/how-do-i-check-whether-a-checkbox-is-checked-in-jquery

https://stackoverflow.com/questions/42418925/prevent-click-event-for-two-seconds

https://davidwalsh.name/event-delegate

https://stackoverflow.com/questions/3664381/force-page-scroll-position-to-top-at-page-refresh-in-html

*/