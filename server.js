#!/usr/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mathQuestions = require('./data/mathQuestions'),
    tq = require('./lib/TriviaQuestions.js'),
    players = require('./lib/Players.js'),

    PORT = process.env.PORT || 8080,
    url = 'http://localhost:' + PORT + '/';

if (process.env.SUBDOMAIN) {
    url = 'http://' + process.env.SUBDOMAIN + '.jit.su/';
}

server.listen(PORT);
console.log("Express server listening on port " + PORT);
console.log(url);

tq.init(mathQuestions);
players.init();

//app.use('/css', express.static(__dirname + 'public/css'));
//app.use('/js', express.static(__dirname + 'public/js'));
app.use(express.static('public'))



app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/p', function(req, res) {
    res.sendfile(__dirname + '/player.html');
});


var nextQuestionDelayMs = 5000; //5secs // how long are players 'warned' next question is coming
var timeToAnswerMs = 10000; // 10secs // how long players have to answer question 
var timeToEnjoyAnswerMs = 5000; //5secs // how long players have to read answer
var currentQustion = null;

//Socket.io emits this event when a connection is made.
io.sockets.on('connection', function(socket) {

    socket.on('answer', function(data) {
        console.log('button ' + data.number);

        players.setAnswer(socket.id, parseInt(data.number));
    });

    socket.on('playerJoin', function(data) {
        var ip = socket.handshake.address.address;
        var p = players.addPlayer({
            playerId: socket.id,
            clientIp: ip,
            name: data.playerName
        });
        console.log('SOCKET.IO player added: ' + p.name + ' from ' + ip + ' for socket ' + socket.id);
        emitPlayerUpdate();

        // TODO: Remove  - debug


    });



    socket.on('disconnect', function() {
        var pname = players.getPlayerName(socket.id);
        console.log('SOCKET.IO player disconnect: ' + pname + ' for socket ' + socket.id);
        if (!pname) {
            // already disconnected
            return;
        }
        players.removePlayer(socket.id);
        emitPlayerUpdate();
    });

    socket.on('startgame', function() {
        if (players.getPlayerCount() >= 1) {
            getQuestionMetaData();
        }
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




function emitNewQuestion(q) {
    console.log(new Date().getTime());
    //players.winningSocket = null;
    var index = Math.floor(Math.random() * 3);

    currentQustion = q;
    io.sockets.emit("UnPresentAnswer");
    io.sockets.emit('question', currentQustion);

    setTimeout(function() {

        players.updatePoints(currentQustion.answer);
        players.clearAnswers();
        emitPlayerUpdate();
        io.sockets.emit("clearanswers");
        io.sockets.emit("PresentAnswer", currentQustion.answer);



        // var q = tq.getQuestionObj(true);
        // q.endTime = new Date().getTime() + timeToAnswerMs;
        // q.totalTime = timeToAnswerMs;

        // io.sockets.emit('question', q);

        // setTimeout(function(){
        //     emitAnswer();
        // }, timeToAnswerMs);

    }, 5000);

    setTimeout(function() {
        //emitNewQuestion();
        getQuestionMetaData();
    }, 10000);
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


function emitPlayerUpdate() {
    var playerData = players.getPlayerData();
    io.sockets.emit('players', playerData);
}

const NUM_OF_ANSWERS = 4;
const SIZE_OF_SAMPLE = 10;

function sampleDoc(data) {
    var docset = data.SEGMENTS.JAGROOT.RESULT.DOCSET;

    var randomIndex = Math.floor(Math.random() * SIZE_OF_SAMPLE);

    return docset.DOC[randomIndex];
}

function getAnswers(trueAnswer, size) {

    var isrSing = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=1&bulkSize=" + SIZE_OF_SAMPLE + "&json=true";
    var desc = null;
    var answersList = [trueAnswer];

    $.get(isrSing, function(data, status) {
            for (var i = 1; i < size; i++) {
                desc = null;
                while (desc == null) {
                    desc = sampleDoc(data).PrimoNMBib.record.display.title;
                    if (answersList.indexOf(desc) > -1) {
                        desc = null;
                    }
                }
                answersList.push(desc);
            }

            return answersList;

        },
        async = false);

    // [[trueAnswer, 0], [title2, 1], [title3, 2], [title4, 3]];
}

function shuffle(array) {

    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function findNewIndex(array, originalIndex) {
    var outIndex = -1;
    var loopIndex = 0;
    while (outIndex < 0) {
        if (array[loopIndex][1] == originalIndex) {
            outIndex = loopIndex;
        }
        loopIndex++;
    }
    return outIndex;
}

var request = require('request');

url = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=1&bulkSize=" + SIZE_OF_SAMPLE + "&json=true";

urlTotalHits = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=1&bulkSize=1&json=true";

var TOTAL_HITS;

request(urlTotalHits, function(error, response, body) {
    TOTAL_HITS = JSON.parse(body).SEGMENTS.JAGROOT.RESULT.DOCSET["@TOTALHITS"];
});

function getQuestionMetaData() {

    var randomImageIndex = Math.floor((Math.random() * TOTAL_HITS - 100) + 1);

    randomUrl = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=" + randomImageIndex + "&bulkSize=" + SIZE_OF_SAMPLE + "&json=true";

    request(randomUrl, function(error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.

        var recordId = JSON.parse(body).SEGMENTS.JAGROOT.RESULT.DOCSET.DOC[0].PrimoNMBib.record.control.recordid;

        var trueDesc = JSON.parse(body).SEGMENTS.JAGROOT.RESULT.DOCSET.DOC[0].PrimoNMBib.record.display.title;

        var imageManifest = "http://iiif.nli.org.il/IIIFv21/DOCID/" + recordId + "/manifest"

        request(imageManifest, function(error, response, body) {

            var imageUrl = JSON.parse(body).sequences[0].canvases[0].images[0].resource["@id"];
            var url1 = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=1&bulkSize=" + SIZE_OF_SAMPLE + "&json=true";
            var desc = null;
            var answersArray = [trueDesc];

            request(url1, function(error, response, body) {
                for (var i = 1; i < NUM_OF_ANSWERS; i++) {
                    desc = null;
                    while (desc == null) {
                        desc = sampleDoc(JSON.parse(body)).PrimoNMBib.record.display.title;
                        if (answersArray.indexOf(desc) > -1) {
                            desc = null;
                        }
                    }
                    answersArray.push(desc);
                }
                //answersArray = getAnswers(trueDesc, NUM_OF_ANSWERS);
                var arrayWithIndex = [];
                var arrayLength = answersArray.length;

                // Add indexs along side the answers
                for (var i = 0; i < arrayLength; i++)
                    arrayWithIndex.push([answersArray[i], i]);

                // Shuffle the answers
                arrayWithIndex = shuffle(arrayWithIndex);
                correctAnswerIndex = findNewIndex(arrayWithIndex, 0);

                // Puts the 
                for (var i = 0; i < arrayLength; i++)
                    answersArray[i] = arrayWithIndex[i][0];

                var obj = {
                    question: imageUrl,
                    choices: answersArray,
                    answer: correctAnswerIndex
                };

                emitNewQuestion(obj);

                // return obj;
            });
        });
    });
}