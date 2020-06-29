/*****************************************************************/
/******************** AUTHENTICATION METHODS *********************/
/*****************************************************************/

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
        //turn off initial search handler method to prevent duplicate requests and methods from runnings
        initialSearchHandler({ data: { boolOff: true, tokenExists: true } })
        basicTokenMethods(token, event)
    })

}

//true main method of program, only operates if token is valid
let basicTokenMethods = (token, oldEvent) => {
    // console.log('authenticated main method event trigger: ', oldEvent);

    //object to contain current data for all tracks that have been analyzed since authentication for quicker retrieval and display
    let allSearchResults = new Map()

    //listeners for search box and button
    $('#search-button').on('click', { boolOff: true, tokenExists: true }, (event) => {
        event.preventDefault();
        // console.log('authenticated click listener', event);

        //disable search button after clicked once so method has time to finish and it can't be spammed
        $('#search-button').prop('disabled', true);
        $('#search-box').prop('disabled', true);

        searchUserInput(token, allSearchResults)
    })
    $('#search-box').on('keypress', { boolOff: true, tokenExists: true }, (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            // console.log('authenticated keypress listener', event);

            //disable search button after clicked once so method has time to finish and it can't be spammed
            $('#search-button').prop('disabled', true);
            $('#search-box').prop('disabled', true);

            searchUserInput(token, allSearchResults)
        }
    })

    //if any row is clicked within a table tbody, display an audio analysis if possible
    $('tbody').on('click', (event) => {
        displayAudioFeatures(token, event, allSearchResults)
    })
    //listener for filter button
    $('#filter-button').on('click', (event) => {
        // console.log('filter listener ', event);

        event.preventDefault();
        //disable filter button after clicked once so method has time to finish and it can't be spammed
        $('#filter-button').prop('disabled', true);

        runFilters(token, allSearchResults)
    })

    //if apikeys already exist and user clicks search button without providing them, then go straight to executing search so don't have to click it twice when click event is reassigned
    if (oldEvent.currentTarget.id === 'search-button' || (oldEvent.currentTarget.id === 'search-box' && oldEvent.keyCode === 13)) {
        //disable search button after clicked once so method has time to finish and it can't be spammed
        $('#search-button').prop('disabled', true);
        $('#search-box').prop('disabled', true);

        searchUserInput(token, allSearchResults)
    }
}

/*****************************************************************/
/******************** AUTHENTICATION METHODS *********************/
/*****************************************************************/

/*****************************************************************/
/************************ SEARCH METHODS *************************/
/*****************************************************************/

//main search method, for when usere inputs normal text. searches the first 10 results for albums, artists, playlists, and tracks
let searchUserInput = (token, allSearchResults) => {
    let baseurl = "https://api.spotify.com/v1/search"
    let queryStr = $('#search-box').val()
    let typeStr = encodeURIComponent('album,artist,playlist,track')
    let limit = 10
    let offset = 0
    let finalurl = `${baseurl}?q=${queryStr}&type=${typeStr}&limit=${limit}&offset=${offset}`

    //clear and hide all data tables
    clearAndHideTables()
    //clear any stored search results data from map. note cannot instantiate a new map because of reference issues with other methods calling the map created in the token method.
    allSearchResults.clear()

    //if user inputs a spotify url call different search function and end this function
    if (queryStr.includes('open.spotify.com')) {
        searchURL(token, queryStr, allSearchResults)
        return;
    }
    queryStr = encodeURIComponent(queryStr)

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${baseurl}?q=${queryStr}&type=${typeStr}&limit=10&offset=5" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);


    $.ajax({
        type: "GET",
        url: finalurl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${token.token_type} ${token.access_token}`,
        }

    }).then((itemsObj) => {
        displaySearchResults(token, itemsObj, allSearchResults)

        //reenable searching once previous search is finished
        $('#search-button').prop('disabled', false);
        $('#search-box').prop('disabled', false);
    })
}

//separate search method for when user inputs a spotify URL
let searchURL = (token, queryStr, allSearchResults) => {
    let baseurl = "https://api.spotify.com/v1"
    let queryURL = new URL(queryStr)
    let path = queryURL.pathname.split('/')
    let finalurl = `${baseurl}/${path[1]}s/${path[2]}`

    if (path[1] === 'v1') {
        //if v1 exists in url then it is an automatic recursive call from this method to get the next set of items until it reaches the total 
        finalurl = queryStr
    } else if (path[1] === 'artist') {
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
        $('#results-tables').show()
        $('#tracks-header').text(`Tracks (total ${itemsObj.total})`)

        for (let i = 0; i < itemsObj.items.length; i++) {
            displayOneTrack(itemsObj, i, allSearchResults)
        }

        //if a next exists in the list of results, recursively call this method until that is not the case
        if (itemsObj.next != null) {
            searchURL(token, itemsObj.next, allSearchResults)
        }

        //reenable searching once previous search is finished
        $('#search-button').prop('disabled', false);
        $('#search-box').prop('disabled', false);
    })
}

/*****************************************************************/
/************************ SEARCH METHODS *************************/
/*****************************************************************/

/*****************************************************************/
/************************ DISPLAY METHODS ************************/
/*****************************************************************/

//display all search results using 1 loop and calling a separate display function on each item
let displaySearchResults = (token, itemsObj, allSearchResults) => {
    // console.log(itemsObj);

    //show tables and set totals in headers
    $('#results-tables').show()
    $('#albums-header').text(`Albums (first ${itemsObj.albums.limit} out of ${itemsObj.albums.total} matches)`)
    $('#artists-header').text(`Artists (first ${itemsObj.artists.limit} out of ${itemsObj.artists.total} matches)`)
    $('#playlists-header').text(`Playlists (first ${itemsObj.playlists.limit} out of ${itemsObj.playlists.total} matches)`)
    $('#tracks-header').text(`Tracks (first ${itemsObj.tracks.limit} out of ${itemsObj.tracks.total} matches)`)

    //loop through and display all items
    for (let i = 0; i < itemsObj.tracks.limit; i++) {
        displayOneAlbum(itemsObj, i)
        displayOneArtist(token, itemsObj, i)
        displayOnePlaylist(itemsObj, i)
        displayOneTrack(itemsObj, i, allSearchResults)
    }
}

//display one album in the search results table
let displayOneAlbum = (itemsObj, i) => {
    //if there are less items then the limit specified and you try to access one that does not exist, end the function
    if (i >= itemsObj.albums.items.length) {
        $('#albums-header').text(`Albums (first ${itemsObj.albums.items.length} out of ${itemsObj.albums.items.length} matches)`)
        return;
    }

    $('#albums-div').show()
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
    //if there are less items then the limit specified and you try to access one that does not exist, end the function
    if (i >= itemsObj.artists.items.length) {
        $('#artists-header').text(`Artists (first ${itemsObj.artists.items.length} out of ${itemsObj.artists.items.length} matches)`)
        return;
    }

    $('#artists-div').show()
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
    //if there are less items then the limit specified and you try to access one that does not exist, end the function
    if (i >= itemsObj.playlists.items.length) {
        $('#playlists-header').text(`Playlists (first ${itemsObj.playlists.items.length} out of ${itemsObj.playlists.items.length} matches)`)
        return;
    }

    $('#playlists-div').show()
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
let displayOneTrack = (itemsObj, i, allSearchResults) => {
    $('#tracks-div').show()
    let oneItem = {}
    let length = 0

    //if object contains multiple items select the tracks object then the track item. if object is a playlist select item object then track object. else it's only a track object so go straight to items    
    if (itemsObj.hasOwnProperty('tracks')) {
        length = itemsObj.tracks.items.length
        oneItem = itemsObj.tracks.items[i]
    } else if (itemsObj.href.includes('playlists')) {
        length = itemsObj.items.length
        oneItem = itemsObj.items[i].track
    } else {
        length = itemsObj.items.length
        oneItem = itemsObj.items[i]
    }

    //if there are less items then the limit specified and you try to access one that does not exist, end the function
    if (i >= length) {
        $('#tracks-header').text(`Tracks (first ${length} out of ${length} matches)`)
        return;
    }

    let $track = $('<tr>').addClass('track-row').attr('id', oneItem.id)
    let $trackLink = $('<a>').text('View in Spotify').attr('target', 'blank')
    let allArtists = ''

    for (const itr of oneItem.artists) {
        if (allArtists.length < 1) {
            allArtists = itr.name
        } else {
            allArtists += ', ' + itr.name
        }
    }
    $track.append($('<td>').text(oneItem.name))
    $track.append($('<td>').text(allArtists))
    $track.append($('<td>').text(oneItem.duration_ms))
    $trackLink.attr('href', oneItem.external_urls.spotify)
    $track.append($('<td>').append($trackLink))

    $('#tracks-table tbody').append($track)

    allSearchResults.set(oneItem.id, {})
    allSearchResults.get(oneItem.id)['type'] = 'track'
    allSearchResults.get(oneItem.id)['name'] = oneItem.name
    allSearchResults.get(oneItem.id)['allArtists'] = allArtists
    allSearchResults.get(oneItem.id)['duration'] = oneItem.duration_ms
    allSearchResults.get(oneItem.id)['link'] = oneItem.external_urls.spotify
}

/*****************************************************************/
/************************ DISPLAY METHODS ************************/
/*****************************************************************/

/*****************************************************************/
/************************ FILTER METHODS *************************/
/*****************************************************************/

//get audio feature values for all tracks in allSearchResults map object where data is stored. boolAdd is a boolean to specify whether the tracks should be added to the filtered results table or not. trackID is an optional argument that indicates only 1 specific track's audio analysis is needed.
let getTrackAudioFeatures = (token, allSearchResults, boolAdd, trackID) => {
    let baseurl = "https://api.spotify.com/v1/audio-features"

    //get list of all keys in map and covert to an array
    let idsArr = Array.from(allSearchResults.keys())
    let idsList = ''

    //log below is for testing ajax query using command prompt
    // console.log(`curl -X "GET" "${baseurl}/?ids=${idsList}" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: ${token.token_type} ${token.access_token}"`);

    let arrPromise = []
    let i = 0
    //keep sending queries to get audio feature data until array of ids is empty and all search results have data
    do {
        //remove first 100 array elements and join into a string separating ids with a comma. limit the list to 100 items because of api query restrictions.
        if (idsArr.length >= 100) {
            idsList = idsArr.splice(0, 100).join(',')
        } else {
            idsList = idsArr.splice(0, idsArr.length).join(',')
        }

        //if a specific track id is passed in only run the query for that track instead of the entire array
        if (typeof trackID !== 'undefined') {
            idsArr.length = 0
            idsList = trackID
        }
        
        arrPromise[i] = $.ajax({
            url: `${baseurl}/?ids=${idsList}`,
            type: "GET",
            data: {

            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${token.token_type} ${token.access_token}`
            }

        }).then((tracks) => {
            // console.log(tracks);

            for (const itr of tracks.audio_features) {
                allSearchResults.get(itr.id)['audioFeatures'] = itr

                if (boolAdd) {
                    addFilteredResultsTrack(itr.id, allSearchResults)
                }
            }

            return tracks
        })

        i++
    } while (idsArr.length > 0);
    return arrPromise
}

//add track to filtered results if it meets all user input criteria
let addFilteredResultsTrack = (trackID, allSearchResults) => {
    //names correspond to both spotify object keys and ids in various html input elements
    let filterNames = ['acousticness', 'danceability', 'duration_ms', 'energy', 'instrumentalness', 'liveness', 'loudness', 'speechiness', 'tempo', 'valence']
    //set default boolean to add track as true
    let track = allSearchResults.get(trackID)['audioFeatures']
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
let runFilters = (token, allSearchResults) => {
    //clear any filtered results that are already displayed
    $('#filtered-table').show()
    $('#filtered-table tbody').empty()
    $('#filtered-header-total').text('0')
    //show CSS border and elements that were initially hidden
    $('.filtered-results-section').css('border', '1px solid #1ed75fb9')
    $('.filtered-div').css('display', 'block')

    if ($('#results-tables .track-row').length < 1) {
        alert('Please search for tracks before filtering the results.')
        return;
    }

    //get audio features for all tracks returned in search results
    let arrPromise = getTrackAudioFeatures(token, allSearchResults, true)

    //re-enable filter button after all tracks have finished filtering so filters are not clicked/called multiple times
    Promise.allSettled(arrPromise).then((data) => {
        $('#filter-button').prop('disabled', false)
        // console.log(arrPromise);
    })

}

//display all audio feature properties for the selected track
let displayAudioFeatures = (token, event, allSearchResults) => {
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
    if (!allSearchResults.get(trackID).hasOwnProperty('audioFeatures')) {
        //send false for add argument so track is not added to filtered results
        arrPromise = getTrackAudioFeatures(token, allSearchResults, false, trackID)
    }

    //when promises are all resolved then add to track analysis table
    Promise.allSettled(arrPromise).then((data) => {
        //add all audio data to track analysis table
        let features = allSearchResults.get(trackID)['audioFeatures']
        for (const key in features) {
            let $tr = $('<tr>')
            $tr.append($('<td>').text(key))
            $tr.append($('<td>').text(features[key]))
            $tbody.append($tr)
        }
    })
}

/*****************************************************************/
/************************ FILTER METHODS *************************/
/*****************************************************************/

/*****************************************************************/
/************************ HELPER METHODS *************************/
/*****************************************************************/

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
    //hide CSS border and elements that might be shown
    $('.filtered-results-section').css('border', 'none')
    $('.filtered-div').css('display', 'none')

    //track analysis results
    $('#track-analysis-table tbody').empty()
    $('#track-analysis-table').hide()
}
//initial handler for search box/button
let initialSearchHandler = (event) => {
    let arrOff = []
    let boolOff = event.data.boolOff

    //if client and secret ids already exist in environment variables then go straight to token method and reassign click event. also if token exists does not exist then run because that means you need a token.
    if (typeof (client_id) === 'string' && typeof (client_secret) === 'string' && !event.data.tokenExists) {
        boolOff = true
        getBasicToken(client_id, client_secret, event)
    }

    if (boolOff) {
        //remove click/keypress events for search so these first event listeners only run the token authentication method once
        arrOff[0] = $('#search-button').off('click', initialSearchHandler)
        arrOff[1] = $('#search-box').off('keypress', initialSearchHandler)
        // console.log('button listener off ', arrOff[0], 'box listener off ', arrOff[1]);
        return arrOff;
    } else {
        alert('Please provide valid keys in the format "client_id:client_secret" without quotes for token authentication.')
    }
    return arrOff;
}

/*****************************************************************/
/************************ HELPER METHODS *************************/
/*****************************************************************/

/*****************************************************************/
/************************* MAIN METHOD ***************************/
/*****************************************************************/

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
    $('#search-button').on('click', { boolOff: false, tokenExists: false }, initialSearchHandler)
    $('#search-box').on('keypress', { boolOff: false, tokenExists: false }, initialSearchHandler)

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