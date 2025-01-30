class ApiService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_BACKEND_API_URL
    this.minioEndpoint = import.meta.env.VITE_MINIO_ENDPOINT
    this.accessKey = import.meta.env.VITE_MINIO_ACCESS_KEY
    this.secretKey = import.meta.env.VITE_MINIO_SECRET_KEY
    this.bucketName = import.meta.env.VITE_MINIO_BUCKET_NAME
  }

  async request(endpoint, method, body) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Something went wrong")
    }

    return response.json()
  }

  loginUser(email, password) {
    return this.request("/auth/login", "POST", { email, password })
  }

  registerUser(userData) {
    return this.request("/auth/register", "POST", userData)
  }

  async uploadFileToMinio(file) {
    try {
      const fileName = `documents/${Date.now()}.${file.name}`
      const uploadUrl = `https://${this.minioEndpoint}/${this.bucketName}/${fileName}`

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (response.ok) {
        return {
          bucket: this.bucketName,
          objectName: fileName,
          url: response.url,
          etag: response.headers.get("ETag"),
        }
      } else {
        throw new Error(`File upload failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  processRfp(user_uuid, bucket, objectName, url, etag, file) {
    const payload = {
      user_uuid,
      bucket,
      object_name: objectName,
      url,
      etag,
      filename: file.name,
      file_size: file.size,
      content_type: file.type,
      upload_date: new Date().toISOString(),
    }

    return this.request("/rfp/process_rfp", "POST", payload)
  }

  updateUserAvatar(userId, seed) {
    return this.request("/user/avatar", "POST", { userId, seed })
  }

  async getDocument(userUuid, documentHash) {
    try {
      const response = await fetch(
        `${this.apiUrl}/documents/get_document/${userUuid}/${documentHash}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch document")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching document:", error)
      throw error
    }
  }
}

const apiService = new ApiService()

export const loginUser = apiService.loginUser.bind(apiService)
export const registerUser = apiService.registerUser.bind(apiService)
export const uploadFileToMinio = apiService.uploadFileToMinio.bind(apiService)
export const processRfp = apiService.processRfp.bind(apiService)
export const updateUserAvatar = apiService.updateUserAvatar.bind(apiService)
export const getDocument = apiService.getDocument.bind(apiService)
