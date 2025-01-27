import { getContenType, UploadFile } from "./minioClient"

export const testMinioClient = async () => {
  // UploadFile(filesArr, bucket, folderName = "/Buzz/")
  const filesArr = [
    new File(["Hello, World!"], "hello.txt", { type: "text/plain" }),
  ]
  const bucket = "rfp-automation"
  const folderName = "/test-files/"
  const response = await UploadFile(filesArr, bucket, folderName)
  console.log("UploadFile response: ", response)
}
