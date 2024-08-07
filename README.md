# JavaScript Daily Quiz CLI Tool

A super fancy CLI daily quiz tool which downloads questions each day from the OpenTrivia database API [Open Trivia DB](https://opentdb.com/).

Inspired by Fireship's [Node.js CLI Tutorial](https://youtu.be/_oHByo8tiEY) video on YouTube.

## Take the Quiz

```
npx cli-daily-quiz
```

## Packages Used

[chalk](https://github.com/chalk/chalk) |
[inquirer](https://github.com/SBoudrias/Inquirer.js) |
[gradient-string](https://github.com/bokub/gradient-string) |
[chalk-animation](https://github.com/bokub/chalk-animation) |
[figlet](https://github.com/patorjk/figlet.js) |
[nanospinner](https://github.com/usmanyunusov/nanospinner) |
[he](https://github.com/mathiasbynens/he) |
[ky](https://github.com/sindresorhus/ky)

```sh
npm i chalk chalk-animation figlet gradient-string inquirer nanospinner he ky
```

## To Do:

- Tidy up code
- Update code so that it doesn't ask for the difficulty and number of questions every time (currently this does nothing if the day's questions have already been downloaded). Delete today's json file if you want a new quiz
