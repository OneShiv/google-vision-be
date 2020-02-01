const vision = require('@google-cloud/vision');
var express = require('express')
var multer  = require('multer')
const path = require('path');
const cors = require('cors');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage });

var app = express();
app.use(cors());
app.post("/",upload.any(), (req,res) => {
  console.log(req.files);
  

  // Creates a client
const client = new vision.ImageAnnotatorClient();
// let imageBuffer = Buffer.from(req.body.base64Image, 'base64');
/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
const fileName = req.files[0].path;
request = {
  image: {
    content: {imageUri: fileName}
  }
};

// Performs text detection on the local file
client.textDetection(fileName).then((result) => {
  console.log(result[0]);
  const detectedText = result[0].fullTextAnnotation.text;
  console.log('Text:',detectedText);
  return res.send({
    msg:detectedText
  });
}).catch(err => {
  return res.status(400).json({
    msg: err
  });
})

})

app.listen(3006,() => {
  console.log('Started on port',3006)
});