const express = require('express');
require("dotenv").config();
const bodyParser = require('body-parser')
const multer = require('multer');
const { json } = require('body-parser');
const uuid = require('uuid').v4;
const app = express();
const { s3Uploadv2, s3Uploadv3 } = require('./s3service')
//app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, resp) => {
  resp.send("image upload project")
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
})

// aws storage
const awsStorage = multer.memoryStorage()

// Filtering on the basis of file type and extention

const fileFilter = (req, file, cb) => {
  // if(file.mimetype==='image/jpeg')
  if (file.mimetype.split("/")[0] === 'image') {
    cb(null, true)
  } else {
    cb(new Error("file is not of the correct type"), false)
  }
}



//const upload=multer({dest:"uploads/"});
const upload = multer({ awsStorage, fileFilter, limits: { fileSize: 1024 * 1024 * 5, files: 3 } });
//for multiple upload with diffrent field and key name

const multiUpload = upload.fields(
  { name: "avatar", maxCount: 2 },
  { name: "resume", maxCount: 1 }
);
// app.post("/upload",multiUpload,(req,resp,next)=>{

// for multiple upload "upload.array("file", limit)"
app.post("/upload", upload.array("file"), async (req, res) => {
  console.log("uploading");
  console.log(req.files);
  console.log(req.body);
  const file = req.files[0]
  const result = await s3Uploadv2(req.files)
  res.json({ Success: true, message: "uploaded", result: result })
  //next()
})

//    For AWS_V3 Uploads
app.post("/uploadV3", upload.array("file"), async (req, res) => {
  console.log("uploading");

  const file = req.files[0]
  const result = await s3Uploadv3(req.files)
  res.json({ Success: true, message: "uploaded", result: result })
})


//Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({ success: true, message: "File is too Large" })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.json({ success: true, message: "File limit is reached" })
    }
  }
})

app.listen(2000, (req, resp) => {
  //  resp.send('successfully hosted at 2000');
  console.log("hosted at 2000");
});
