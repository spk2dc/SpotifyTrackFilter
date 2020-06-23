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
        $('#apikeys').css('background', 'rgb(155, 255, 155)')
        basicTokenMethods(token, event)
    })

}

//true main method of program, only operates if token is valid
let basicTokenMethods = (token, oldEvent) => {
    // console.log('authenticated main method event trigger: ', oldEvent);

    //listeners for search box and button
    $('#search-button').on('click', (event) => {
        event.preventDefault();
        // console.log('authenticated click listener', event);

        searchUserInput(token)

    })
    $('#search-box').on('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            // console.log('authenticated keypress listener', event);
            $('#search-button').click();
        }
    })

    //object to contain current data for all tracks that have been analyzed since authentication for quicker retrieval and display
    let allFilteredTracks = {}
    //if any row is clicked within a table tbody, display an audio analysis if possible
    $('tbody').on('click', (event) => {
        displayAudioFeatures(token, event, allFilteredTracks)
    })
    //listener for filter button
    $('#filter-button').on('click', (event) => {
        // console.log('filter listener ', event);

        event.preventDefault();
        //disable filter button after clicked once so method has time to finish and it can't be spammed
        $('#filter-button').prop('disabled', true);

        runFilters(token, allFilteredTracks)
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

    clearAndHideTables()

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

    clearAndHideTables()

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

        $('#results-tables tbody').empty()
        $('#results-tables').show()

        for (let i = 0; i < itemsObj.items.length; i++) {
            displayOneTrack(itemsObj, i)
        }
    })
}

//display all search results using 1 loop and calling a separate display function on each item
let displaySearchResults = (token, itemsObj, limit) => {
    // console.log(itemsObj);
    $('#results-tables').show()
    for (let i = 0; i < limit; i++) {
        displayOneAlbum(itemsObj, i)
        displayOneArtist(token, itemsObj, i)
        displayOnePlaylist(itemsObj, i)
        displayOneTrack(itemsObj, i)
    }
}

//display one album in the search results table
let displayOneAlbum = (itemsObj, i) => {
    $('#albums-div').show()
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
    $('#artists-div').show()
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
    $('#playlists-div').show()
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
    $('#tracks-div').show()
    let oneItem = {}
    //if object contains multiple items select the tracks object then the track item. if object is a playlist select item object then track object. else it's only a track object so go straight to items    
    if (itemsObj.hasOwnProperty('tracks')) {
        $('#tracks-header').text(`Tracks (first ${itemsObj.tracks.limit} out of ${itemsObj.tracks.total} matches)`)
        oneItem = itemsObj.tracks.items[i]
    } else if (itemsObj.href.includes('playlists')) {
        $('#tracks-header').text(`Tracks (first ${itemsObj.limit} out of ${itemsObj.total} matches)`)
        oneItem = itemsObj.items[i].track
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

//get audio feature values for a track. allFilteredTracks argument is an object to store all the data in and boolAdd is a boolean to specify whether the track should be added to the filtered results table or not.
let getTrackAudioFeatures = (token, trackID, allFilteredTracks, boolAdd) => {
    let baseurl = "https://api.spotify.com/v1/audio-features"

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${baseurl}/${trackID}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

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
        //cannot have duplicate id's, must change new one. remove highlighting in case original row is highlighted.
        $tr.attr('id', `filtered_${trackID}`)
        $tr.removeClass('highlight-row')
        $('#filtered-table tbody').append($tr)
        //increase total number in header by 1
        let $total = $('#filtered-header-total')
        $total.text(parseInt($total.text(), 10) + 1)
    }
}

//add each track in search results table to filtered results table based on current filter settings
let runFilters = (token, allFilteredTracks) => {
    //clear any filtered results that are already displayed
    $('#filtered-table').show()
    $('#filtered-table tbody').empty()
    $('#filtered-header-total').text('0')

    if ($('#results-tables .track-row').length < 1) {
        alert('Please search for tracks before filtering the results.')
        return;
    }

    //note that .get() does NOT return a jquery object like .eg() does. this is necessary to get the rows since they seem to only be accessible with vanilla javascript
    let rows = $('#tracks-table tbody').get(0).rows
    // console.log(`running filters method on: `, rows);

    for (let i = 0; i < rows.length; i++) {
        getTrackAudioFeatures(token, rows[i].id, allFilteredTracks, true)
    }

}

//display all audio feature properties for the selected track
let displayAudioFeatures = (token, event, allFilteredTracks) => {
    //do not display if selected element is not a track row
    if (!event.target.parentElement.matches('tr.track-row')) {
        return;
    }

    let row = event.target.parentElement

    //if row id does not start with 'filtered_' then it is from the search results so use the row id value. the length of the split will be 1 in this case. if the length is 2 then it is a filtered row so use the split's 2nd value. if none of these lengths then an unusual row id exists so end the method for security.
    let trackID = row.id.split('_')[0]
    switch (row.id.split('_').length) {
        case 1:
            trackID = row.id
            break;
        case 2:
            trackID = row.id.split('_')[1]
            break;
        default:
            return;
    }

    let $tbody = $('#track-analysis-table tbody')
    let $tdTrackName = $('<td>').text($(row).children().eq(0).text())
    let $tdArtist = $('<td>').text($(row).children().eq(1).text())
    let $trName = $('<tr>').append($('<td>').text('Track Name'), $tdTrackName)
    let $trArtist = $('<tr>').append($('<td>').text('Artist'), $tdArtist)

    $('#track-analysis-table').show()
    $('.highlight-row').removeClass('highlight-row')
    $(row).addClass('highlight-row')
    $tbody.empty()
    $tbody.append($trName)
    $tbody.append($trArtist)

    let arrPromise = []
    //default promise array to contain a resolved promise so if you do not need to run a query then you can just display the preexisting audio analysis
    arrPromise[0] = Promise.resolve(true)

    //if audio analysis data does not exist yet, run query to get it
    if (!allFilteredTracks.hasOwnProperty(trackID)) {
        //send false for add argument so track is not added to filtered results
        arrPromise[1] = getTrackAudioFeatures(token, trackID, allFilteredTracks, false)
    }

    //when promises are all resolved then add to track analysis table
    Promise.allSettled(arrPromise).then((data) => {
        //add all audio data to track analysis table
        for (const key in allFilteredTracks[trackID]) {
            let $tr = $('<tr>')
            $tr.append($('<td>').text(key))
            $tr.append($('<td>').text(allFilteredTracks[trackID][key]))
            $tbody.append($tr)
        }
    })
}

//clears data from all tables and then hides each emptied table
let clearAndHideTables = () => {
    //search results
    $('#results-tables tbody').empty()
    $('#results-tables').hide()
    //hide each direct child div (not all divs) in the results table as well, so only divs with data will be displayed on next search
    $('#results-tables > div').hide()

    //filtered results
    $('#filtered-table tbody').empty()
    $('#filtered-table').hide()
    $('#filtered-header-total').text('0')

    //track analysis results
    $('#track-analysis-table tbody').empty()
    $('#track-analysis-table').hide()
}

//window onload method that sets initial event listeners to authenticate token so API can be used before any other methods can be called
$(() => {
    //scroll to the top of the page when page is reloaded. need to scroll to the top before the page is reloaded as well since chrome still remembers the scroll position.
    $(window).scrollTop(0);
    $(window).on('beforeunload', () => {
        $(window).scrollTop(0);
    });

    let clientID = ''
    let secretID = ''

    //if client and secret ids already exist in environment variables then go straight to token method and reassign click event
    $('#search-button').on('click', '', (event) => {
        event.preventDefault();
        if (typeof (client_id) === 'string' && typeof (client_secret) === 'string') {
            clientID = client_id
            secretID = client_secret
            //remove click/keypress events for search so these first event listeners only run the token authentication method once
            $('#search-button').off('click', '')
            $('#search-box').off('keypress', '')
            // console.log('initial click listener', $(this));

            getBasicToken(clientID, secretID, event)
        }
    })
    $('#search-box').on('keypress', '', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            // console.log('initial keypress listener', $(this));
            $('#search-button').click();

            //remove click/keypress events for search so these first event listeners only run the token authentication method once
            $('#search-button').off('click', '')
            $('#search-box').off('keypress', '')
        }
    })

    //if need to get client and secret ids from user then wait until they are entered and go to token method
    $('#apikeys').on('keypress', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            let userID = $('#apikeys').val().split(':')
            clientID = userID[0]
            secretID = userID[1]
            console.log($(this));

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