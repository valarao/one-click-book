require('dotenv').config()

const book = require('./scripts/book')

const { SSC_USER, SSC_PASS } = process.env

async function run() {
  await book(SSC_USER, SSC_PASS)
}

run()