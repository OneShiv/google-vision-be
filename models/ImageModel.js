const mongoose = require('mongoose');
const ImageResultSchema = new mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String
},
detectedText: {
  type: String
}
},{
  timestamps: true
});

module.exports = mongoose.model("Image", ImageResultSchema);