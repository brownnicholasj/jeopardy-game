// This is the first draft of the persistant session object. I organized it for ease of use in iteration, but when we get there we may need to make adjustments.
let sessionQuestions = {
	category1: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
	category2: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
	category3: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
	category4: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
	category5: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
	category6: {
		valule: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		question: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
		answer: {
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
		},
	},
};

let mathFacts = {
	fact1: { number: '', text: '' },
	fact2: { number: '', text: '' },
	fact3: { number: '', text: '' },
	fact4: { number: '', text: '' },
	fact5: { number: '', text: '' },
	fact6: { number: '', text: '' },
};
//Function that gives user the option to reload their last session. The internal code at this point is arbitrary, but I wanted something there for testing the functionality.
function continueLastGame() {
	$('#testdiv').append('<div id="continue"></div>');
	let continueDiv = $('#continue');
	continueDiv.append('<p>Saved game detected. Continue?</p>');
	continueDiv.append('<button id="confirmSave">Yes</button>');
	continueDiv.append('<button id="confirmNew">No</button>');
	let playSave = $('#confirmSave');
	let playNew = $('#confirmNew');
	playSave.on('click', function (event) {
		event.preventDefault();
		loadQuestionSpace('confirmSave');
	});
	playNew.on('click', function (event) {
		event.preventDefault();
		loadQuestionSpace('confirmNew');
	});
}

//This will be the function that generates the puzzle area from the data in the question object. Again, the internal code is arbitrary at this point.
function loadQuestionSpace(choice) {
	if (choice == 'confirmNew') {
		$('#testdiv').empty();
		$('#testdiv').append('<h1>NEW GAME</h1>');
		callNewQuestions();
	}
	if (choice == 'confirmSave') {
		$('#testdiv').empty();
		$('#testdiv').append('<h1>SAVED GAME</h1>');
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
function saveSession(number, object) {
	localStorage.setItem('category-' + number, JSON.stringify(object));
}
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
		let keyArray = ['fact1', 'fact2', 'fact3', 'fact4', 'fact5', 'fact6'];
		fetch(`http://numbersapi.com/${categoryArray[i]}/math?json`)
			.then((response) => response.json())
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

//************************************************************ Functions to get JService DATA ********* */

var object = {};

async function playGame() {
	var randomNumber = Math.floor(Math.random() * 10000);
	var response = await fetch(
		'https://jservice.io/api/categories?count=6&offset=' + randomNumber
	);
	var data = await response.json();
	var questionsPull = data;
	var questionsObject = await organizeData(questionsPull);
	console.log('questionsObject :>> ', questionsObject);
	createCategories(Object.getOwnPropertyNames(questionsObject));
}

async function organizeData(data) {
	var allQuestions = {};
	if (data) {
		console.log(data);
		for (let i = 0; i < data.length; i++) {
			var questionResponse = await getQuestions(data[i].id);

			allQuestions[data[i].title] = questionResponse;
			var questionBank = {
				[data[i].title]: questionResponse,
			};
			saveSession(i, questionBank);
		}
	}
	console.log('FINAL QUESTION BANK: >> ', allQuestions);
	return allQuestions;
}

async function getQuestions(category) {
	var response = await fetch(
		'http://jservice.io/api/clues?category=' + category
	);
	var data = await response.json();
	return data;
}

playGame();

//function to create/populate the board
function createCategories(categoryArray) {
	var boardContainer = document.getElementById('boardContainer');
	//storing all needed categories here??
	// var categoryArray = [1, 2, 3, 4, 5, 6];
	for (var i = 0; i < categoryArray.length; i++) {
		var catContainer = document.createElement('div');
		catContainer.setAttribute('class', 'col-12 col-md-2');
		catContainer.setAttribute('id', 'catContainer');
		var catBox = document.createElement('div');
		catBox.setAttribute('class', 'row');
		catBox.setAttribute('id', 'catBox');
		var catHeadcontainer = document.createElement('div');
		var catHead = document.createElement('h4');
		catHeadcontainer.setAttribute('class', 'col-12');
		//update category name here
		catHead.innerHTML = `${categoryArray[i]}`;
		catHeadcontainer.append(catHead);
		catBox.append(catHeadcontainer);
		catContainer.append(catBox);
		createQuestions(catContainer);
		boardContainer.append(catContainer);
	}
}

//function to create/populate questions section
function createQuestions(container, round) {
	var catAContainer = document.createElement('div');
	catAContainer.setAttribute('class', 'row');
	catAContainer.setAttribute('id', 'catAContainer');
	//storing/pulling questions for related category here
	var categoryQuestions = [1, 2, 3, 4, 5];
	for (var i = 0; i < categoryQuestions.length; i++) {
		var questBox = document.createElement('a');
		questBox.setAttribute('class', 'col col-md-12');
		questBox.setAttribute('id', 'questBox');
		// var questHead = document.createElement('button');
		// establish value [should pull or match to API]
		var questValue = Math.imul(categoryQuestions[i], 100);
		// questHead.innerHTML = '$' + questValue;
		// questHead.setAttribute('type', 'button');
		// questHead.setAttribute('class', 'btn');
		// questHead.setAttribute('data-bs-toggle', 'modal');
		var categoryFinder =
			container.children[0].children[0].children[0].textContent;
		var questId = `${categoryFinder}_${categoryQuestions[i]}`;
		questId = questId.replace(/\s+/g, '');
		// questHead.setAttribute('data-bs-target', `#${questId}`);
		questBox.setAttribute('data-bs-toggle', 'modal');
		questBox.setAttribute('data-bs-target', `#${questId}`);
		// questBox.append(questHead);
		questBox.innerHTML = `$${questValue}`;
		catAContainer.append(questBox);
		// console.log(questBox);
		createModal(catAContainer, questId);
		container.append(catAContainer);
	}
}

//function to create the modal (popup) inside each questionBox
function createModal(container, id) {
	var modalFade = document.createElement('div');
	modalFade.setAttribute('class', 'modal fade');
	modalFade.setAttribute('id', id);
	modalFade.setAttribute('tabindex', '-1');
	modalFade.setAttribute('aria-labelledby', id);
	modalFade.setAttribute('aria-hidden', 'true');
	modalFade.setAttribute('data-bs-keyboard', 'false');
	modalFade.setAttribute('data-bs-backdrop', 'static');

	var modalDialog = document.createElement('div');
	modalDialog.setAttribute('class', 'modal-dialog modal-dialog-centered');

	var modalContent = document.createElement('div');
	modalContent.setAttribute('class', 'modal-content');

	//title for the question, currently in as 'Answer' since jeopardy
	var modalHeader = document.createElement('div');
	modalHeader.setAttribute('class', 'modal-header');
	modalHeader.innerHTML = 'Answer:';

	// store the question here
	var modalQuestion = document.createElement('h5');
	modalQuestion.setAttribute('class', 'modal-title');
	modalQuestion.setAttribute('id', id);
	modalQuestion.innerHTML = id;

	// store timer
	var modalTimer = document.createElement('h5');
	modalTimer.setAttribute('class', 'modal-timer');
	modalTimer.setAttribute('id', 'modaltimer');
	// set interval timer here
	modalTimer.innerHTML = 10;

	var modalBody = document.createElement('div');
	modalBody.setAttribute('class', 'modal-body');

	var modalForm = document.createElement('form');
	var modalFgroup = document.createElement('div');
	modalFgroup.setAttribute('class', 'form-group');

	var modalInput = document.createElement('input');
	modalInput.setAttribute('type', 'answer');
	modalInput.setAttribute('class', 'form-control');
	modalInput.setAttribute('id', `floatingInput_${id}`);
	modalInput.setAttribute('placeholder', 'Answer Here');

	var modalLabel = document.createElement('label');
	modalLabel.setAttribute('for', `floatingInput_${id}`);

	var modalFooter = document.createElement('div');
	modalFooter.setAttribute('class', 'modal-footer');

	var modalSubmit = document.createElement('button');
	modalSubmit.setAttribute('type', 'button');
	modalSubmit.setAttribute('id', 'submit');
	modalSubmit.setAttribute('class', 'btn');
	modalSubmit.setAttribute('data-bs-dismiss', 'modal');
	modalSubmit.innerHTML = 'Submit';

	modalFooter.append(modalSubmit);
	modalFgroup.append(modalInput);
	modalFgroup.append(modalLabel);
	modalForm.append(modalFgroup);
	modalBody.append(modalForm);
	modalHeader.append(modalQuestion);
	modalHeader.append(modalTimer);
	modalContent.append(modalHeader, modalBody, modalFooter);
	modalDialog.append(modalContent);
	modalFade.append(modalDialog);
	container.append(modalFade);
}

//function to handle the submit event (pressing 'enter' after input)
function handleFormSubmit(event) {
	event.preventDefault();
	// Traverse DOM to click the button [Hitting Enter does same thing as clicking button]
	event.target.parentNode.parentNode.childNodes[2].childNodes[0].click();
}

//function to handle the clicking of the 'Submit' button inside the modal -- directs to the handleFormSubmit
function handleButtonClick(event) {
	event.preventDefault();
	if (event.target.id === 'submit') {
		var answerValue =
			event.target.parentNode.parentNode.childNodes[1].childNodes[0]
				.childNodes[0].childNodes[0].value;
		//currently just console logging answer until we can do something
		console.log(answerValue);
	}
}

checkLocalStorage();
//generate board
// createCategories();

//event Listeners
// answerSubmit.addEventListener('submit', handleFormSubmit);
// answerSubmit.addEventListener('click', handleButtonClick);
