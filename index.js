#!/usr/bin/env node

// Import dependencies

import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import ky from "ky";
import he from "he";
import fs from "fs";

// Define variables - difficulty and number of quiz questions will be determined by user
const chalkColorNames = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "blackBright",
  "redBright",
  "greenBright",
  "yellowBright",
  "blueBright",
  "magentaBright",
  "cyanBright",
  "whiteBright",
];
let questionNumber = 0;
let quizJSON;
const folderName = "question_data";
const date = new Date();
let quizDifficulty;
let questionObject;
let quizNumberOfQuestions;
let score = 0;

const correctAnswerResponses = [
  "Nice work!",
  "Good job!",
  "Bravo!",
  "Well done!",
];
const incorrectAnswerResponses = [
  "Unlucky",
  "You suck!",
  "Try again",
  "Better luck next time",
];

// Get the current date for quiz json filename
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const currentDate = `${day}-${month}-${year}`;

const quizUrl = `https://opentdb.com/api.php?amount=${quizNumberOfQuestions}&difficulty=${quizDifficulty}`;

// Helper function to provide a random item from an array

function randomResponse(answerResponses = Array) {
  return answerResponses[Math.floor(Math.random() * answerResponses.length)];

  // Credit to https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
}

// Helper function to shuffle an array

function shuffleArray(answerArray = Array) {
  let currentIndex = answerArray.length;

  // While there are remaining elements to shuffle

  while (currentIndex != 0) {
    // Pick a remaining element...

    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.

    [answerArray[currentIndex], answerArray[randomIndex]] = [
      answerArray[randomIndex],
      answerArray[currentIndex],
    ];
  }
  return answerArray;
}

// Credit to https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

// Helper function to create the data folder if it doesn't already exist
async function downloadQuizJSON(
  quizDifficulty = String,
  quizNumberOfQuestions = Number
) {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }

  // Save the current day's quiz json if it doesn't already exist

  try {
    if (!fs.existsSync(`${folderName}/${currentDate}.json`)) {
      const response = await ky.get(quizUrl);
      let data = await response.json();
      const dataString = JSON.stringify(data);
      fs.writeFileSync(`${folderName}/${currentDate}.json`, dataString);
    }
  } catch (err) {
    console.error(err);
  }

  try {
    if (fs.existsSync(`${folderName}/${currentDate}.json`)) {
      quizJSON = fs.readFileSync(`${folderName}/${currentDate}.json`);
      quizJSON = JSON.parse(quizJSON);
    }
  } catch (err) {
    console.error(err);
  }
}

// Timeout helper function - 2s default delay

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    "Welcome to today's daily quiz!\n"
  );
  await sleep();
  rainbowTitle.stop();
  console.clear();
}

async function numberOfQuestions() {
  const answers = await inquirer.prompt({
    name: "numberOfQuestions",
    type: "number",
    message: chalk[randomResponse(chalkColorNames)](
      "How many questions would you like?"
    ),
    default() {
      return 10;
    },
  });
  quizNumberOfQuestions = answers.numberOfQuestions;
}

async function getQuizDifficulty() {
  const answers = await inquirer.prompt({
    name: "selectQuizDifficulty",
    type: "list",
    message: chalk[randomResponse(chalkColorNames)](
      "What quiz difficulty would you like?"
    ),
    choices: ["easy", "medium", "hard"],
    default() {
      return "medium";
    },
  });
  quizDifficulty = answers.selectQuizDifficulty;
}

async function handle_questions(questionObject) {
  // join the correct and incorrect answers, shuffle and convert answer text from html

  let correct_answer = questionObject.correct_answer;
  correct_answer = he.decode(correct_answer);

  let formattedArray = Array(questionObject.correct_answer).concat(
    questionObject.incorrect_answers
  );
  shuffleArray(formattedArray);
  formattedArray = formattedArray.map((elem) => he.decode(elem));
  let questionName = "question_" + questionNumber;
  const answers = await inquirer.prompt({
    name: questionName,
    type: "list",
    message:
      chalk[randomResponse(chalkColorNames)](
        he.decode(questionObject.question)
      ) + `\n`,
    choices: formattedArray,
  });
  return handleAnswer(answers[questionName] === correct_answer);
}

async function handleAnswer(isCorrect) {
  const spinner = createSpinner("Checking answer...").start();
  await sleep();
  if (isCorrect) {
    spinner.success({ text: randomResponse(correctAnswerResponses) });
    score++;
  } else {
    spinner.error({ text: randomResponse(incorrectAnswerResponses) });
  }
  await sleep();
  console.clear();
}
async function winner() {
  const msg = `Congrats\n W I N N E R !`;
  figlet(msg, (err, data) => {
    console.log(gradient.pastel.multiline(data));
  });
  await sleep(4000);
  console.clear();
}
console.clear();
await welcome();
await getQuizDifficulty();
await numberOfQuestions();
await sleep();
console.clear();

try {
  if (!fs.existsSync(`${folderName}/${currentDate}.json`)) {
    const response = await ky.get(quizUrl);
    let data = await response.json();
    const dataString = JSON.stringify(data);
    fs.writeFileSync(`${folderName}/${currentDate}.json`, dataString);
  }
} catch (err) {
  console.error(err);
}
await downloadQuizJSON(quizDifficulty, quizNumberOfQuestions);
for (let i = questionNumber; i < quizNumberOfQuestions; i++) {
  questionObject = quizJSON.results[i];
  await handle_questions(questionObject);
  console.clear();
}
if (score === quizNumberOfQuestions) {
  await winner();
} else {
  console.log(
    chalk[randomResponse(chalkColorNames)](
      `You got ${score} out of ${quizNumberOfQuestions} correct!`
    )
  );
  await sleep();
  console.clear();
}
