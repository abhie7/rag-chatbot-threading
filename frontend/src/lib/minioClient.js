// import * as Minio from "minio"

// class MinioService {
//   constructor() {
//     this.minioClient = new Minio.Client({
//       endPoint: import.meta.env.VITE_MINIO_END_POINT,
//       useSSL: true,
//       accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY,
//       secretKey: import.meta.env.VITE_MINIO_SECRET_KEY,
//     })
//   }

//   getContentType(fileName) {
//     if (fileName) {
//       const ext = fileName.split(".").pop().toLowerCase()
//       if (ext === "pdf") {
//         return "application/pdf"
//       } else if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
//         return "image/" + ext
//       }
//       return "application/octet-stream"
//     }
//     return "application/octet-stream"
//   }

//   async getBufferValue(file) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.onload = () => resolve(new Uint8Array(reader.result))
//       reader.onerror = (error) => reject(error)
//       reader.readAsArrayBuffer(file)
//     })
//   }

//   async uploadFile(file, bucket, folderName = "/Buzz/") {
//     try {
//       const contentType = this.getContentType(file.name)
//       const bufferValue = await this.getBufferValue(file)
//       const objectName = folderName + file.name

//       return new Promise((resolve, reject) => {
//         this.minioClient.putObject(
//           bucket,
//           objectName,
//           bufferValue,
//           {
//             "Content-Type": contentType,
//           },
//           (err, etag) => {
//             if (err) {
//               console.error("Error uploading file:", err)
//               reject(err)
//             } else {
//               resolve({ etag, objectName })
//             }
//           }
//         )
//       })
//     } catch (error) {
//       console.error("Error in uploadFile:", error)
//       throw error
//     }
//   }

//   async getPresignedUrl(bucket, objectName, expiryInSeconds = 3600) {
//     return new Promise((resolve, reject) => {
//       this.minioClient.presignedGetObject(
//         bucket,
//         objectName,
//         expiryInSeconds,
//         (err, url) => {
//           if (err) {
//             console.error("Error generating presigned URL:", err)
//             reject(err)
//           } else {
//             resolve(url)
//           }
//         }
//       )
//     })
//   }
// }

// export default new MinioService()

class MinioService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL
  }

  async uploadFile(file, bucket, folderName = "/Buzz/") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", bucket)
    formData.append("folder_name", folderName)

    const response = await fetch(`${this.apiUrl}/upload_file`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("File upload failed")
    }

    return response.json()
  }

  async getPresignedUrl(bucket, objectName, expiryInSeconds = 3600) {
    const response = await fetch(`${this.apiUrl}/get_presigned_url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket,
        object_name: objectName,
        expiry_seconds: expiryInSeconds,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get presigned URL")
    }

    return response.json()
  }
}

export default new MinioService()
