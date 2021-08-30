const express = require('express')

const app = express()

app.use(express.static('public'))

const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/logger', (req, res) => {
    res.sendFile(__dirname + '/public/logger.html')
})

app.listen( PORT, () => {
    console.log(`listening on ${PORT}`)
} )