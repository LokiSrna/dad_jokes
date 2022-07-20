const { default: axios } = require('axios');
const repl = require('repl');
const fs = require('fs');

const fileName = "bin/jokes.txt"

const local = repl.start('=> ');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

readline.question(`What your are willing to 1. Get a Joke / 2. Show leaderboard. => `, id => {
  let option = 0
  let text = ""

  switch (id) {
    case "1":
      option = 1
      text = "Get a joke"
      break;
    case "2":
      option = 2
      text = "Show leaderboard"
      break;
  }
  if (option) {
    console.log(`You have choosen => ${text}`)

    if (option == 1) {
      readline.question(`Search for a joke => `, async (term) => {
        try {
          console.log(new Date())
          const apiResponce = await fetchJoke(term)
          console.log(new Date())
          const jokeArray = apiResponce.results

          if (jokeArray.length) {
            const randomJoke = jokeArray[Math.floor(Math.random() * jokeArray.length)]

            storeJokeInFile(randomJoke)
          } else {
            console.log("No joke found with given term")
          }
        } catch (error) {
          console.log(error)
        }
        readline.close()
      })
    } else {
      leaderboard()
      readline.close()
    }
  } else {
    console.log(`Invalid option`)
    readline.close()
  }
})

const leaderboard = () => {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
      throw err;
    }

    const existingData = JSON.parse(data)

    const jokesList = existingData.jokes

    jokesList.sort((a, b) => {
      return b.count - a.count
    })

    const outputData = {}

    jokesList.forEach(element => {
      outputData[element.joke] = element.count
    })

    console.table(outputData)
  })
}

const storeJokeInFile = (obj) => {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
      throw err;
    }

    const existingData = JSON.parse(data)

    if (existingData.jokes.length) {
      const index = existingData.jokes.findIndex(item => item.id === obj.id)

      if (index !== -1) {
        existingData.jokes[index].count++
      } else {
        existingData.jokes.push({ ...obj, count: 1 })
      }
    } else {
      existingData.jokes.push({ ...obj, count: 1 })
    }

    fs.writeFile(fileName, JSON.stringify(existingData), (err) => {
      if (err) {
        throw err;
      }
      console.log("A joke for you, ", obj.joke);
    });
  });
}

const fetchJoke = (value) => {
  return new Promise((resolve, reject) => {
    axios.get(`https://icanhazdadjoke.com/search?term=${value}`, {
      headers: {
        "accept": "application/json",
        "User-Agent": "axios 0.21.1"
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      });

  })
}