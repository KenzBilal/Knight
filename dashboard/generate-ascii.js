const Jimp = require('jimp');
const fs = require('fs');

const DENSITY = 'Ñ@#W$9876543210?!abc;:+=-,._                    ';

async function imageToAscii(url, width = 120) {
  try {
    const image = await Jimp.read(url);
    image.resize(width, Jimp.AUTO);
    image.grayscale();

    let asciiStr = '';
    
    for (let y = 0; y < image.bitmap.height; y++) {
      let line = '';
      for (let x = 0; x < image.bitmap.width; x++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        // Calculate brightness
        const brightness = (color.r + color.g + color.b) / 3;
        // Map brightness to character
        const charIndex = Math.floor((brightness / 255) * (DENSITY.length - 1));
        line += DENSITY[charIndex];
      }
      asciiStr += `"${line}",\n`;
    }

    fs.writeFileSync('ascii-output.txt', asciiStr);
    console.log(`Generated ASCII art with dimensions ${image.bitmap.width}x${image.bitmap.height}`);
  } catch (err) {
    console.error(err);
  }
}

// Download a known transparent/white background version of the hands, or standard creation of adam
imageToAscii('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/800px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg', 120);
