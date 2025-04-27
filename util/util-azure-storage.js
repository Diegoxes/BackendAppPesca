'use strict';
const fs = require('fs');
const path = require('path');
const sep = path.sep;

const config = require('../config/config');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only avaiable in Node.js runtime, not in browsers
const sharedKeyCredential = new StorageSharedKeyCredential(config.azureStorage.accountName, config.azureStorage.accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${config.azureStorage.accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

var uploadFilePathToAzure = async function(filePath, azureFilePath){
    const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
    var file = fs.readFileSync(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(azureFilePath);
    const uploadBlobResponse = await blockBlobClient.upload(file, file.length);

    return uploadBlobResponse;
}
module.exports.uploadFilePathToAzure = uploadFilePathToAzure;

var uploadFileToAzure = async function(file, filePath){
    const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);
    const uploadBlobResponse = await blockBlobClient.upload(file.data, file.size);
    return uploadBlobResponse;
}
module.exports.uploadFileToAzure = uploadFileToAzure;


var getBlobFromAzure = async function(filePath){
    const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
    const blobClient = containerClient.getBlobClient(filePath);
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = downloadBlockBlobResponse.readableStreamBody;
    const blob = await streamToLocalFile(downloaded);
    return blob;
}
module.exports.getBlobFromAzure = getBlobFromAzure;


async function streamToLocalFile(readableStream) {
    return new Promise((resolve, reject) => {
      let buffer = Buffer.from([]);
      readableStream.on("data", (data) => {
          buffer = Buffer.concat([buffer, data], buffer.length+data.length);//Add the data read to the existing buffer.
      });
      readableStream.on("end", () => {
          resolve(buffer);  
      });
      readableStream.on("error", reject);
    });
}


