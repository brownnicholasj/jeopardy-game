
// This is the first draft of the persistant session object. I organized it for ease of use in iteration, but when we get there we may need to make adjustments.
let sessionQuestions = {
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

let mathFacts = {fact1: {number: '', text: ''}, fact2: {number: '', text: ''}, fact3: {number: '', text: ''}, fact4: {number: '', text: ''}, fact5: {number: '', text: ''}, fact6: {number: '', text: ''}}
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
        $('#testdiv').empty();
        $('#testdiv').append('<h1>NEW GAME</h1>');
        callNewQuestions();
    }
    if (choice == "confirmSave") {
        $('#testdiv').empty()
        $('#testdiv').append('<h1>SAVED GAME</h1>')
        sessionQuestions = JSON.parse(localStorage.getItem('currentSession'));
    }
}
//This function checks local storage for a saved game and returns the option to continue if it exists, or a new game if it doesn't.
function checkLocalStorage() {
    if (localStorage.getItem('currentSession')) {
        continueLastGame();
    } else {
        callNewQuestions(); //This will be the function that makes the API call. It will contain functions for setting the local object (which will save to local storage).
        saveSession();
    }
}
// This function saves the function's question object to local storage.
function saveSession(object) {
    localStorage.setItem('currentSession', JSON.stringify(object));
}

//#####################################TESTING ITERATED FETCH CALLS################################
//testing for the population of the session questions.

function callNewQuestions() {
    // Empty array for storing the randomly generated categories.
    let categoryArray = [];
    // Iterating through the possible categories to randomly assign 6. No dublicate testing yet, but we need it.
    for (let i = 0; i < 6; i++) {
        categoryArray.push(Math.floor(Math.random() * categories.length));
    }
    // Looping fetch call from a number facts API (for testing purposes only) based on the categories that were randomly selected.
    for (let i = 0; i < categoryArray.length; i++) {
        let keyArray = ['fact1', 'fact2','fact3','fact4','fact5','fact6'];
        (fetch(`http://numbersapi.com/${categoryArray[i]}/math?json`))
            .then(response => response.json())
            .then(function (data) {
                // Populating the object from which the questions will be rendered. There needs to be a step in between here where we look at questions and values in order to select a whole category. My suspicion is that we'll need to build an array within the scope of this function to contain the data in order to work with it.
                mathFacts[keyArray[i]].number = data.number;
                mathFacts[keyArray[i]].text = data.text;
            })
            .then(function (data) {
                // This calls the function that puts our finished category set into local storage.
                saveSession(mathFacts);
            });
    }
}
//callNewQuestions();
checkLocalStorage();






