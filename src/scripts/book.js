const puppeteer = require('puppeteer');

const { buildMatrix } = require('../helpers/matrix');
const login = require('./login');

const computeBestEntry = (timeIndex, matrix) => {
  let maxLength = 0;
  let bestRoom = 0;
  const bestTime = timeIndex;

  matrix[timeIndex].forEach((_, roomIndex) => {
    if (matrix[timeIndex][roomIndex] === 0) {
      let offset = 1;

      while (offset < 4 && (timeIndex + offset < matrix.length)) {
        if (matrix[timeIndex + offset][roomIndex] === 0) {
          offset += 1;
        } else {
          break;
        }
      }

      if (offset > maxLength) {
        maxLength = offset;
        bestRoom = roomIndex;
      }
    }
  });

  return { bestTime, bestRoom, maxLength };
};

const getNextPossibleTimeIndex = () => {
  const date = new Date();

  const inputHour = date.getHours();
  const inputMinutes = date.getMinutes();

  let bookingHour = inputHour;
  let bookingMinutes = 0;

  if (inputMinutes >= 30) {
    bookingHour += 1;
  } else {
    bookingMinutes = 30;
  }

  const timeIndex = Math.min(
    Math.max((bookingHour - 7) * 2, 0) + (bookingMinutes === 30 ? 1 : 0),
    30,
  );

  return timeIndex;
};

/**
 * Converts a roomIndex in matrix representation to
 * the corresponding index in the HTML table
 * @param {number[][]} matrix
 * @param {number} timeIndex
 * @param {number} roomIndex
 */
const convertIndex = (matrix, timeIndex, roomIndex) => {
  let rowIndex = 0;
  for (let i = matrix[timeIndex].indexOf(0);
    i !== roomIndex;
    i = matrix[timeIndex].indexOf(0, i + 1)) {
    rowIndex += 1;
  }
  return rowIndex;
};

/**
 * Books the corresponding entry in HTML timetable
 * within the given array of entry ElementHandlers
 * @param {Page} page
 * @param {ElementHandle[]} rows
 * @param {number} timeIndex - index of a time period
 * @param {number} roomIndex - index of a room
 * @param {number} length - length of time to book room for
 */
async function bookEntry(page, rows, timeIndex, roomIndex, length) {
  const entries = await rows[timeIndex].$$('td.new > div > a');
  entries[roomIndex].click();

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  await page.click('#div_name');
  await page.keyboard.type('Study');

  await page.evaluate((len) => {
    document.getElementById('end_seconds').selectedIndex = len - 1;
  }, length);
}

async function book(username, password) {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const [page] = await browser.pages();

  await login(page, username, password);

  const { matrix, rows } = await buildMatrix(page);
  const timeIndex = getNextPossibleTimeIndex();

  // Compute two alternatives
  const bestEntries = [
    computeBestEntry(timeIndex, matrix),
    computeBestEntry(timeIndex + 1, matrix),
  ];

  const columnIndex = convertIndex(matrix, bestEntries[0].bestTime, bestEntries[0].bestRoom);
  await bookEntry(page, rows, bestEntries[0].bestTime, columnIndex, bestEntries[0].maxLength);
}

module.exports = book;
