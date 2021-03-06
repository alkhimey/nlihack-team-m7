
// WHEN CREATING QUESTIONS AND ANSWERS ...
// The correct answer must be the first choice (keepin' it simple).
// Choices will be presented in random order.
// points is optional, defaults to 10 if not specified.
var mathQuestions = [{
    answer: 0,
    question: 'https://avatars1.githubusercontent.com/u/23655873?s=64&v=4',
    choices: [
        '141',
        '37',
        '613',
        '23'
    ]
},{
     answer: 0,
    question: 'https://static.pexels.com/photos/39517/rose-flower-blossom-bloom-39517.jpeg',
    choices: [
        '504',
        '252',
        '28',
        '2'
    ]
},{
    answer: 0,
    question: "https://static.pexels.com/photos/36753/flower-purple-lical-blosso.jpg?",
    choices: [
        '500 BC',
        '800 BC',
        '400 BC',
        '200 BC'
    ]
},{
    question: "Chad's car used 12 gallons of gasoline on a 420 mile trip. How many miles per gallon (mpg) did the car get?",
    choices: [
        '35 mpg',
        '25 mpg',
        '30 mpg',
        '40 mpg'
    ]
},{
    question: "What is the probability of rolling a pair of dice and getting the same number?",
    choices: [
        '1/6',
        '1/12',
        '1/4',
        '1/18'
    ]
},{
    question: "What's the area of a circle with radius 5?",
    choices: [
        '79',
        '25',
        '16',
        '31'
    ]
},{
    question: "What is 15% of 420?",
    choices: [
        '63',
        '57',
        '61',
        '69'
    ]
},{
    question: "How much is a googol? Note 10^3 means 10 x 10 x 10",
    choices: [
        '10^100',
        '10^10',
        '10^15',
        '10^20'
    ]
},{
    question: "What is the least prime natural number?",
    choices: [
        '2',
        '1',
        '3',
        '0'
    ]
}];

if (typeof module == 'object') {
    module.exports = mathQuestions;    
}
