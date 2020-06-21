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

#### Authentication
1. Provide a Spotify API key in the top left input in the following layout "client_id:client_secret" (without quotes) and hit enter for token authentication. Input field will turn from red to green if successfully authenticated. [Spotify instructions for getting your API key](https://developer.spotify.com/documentation/web-api/quick-start/)

##### Searching
2. Search Spotify database for albums, artists, playlists, and tracks
3. Input a specific album or playlist URL copied from Spotify with the following layout "https://open.spotify.com/album/7tHPr5YXzvm42CeCjUFqBK" (without quotes)

##### Filtering
4. Select desired filters, adjusting values and selecting whether a filtered track's values should be above or below the input value
    * Click run checked filters with no filters checked to display all tracks from a search result
    * Hover over a filter option to view a description of its meaning with a clickable picture of the standard value distrubtions

##### Track Analysis
5. Scroll down once filters have finished running to view all resulting track that match the selected filter criteria
6. Click each result to display a detailed audio analysis of the track

### Approach Taken


### Unsolved Problems
* Secure way to provide personal Spotify API key to website without publicly revealing it so anyone can use the website without providing their own API key
* Better search functionality that does not require user to provide links

### Future Features & Improvements



<!-- 
Source: https://guides.github.com/features/mastering-markdown/ 
-->

