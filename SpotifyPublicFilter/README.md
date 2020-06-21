# [Spotify Track Filter](https://spk2dc.github.io/SpotifyPublicFilter/) Read Me


### Technologies Used
* HTML website
* CSS styling and animations
* jQuery and vanilla JavaScript
* AJAX requests to pull external data from Spotify API
* Document Object Model (DOM) manipulation 
* Event listeners and handlers


### Instructions
[Click here for live Spotify Track Filter website](https://spk2dc.github.io/SpotifyPublicFilter/)

1. #### Authentication
    * Provide a Spotify API key in the top left input in the following layout "client_id:client_secret" (without quotes) and hit enter for token authentication. Input field will turn from red to green if successfully authenticated. [Spotify instructions for getting your API key](https://developer.spotify.com/documentation/web-api/quick-start/)

2. #### Searching
    * Search Spotify database for albums, artists, playlists, and tracks
    * Input a specific album or playlist URL copied from Spotify with the following layout "https://open.spotify.com/album/7tHPr5YXzvm42CeCjUFqBK" (without quotes)

3. #### Filtering
    * Select desired filters, adjusting values and selecting whether a filtered track's values should be above or below the input value
      * Click run checked filters with no filters checked to display all tracks from a search result
      * Hover over a filter option to view a description of its meaning with a clickable picture of the standard value distrubtions

4. #### Track Analysis
    * Scroll down once filters have finished running to view all resulting track that match the selected filter criteria
    * Click each result to display a detailed audio analysis of the track


### Approach Taken
General code flow is similar to the instructions for using the website. First authenticate the user's token in order to use Spotify's API. Then all other methods can be run by passing in the validated token. Add listeners to search Spotify and filter the results. If the search is a normal word then find matches based for albums, artists, playlists, and tracks. If the search is a URL display that specific result. Run all queries and display results. If the search results only contain tracks, allow filtering based on each track's audio features. If the audio features match all of the user's filter settings criteria then display it. If no criteria are specified, display all track search results. Once all search results are filtered and displayed, add listeners to each row to display each track's audio features.


### Unsolved Problems
* Secure way to provide personal Spotify API key to website without publicly revealing it so anyone can use the website without providing their own API key


### Future Features & Improvements
* Better search functionality that does not require user to provide direct links and is navigable within the search results.
* Ability to display filtered tracks from all search results, not just ones that result in a list of tracks. For example if an artist is returned it would be possible to filter every song in every album that artist has.
* Displaying audio features for multiple tracks at a time and from the search results as well instead of only after they have been filtered.


##### Author/Developer: [Senthil Kannan](https://www.linkedin.com/in/spk2dc)

##### Last Updated: 6/21/2020
<!-- 
Source: https://guides.github.com/features/mastering-markdown/ 
-->

