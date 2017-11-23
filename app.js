var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000
  , http = require('http').Server(app)
  , io = require('socket.io')(http);

app.set('views', __dirname + '/views')
app.engine('jade', require('jade').__express)
app.set('view engine', 'jade')

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(require('./controllers'))

http.listen(port, function() {
  console.log('Listening on port ' + port)
})

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('msg', function(msg){
    console.log('message: ' + msg);
  });
});