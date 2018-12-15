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
}

module.exports = book