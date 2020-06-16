
let callSpotify = () => {
    let baseurl = "https://api.spotify.com/v1/"

    let testSongID = '4JjUwfp8GQ3PxWg2QPKnpn'
    let filter = `${baseurl}audio-features/${testSongID}`
    console.log(filter);

    $.ajax({
        url: filter,
        type: "GET",
        data: {

        },
        headers: {
            'Authorization': 'Bearer ' + token
        }

    }).then(parseData)

}

let parseData = (data) => {
    console.log(data);
    
}


$(() => {
    callSpotify()
});

