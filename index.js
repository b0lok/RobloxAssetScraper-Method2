const axios = require('axios');
const fs = require('fs');
const cookies = require('./apicookie.json');

const url = ["cookie1here", "cookie2here", "etc.."];
const fetchinterval = 3000;

let currentCookieIndex = 0;

// Read current product ID from file
let currentProductId = fs.existsSync('currentasset.json')
  ? parseInt(fs.readFileSync('currentasset.json'))
  : 0;

function fetchData() {
  axios.get(url)
    .then(response => {
      fs.writeFile('apicookie.json', JSON.stringify(response.data), err => {
        if (err) {
          console.error('Error writing to apicookie.json:', err);
        } 
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

fetchData();

setInterval(fetchData, fetchinterval);

const fetchProductId = async (cookie, productId) => {
  try {
    //const response = await axios.get(`http://economy.roblox.com/v2/assets/${productId}/details`, {
    const response = await axios.get(`https://roblox.com/economy/v2/assets/${productId}/details`, {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`
      }
    });
    if (response.data.errors && response.data.errors.length > 0 && response.data.errors[0].message === "Too many requests") {
      console.log(`Too many requests for product ${productId}. Skipping...`);
    } else {
      const productInfo = response.data;
      console.log(`ProductID: ${productId} Product name: ${productInfo.Name} + ${response.data}`);
    }
  } catch (error) {
    console.error(`Error fetching product ${productId}: ${error}`);
  }
};

const fetchNextProductId = () => {
  const productId = currentProductId;
  const cookie = cookies[currentCookieIndex % cookies.length];
  fetchProductId(cookie, productId);
  currentCookieIndex++;

  // Save current product ID to file
  fs.writeFileSync('currentasset.json', currentProductId.toString());
  currentProductId++;
};

// Start interval with the saved current product ID
let interval = setInterval(fetchNextProductId, 100);

// Optional: stop the interval after a certain number of iterations
const maxIterations = 35;
let currentIteration = 0;
const stopIntervalAfterMaxIterations = () => {
  currentIteration++;
  if (currentIteration >= maxIterations) {
    clearInterval(interval);
    console.log("Stopped - Max Iteration Met.")
  }
};
setTimeout(stopIntervalAfterMaxIterations, maxIterations * 100);

// Optional: handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error}`);
  clearInterval(interval);
});
