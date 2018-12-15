module.exports.buildMatrix = async (page) => {
  const columns = await page.$$('#day_main > thead:nth-child(1) > tr > th');
  const rows = await page.$$('#day_main > tbody > tr');

  columns.shift(); // remove first `Time` header element

  // const columnNames = await (Promise.all(columns.map(column
  // => page.evaluate(e => e.innerText, column))));

  // Creates zero-initialized 2D array of size `rows.length`
  // eslint-disable-next-line no-unused-vars
  const matrix = [...Array(rows.length)].map(_e => Array(columns.length).fill(0));
  const allEntries = await Promise.all(Array.from(Array(rows.length).keys()).map(i => rows[i].$$('td')));

  // 2D array of each entry's timeslots' classes
  const entryClasses = await Promise.all(allEntries.map(async entries => Promise.all(entries.map(entry => page.evaluate(e => [e.getAttribute('class'), e.getAttribute('rowspan')], entry)))));

  rows.forEach((_, index) => {
    const classes = entryClasses[index];

    let cursor = matrix[index].indexOf(0);

    classes.filter(cl => cl.type !== 'row_labels').forEach((cl) => {
      const type = cl[0];
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

  return { matrix, rows };
};
