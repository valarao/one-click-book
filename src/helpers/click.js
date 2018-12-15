module.exports = {
  xclick: async (page, xpath) => {
    const links = await page.$x(xpath)

    if (links.length > 0) {
      await links[0].click();
    } else {
      throw new Error("Button not found");
    }
  }
}