import { Client } from "minio"
import { Buffer } from "buffer"

class MinioService {
  constructor() {
    this.minioClient = new Client({
      endPoint: import.meta.env.VITE_MINIO_END_POINT,
      useSSL: true,
      accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY,
      secretKey: import.meta.env.VITE_MINIO_SECRET_KEY,
    })
  }

  isListBuckets = () => {
    return this.minioClient.listBuckets(function (err, buckets) {
      if (err) return console.log(err)
      return buckets
    })
  }

  isListObject(bucket) {
    var data = []
    var stream = this.minioClient.listObjects(bucket, "", true)
    stream.on("data", function (obj) {
      data.push(obj)
    })
    stream.on("end", function (obj) {
      console.log(data)
    })
    stream.on("error", function (err) {
      console.log(err)
    })
  }

  isBucketExist = async (bucketName) => {
    try {
      const exists = await new Promise((resolve, reject) => {
        this.minioClient.bucketExists(bucketName, (err, exists) => {
          if (err) {
            reject(err)
          } else {
            resolve(exists)
          }
        })
      })

      return exists
    } catch (err) {
      throw err
    }
  }

  async getBufferValue(file) {
    //return Buffer of file-object required to use minio putObject method.
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = function () {
        const arrayBuffer = reader.result // This is the ArrayBuffer of the selected image
        const bufferValue = Buffer.from(arrayBuffer)
        resolve(bufferValue)
      }

      reader.onerror = function (error) {
        reject(error)
      }
      // console.log("first", file);
      reader.readAsArrayBuffer(file)
    })
  }

  getContentType(fileName) {
    if (fileName) {
      try {
        const ext = fileName.split(".").pop().toLowerCase()
        if (ext === "pdf") {
          return "application/pdf"
        } else if (
          ext === "jpg" ||
          ext === "jpeg" ||
          ext === "png" ||
          ext === "gif"
        ) {
          return "image/*"
        }
        // Add more conditions for other file types as needed
        return "application/octet-stream"
      } catch (error) {
        return error
      }
    }
  }

  async UploadFile(filesArr, bucket, folderName = "/Buzz/") {
    let uploadDetails = []
    try {
      // Create an array of Promises for each upload
      // console.log("minio function", filesArr);
      const uploadPromises = filesArr.map(async (file) => {
        const contentType = this.getContentType(file.name)
        const headers = {
          "Content-Type": contentType,
          "X-Amz-Meta-Testing": "1234",
          example: "5678",
        }
        const bufferValue = await this.getBufferValue(file)
        return new Promise((resolve, reject) => {
          this.minioClient.putObject(
            bucket,
            folderName + file.name,
            bufferValue,
            bufferValue.length,
            headers,
            function (error, etag) {
              if (error) {
                console.error("Error:", error)
                reject(error)
              } else {
                // console.log('dada', etag);

                const uploadinfoObj = {
                  filename: file.name,
                  etag,
                }
                uploadDetails.push(uploadinfoObj)
                resolve()
              }
            }
          )
        })
      })

      // Wait for all uploads to complete before returning uploadDetails
      await Promise.all(uploadPromises)
      return uploadDetails
    } catch (error) {
      console.error("Error reading and uploading the file:", error)
      throw error // Rethrow the error to handle it elsewhere if needed
    }
  }

  isDownloadFile(bucket, eid) {
    const client = this.minioClient
    var data = []
    var stream = this.minioClient.listObjects(bucket, "", true)
    stream.on("data", function (obj) {
      data.push(obj)
    })
    stream.on("end", function (obj) {
      const find = data.filter((data) => data.etag == eid)
      if (find.length > 0) {
        client.fGetObject(bucket, find[0].name, "../download", function (e) {
          if (e) {
            console.log(e)
          }
          return "done"
        })
      } else {
        return "file not found"
      }
    })
    stream.on("error", function (err) {
      console.log(err)
    })
  }

  async getPresignedUrlByEtag(bucketName, etag, expiryInSeconds) {
    try {
      // Initialize a variable to store the matching object
      let matchingObject = null

      // Create a promise to list objects and find the matching one
      const listObjectsPromise = new Promise((resolve, reject) => {
        const objects = []
        const stream = this.minioClient.listObjects(bucketName, "", true)
        stream.on("data", (obj) => objects.push(obj))
        stream.on("end", () => {
          matchingObject = objects.find((obj) => obj.etag === etag)
          if (matchingObject) {
            resolve()
          } else {
            reject(new Error("File with the specified ETag not found."))
          }
        })
        stream.on("error", reject)
      })

      await listObjectsPromise

      // Generate a presigned URL for the matching object
      const url = await this.minioClient.presignedGetObject(
        bucketName,
        matchingObject.name,
        expiryInSeconds
      )
      return url
    } catch (error) {
      console.error("Error generating presigned URL:", error)
      throw error
    }
  }

  async isCreateBucket(bucketName) {
    try {
      const resp = await this.minioClient.makeBucket(bucketName, "us-west-1")
      return resp
    } catch (error) {
      console.log("Bucket already created!")
    }

    // return new Promise((resolve, reject) => {
    //   this.minioClient.makeBucket(bucketName, "us-west-1", function (e) {
    //     if (e) {
    //       console.error(e);
    //       reject(e);
    //     } else {
    //       console.log("Success");
    //       resolve(true);
    //     }
    //   });
    // });
  }

  async ChangeBucketPolicy(bucketName) {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    }

    return new Promise((resolve, reject) => {
      this.minioClient.setBucketPolicy(
        bucketName,
        JSON.stringify(policy),
        function (err) {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            console.log(`Bucket ${bucketName} is now public.`)
            resolve(true)
          }
        }
      )
    })
  }

  isDeleteBucket(bucketName) {
    this.minioClient.removeBucket(bucketName, function (e) {
      if (e) {
        return console.log(e)
      }
      return "success"
    })
  }

  async SearchFile(bucketName, eid) {
    return new Promise((resolve, reject) => {
      const client = this.minioClient
      const data = []
      const stream = this.minioClient.listObjects(bucketName, "", true)

      stream.on("data", function (obj) {
        data.push(obj)
      })

      stream.on("end", function () {
        const find = data.find((data) => data.etag == eid)
        if (find) {
          let obj = {}
          const fileUrl =
            client.protocol +
            "//" +
            client.host +
            ":" +
            client.port +
            "/" +
            bucketName +
            "/" +
            find.name
          obj.fileName = find.name
          obj.url = fileUrl
          resolve(obj)
        } else {
          // console.log("No file found!");
          reject("NA")
          // reject(new Error("No file found"));
        }
      })

      stream.on("error", function (err) {
        console.log(err)
        reject(err)
      })
    })
  }

  async DeleteFile(eid, bucket) {
    const client = this.minioClient
    var data = []
    var stream = this.minioClient.listObjects(bucket, "", true)
    stream.on("data", function (obj) {
      data.push(obj)
    })
    stream.on("end", function (obj) {
      const find = data.filter((data) => data.etag == eid)
      if (find.length > 0) {
        client.removeObject(bucket, find[0].name, function (err) {
          if (err) {
            return console.log("Unable to remove object", err)
          }
          console.log("Removed the object")
          return "Removed the object"
        })
      } else {
        console.log("No file found!")
        return "No file found"
      }
    })
    stream.on("error", function (err) {
      console.log(err)
    })
  }

  async DeleteUsingFilePath(filePath, editedImagePath, bucket) {
    const client = this.minioClient

    try {
      const data = await new Promise((resolve, reject) => {
        const data = []
        const stream = this.minioClient.listObjects(bucket, "", true)

        stream.on("data", (obj) => {
          data.push(obj)
        })

        stream.on("end", () => {
          resolve(data)
        })

        stream.on("error", (err) => {
          reject(err)
        })
      })

      const find = data.filter((data) => data.name === filePath)
      const find2 = data.filter(
        (data) => data.name === editedImagePath + "/" + filePath
      )

      if (find.length > 0) {
        await client.removeObject(bucket, find[0].name)
      } else {
        return "No file found"
      }

      if (find2.length > 0) {
        await client.removeObject(bucket, find2[0].name)
      } else {
        return "No file found"
      }

      return "Removed the edited object"
    } catch (error) {
      console.error("Error in DeleteUsingFilePath: ", error)
    }
  }
}

export default new MinioService()
