/*global Backbone */
var app = app || {};

const NUM_OF_ANSWERS = 4;
const SIZE_OF_SAMPLE = 100;

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

function returnQuestionMetaData() {

    console.log('ShowPictureClick:', this);

    var isrSing = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&query=title,contains,%D7%96%D7%9E%D7%A8%D7%99%D7%9D+%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%99%D7%9D&indx=1&bulkSize=10&json=true";

    $.get(isrSing, function(data, status) {

        var recordId = data.SEGMENTS.JAGROOT.RESULT.DOCSET.DOC[0].PrimoNMBib.record.control.recordid;

        var trueDesc = data.SEGMENTS.JAGROOT.RESULT.DOCSET.DOC[0].PrimoNMBib.record.display.title;

        var imageManifest = "http://iiif.nli.org.il/IIIFv21/DOCID/" + recordId + "/manifest"

        $.get(imageManifest, function(data, status) {

            var imageUrl = data.sequences[0].canvases[0].images[0].resource["@id"];

            var isrSing1 = "http://primo.nli.org.il/PrimoWebServices/xservice/search/brief?institution=NNL&loc=local,scope:(NNL)&query=lsr08,exact,%D7%94%D7%A1%D7%A4%D7%A8%D7%99%D7%99%D7%94+%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA+%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F+%D7%93%D7%9F+%D7%94%D7%93%D7%A0%D7%99&indx=1&bulkSize=" + SIZE_OF_SAMPLE + "&json=true";
            var desc = null;
            var answersArray = [trueDesc];

            $.get(isrSing1, function(data, status) {
                    for (var i = 1; i < NUM_OF_ANSWERS; i++) {
                        desc = null;
                        while (desc == null) {
                            desc = sampleDoc(data).PrimoNMBib.record.display.title;
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
                        imageUrl: imageUrl,
                        answersArray: answersArray,
                        correctAnswerIndex: correctAnswerIndex
                    };

                    return obj;
                },
                async = false);
        }, async = false);
    }, async = false);
}

$(function() {

    app.QuestionModel = Backbone.Model.extend({});

    app.question = new app.QuestionModel();


    app.AnswerModel = Backbone.Model.extend({});

    app.answer = new app.AnswerModel();



    // AppView is top-level piece of UI
    app.AppView = Backbone.View.extend({

        // bind to existing html
        el: $('body'),

        events: {
            "click .leave": "leaveBtnClick",
            "keypress .join input": "joinOnEnter",
            "click .join button": "joinBtnClick",
        },

        initialize: function() {
            this.$input = this.$('.join input');
            this.$players = this.$('.players ol');
            this.questionView = new app.QuestionView();
            this.answerView = new app.AnswerView();
        },

        render: function() {
            // nothing changes on re-rendering
        },

        renderPlayers: function(players) {
            var that = this;
            this.$players.html('');
            _.each(players, function(player) {
                var view = new app.PlayerView({ model: player });
                that.$players.append(view.render().el);
            });
        },

        renderQuestionAnswers: function(data) {
            // don't re-render questions unless data contains choices
            if (data.choices) {
                app.question.clear({ silent: true }).set(data);
            }
            // in the initial case where player joins and receives answers before a question,
            // answer should not be updated.
            if (app.question.get('question')) {
                app.answer.clear({ silent: true }).set(data);
            }
        },

        leaveBtnClick: function() {
            // close socket connection by reloading tab
            if (!confirm('Are you sure you want to leave the Trivia Game?\nYou will loose all your points.')) {
                return;
            }
            window.location = self.location;
            location.reload(true);
        },

        joinOnEnter: function(e) {
            if (e.keyCode == 13) this.joinBtnClick();
        },

        joinBtnClick: function() {
            console.log('joinBtnClick:', this);
            var that = this;
            var playerName = this.$input.val();
            $('.join').hide();
            $('.leave').show();

            this.socket = app.socket = io.connect();
            console.log('io.connect socket:', this.socket);

            this.socket.on('players', function(data) {
                console.log('players updated, data:', data);
                $('.playerMsg').html(data.msg);
                that.renderPlayers(data.players);
            });

            this.socket.on('question', function(data) {
                console.log('received question, data: ', data);
                that.renderQuestionAnswers(data);
            });

            this.socket.emit('playerJoin', {
                playerName: playerName
            });
        }

    });


    app.PlayerView = Backbone.View.extend({

        tagName: 'li',

        // Cache the template function for a single player.
        template: _.template($('#playerTemplate').html()),

        render: function() {
            this.$el.html(this.template(this.model));
            return this;
        }
    });


    app.QuestionView = Backbone.View.extend({

        model: app.question,

        el: $('#questionContainer'),

        template: _.template($('#questionTemplate').html()),

        events: {
            "click .choice": "answerClick"
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            // if question string does not exist, clear html
            if (this.model.get('question')) {
                this.$el.html(this.template({ d: this.model.toJSON() }));
                this.updateProgressBar();
            } else {
                this.$el.html('');
            }
        },

        updateProgressBar: function() {
            var $prog = $('#questionContainer .progress');
            var $bar = $('#questionContainer .bar');
            var now = new Date().getTime();
            var d = this.model.toJSON();
            var pct = Math.floor(100 * (d.endTime - now) / d.totalTime);
            if (pct < 2) {
                pct = 0;
            }
            $bar.width(pct + '%');
            if (pct < 20) {
                $prog.removeClass('progress-info progress-warning').addClass('progress-danger');

            } else if (pct < 40) {
                $prog.removeClass('progress-info').addClass('progress-warning');
            }
            if (pct < 1) {
                // if 0 or negative, no need to update again.
                return;
            }
            var that = this;
            setTimeout(function() {
                that.updateProgressBar();
            }, 100);
        },

        answerClick: function(evt) {
            var $el = this.$el.find(evt.target);
            console.log('--- answerClick: chose:', $el.html());

            if (this.$el.find('.myChoice').length > 0) {
                console.log('answerClick: already chose:', this.$el.find('.myChoice').html());
                return;
            }

            $el.addClass('myChoice btn-inverse');
            app.socket.emit('answer', {
                answer: $el.html(),
                question: this.model.get('question')
            });
        }
    });


    app.AnswerView = Backbone.View.extend({

        model: app.answer,

        el: $('#answerContainer'),

        template: _.template($('#answerTemplate').html()),

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            console.log('app.AnswerView render', this.model.toJSON());
            var data = this.model.toJSON();
            data.myChoice = $('#questionContainer .myChoice').html() || '';
            if (data.correctAnswer) {
                this.$el.html(this.template({ d: data }));
            } else {
                this.$el.html('');
            }
        }
    });


    var App = new app.AppView();
});