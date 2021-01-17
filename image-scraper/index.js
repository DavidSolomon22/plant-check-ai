const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

const downloadImage = async (imageUrl) => {
  const imagePath = path.resolve(__dirname, 'images', uuidv4() + '.jpeg');
  console.log('imagePath :>> ', imagePath);
  const writer = fs.createWriteStream(imagePath);

  const response = await axios.get(imageUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

(async () => {
  let url = 'https://unsplash.com/s/photos/rose';

  let browser = await puppeteer.launch({ headless: true, slowMo: 200 });
  let page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  let imageUrlsSet = new Set();
  while (imageUrlsSet.size < 500) {
    await page.evaluate('window.scrollBy(0, 1000)');
    let scrapedImgUrls = await page.evaluate(() => {
      let scrapedImgUrls = [];
      document.querySelectorAll('img[class="_2UpQX"]').forEach((e) => {
        if (e?.currentSrc) {
          scrapedImgUrls.push(e.currentSrc);
        }
      });
      return scrapedImgUrls;
    });
    imageUrlsSet = new Set([...imageUrlsSet, ...scrapedImgUrls]);
  }

  if (imageUrlsSet.size > 500) {
    const imageUrlsArray = Array.from(imageUrlsSet);
    const imageUrlsArrayLength = imageUrlsArray.length;
    for (let i = 0; i < imageUrlsArrayLength - 500; i++) {
      imageUrlsArray.pop();
    }
    imageUrlsSet = new Set(imageUrlsArray);
  }

  for (const imgUrl of imageUrlsSet) {
    await downloadImage(imgUrl);
  }

  await browser.close();
})();
