const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

const PLANT_NAME = 'aloe';
const NUMBER_OF_IMAGES = 200;

const createPathIfNotExist = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

const downloadImage = async (imageUrl) => {
  const imagePath = path.resolve(__dirname, 'images', `${PLANT_NAME}s`);
  createPathIfNotExist(imagePath);
  const imageFullPath = path.resolve(imagePath, uuidv4() + '.jpeg');
  console.log('Downloaded image path :>> ', imageFullPath);
  const writer = fs.createWriteStream(imageFullPath);

  const response = await axios.get(imageUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

(async () => {
  let url = `https://unsplash.com/s/photos/${PLANT_NAME}`;

  let browser = await puppeteer.launch({ headless: true, slowMo: 200 });
  let page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  let imageUrlsSet = new Set();
  while (imageUrlsSet.size < NUMBER_OF_IMAGES) {
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

  if (imageUrlsSet.size > NUMBER_OF_IMAGES) {
    const imageUrlsArray = Array.from(imageUrlsSet);
    const imageUrlsArrayLength = imageUrlsArray.length;
    for (let i = 0; i < imageUrlsArrayLength - NUMBER_OF_IMAGES; i++) {
      imageUrlsArray.pop();
    }
    imageUrlsSet = new Set(imageUrlsArray);
  }

  for (const imgUrl of imageUrlsSet) {
    await downloadImage(imgUrl);
  }

  await browser.close();
})();
