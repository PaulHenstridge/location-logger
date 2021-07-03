const getcd = document.querySelector('#getcd')
const posInfo = document.querySelector('#pos-info')
const textArea = document.querySelector('#note')
const save = document.querySelector('#save')
const output = document.querySelector('#log-array')

const locArray = []

let lat, lng, acc, notes

let count = 0

// get current location coordinates
getcd.addEventListener('click', () => {
    posInfo.innerText = `
        Aquiring location...
    `
    navigator.geolocation.getCurrentPosition(success,error)
})

function success(position) {
    console.log(position)
    // let crd = position.coords
    lat = position.coords.latitude
    lng = position.coords.longitude
    acc = position.coords.accuracy

    posInfo.innerText = ` 
    Lat: ${lat}, Lng: ${lng}, Accuracy: ${acc}m
    `
    count++
}

function error() {
    posInfo.innerText = `uh oh...problem. I cant find you..`
}

// if lat and lng returned, save the location as an object
save.addEventListener('click', () => {
    if(lat && lng) {
        console.log(lat, lng)
        saveLocation(lat, lng, notes)
    }
})


function saveLocation(lat, lng, notes) {
    let location = {
        number : count,
        coords : {lat,lng},
        accuracy: acc,
        notes : textArea.value
    }

    locArray.push(location)
    textArea.value = 'location has been saved'
    setTimeout( () => {
        textArea.value = 'enter location details'
    },1500)
}

output.addEventListener('click', () => {
    console.log(locArray)
})