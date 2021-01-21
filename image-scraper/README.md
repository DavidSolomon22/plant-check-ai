# plant-check-image-scraper

## Prerequisites

- Node.js
- Python
- split-folders

## Installation

```bash
$ npm install
```

```bash
$ pip install split-folders
```

## Running the app

In the index.js script change the value of two variables:

```javascript
PLANT_NAME // name of the plant you want download

NUMBER_OF_IMAGES // how many images of the plant you want to download
```

```bash
$ npm run start
```

After downloading all of the images, you can use __split-folders__ tool to split dataset into learn and validation datasets.

```bash
$ splitfolders --output ./splitted-dataset --ratio .8 .2 -- ./images
```


