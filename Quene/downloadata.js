require("dotenv").config();
const Queue = require('bull');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DownloadQueue = new Queue('DownloadCSV');

async function downloadfile(uuidcode) {
   
  const fileUrl = `F:\\WORK\\Office Web Developement\\Jobs\\uploads\\${uuidcode}.pdf`;

  const downloadFolderPath = path.join(require('os').homedir(), 'Downloads');
  const localFilePath = path.join(downloadFolderPath, `${uuidcode}.pdf`);
  
  console.log(fileUrl);  
  fs.access(fileUrl, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File ${uuidcode} does not exist in the upload folder.`);
      return;
    }
  
    // Read the file and write it to the download folder
    console.log('HI');
    fs.copyFile(fileUrl, localFilePath, (err) => {
      if (err) {
        console.error('Error copying the file:', err);
      } else {
        console.log(`File ${uuidcode} has been successfully downloaded to the download folder.`);
        

        fs.unlink(fileUrl, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
          console.log('File deleted successfully');
        });
      }

    });
  });  
}


function DownloadData(name) {

  DownloadQueue.add({name:name});
}

DownloadQueue.process(async (job,done)=>{
  
    await downloadfile(job.data.name).then((result) => {
    }).catch((err) => {
      console.log(err);
    });

    
});



DownloadQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});
function pasueQuene() {
  DownloadQueue.pause();
  DownloadQueue.empty().then(() => {
    console.log('Queue emptied successfully.');
  }).catch((err) => {
    console.error('Error emptying the queue:', err);
  });
  DownloadQueue.clean(0, 'failed').then(() => {
    console.log('Failed jobs removed successfully.');
  }).catch((err) => {
    console.error('Error removing failed jobs:', err);
  });
  DownloadQueue.resume();
}

module.exports = {DownloadQueue,DownloadData,pasueQuene}; // Export the emailQueue variable
