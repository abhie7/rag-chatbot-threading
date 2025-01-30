// class MinioService {
//   constructor() {
//     this.minioEndPoint = import.meta.env.VITE_MINIO_ENDPOINT
//     this.accessKey = import.meta.env.VITE_MINIO_ACCESS_KEY
//     this.secretKey = import.meta.env.VITE_MINIO_SECRET_KEY
//     this.bucketName = import.meta.env.VITE_MINIO_BUCKET_NAME
//   }

//   async uploadFileToMinio(file) {
//     try {
//       const fileName = `documents/${Date.now()}.${file.name}`
//       const uploadUrl = `https://${this.minioEndPoint}/${this.bucketName}/${fileName}`

//       const response = await fetch(uploadUrl, {
//         method: "PUT",
//         headers: {
//           "Content-Type": file.type,
//         },
//         body: file,
//       })

//       if (response.ok) {
//         console.log("File uploaded successfully")
//         return {
//           bucket: this.bucketName,
//           objectName: fileName,
//           etag: response.headers.get("ETag"),
//           size: file.size,
//           type: file.type,
//         }
//       } else {
//         throw new Error(`File upload failed: ${response.statusText}`)
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error)
//       throw error
//     }
//   }
// }

