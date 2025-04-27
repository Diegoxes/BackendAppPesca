'use strict';
const fs = require('fs');
const path = require('path');
const sep = path.sep;

const logger = require('./basic-logger');
var shell = require('shelljs');

var saveFileDataToPath =  async function(fileData, fileName, directoryPath){
    try{
        if (!fs.existsSync(directoryPath)) 
            shell.mkdir('-p', directoryPath);

        await fs.writeFileSync(directoryPath+sep+fileName, fileData);
        
    }catch(err){
        logger.error(err);
        logger.error("No se pudo grabar el archivo = "+ directoryPath+sep+fileName);
    }
}
module.exports.saveFileDataToPath = saveFileDataToPath;

var deleteFileFromPath =  async function(filePath){
    try{
        await fs.unlinkSync(filePath);
    }catch(err){
        logger.error(err);
        logger.error("No se pudo eliminar el archivo = "+ filePath);
    }
}
module.exports.deleteFileFromPath = deleteFileFromPath;


var getFileFromPath =  async function(filePath){
    try{
        if (fs.existsSync(filePath)) {
            return await fs.readFileSync(filePath);
        }else{
            return null;
        }
        
    }catch(err){
        logger.error(err);
        logger.error("No se pudo eliminar el archivo = "+ filePath);
    }
}

module.exports.getFileFromPath = getFileFromPath;

var createDirectory =  async function(directoryPath){
    try{
        if (!fs.existsSync(directoryPath)) 
            shell.mkdir('-p', directoryPath);
    }catch(err){
        logger.error(err);
        logger.error("No se pudo crear el directorio = "+ directoryPath);
    }
}
module.exports.createDirectory = createDirectory;