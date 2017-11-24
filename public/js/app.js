$(document).foundation() // artium

var progress_width = 0; // pct
var question_time = 10000; // ms
var progress_resolution = 50; // update every 100 ms
var prog_intervall_id = null;

$(function() {

    //var socket = io();
    var socket = io({ transports: ['websocket'] });
    socket.on('question', function(data) {
        $('#image').attr("src", data.question + "?timestamp=" + new Date().getTime());
        $('#answer_1_txt').html(data.choices[0]);
        $('#answer_2_txt').html(data.choices[1]);
        $('#answer_3_txt').html(data.choices[2]);
        $('#answer_4_txt').html(data.choices[3]);

        $('#openningscreen').remove();
        $('#justabutton').remove();
        $('#gamescreen').css("visibility", 'visible');

        if (prog_intervall_id != null) {
            clearInterval(prog_intervall_id);
            prog_intervall_id = null;
        }
        progress_width = 0;
        prog_intervall_id = setInterval(function() {
            $("#mymeter").width(progress_width + "%");
            if (progress_width >= 100) {
                clearInterval(prog_intervall_id);
                prog_intervall_id = null;
            }
            else {
                progress_width += (100.0 * progress_resolution) / question_time;             
            }
            
        }, progress_resolution);
    });

    // update and display player list
    socket.on('players', function(data) {
        $('#highscoreblock').empty();
        data.players.forEach(function(item, idx) {
            var item = $("<li></li>").text(item.name + " " + item.points);
            $('#highscoreblock').append(item);
        });
    });

    socket.on('clearanswers', function() {
        $("#selected").css("display", "none");
    });

    socket.on('PresentAnswer', function(data) {

        if (data == 0) {
            $("#answer_1_cont").css("background-color", "#4CAF50");
            $("#answer_1").css("background-color", "#4CAF50");
        } else if (data == 1) {
            $("#answer_2_cont").css("background-color", "#4CAF50");
            $("#answer_2").css("background-color", "#4CAF50");
        } else if (data == 2) {
            $("#answer_3_cont").css("background-color", "#4CAF50");
            $("#answer_3").css("background-color", "#4CAF50");
        } else if (data == 3) {
            $("#answer_4_cont").css("background-color", "#4CAF50");
            $("#answer_4").css("background-color", "#4CAF50");
        }

    });

    socket.on('UnPresentAnswer', function(data) {

        $("#answer_1_txt").css("background-color", "");
        $("#answer_1").css("background-color", "");
        $("#answer_2_txt").css("background-color", "");
        $("#answer_2").css("background-color", "");
        $("#answer_3_txt").css("background-color", "");
        $("#answer_3").css("background-color", "");
        $("#answer_4_txt").css("background-color", "");
        $("#answer_4").css("background-color", "");

        // Reset image...
        $('#image').removeAttr("src");

    });

    $('#justabutton').click(function() {

        $('#justabutton').attr("disabled", "disabled");
        socket.emit("startgame");

    });

    $('#connect').click(function() {
        socket.emit("playerJoin", { playerName: $('#name').val() });
        $('#answersblock').css("visibility", 'visible');
        $('#firstconnect').remove();

    });

    $('#answer_1').click(function() {
        socket.emit("answer", { number: '0' });
        $("#selected").css("display", "inline");
        $("#selected").html("A");

    });

    $('#answer_2').click(function() {
        socket.emit("answer", { number: '1' });
        $("#selected").css("display", "inline");
        $("#selected").html("B");
    });

    $('#answer_3').click(function() {
        socket.emit("answer", { number: '2' });
        $("#selected").css("display", "inline");
        $("#selected").html("C");
    });

    $('#answer_4').click(function() {
        socket.emit("answer", { number: '3' });
        $("#selected").css("display", "inline");
        $("#selected").html("D");
    });



    return false;
});