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
  await page.goto('https://booking.sauder.ubc.ca/ugr/day.php?year=2018&month=09&day=07&area=1&room=13')

  const rows = await page.$$('#day_main > tbody > tr')

  // Creates zero-initialized 2D array of size `rows.length`
  let matrix = [...Array(rows.length)].map(e => Array(rows.length).fill(0));

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
      } else if (type == "I") {
        const length = cl[1]

        for (let i = 0; i < length; i ++) {
          matrix[index + i][cursor] = 1
        }

        cursor = matrix[index].indexOf(0, cursor + 1)
      }
    }    
  }

  const date = new Date()

  const hour = date.getHours()
  const minutes = date.getMinutes()

  const index = Math.max(Math.min(hour - 7, 0) * 2 + (minutes >= 30 ? 2 : 1), 30)
  console.log(index)

  console.log(matrix.join("\n"));

}

module.exports = book