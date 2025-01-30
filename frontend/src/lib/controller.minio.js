const httpStatus = require('http-status');
const minio = require('../services/minio.service');
const { noticeBoard } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { exec } = require('child_process');
const UploadSingleFile = catchAsync(async (req, res) => {
  const bucket = process.env.BUCKET_NAME;
  const eTag= await minio.UploadFile(req.files.image, bucket, req.body.folderName);
  res.status(httpStatus.OK).send({ data: eTag});

})
const UploadFile = catchAsync(async (req, res) => {  
  
  const bucket = process.env.BUCKET_NAME;
  let thumbnailFolderName = "";
  let contentFolderName = "";
  let thumbnailName = "";
  
  if(req.body.folderName == "buzz"){
      thumbnailFolderName = "buzz/feature-images";
      contentFolderName = `buzz/pdfs/${req.body.buzzName}`;
      if(req.files.thumbnail){
        let ext = req.files.thumbnail.name.slice((req.files.thumbnail.name.lastIndexOf(".") - 1 >>> 0) + 2);
        thumbnailName = "thumbnail-buzz-"+ req.body.buzzName + "." + ext;
        console.log("thumbnailName", thumbnailName)
      }
     

  } else if(req.body.folderName.includes("memories")){
      contentFolderName = req.body.folderName;
      thumbnailFolderName = req.body.folderName+"/thumbnails";
      thumbnailName = "thumbnail-"+req.files.content.name;
  }
  let eTag1
if(req.files.thumbnail) {
   eTag1 = await minio.uploadSingleFile(req.files.thumbnail, bucket, thumbnailFolderName, thumbnailName);
   res.status(httpStatus.OK).send({ message: 'success', data: { thumbnail : eTag1 } });


}
  
  // Check if the folderName includes "memories"
  if (req.body.folderName.includes("memories")) {
      const eTag2 = await minio.uploadSingleFile(req.files.content, bucket, contentFolderName);
      res.status(httpStatus.OK).send({ message: 'success', data: { thumbnail : eTag1, content :eTag2 } });
  } else if(req.files.content){
    if(req.files.thumbnail){
      delete req.files.thumbnail
    }
    let eTags = []
 
      const contentData = req.files[`content`];
     let eTag = await minio.uploadSingleFile(contentData, bucket, contentFolderName);
    console.log("content",req.files.content)
      res.status(httpStatus.OK).send({ message: 'success', data: { content : eTag } });
  }
});


const SearchFile = catchAsync(async (req, res) => {
  const bucket = process.env.BUCKET_NAME;
  const eid = req.query.eid;
  const eTag1 = await minio.SearchFile(bucket, eid);
 
  res.status(httpStatus.OK).send({ message: 'succces to find',data: eTag1 });
});


const username = 'kartikgupta';
const cronJobCommandToRemove = '/bin/sh /home/kartikgupta/Desktop/abc.sh';

// Get the current crontab for the user
const RemoveCronTab = catchAsync(async (req, res) => {
  exec(`crontab -u ${username} -l`, (error, currentCrontab) => {
    if (error) {
      console.error(`Error getting crontab: ${error.message}`);
      return;
    }
  
    // Remove the specified cron job command from the crontab
    const filteredCrontab = currentCrontab
      .split('\n')
      .filter(line => !line.includes(cronJobCommandToRemove))
      .join('\n');
  
    // Update the crontab with the filtered content
    exec(`echo "${filteredCrontab}" | crontab -u ${username} -`, (updateError) => {
      if (updateError) {
        console.error(`Error updating crontab: ${updateError.message}`);
        return;
      }
  
      console.log('Cron job removed successfully.');
    });
  });
})

module.exports = {
  UploadFile,
  SearchFile,
  RemoveCronTab,
  UploadSingleFile
};