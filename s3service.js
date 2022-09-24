const { S3 } = require('aws-sdk');
const uuid = require("uuid").v4;

// For Single File
// exports.s3Uploadv2 = async (file) => {
//     const s3 = new S3()
//     const param = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `uploads/${uuid()}-${file.originalname}`,
//         Body: file.buffer
//     }

//     return await s3.upload(param).promise();
// }

//For multiple files

exports.s3Uploadv2 = async (files) => {
    const s3 = new S3()
    const params = files.map(file=>{
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer
        };
    });

   return await Promise.all(params.map(param=> s3.upload(param).promise())); 
}


//uploading it by version 3
// npm i @aws-sdk/client-s3
const {S3Client,  PutObjectCommand}=require('@aws-sdk/client-s3');
exports.s3Uploadv3=async (file)=>{
    const s3Client=new S3Client;
    const param= {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uuid()}-${file.originalname}`,
        Body: file.buffer
    };
    return s3Client.send(new PutObjectCommand(param))
}