const vision = require('@google-cloud/vision');
const {Storage} = require('@google-cloud/storage');
var express = require('express')
var multer  = require('multer')
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const ImageModel = require('./models/ImageModel');
const fs = require('fs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage });

// database connection
mongoose.connect('mongodb://localhost/vision', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Database connected");
});
var app = express();
app.use(cors());
app.post("/",upload.any(), async (req,res) => {
  const storage = new Storage();
  const bucketName = 'shivvision-bucket';
  // Creates a client
  const client = new vision.ImageAnnotatorClient();
  const fileName = req.files[0].path;
  try{
    await storage.bucket(bucketName).upload(fileName, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    });
  }catch(err){
    console.log(err);
  }
  console.log(req.files);
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
    let image_detect = new ImageModel();
    image_detect.image.data = fs.readFileSync(fileName);
    image_detect.image.contentType = req.files[0].mimetype;
    image_detect.detectedText = detectedText;
    return image_detect.save((err,result)=>{
      return res.send({
        msg:detectedText
      });
    })
  }).catch(err => {
    return res.status(400).json({
      msg: err
    });
  })
})


app.get('/latest',(req,res) => {
  ImageModel.find().select(["id","detectedText"]).limit(5).exec((err,result) =>{
    res.send(result);
  });
})

app.get('/image/:imageID',(req,res) => {
  let imgId = req.params.imageID;
  let image = undefined;
  ImageModel.find({
    _id: imgId
  }).exec((err,resp) =>{
    res.set('Content-Type',resp[0].image.contentType);
    return res.send(resp[0].image.data);
  });
});

app.listen(3006,() => {
  console.log('Started on port',3006)
});