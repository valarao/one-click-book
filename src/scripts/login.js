const { xclick } = require('../helpers/click');

const LOGIN_BOOK_URL = 'https://booking.sauder.ubc.ca/ugr/cwl-login';

const USERNAME_SELECTOR = '#username';
const PASSWORD_SELECTOR = '#password';
const LOGIN_BTN_XPATH = "//button[@type='submit' and contains(., 'Login')]";

module.exports = async function login(page, username, password) {
  await page.goto(LOGIN_BOOK_URL);

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);

  await xclick(page, LOGIN_BTN_XPATH);

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
};
