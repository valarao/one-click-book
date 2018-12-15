const puppeteer = require('puppeteer')
const { xclick } = require('../helpers/click')

const BOOK_URL = 'https://booking.sauder.ubc.ca/ugr/cwl-login'

const USERNAME_SELECTOR = '#username'
const PASSWORD_SELECTOR = '#password'
const LOGIN_BTN_XPATH = "//button[@type='submit' and contains(., 'Login')]"

const book = async (username, password) => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(BOOK_URL)

  // Login
  await page.click(USERNAME_SELECTOR)
  await page.keyboard.type(username)
  
  await page.click(PASSWORD_SELECTOR)
  await page.keyboard.type(password)

  await xclick(page, LOGIN_BTN_XPATH)

  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.goto('https://booking.sauder.ubc.ca/ugr/day.php?year=2018&month=12&day=6&area=1&room=13')

  const columns = await page.$$('#day_main > thead:nth-child(1) > tr > th')
  const rows = await page.$$('#day_main > tbody > tr')

  // Creates zero-initialized 2D array of size `rows.length`
  let matrix = [...Array(rows.length)].map(e => Array(columns.length - 1).fill(0));

  for (let index in rows) {
    index = parseInt(index)
    const entries = await rows[index].$$('td')

    const promises = entries.map(entry => 
      page.evaluate(e => [e.getAttribute('class'), e.getAttribute('rowspan')], entry)
    )

    const classes = await Promise.all(promises)

    let cursor = matrix[index].indexOf(0)

    for (let cl of classes) {
      const type = cl[0]
  
      if (type == "row_labels") {
        continue
      } else if (type == "new") {
        cursor = matrix[index].indexOf(0, cursor + 1)
      } else if (type.charAt(0) == "I") {
        const length = cl[1]

        for (let i = 0; i < length; i ++) {
          matrix[index + i][cursor] = 1
        }

        cursor = matrix[index].indexOf(0, cursor + 1)
      }
    }    
  }

  const date = new Date()

  const inputHour = 14
  const inputMinutes = 25

  let bookingHour = inputHour;
  let bookingMinutes = 0;

  if (inputMinutes >= 30) {
    bookingHour++
  } else {
    bookingMinutes = 30  
  }

  const timeIndex = Math.min(Math.max((bookingHour - 7) * 2, 0) + (bookingMinutes == 30 ? 1 : 0), 30)

  let max = 0
  let bestRoom = 0

  for (let roomIndex in matrix[timeIndex]) {
    if (matrix[timeIndex][roomIndex] == 0) {
      // check belows
      let offset = 1
      while (offset < 4 && (timeIndex + offset < matrix.length)) {
        if (matrix[timeIndex + offset][roomIndex] == 0) {
          offset++
        } else {
          break
        }
      }

      if (offset > max) {
        max = offset
        bestRoom = roomIndex
      }
    }
  }
  console.log(matrix.join('\n'))
  console.log(`Best position is at: ${bestRoom} for ${max} thirty minute interval(s)`)

}

module.exports = book