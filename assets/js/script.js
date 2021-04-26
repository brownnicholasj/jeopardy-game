// delegation event listener for board
var answerSubmit = document.getElementById('boardContainer');

//Function that gives user the option to reload their last session. The internal code at this point is arbitrary, but I wanted something there for testing the functionality.
function continueLastGame() {
	$('#boardContainer').append('<div id="continue"></div>');
	let continueDiv = $('#continue');
	continueDiv.append('<p>Saved game detected. Do you want to continue?</p>');
	continueDiv.append('<button id="confirmSave">Yes</button>');
	continueDiv.append('<button id="confirmNew">No</button>');
	let playSave = $('#confirmSave');
	let playNew = $('#confirmNew');
	playSave.on('click', function (event) {
		event.preventDefault();
		let questionsObject = recoverSession();
		createCategories(questionsObject);
	});
	playNew.on('click', function (event) {
		event.preventDefault();
		playGame();
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
		playGame();
	}
}

// This function saves the function's question object to local storage.
function recoverSession() {
	let questionsObject = JSON.parse(localStorage.getItem('currentSession'));
	return questionsObject;
}
// This function can be called to save the current game session.
function saveSession(object) {
	localStorage.setItem('currentSession', JSON.stringify(object));
}
//GAME CONSTRAINT DEVELOPMENT
//	This function should more accurately generate a round of jeopardy with increased clue/value integrity.
function constrainGame(object) {
	console.log(object);
	let keys = Object.keys(object);
	let subKeys = Object.keys(object[keys[0]]);
	let botKeys = Object.keys(object[keys[subKeys[0]]]);
	console.log(keys)
	console.log(subKeys)
	console.log(botKeys)
	for (let i = 0; i < keys.length; i++) {
		for (let j = 0; j < object[keys[i]].length; j++) {
			delete object[keys[i]][j].id;
			delete object[keys[i]][j].airdate;
			delete object[keys[i]][j].category;
			delete object[keys[i]][j].category_id;
			delete object[keys[i]][j].created_at;
			delete object[keys[i]][j].game_id;
			delete object[keys[i]][j].invalid_count;
			delete object[keys[i]][j].updated_at;
			if (object[keys[i]][j].value == 1000 || 800 || 600) {
				object[keys[i]][j].value = (object[keys[i]][j].value)/2;
			}
			if (object[keys[i]][j].value == 1000 || 800 || 600) {
				object[keys[i]][j].value = (object[keys[i]][j].value)/2;
			}
		}		
	}

	console.log(object)
}



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
	
	saveSession(questionsObject);
	// createCategories(Object.getOwnPropertyNames(questionsObject));
	createCategories(questionsObject);
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

//function to create/populate the board
function createCategories(categoryArray) {
	var boardContainer = document.getElementById('boardContainer');
	let bContainerJq = $('#boardContainer');
	bContainerJq.empty();

	for (var i = 0; i < Object.keys(categoryArray).length; i++) {
		var catCount = i + 1;
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
		catHead.innerHTML = `${Object.keys(categoryArray)[i].toUpperCase()}`;
		catHeadcontainer.append(catHead);
		catBox.append(catHeadcontainer);
		catContainer.append(catBox);
		// console.log(categoryArray)
		// console.log(Object.values(categoryArray)[i]);
		var box1Values = getBoxValues(Object.values(categoryArray)[i], 1);
		var box2Values = getBoxValues(Object.values(categoryArray)[i], 2);
		var box3Values = getBoxValues(Object.values(categoryArray)[i], 3);
		var box4Values = getBoxValues(Object.values(categoryArray)[i], 4);
		var box5Values = getBoxValues(Object.values(categoryArray)[i], 5);
		// console.log(box2Values);
		// console.log(box3Values);
		// console.log(box4Values);
		// console.log(box5Values);

		createQuestions(
			catContainer,
			catCount,
			box1Values,
			box2Values,
			box3Values,
			box4Values,
			box5Values,
			categoryArray
		);
		boardContainer.append(catContainer);
	}
	$('button').on('click', function(event){
		console.log(event.target.id);
		let answerSelector = $(this).attr('data-id');
		let correctSelector = $(this).parent().siblings('.modal-header').children('.modal-title').attr('data-answer');
		let userSubmission = $(`#floatingInput_${answerSelector}`).val();
		let answerPackage = [];
		answerPackage.push(correctSelector);
		answerPackage.push(userSubmission);
		checkAnswer(answerPackage)
	})
}

function checkAnswer(answerPackage) {
	console.log(answerPackage);
	let answer = answerPackage[0].toLowerCase();
	let submission = answerPackage[1].toLowerCase();
	if (answer.includes(submission)) {
		console.log(true);
	} else {
		console.log(false);
	}
}

//function to create/populate questions section
function createQuestions(
	container,
	catCount,
	box1Values,
	box2Values,
	box3Values,
	box4Values,
	box5Values,
	categoryArray,
	round
) {
	var catAContainer = document.createElement('div');
	catAContainer.setAttribute('class', 'row');
	catAContainer.setAttribute('id', 'catAContainer');
	//storing/pulling questions for related category here

	var categoryQuestions = [1, 2, 3, 4, 5];
	for (var i = 0; i < categoryQuestions.length; i++) {
		var boxCount = i + 1;
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
		// var categoryFinder =
		// 	container.children[0].children[0].children[0].textContent;
		var questId = `cat${catCount}b${boxCount}`;
		// questHead.setAttribute('data-bs-target', `#${questId}`);
		questBox.setAttribute('data-bs-toggle', 'modal');
		questBox.setAttribute('data-bs-target', `#${questId}`);
		// questBox.append(questHead);
		questBox.innerHTML = `$${questValue}`;
		catAContainer.append(questBox);
		// console.log(questBox);

		var amount = getQvalues(
			boxCount,
			'a',
			box1Values,
			box2Values,
			box3Values,
			box4Values,
			box5Values
		);
		var question = getQvalues(
			boxCount,
			'q',
			box1Values,
			box2Values,
			box3Values,
			box4Values,
			box5Values
		);
		var answer = getQvalues(
			boxCount,
			'an',
			box1Values,
			box2Values,
			box3Values,
			box4Values,
			box5Values
		);

		createModal(catAContainer, questId, amount, question, answer);
		container.append(catAContainer);
	}

}



//function to create the modal (popup) inside each questionBox
function createModal(container, id, amount, question, answer) {
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
	modalQuestion.setAttribute('data-answer', answer);
	modalQuestion.setAttribute('data-value', amount);
	modalQuestion.innerHTML = question;

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
	modalInput.setAttribute('data-id', id);
	modalInput.setAttribute('placeholder', 'Answer Here');

	var modalLabel = document.createElement('label');
	modalLabel.setAttribute('for', `floatingInput_${id}`);

	var modalFooter = document.createElement('div');
	modalFooter.setAttribute('class', 'modal-footer');

	var modalSubmit = document.createElement('button');
	modalSubmit.setAttribute('type', 'button');
	modalSubmit.setAttribute('id', `submit_${id}`);
	modalSubmit.setAttribute('data-id', id);
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
		// console.log(answerValue);
	}
}

//function to sum score from each question after answered
function scoreTally(answer, value) {
	var totalScore = document.getElementById('scoreBox');
	var currentScore = Number(totalScore.textContent);

	if (!answer) {
		var scoreAdd = value * -1;
		totalScore.textContent = currentScore + scoreAdd;
	} else {
		var scoreAdd = value * 1;
		totalScore.textContent = currentScore + scoreAdd;
	}
}

// simulation for score updating
// scoreTally(true, 100);
// scoreTally(true, 200);
// scoreTally(true, 300);
// scoreTally(true, 400);
// scoreTally(false, 500);

//callNewQuestions();
checkLocalStorage();
//generate board -- goes through checkLocalStorage();
// createCategories();
// start of game here
// playGame();

function formQuestion(speechPart) {
	switch (speechPart.toLowerCase()) {
		case 'geographical name':
			return 'Where is ';
		case 'biographical name':
			return 'Who is ';
		default:
			return 'What is ';
	}
}

function defineWord(word) {
	let output;
	const regex = /[%!@#$%^&*()_\-+=/]/gm;
	if (regex.test(word)) {
		output = 'What is ';
		//MAP OUTPUT TO THE QUESTIONS DATA OBJECT.
	} else {
		let searchUrl =
			'https://dictionaryapi.com/api/v3/references/collegiate/json/' +
			word +
			'?key=0442cdad-ae0d-4b9d-a484-5df8d0b9fc7d';
		fetch(searchUrl)
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				console.log('Question Data: ', data);
				if (data && data[0] && data[0].fl) {
					output = formQuestion(data[0].fl);
				} else {
					output = 'What is ';
				}
				//MAP OUTPUT TO THE QUESTIONS DATA OBJECT. Test
			});
	}
}

function getBoxValues(category, num) {
	var box = {};
	for (let value of Object.values(category)) {
		if (typeof box === 'object' && box !== null) {
			// console.log('box 1 statement 1 true');
			if (value.value == 100 * num) {
				// console.log('100 value here');
				box.value = value.value;
				box.question = value.question;
				box.answer = value.answer;
			} else if (value.value == 200 * num) {
				// console.log('200 value here');
				box.value = value.value;
				box.question = value.question;
				box.answer = value.answer;
			}
		}
	}
	return box;
}

function getQvalues(
	boxCount,
	ind,
	box1Values,
	box2Values,
	box3Values,
	box4Values,
	box5Values
) {
	if (boxCount === 1) {
		if (ind === 'a') {
			return box1Values.value;
		}
		if (ind === 'q') {
			return box1Values.question;
		}
		if (ind === 'an') {
			return box1Values.answer;
		}
	}
	if (boxCount === 2) {
		if (ind === 'a') {
			return box2Values.value;
		}
		if (ind === 'q') {
			return box2Values.question;
		}
		if (ind === 'an') {
			return box2Values.answer;
		}
	}
	if (boxCount === 3) {
		if (ind === 'a') {
			return box3Values.value;
		}
		if (ind === 'q') {
			return box3Values.question;
		}
		if (ind === 'an') {
			return box3Values.answer;
		}
	}
	if (boxCount === 4) {
		if (ind === 'a') {
			return box4Values.value;
		}
		if (ind === 'q') {
			return box4Values.question;
		}
		if (ind === 'an') {
			return box4Values.answer;
		}
	}
	if (boxCount === 5) {
		if (ind === 'a') {
			return box5Values.value;
		}
		if (ind === 'q') {
			return box5Values.question;
		}
		if (ind === 'an') {
			return box5Values.answer;
		}
	}
}

//event Listeners
answerSubmit.addEventListener('submit', handleFormSubmit);
answerSubmit.addEventListener('click', handleButtonClick);
