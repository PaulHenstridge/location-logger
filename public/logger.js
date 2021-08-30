
const getcd = document.querySelector('#getcd')
const posInfo = document.querySelector('#pos-info')
const locTitle = document.querySelector('#title')
const textArea = document.querySelector('#note')
const save = document.querySelector('#save')
const output = document.querySelector('#output')
const outputContainer = document.querySelector('.output-container')
const copy = document.querySelector('#copy')
const check = document.querySelector('#check')
const locResult = document.querySelector('.loc-result')
const body = document.querySelector('body')

// const closeBtn = document.querySelector('.close-btn') dont think I need since i create it in JS

const locArray = []

let lat, lng, acc, notes, title, time

let count = 0

const locOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
}

// get current location coordinates
getcd.addEventListener('click', () => {
    posInfo.innerText = `Aquiring location...`
    getLocation()
})

function getLocation(){
    navigator.geolocation.getCurrentPosition(success,error, locOptions)
}

function success(position) {
    console.log(position)
    // let crd = position.coords
    lat = position.coords.latitude
    lng = position.coords.longitude
    acc = position.coords.accuracy
    timeStamp = position.timestamp

    posInfo.innerText = ` 
    Lat: ${lat}, Lng: ${lng}, Accuracy: ${acc}m
    `
}

function error() {
    posInfo.innerText = `uh oh...problem. I cant find you..`
} 


// if lat and lng returned, save the location as an object
save.addEventListener('click', () => {
    if(lat && lng) {
        count++
        saveLocation()
    }
})

    // define the location object     <-- add timestamp (conveted to real time)
function saveLocation() {
    let location = {
        number : count,
        coords : {lat,lng},
        accuracy: acc,
        title: locTitle.value,
        notes : textArea.value,
        time: new Date(timeStamp)
    }

    locArray.push(location)

    // tell user data is saved, then set back to placeholder
    textArea.value = 'location has been saved'
    setTimeout( () => {
        textArea.value = ''
        locTitle.value = ''  // this is not working...???
    },1500)
}

// list all recorded points in a display div
    // while storage is not avbailable, best option is to copy and paste to an email
    // i could use nodemailer, but prob not worth it?  
    // this is just a tool to get waypoints for the main app
output.addEventListener('click', () => {
    console.log(locArray)
    outputContainer.classList.remove('hidden')
    locArray.forEach( ( loc, i ) => {
        let card = document.createElement('div')
        card.classList.add('card')
        card.innerHTML = `
        <h3>location ${loc.number} - ${loc.title}</h3>
        <h4> coordinates: {lat: ${loc.coords.lat}, lng: ${loc.coords.lng}}</h4>
        <h4> accuracy: ${loc.accuracy}</h4>
        <h4> ${loc.notes}</h4>
        <h4> time: ${loc.time}
        `
        // add a close button positioned absolute, relatinve to the last card
        // not right, but currently positioned to the container/body
        if (i === locArray.length -1) {
            let closeBtn = document.createElement('button')
            closeBtn.innerText = 'close'
            closeBtn.classList.add('close-btn')
            closeBtn.addEventListener('click', () => {
                // put inside a setTimeout
                outputContainer.innerHTML = ''
                outputContainer.classList.add('hidden')
            })

            card.appendChild(closeBtn)
        }
        outputContainer.appendChild(card)
    })
    
})
// trying to add a copy all to clipboard button. also not working yet.
// easier if saved to a textarea?

// ADD AS A BUTTON BELOW CLOSE ON DISPLAY PANEL
// copy.addEventListener('click', () => {
//     document.execCommand('copy')
// })


// check if current location has already been logged

check.addEventListener('click', () => {
    checkLocation()
})

function checkLocation() {
    console.log('checkLocation called')

    getLocation()
    
    let parsedLat = parseFloat(lat?.toFixed(4))
    let parsedLng = parseFloat(lng?.toFixed(4))

    console.log('parsed ', parsedLat, parsedLng)

    let latRange = [parsedLat - 0.00005, parsedLat + 0.00005]
    let lngRange = [parsedLng - 0.00005, parsedLng + 0.00005]

    console.log('ranges ', latRange, lngRange)

    locArray.forEach( loc => {
        if ((loc.coords.lat > latRange[0] && loc.coords.lat < latRange[1])
            &&
            (loc.coords.lng > lngRange[0] && loc.coords.lng < lngRange[1])) {
                console.log('YOU HAVE BEEN HERE!')
                locResult.style.height = '2rem'
                locResult.innerText = 'SUCCESS! location recognised!!'
                reset()
            
                body.style.backgroundColor = 'rgb(17,77,7)'
            } else {
                console.log('LOCATION UNKNOWN')
                locResult.style.height = '2rem'
                locResult.innerText = 'Sorry, this location is not recognised'
                body.style.backgroundColor = 'rgb(88,8,18)' //155,13, 13
                reset()
            }
    })

    function reset() {
        setTimeout( () => {
            locResult.innerText = ''
            locResult.style.height = '0'
            body.style.backgroundColor = 'rgb(43,9,107)'
        },3000)
       

    }

}