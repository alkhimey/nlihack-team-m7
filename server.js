#!/usr/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mathQuestions = require('./data/mathQuestions'),
    tq = require('./lib/TriviaQuestions.js'),
    players = require('./lib/Players.js'),
    PORT = process.env.PORT || 8080,
    url  = 'http://localhost:' + PORT + '/';

if (process.env.SUBDOMAIN) {
    url = 'http://' + process.env.SUBDOMAIN + '.jit.su/';
}

server.listen(PORT);
console.log("Express server listening on port " + PORT);
console.log(url);

tq.init(mathQuestions);
players.init();

app.use('/css/', express.static(__dirname + '/css'));
app.use('/js/', express.static(__dirname + '/js'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/p', function (req, res) {
    res.sendfile(__dirname + '/player.html');
});


var nextQuestionDelayMs = 5000; //5secs // how long are players 'warned' next question is coming
var timeToAnswerMs = 10000; // 10secs // how long players have to answer question 
var timeToEnjoyAnswerMs = 5000; //5secs // how long players have to read answer


//Socket.io emits this event when a connection is made.
io.sockets.on('connection', function (socket) {

    socket.on('answer', function (data) {
        console.log('button ' + data.number);

        players.setAnswer(socket.id, parseInt(data.number));
    });

    socket.on('playerJoin', function (data) {
        var ip = socket.handshake.address.address;
        var p = players.addPlayer({
            playerId: socket.id,
            clientIp: ip,
            name: data.playerName
        });
        console.log('SOCKET.IO player added: '+ p.name + ' from '+ ip + ' for socket '+ socket.id);
        emitPlayerUpdate(socket);
        
        // TODO: Remove  - debug
        emitNewQuestion();

    });
    
    
    socket.on('disconnect', function() {
        var pname = players.getPlayerName(socket.id);
        console.log('SOCKET.IO player disconnect: '+ pname + ' for socket '+ socket.id);
        if (!pname) {
            // already disconnected
            return;
        }
        players.removePlayer(socket.id);
        emitPlayerUpdate();
    });
/*
    socket.on('answer', function (data) { 
        console.log('SOCKET.IO player answered: "'+ data.answer + '" for question: '+ data.question);
        players.lastActive(socket.id);
        // TODO: handle case where player might have already answered (damn hackers)
        if (tq.isCorrect(data) && !players.winningSocket) {
            console.log('SOCKET.IO player correct ! =========> : "'+ data.answer + '", '+ players[socket.id] + ' for socket '+ socket.id);
            players.winningSocket = socket;
        }
    });
*/
});

function emitNewQuestion() {
    //players.winningSocket = null;

    io.sockets.emit('question', {
        //totalTime: nextQuestionDelayMs,
        //endTime: new Date().getTime() + nextQuestionDelayMs,
        choices: mathQuestions[0].choices,
        question: mathQuestions[0].question

       // choices: ['aaa', 'bbbb', 'cccc', 'ddd'],
       // question:'https://avatars1.githubusercontent.com/u/23655873?s=64&v=4'
    });

    console.log(mathQuestions);
/*
    setTimeout(function(){
        var q = tq.getQuestionObj(true);
        q.endTime = new Date().getTime() + timeToAnswerMs;
        q.totalTime = timeToAnswerMs;
        
        io.sockets.emit('question', q);
        
        setTimeout(function(){
            emitAnswer();
        }, timeToAnswerMs);

    }, nextQuestionDelayMs);   */
}

/*
function emitAnswer() {
    
    var answerData = tq.getQuestionObj();
    delete answerData.choices;
    answerData.correctAnswer = tq.getAnswer();
    answerData.endTime = new Date().getTime() + timeToEnjoyAnswerMs;
    answerData.totalTime = timeToEnjoyAnswerMs;
    answerData.winner = false;
    
    if (players.winningSocket) {
        answerData.winnerName = players.getPlayerName(players.winningSocket.id);
        players.addPlayerPoints(players.winningSocket.id, answerData.points);
        
        emitPlayerUpdate(); // send update because points changed
        
        players.winningSocket.broadcast.emit('question', answerData); // emit to all but winner 

        answerData.winner = true;
        players.winningSocket.emit('question', answerData); // emit only to winner
        
    } else {
        io.sockets.emit('question', answerData); // emit to everyone (no winner)
    }
    
    setTimeout(function(){
        emitNewQuestion();
    }, timeToEnjoyAnswerMs);
}
*/


function emitPlayerUpdate(socket) {
    var playerData = players.getPlayerData();
    io.sockets.emit('players', playerData);
}
