/**
 * Returns a matrix representation for the time/room availability
 * on a Sauder Room Booking date-picker page.
 *
 * Rows represent the time.
 * Columns represent the rooms.
 *
 * Example:
 *  [0, 0, 0, 0, 0]
 *  [1, 1, 1, 0, 0]
 *  [1, 1, 0, 0, 0]
 *
 *  Rooms 0 and 1 are only free during time period 0.
 *  Room 2 is free during time periods 0 and 2.
 *  Rooms 3 and 4 are free during time periods 0 to 2.
 *
 * @param {Page} page
 */
async function buildMatrix(page) {
  const columns = await page.$$('#day_main > thead:nth-child(1) > tr > th');
  const rows = await page.$$('#day_main > tbody > tr');

  columns.shift(); // remove first `Time` header element

  const columnNames = await Promise.all(columns.map(
    column => page.evaluate(e => e.innerText, column),
  ));

  // Creates zero-initialized 2D array of size `rows.length`
  // eslint-disable-next-line no-unused-vars
  const matrix = [...Array(rows.length)].map(_e => Array(columns.length).fill(0));
  const allEntries = await Promise.all(Array.from(Array(rows.length).keys()).map(i => rows[i].$$('td')));

  // 2D array of each entry's timeslots' classes
  const entryClasses = await Promise.all(allEntries.map(async entries => Promise.all(entries.map(entry => page.evaluate(e => [e.getAttribute('class'), e.getAttribute('rowspan')], entry)))));

  rows.forEach((_, index) => {
    const classes = entryClasses[index];

    let cursor = matrix[index].indexOf(0);

    // Ignore slots with `row_label` class, which are row labels
    classes.filter(cl => cl.type !== 'row_labels').forEach((cl) => {
      const type = cl[0];

      // `new` class means the time-slot is free
      // `I*` class means the time-slot is unavailable
      //    -> also contains info for how long
      //       it is booked for
      if (type === 'new') {
        cursor = matrix[index].indexOf(0, cursor + 1);
      } else if (type.charAt(0) === 'I') {
        const length = cl[1];

        for (let i = 0; i < length; i += 1) {
          matrix[index + i][cursor] = 1;
        }

        cursor = matrix[index].indexOf(0, cursor + 1);
      }
    });
  });

  return { matrix, rows, columnNames };
}

module.exports = {
  buildMatrix,
};
