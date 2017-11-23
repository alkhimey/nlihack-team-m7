$(document).foundation() // artium



$(function () {
    var socket = io();

    socket.on('question', function(data) {
        $('#image').attr("src", data.question);
        $('#answer_1_txt').html(data.choices[0]);
        $('#answer_2_txt').html(data.choices[1]);
        $('#answer_3_txt').html(data.choices[2]);
        $('#answer_4_txt').html(data.choices[3]);
    });

    $('#connect').click(function(){
        socket.emit("playerJoin", { playerName :  $('#name').val() });
    });

    $('#answer_1').click(function(){
        socket.emit("answer", { number : '1' });
    });

    $('#answer_2').click(function(){
        socket.emit("answer", { number : '2' });
    });

    $('#answer_3').click(function(){
        socket.emit("answer", { number : '3' });
    });

    $('#answer_4').click(function(){
        socket.emit("answer", { number : '4' });
    });



    return false;
});


