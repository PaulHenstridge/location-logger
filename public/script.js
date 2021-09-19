const imHere = document.querySelector('#im-here')
const infoPanel = document.querySelector('#info-panel')
const reset = document.querySelector('#reset')
const viewMap = document.querySelector('#view-map')
const mapPanel = document.querySelector('#map')
const clock = document.querySelector('.clock')
const w3w = document.querySelector('#autosuggest')
const viewW3w = document.querySelector('#view-w3w')
const container = document.querySelector('.container')
const quizContainer = document.querySelector('.quiz-container')

//  qiuz variables

const ques = document.querySelector('.question')
const answers = document.querySelector('.answers')
const scoreBoard = document.querySelector('.score')
const hiScore = document.querySelector('.high-score')
const skipQuiz = document.querySelector('#skip-quiz')

const numberOfQuestions = 5

let qData, catagory, question, correct, incorrect, i, quizLevelPassed

let score = 0
let highScore = 10

// game locations
// const moreLocations = [{ lat: 55.948106, lng:  -3.193522},{lat: 55.947208, lng: -3.189332}, {lat: 55.947208, lng: -3.189332},
//   {lat: 55.943589, lng: -3.189093},{lat: 55.942307, lng:  -3.186504},{lat: 55.951555, lng: -3.179406},
//   {lat:55.9393001, lng: -2.9435928},{lat: 55.949941, lng: -3.202855} {lat: 55.938599, lng:-2.944369},]

//   const nonLocationObjects = [{game:'challenge', question:'first question',answer:'something'}]

//   const birthdayLocs = [ {lat:55.939499, lng:-2.945716, name:'Mpark'}, {lat:55.944538, lng:-2.953770, name:'tranentHighSt'},{lat:55.953269, lng:3.207214, name:'panda'}, {lat:55.954908, lng:-3.182775, name:'calton'}]

const locations = [{lat: 55.939348, lng: -2.943569, name: 'home'}, {lat:55.939499, lng:-2.945716, name:'Mpark'},{lat:55.944538, lng:-2.953770, name:'tranentHighSt'},
{game:'challenge', question:'Well done so far!  the next challenge is a bit trickier...  You need to get yourself to trash.hats.atomic. Go go go!!'},{game:'quiz'},
{lat: 55.957336, lng: -3.169312, game:'challenge', question: 'Welcome to Abbeyhill!  You might want to check out the festival that is going on here today!  When you are ready, click to continue the game'},{lat:55.954908, lng:-3.182775, name:'calton'},
{lat: 55.950216,lng: -3.202358, game:'challenge', question:'Without using google....how old was Robert Louis Stevenson when he died? Hint: remember your clue form earlier', answer:'44'},{lat:55.953154, lng: -3.207327, name:'panda'}, 
{game:'challenge', question:'Well done for making it this far!  Now, you have an appointment with the Barber at 4.30pm.  I hope you are not late!'}]

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
        <h1>Hello Life!  Welcome to your game!</h1>

        <h3> Are you ready to test your wits, skill and...um... navigation?</h3>
        
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

 function success(position) {   // return an object?? something to pass into a .then
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
        
        
        let latRange = [parsedLat - 0.001, parsedLat + 0.001]
        let lngRange = [parsedLng - 0.001, parsedLng + 0.001]


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
            <h4> you are at ${parsedLat}, ${parsedLng},</h4>
            <h4> The target is ${target.lat} ${target.lng}.
            <h4>Click the green button to keep trying, or the red button to move on</h4>
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
        if (target.game === 'challenge') { 
            challenge()
            initialize()
            startTimer()
        } else if (target.game === 'quiz') {
            quiz()
            startTimer()
        } else { 
            initialize()
            startTimer() 
        }
    // if target.game = quiz { run quiz logic}
        // else
    
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

// chalenge logic

function challenge() {
    infoPanel.classList.add('active')
    infoPanel.innerHTML = ` 
    
    <h3>${target.question}</h3>
    <input type="text" id="ansInput" placeholder="enter your answer here"> <button id="ansButton" class="info-btn green">Go!</button>
   
    `
    // add a buttin to hide the window to see map.  need ot keep the button avasilable to toggle the screen abck on.
    const ansInput = document.querySelector('#ansInput')
    const ansButton = document.querySelector('#ansButton')
    const hideButton = document.querySelector('#hide')

    console.log('target.answer is', target.answer)

    if (target.answer = 44) () => {
        ansInput.classList.remove('hidden')
    }

    ansButton.addEventListener('click', () => {  // add a button to click submit - better for mobile too
        
        if (ansInput.value === target.answer){
            console.log('Correctamundo!')
            infoPanel.innerHTML = `
                <h1>Correctamundo!!</h1>
                <button class="info-btn green" id="next" >Next Challenge!</button>
            `
            stopTimer()
            document.querySelector('#next').addEventListener('click', () => {        
                infoPanel.innerHTML = ''
                infoPanel.classList.remove('active')
                nextLocation()
            })   
        } else {
            infoPanel.innerHTML = ''
            infoPanel.classList.remove('active')
            nextLocation()
        }
    })

}

// make nice html for challenge, seyt question(s)
// quiz - make a fullscreen div, hidden. omn quiz level unhide and inject quiz html, add logic to quiz()
// set stages - end of street, somewhere else nearby, train station, quiz, challenge for w3w, w3w lweds to abbeyhill?


function quiz() {
    container.classList.add('hidden')
    quizContainer.classList.remove('hidden')
    let quizInstructions = document.createElement('div')
    quizInstructions.classList.add('quiz-instructions')
    quizInstructions.innerHTML = `
    <p>Its quiz time.  You need to beat the high score to get the secret clue and reach the next level.  good luck!</p>
    <button class="info-btn green" id="playQuiz" >lets Play</button>    

    `
    quizContainer.appendChild(quizInstructions)

    document.querySelector('#playQuiz').addEventListener('click', () => {
        quizInstructions.classList.add('hidden')
    })

    skipQuiz.addEventListener('click', () => {
        quizContainer.classList.add('hidden')
        container.classList.remove('hidden')
        nextLocation()
    })



    getQuestions()

    // using base 64 encoding so it can be decoded with atob(), so including punctuation not recognised by JSON.
    function getQuestions() {
        fetch(`https://opentdb.com/api.php?amount=${numberOfQuestions}&type=multiple&encode=base64`
        )
            .then(response => response.json())
            .then(data => {
                
                qData = data.results
                console.log(qData)
                i = 0
                displayQs()
            })
    }    
            
    function displayQs() {

        if(i < qData.length) {
            catagory = qData[i].catagory
            question = atob(qData[i].question) 
            correct = qData[i].correct_answer
            incorrect = qData[i].incorrect_answers

            console.log(question, correct)

            ques.innerText = question
            displayAnswers()
        }  else {
            ques.innerText = `End of the quiz!  You scored ${score} points!`

            if(score <= highScore){
                answers.innerText = "Oh dear.  Your're not very good, are you?"
                playAgain()
            }

            if(score > highScore){
                answers.innerText = `Congratulations! You set the new high score! The previous high score was ${highScore}!
                                    Your clue is: vibrates.gloves.evenly
                Dont forget it, you will need it later!

                You can play the quiz again if you like, or if you have arrived to your destination, lets play on!`
                stopTimer()
                highScore = score
                hiScore.innerText = highScore
                quizLevelPassed = true
                playAgain()
                nextRound()
            }

            // make play quiz again button
            function playAgain() {
                let again = document.createElement('div')
                again.innerHTML = '<h5 class="info-btn red"> Play Again?</h5>' 
                again.addEventListener('click', () => {
                    again.style.display = 'none'
                    answers.innerText = ''
                    score = 0
                    scoreBoard.innerText = score
                    // if (quizLevelPassed) {
                    //     let qNumTag = document.createElement('div')
                    //     qNumTag.innerText = 'how many questions you want this round? huh??'
                    //     let qNumInput = document.createElement('input')
                    //     let qNumButton = document.createElement('button')
                    //     qNumButton.addEventListener('click', () => {
                    //         numberOfQuestions = qNumInput.value
                    //         getQuestions()
                    //     })
                    //     answers.appendChild('qNumTag')
                    //     answers.appendChild('qNumInput')
                    //     answers.appendChild('qNumButton')
                    // } else {
                        getQuestions()
                    // }
                   
                    
            })
            answers.appendChild(again)
            }
            

            // make move on to next round button
            function nextRound() {
                let nextRound = document.createElement('div')
                nextRound.innerHTML = '<h5 class="info-btn green"> Continue the game!</h5>' 
                nextRound.addEventListener('click', () => {
                    quizContainer.classList.add('hidden')
                    container.classList.remove('hidden')
                    nextLocation()
            })
            answers.appendChild(nextRound)
            }
          
        }
    }

    function next() {
        i++
        displayQs()
    }

    function displayAnswers() {
        // insert correct answer randomly amongst wrong ones
        let ansList = [...incorrect]
        let rand = Math.floor(Math.random()*4)
        ansList.splice(rand,0,correct)
    
        let ansContainer = document.createElement('div')

        ansList.forEach(ans => {
            let ansSpan = document.createElement('span')
            ansSpan.innerHTML = `<h3 class="answer-h3">${atob(ans)}</h3>`  
            

            if(ans === correct) {
                ansSpan.addEventListener('click', () => {
                    // alert('Correct!')
                    ansSpan.style.backgroundColor = 'rgb(21, 90, 30)'           
                    score+=3
                    scoreBoard.innerText = score
                    ques.innerText = 'Correct!'
                    setTimeout(() => {
                        answers.innerHTML = ''
                        next()
                    },600)
                
                })
            } else {
                ansSpan.addEventListener('click', () => {
                    // alert('Wrong!')
                    score--
                    scoreBoard.innerText = score
                    ques.innerText = 'Wrong!'
                    ansSpan.style.backgroundColor = 'rgb(151, 72, 72)'
                    setTimeout(() => {
                        ansSpan.style.backgroundColor = 'rgb(69, 130, 179)'
                        ques.innerText = question
                    },1000)

                })
            }
            ansContainer.appendChild(ansSpan)       
        })
        answers.appendChild(ansContainer) 
    }  
    
}