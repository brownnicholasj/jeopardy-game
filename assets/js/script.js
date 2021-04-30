// delegation event listener for board
var answerSubmit = document.getElementById('boardContainer');
var titleLink = document.getElementById('topTitle');
var themeSwitch = false;
var currentTime;

//Function that gives user the option to reload their last session. The internal code at this point is arbitrary, but I wanted something there for testing the functionality.
function continueLastGame() {
	$('#boardContainer').append('<div id="continue"></div>');
	let continueDiv = $('#continue');
	continueDiv.append('<p>Do you want to replay the same board?</p>');
	continueDiv.append('<button id="confirmSave">Yes</button>');
	continueDiv.append('<button id="confirmNew">No</button>');
	let playSave = $('#confirmSave');
	let playNew = $('#confirmNew');
	playSave.on('click', function (event) {
		event.preventDefault();
		currentTime = setInterval(timeBox, 1000);
		audioSound('startGame');
		let questionsObject = recoverSession();
		createCategories(questionsObject);
	});
	playNew.on('click', function (event) {
		event.preventDefault();
		currentTime = setInterval(timeBox, 1000);
		audioSound('startGame');
		playGame();
	});
}

//This will be the function that generates the puzzle area from the data in the question object. Again, the internal code is arbitrary at this point.
function loadQuestionSpace(choice) {
	if (choice == 'confirmNew') {
		$('#testdiv').empty();
		$('#testdiv').append('<h1>NEW GAME</h1>');
		// callNewQuestions();
	}
	if (choice == 'confirmSave') {
		$('#testdiv').empty();
		$('#testdiv').append('<h1>SAVED GAME</h1>');
		sessionQuestions = JSON.parse(localStorage.getItem('currentSession'));
		//pull saved score too?
		//sessionScore = JSON.parse(localStorage.getItem('currentScore'));
	}
}

//This function checks local storage for a saved game and returns the option to continue if it exists, or a new game if it doesn't.
function checkLocalStorage() {
	if (localStorage.getItem('currentSession')) {
		continueLastGame();
	} else {
		var currentTime = setInterval(timeBox, 1000);
		audioSound('startGame');
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

//************************************************************ Functions to get JService DATA ********* */

var object = {};

async function playGame() {
	var questionsObject = {};
	var potentialNewCategory = await getNewCategory();
	var duplicatesArray = [];
	while (Object.keys(questionsObject).length < 6) {
		var potentialNewCategory = await getNewCategory();
		if (
			potentialNewCategory === false ||
			duplicatesArray.includes(Object.keys(potentialNewCategory)[0])
		) {
			// console.log('category is false');
		} else {
			questionsObject[Object.keys(potentialNewCategory)[0]] = Object.values(
				potentialNewCategory
			)[0];
			duplicatesArray.push(Object.keys(potentialNewCategory)[0]);
		}
	}
	saveSession(questionsObject);

	createCategories(questionsObject);

	audioSound('boardGeneration');
}

async function getNewCategory() {
	var response = await fetch(
		'https://jservice.io/api/category?id=' + Math.floor(Math.random() * 18000)
	);
	var data = await response.json();
	var questionsPull = data;
	if (questionsPull.clues.length > 5) {
		questionsPull.clues = questionsPull.clues
			.map((a) => ({ sort: Math.random(), value: a }))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => a.value);
	}
	var newObjectProperty = await organizeData(questionsPull);

	if (newObjectProperty === false) {
		return false;
	} else {
		return newObjectProperty;
	}
}

async function organizeData(data) {
	var currentCategoryObject = {};
	for (let i = 0; i < 5; i++) {
		if (!data.clues[i].question || !data.clues[i].answer) {
			return false;
		}
	}
	currentCategoryObject[data.title] = data.clues;
	return currentCategoryObject;
}

//function to create/populate the board
function createCategories(categoryArray) {
	var boardContainer = document.getElementById('boardContainer');
	let bContainerJq = $('#boardContainer');
	bContainerJq.empty();

	for (var i = 0; i < Object.keys(categoryArray).length; i++) {
		var catCount = i + 1;
		var catContainer = document.createElement('div');
		catContainer.setAttribute('class', 'col-12 col-sm-2');
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

		var box1Values = getBoxValues(Object.values(categoryArray)[i], 1);
		var box2Values = getBoxValues(Object.values(categoryArray)[i], 2);
		var box3Values = getBoxValues(Object.values(categoryArray)[i], 3);
		var box4Values = getBoxValues(Object.values(categoryArray)[i], 4);
		var box5Values = getBoxValues(Object.values(categoryArray)[i], 5);

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
}
//BEGIN CHECK ANSWER ADJUSTMENT.
function checkAnswer(answerPackage) {
	let answer = answerPackage[0].toLowerCase();
	if (!answerPackage[3]) {
		if (answerPackage[1]) {
			let submission = answerPackage[1].toLowerCase();
			let lengthCheck = validateSubmissionLength(answer, submission);
			if (answer.includes(submission) && lengthCheck) {
				scoreTally(true, answerPackage[2]);
				answerPackage.push(true);
			} else {
				scoreTally(false, answerPackage[2]);
				answerPackage.push(false);
			}
		}
		if (!answerPackage[1]) {
			let submission = false;
			if (answer.includes(submission)) {
				scoreTally(true, answerPackage[2]);
				answerPackage.push(true);
			} else {
				scoreTally(false, answerPackage[2]);
				answerPackage.push(false);
			}
		}
		answerToast(answerPackage);
	} else {
		answerToast(answerPackage);
	}
}

function validateSubmissionLength(answer, submission) {
	if (answer.length > 12) {
		if (submission.length > answer.length / 4) {
			return true;
		} else {
			return false;
		}
	} else {
		if (submission.length > answer.length / 2) {
			return true;
		} else {
			return false;
		}
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
		var questId = `cat${catCount}b${boxCount}`;
		var questBox = document.createElement('a');
		questBox.setAttribute('class', 'col col-md-12');
		questBox.setAttribute('id', 'questBox');
		questBox.setAttribute('name', questId);
		// establish value [should pull or match to API]
		var questValue = Math.imul(categoryQuestions[i], 100);
		questBox.setAttribute('data-bs-toggle', 'modal');
		questBox.setAttribute('data-bs-target', `#${questId}`);
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
async function createModal(container, id, amount, question, answer) {
	// console.log(container, id, amount, question, answer);
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
	modalQuestion.setAttribute('class', `modal-title modal_${id}`);
	modalQuestion.setAttribute('id', id);
	//	modalQuestion.setAttribute('name', `modal_${id}`);
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

	var modalPhrase = document.createElement('h5');
	modalPhrase.setAttribute('id', `phrase_${id}`);

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

	var modalPass = document.createElement('button');
	modalPass.setAttribute('type', 'button');
	modalPass.setAttribute('id', 'pass');
	modalPass.setAttribute('class', 'btn');
	modalPass.setAttribute('data-bs-dismiss', 'modal');
	modalPass.innerHTML = 'Pass';

	var modalSubmit = document.createElement('button');
	modalSubmit.setAttribute('type', 'button');
	modalSubmit.setAttribute('id', `submit`);
	modalSubmit.setAttribute('data-id', id);
	modalSubmit.setAttribute('class', 'btn');
	modalSubmit.setAttribute('data-bs-dismiss', 'modal');
	modalSubmit.innerHTML = 'Submit';

	modalFooter.append(modalSubmit);
	modalFooter.append(modalPass);
	modalFgroup.append(modalPhrase);
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
	// console.log(event.target.id);
	if (event.target.id === 'submit') {
		// console.log('button click 2');
		var answerHome =
			event.target.parentNode.parentNode.childNodes[0].childNodes[1];
		// console.log(answerHome);
		answerHandler(answerHome, false);
		//currently just console logging answer until we can do something
		// console.log(answerValue);
		removeCatSquare(event.target);
		showToast();
	} else if (event.target.id === 'pass') {
		var answerHome =
			event.target.parentNode.parentNode.childNodes[0].childNodes[1];
		removeCatSquare(event.target);
		answerHandler(answerHome, true);
		showToast();
		audioSound('timesUp');
	} else if (event.target.id === 'topTitle') {
		audioSound('theme');
	} else if (event.target.id === 'questBox') {
		let clueTarget = $(event.target);
		let clueName = clueTarget.attr('name');
		let answerTarget = $(`.modal_${clueName}`);
		let answerName = answerTarget.attr('data-answer');
		// console.log(answerName);
		defineWord(answerName, `phrase_${clueName}`);
	}
	if (event.target.id === 'endButton') {
		location.reload();
	}
}

//
function answerHandler(event, boolean) {
	let answerSelector = event.getAttribute('id');
	let correctSelector = event.getAttribute('data-answer');
	let userSubmission = $(`#floatingInput_${answerSelector}`).val();
	let valueSelector = event.getAttribute('data-value');
	let answerPackage = [];
	answerPackage.push(correctSelector);
	answerPackage.push(userSubmission);
	answerPackage.push(valueSelector);
	answerPackage.push(boolean);
	checkAnswer(answerPackage);
}

function answerToast(package) {
	var toast = document.createElement('div');
	var tHeader = document.createElement('div');
	var solve = document.createElement('strong');
	var value = document.createElement('small');
	var body = document.createElement('div');
	var userA = document.createElement('h4');
	var correctA = document.createElement('h4');

	correctA.setAttribute('id', 'correctA');
	correctA.innerHTML = `The Correct Answer is <br> ${package[0]}`;
	userA.setAttribute('id', 'userA');
	solve.setAttribute('class', 'me-auto');
	if (!package[3]) {
		userA.innerHTML = `Your Answer was <br> ${package[1]}`;

		var correct;
		if (package[4] === true) {
			correct = 'You are Correct!';
			value.innerText = `+ ${package[2]}`;
			audioSound('rightAnswer');
		} else {
			correct = 'Incorrect';
			value.innerText = `- ${package[2]}`;
			value.setAttribute('id', 'valuefalse');
			audioSound('timesUp');
		}
		solve.innerText = correct;
	} else {
		solve.innerText = `Not Answered`;
	}

	body.setAttribute('class', 'toast-body');
	body.append(correctA);
	body.append(userA);

	tHeader.setAttribute('class', 'toast-header');
	tHeader.append(solve);
	tHeader.append(value);

	toast.setAttribute('class', 'toast');
	toast.setAttribute('data-bs-delay', 2000);
	toast.setAttribute('role', 'alert');
	toast.setAttribute('aria-live', 'assertive');
	toast.setAttribute('aria-atomic', 'true');
	toast.setAttribute('id', 'toast');
	// toast.setAttribute('data-autohide', 'false');
	toast.append(tHeader);
	toast.append(body);

	mainBody = document.getElementById('boardContainer');
	mainBody.append(toast);
}

function showToast() {
	$('.toast').toast('show');
}

function removeCatSquare(event) {
	var logId = event.parentNode.parentNode.parentNode.parentNode.id;
	var findBox = document.getElementsByName(logId);
	findBox[0].innerHTML = '';
	findBox[0].removeAttribute('data-bs-toggle');
	findBox[0].setAttribute('done', true);
	var findModal = document.getElementById(logId);
	findModal.remove();
	endGame();
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
	saveScore();
}

function saveScore() {
	// console.log('save score start');
	var totalScore = document.getElementById('scoreBox');
	var currentScore = Number(totalScore.textContent);
	localStorage.setItem('currentScore', JSON.stringify(currentScore));
}

checkLocalStorage();

async function formQuestion(speechPart) {
	switch (speechPart.toLowerCase()) {
		case 'geographical name':
			return 'Where is ';
		case 'biographical name':
			return 'Who is ';
		default:
			return 'What is ';
	}
}

async function defineWord(word, id) {
	var findObject = document.getElementById(id);
	let output;
	const regex = /[%!@#$%^&*()_\-+=/]/gm;
	if (regex.test(word)) {
		output = 'What is ';

		if (findObject === null) {
			return;
		} else {
			findObject.innerText = `${output}...`;
		}
	} else {
		let searchUrl =
			'https://dictionaryapi.com/api/v3/references/collegiate/json/' +
			word +
			'?key=0442cdad-ae0d-4b9d-a484-5df8d0b9fc7d';
		let response = await fetch(searchUrl);
		let data = await response.json();
		if (data && data[0] && data[0].fl) {
			var formRequest = data[0].fl;
			// console.log(formRequest);
			output = await formQuestion(formRequest);
		} else {
			output = 'What is ';
		}
		if (findObject === null) {
			return;
		} else {
			findObject.innerText = `${output}...`;
		}
	}
}

var everyQuestionArray = [];

function getBoxValues(category, num) {
	var box = {};
	for (i = 0; i < 5; i++) {
		if (typeof box === 'object' && box) {
			if (num === 1) {
				box.value = 100;
				box.question = category[num - 1].question;
				box.answer = category[num - 1].answer;
			}
			if (num === 2) {
				box.value = 200;
				box.question = category[num - 1].question;
				box.answer = category[num - 1].answer;
			}
			if (num === 3) {
				box.value = 300;
				box.question = category[num - 1].question;
				box.answer = category[num - 1].answer;
			}
			if (num === 4) {
				box.value = 400;
				box.question = category[num - 1].question;
				box.answer = category[num - 1].answer;
			}
			if (num === 5) {
				box.value = 500;
				box.question = category[num - 1].question;
				box.answer = category[num - 1].answer;
			}
		}
	}
	everyQuestionArray.push(box);

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

//function to find and play sound
function audioSound(selection) {
	var mute = document.getElementById('mute');
	if (mute.getAttribute('data-status') === 'true') {
		if (selection === 'theme') {
			if (themeSwitch === false) {
				var path = 'assets/audio/';
				var snd = new Audio(path + selection + '.mp3');
				snd.play();
				themeSwitch = true;
			}
		}
		if (selection !== 'theme') {
			var path = 'assets/audio/';
			var snd = new Audio(path + selection + '.mp3');
			snd.play();
		}
	}
}

function timeBox() {
	var roundTime = document.getElementById('timeBox').getAttribute('data-time');
	if (roundTime === '' || roundTime === null) {
		roundTime = 900;
	} else {
		roundTime--;
	}
	if (roundTime === 0) {
		clearInterval(currentTime);
	}
	var minute = Math.floor(roundTime / 60);
	var second = roundTime - minute * 60;
	leadZero(second);
	function leadZero(int) {
		var sec = int.toString();
		while (sec.length < 2) sec = '0' + sec;
		second = sec;
	}
	var timerLog = `${minute}:${second}`;
	document.getElementById('timeBox').innerText = timerLog;
	document.getElementById('timeBox').setAttribute('data-time', roundTime);
	if (document.getElementById('timeBox').getAttribute('data-time') == 0) {
		endGame();
	}
}

//checks the status of the mute button to toggle on/off
function muteHandler() {
	mute = document.getElementById('mute');
	var currState = document.getElementById('mute');
	if (currState.getAttribute('data-status') === 'false') {
		currState.setAttribute('class', 'fas fa-volume-up');
		currState.setAttribute('data-status', 'true');
	} else {
		currState.setAttribute('class', 'fas fa-volume-mute');
		currState.setAttribute('data-status', 'false');
	}
}

function endGame() {
	console.log('start endGame');
	var boxFind = document.querySelectorAll('#questBox[done]');
	if (boxFind.length == '30') {
		console.log(boxFind.length);
		finalScreen();
	}
	var timerFind = document.getElementById('timeBox').getAttribute('data-time');
	console.log(timerFind);
	if (timerFind == 0) {
		console.log('end the game');
		finalScreen();
	}
}

function finalScreen() {
	console.log('FINAL SCREEN HERE');
	answerSubmit.innerHTML = '';

	var div = document.createElement('div');
	div.setAttribute('id', 'finalContainer');
	var text = document.createElement('h1');
	var currentScore = document.getElementById('scoreBox').innerText;
	text.setAttribute('id', 'endGame');
	text.innerHTML = `The game has ended <br> your score is $${currentScore}`;
	div.append(text);

	var restart = document.createElement('button');
	restart.setAttribute('id', 'endButton');
	restart.innerHTML = 'Restart';
	div.append(restart);
	answerSubmit.append(div);
}

//event Listeners
answerSubmit.addEventListener('submit', handleFormSubmit);
answerSubmit.addEventListener('click', handleButtonClick);
titleLink.addEventListener('click', handleButtonClick);
mute.addEventListener('click', muteHandler);
