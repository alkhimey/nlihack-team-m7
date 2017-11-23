$(document).foundation() // artium



$(function () {
    var socket = io();

    socket.on('question', function (data) {
        $('#image').attr("src", data.question);
        $('#answer_1_txt').html(data.choices[0]);
        $('#answer_2_txt').html(data.choices[1]);
        $('#answer_3_txt').html(data.choices[2]);
        $('#answer_4_txt').html(data.choices[3]);
    });

    // update and display player list
    socket.on('players', function (data) {
        $('#highscoreblock').empty();
        data.players.forEach(function (item, idx) {
            var item = $("<li></li>").text(item.name + " " + item.points);
            $('#highscoreblock').append(item);
        });
    });

    socket.on('clearanswers', function () {
        $("#selected").html("");
    });

    socket.on('PresentAnswer', function (data) {

        if (data == 0) {
            $("#answer_1_txt").css("background-color", "#4CAF50");
            $("#answer_1").css("background-color", "#4CAF50");
        }
        else if (data == 1) {
            $("#answer_2_txt").css("background-color", "#4CAF50");
            $("#answer_2").css("background-color", "#4CAF50");
        }
        else if (data == 2) {
            $("#answer_3_txt").css("background-color", "#4CAF50");
            $("#answer_3").css("background-color", "#4CAF50");
        }
        else if (data == 3) {
            $("#answer_4_txt").css("background-color", "#4CAF50");
            $("#answer_4").css("background-color", "#4CAF50");
        }

    });
    //remove screenstart 
    socket.on('startgame', function () {

    });

    socket.on('UnPresentAnswer', function (data) {

        $("#answer_1_txt").css("background-color", "");
        $("#answer_1").css("background-color", "");
        $("#answer_2_txt").css("background-color", "");
        $("#answer_2").css("background-color", "");
        $("#answer_3_txt").css("background-color", "");
        $("#answer_3").css("background-color", "");
        $("#answer_4_txt").css("background-color", "");
        $("#answer_4").css("background-color", "");
    });
    $('#justabutton').click(function () {

        $('#openningscreen').remove();
        $('#justabutton').remove();
        $('#gamescreen').css("visibility", 'visible');

        socket.emit("startgame");

    });

    $('#connect').click(function () {
        socket.emit("playerJoin", { playerName: $('#name').val() });
        $('#answersblock').css("visibility", 'visible');
        $('#firstconnect').remove();

    });

    $('#answer_1').click(function () {
        socket.emit("answer", { number: '0' });
        $("#selected").html("A");

    });

    $('#answer_2').click(function () {
        socket.emit("answer", { number: '1' });
        $("#selected").html("B");
    });

    $('#answer_3').click(function () {
        socket.emit("answer", { number: '2' });
        $("#selected").html("C");
    });

    $('#answer_4').click(function () {
        socket.emit("answer", { number: '3' });
        $("#selected").html("D");
    });



    return false;
});


