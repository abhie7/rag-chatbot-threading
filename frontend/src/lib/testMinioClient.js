import MinioService from "./minioClient"

export const testMinioClient = async () => {
  try {
    const file = new File(["Hello, World!"], "hello.txt", {
      type: "text/plain",
    })
    const bucket = "rfp-automation"
    const folderName = "/test-files/"

    const response = await MinioService.uploadFile(file, bucket, folderName)
    console.log("Upload response:", response)

    // Test getting a pre-signed URL
    const presignedUrl = await MinioService.getPresignedUrl(
      bucket,
      `${folderName}${file.name}`
    )
    console.log("Pre-signed URL:", presignedUrl)
  } catch (error) {
    console.error("Error testing MinioClient:", error)
  }
}
