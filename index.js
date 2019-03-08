#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const meow = require("meow");
const sharp = require("sharp");
const PDFDocument = require("pdfkit");
const { PDFImage } = require("pdf-image");

const convert = originalPath => {
  const outputName = path.basename(originalPath).split(".")[0];
  const outputPath = path.dirname(originalPath);

  const outputPdf = `${outputPath}/${outputName}C.pdf`;

  const pdfImage = new PDFImage(originalPath, {
    convertExtension: "jpg",
    convertOptions: {
      "-colorspace": "RGB",
      "-interlace": "none",
      "-density": "300",
      "-quality": "100"
    }
  });

  const doc = new PDFDocument();

  const top = 1443;
  const left = 120;
  const width = 2242;
  const height = 1150;
  const outputWidth = width / 2;
  const outputHeight = height / 2;

  const outputFile = "output.jpg";

  pdfImage.convertFile().then(paths => {
    const image = paths[0];

    sharp(image)
      .extract({ left, top, width, height })
      .resize(outputWidth, outputHeight)
      .jpeg({
        quality: 100,
        force: false
      })
      .toFile(outputFile)
      .then(() => {
        const stream = fs.createWriteStream(outputPdf);
        doc.pipe(stream);
        doc.image(outputFile, 18, 18, {
          fit: [outputHeight, outputWidth]
        });
        doc.end();
        stream.on("finish", () => {
          fs.unlinkSync(image);
          fs.unlinkSync(outputFile);
          console.log("Mal feito, feito");
        });
      });
  });
};

const cli = meow(`
    Usage
      $ mask <input>

    Examples
      $ mask ./boleto.pdf
`);

if (cli.input.length === 1) {
  convert(cli.input[0]);
} else {
  cli.showHelp();
}
