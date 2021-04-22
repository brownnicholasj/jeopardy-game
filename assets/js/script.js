
// This is the first draft of the persistant session object. I organized it for ease of use in iteration, but when we get there we may need to make adjustments.
const sessionQuestions = {
    category1: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }},
    category2: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }},
    category3: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }},
    category4: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }},
    category5: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }},
    category6: {
        valule: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        question: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        },
        answer: {
            1: "",
            2: "",
            3: "",
            4: "",
            5: "",
        }}
} 

//Function that gives user the option to reload their last session. The internal code at this point is arbitrary, but I wanted something there for testing the functionality.
function continueLastGame() {
    $('#testdiv').append('<div id="continue"></div>');
    let continueDiv = $('#continue');
    continueDiv.append('<p>Saved game detected. Continue?</p>');
    continueDiv.append('<button id="confirmSave">Yes</button>');
    continueDiv.append('<button id="confirmNew">No</button>');
    let playSave = $('#confirmSave');
    let playNew = $('#confirmNew');
    playSave.on('click', function (event) {event.preventDefault(); loadQuestionSpace("confirmSave")});
    playNew.on('click', function (event) {event.preventDefault(); loadQuestionSpace("confirmNew")});
}

//This will be the function that generates the puzzle area from the data in the question object. Again, the internal code is arbitrary at this point.
function loadQuestionSpace(choice) {
    if (choice == "confirmNew") {
        $('#testdiv').empty()
        $('#testdiv').append('<h1>NEW GAME</h1>')
    }
    if (choice == "confirmSave") {
        $('#testdiv').empty()
        $('#testdiv').append('<h1>SAVED GAME</h1>')
    }
}
//This function checks local storage for a saved game and returns the option to continue if it exists, or a new game if it doesn't.
function checkLocalStorage() {
    if (localStorage.getItem('currentSession')) {
        continueLastGame();
        sessionQuestions = localStorage.getItem(JSON.stringify(sessionQuestions));
        loadQuestionSpace("confirmSave"); 
    } else {
        callNewQuestions(); //This will be the function that makes the API call. It will contain functions for setting the local object (which will save to local storage).
        loadQuestionSpace("confirmNew");
    }
}

//#####################################TESTING ITERATED FETCH CALLS################################
//testing for the population of the session questions.
let mathFacts = []
function callNewQuestions() {
    let categoryArray = [];
    for (let i = 0; i < 5; i++) {
        categoryArray.push(Math.floor(Math.random() * categories.length)); // This is selecting from a list of known, good (data-wise) categories.
    }
    console.log(categoryArray)
    let promises = [];
    for (let i = 0; i < categoryArray.length; i++) {
        (fetch(`http://numbersapi.com/${categoryArray[i]}/math?json`))
            .then(response => response.json())
            .then(function (data) {
                console.log(data)
                let tempArray = [];
                tempArray.push(data.number);
                tempArray.push(data.text);
                tempArray.push(data.type);
                mathFacts.push(tempArray);
            });
    }
    console.log(mathFacts);
}
callNewQuestions();
//checkLocalStorage();






