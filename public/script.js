const imHere = document.querySelector('#im-here')
const infoPanel = document.querySelector('#info-panel')
const reset = document.querySelector('#reset')
const viewMap = document.querySelector('#view-map')
const mapPanel = document.querySelector('#map')
const clock = document.querySelector('.clock')
const w3w = document.querySelector('#autosuggest')
const viewW3w = document.querySelector('#view-w3w')

const moreLocations = [{ lat: 55.948106, lng:  -3.193522},{lat: 55.947208, lng: -3.189332}, {lat: 55.947208, lng: -3.189332},
  {lat: 55.943589, lng: -3.189093},{lat: 55.942307, lng:  -3.186504},{lat: 55.951555, lng: -3.179406},
  {lat:55.9393001, lng: -2.9435928},{lat: 55.949941, lng: -3.202855}]

const locations = [{lat: 55.939348, lng: -2.943569},{ lat:55.941709, lng:-2.940348},{lat:55.943545, lng:-2.945525}, {lat:55.944989, lng:-2.952791},{lat:55.940338, lng:-2.949023}]

// const locations = [{lat: 55.939348, lng: -2.943569},{lat: 55.939348, lng: -2.943569}]

let count = 0
let target = locations[count]
let lat, lng, acc, timeStamp, parsedLat, parsedLng

// timer variables
let startTime, endTime, timediff
const roundTimes = []

// buttons
imHere.addEventListener('click', () => {
    checkLocation()
    infoPanel.classList.add('active')
})

reset.addEventListener('click', () => {
    initialize()
})

viewMap.addEventListener('click', () => {
    mapPanel.classList.toggle('active')
    viewMap.classList.toggle('active')
})

viewW3w.addEventListener('click', () => {
    w3w.classList.toggle('active')
    viewW3w.classList.toggle('active')

})

startGame()

function startGame() {
    //apply a cover/filter to block game until start is clicked
    
    infoPanel.classList.add('active')
    infoPanel.innerHTML = `
        <h1>Welcome to the Game</h1>

        <h3> Are you ready to test your wits, skill and...um... patience?</h3>
        
        <div class="buttons-container">
            <button class="info-btn green" id="playGame" >lets Play</button>    
            <button class="info-btn red" id="quit" >Quit</button>
        </div>
    `

    // add content to infoPAnel
    // start the timer

    
}

document.querySelector('#playGame').addEventListener('click',() => {
  infoPanel.classList.remove('active')
    initialize()
    startTimer()

})

// initialize map and streetview at given target loc

function initialize() {
    // const fenway = {lat: 55.951555, lng: -3.179406};
    const map = new google.maps.Map(document.getElementById("map"), {
        center: target,
        zoom: 14,
    });
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
          position: target,
          pov: {
            heading: 34,
            pitch: 10,
          },
        }
    );
    map.setStreetView(panorama);



    // adding w3w logic

    let gridData

    google.maps.event.addListenerOnce(map, 'idle', function(){
        // do something only the first time the map is loaded
        // Add the what3words grid to the Google Map data layer once the desired zoom level is meet
       map.addListener('bounds_changed', function() {
           const zoom = map.getZoom();
           const loadFeatures = zoom > 17;
           
           if (loadFeatures) { // Zoom level is high enough
               var ne = map.getBounds().getNorthEast();
               var sw = map.getBounds().getSouthWest();
           
               // Call the what3words Grid API to obtain the grid squares within the current visble bounding box
               what3words.api
               .gridSectionGeoJson({
                   southwest: {
                       lat: sw.lat(), lng: sw.lng()
                   },
                   northeast: {
                       lat: ne.lat(), lng: ne.lng()
                   }
               }).then(function(data) {
                   if (gridData !== undefined) {
                       for (var i = 0; i < gridData.length; i++) {
                           map.data.remove(gridData[i]);
                       }
                   }
                   gridData = map.data.addGeoJson(data);
               }).catch(console.error);
           }
           
           // Set the grid display style
           map.data.setStyle({
               visible: loadFeatures,
               strokeColor: '#777',
               strokeWeight: 0.5,
               clickable: false
           });
       });
   })
  
   var markers = [];
   
   const input = document.getElementById("suggestComponent");
   input.addEventListener("select", (value) => {
       // open map if not already open
       mapPanel.classList.add('active')
       viewMap.classList.add('active')
       // Call the what3words convert to coordinates API to obtain the latitude and longitude of the three word address provided   
       what3words.api.convertToCoordinates(value.detail).then(function(response) {
           if (response.coordinates) {
               // Clear out the old markers.
               markers.forEach(function(marker) {
                   marker.setMap(null);
               });
               
               markers = [];

               var latLng = {lat: response.coordinates.lat, lng: response.coordinates.lng};

               // Create a marker for the location
               var marker = new google.maps.Marker({
                   position: latLng,
                   map: map,
                   title: value.detail,
                   // icon: 'https://what3words.com/map/images/marker-18.png'
               });
               markers.push(marker);

               // Center the map on that location, and zoom in on it to display the grid
               map.setCenter(latLng);
               map.setZoom(20);
           }
       })    
   })
  }

  // location logic
const locOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
}

 function getLocation(){
  navigator.geolocation.getCurrentPosition(success,error, locOptions)
}

 function success(position) {  
    lat = position.coords.latitude
    lng = position.coords.longitude
    acc = position.coords.accuracy
    timeStamp = position.timestamp
    console.log("from get loc ", lat, lng)
}

function error() {
    console.log( `uh oh...problem. I cant find you..` )
} 


function checkLocation() {

    getLocation()

     
        // parsing to 4 decimal places gives accuracy of 11.1m
        parsedLat = parseFloat(lat.toFixed(4))
        parsedLng = parseFloat(lng.toFixed(4))
        
        
        let latRange = [parsedLat - 0.00008, parsedLat + 0.00008]
        let lngRange = [parsedLng - 0.00008, parsedLng + 0.00008]


        if ((target.lat > latRange[0] && target.lat < latRange[1])
            &&
        (target.lng > lngRange[0] && target.lng < lngRange[1])) {
            stopTimer() 
            roundTimes.push(timeDiff)

            console.log('Correct!')
            infoPanel.innerHTML = `
                <h2>WELL DONE!!</h2>
                <h3>You reached your destination in ${Math.floor(timeDiff/60)}mins and ${Math.floor(timeDiff%60)}secs</h3>
                <h4>click the button below for your next location challenge!</h4>
                <button class="info-btn green" id="next" >Next Challenge!</button>
            `
            document.querySelector('#next').addEventListener('click', () => {        
                infoPanel.innerHTML = ''
                infoPanel.classList.remove('active')
                nextLocation()
            })       
        
    } else {
        console.log('Wrong')
        infoPanel.innerHTML = `
            <h2>OOPS... NOT QUITE</h2>
            <h1> you are at ${parsedLat}, ${parsedLng}, so the acceptable range is between ${latRange}, and ${lngRange} </h1>
            <h1> The target is ${target.lat} ${target.lng}.
            <h4>Click the green button to keep trying, or the red button to skip this level</h4>
            <button class="info-btn green" id="back" > Back to map</button>
            <button class="info-btn red" id="next" >Skip level</button>      
        `

        document.querySelector('#next').addEventListener('click', () => { 
            stopTimer()
            //if not the last one
            infoPanel.classList.remove('active')
            nextLocation()
            //else go to the end bit
        })

        document.querySelector('#back').addEventListener('click', () => {
            infoPanel.classList.remove('active')
        })
    }      
}

function nextLocation() {
    if (count + 1 === locations.length) {
        // end of game
        //display time/scores etc
        // offer play again, other games ....
        infoPanel.classList.add('active')
        infoPanel.innerHTML = `
            <h1>Game Over!</h1>

            <h3> congratulations you completed the game in ${Math.floor(roundTimes.reduce((acc, curr) => acc+curr )/60)}mins and 
            ${Math.round(roundTimes.reduce((acc, curr) => acc+curr )%60)} secs!</h3>
            
            <div class="buttons-container">
                <button class="info-btn green" class="play-again">Play Again</button>
                <button class="info-btn red" class="quit">Quit</button>
            </div>
        `
        document.querySelector('.play-again').addEventListener('click', () => {
            startGame()
        })
    } else {
        count++
        target = locations[count]
    
        initialize()
        startTimer() 
    }
}
// timer logic - maybe should use performance.now() instead? dont need super accuracy forthis but good to know.


function startTimer() {
    console.log('start timer')
    startTime = new Date()

    setInterval(() => {
        let currentTime = new Date() - startTime
        clock.innerText = currentTime
    },1000) 
    // start the visible clock
}

function stopTimer() {
    endTime = new Date()
    timeDiff = (endTime - startTime)/1000
    console.log('round took', timeDiff)
}