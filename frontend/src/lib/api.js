// import MinioService from "./minioClient";

const API_URL = import.meta.env.VITE_BACKEND_API_URL

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export const uploadFileToMinio = async (user_uuid, file) => {
  try {
    const MINIO_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT
    const ACCESS_KEY = import.meta.env.VITE_MINIO_ACCESS_KEY
    const SECRET_KEY = import.meta.env.VITE_MINIO_SECRET_KEY
    const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME

    const fileName = `uploads/${user_uuid}/${Date.now()}.${file.name}`
    const uploadUrl = `https://${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileName}`

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type, // Set the Content-Type based on the file type
      },
      body: file, // Send the file directly (no FormData necessary)
    })

    if (response.ok) {
      return {
        bucket: BUCKET_NAME,
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

export const downloadFileFromMinio = async (bucket, objectName) => {
  try {
    const MINIO_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT
    const downloadUrl = `https://${MINIO_ENDPOINT}/${bucket}/${objectName}`

    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error("Failed to download file from Minio")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = objectName.split("/").pop()
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading file from Minio:", error)
    throw error
  }
}

export const processRfp = async (
  user_uuid,
  bucket,
  objectName,
  url,
  etag,
  file
) => {
  try {
    const payload = {
      user_uuid: user_uuid,
      bucket: bucket,
      object_name: objectName,
      url: url,
      etag: etag,
      filename: file.name,
      file_size: file.size,
      content_type: file.type,
      upload_date: new Date().toISOString(),
    }

    const response = await fetch(`${API_URL}/rfp/process_rfp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || error.message || "Something went wrong")
    }

    return response.json()
  } catch (error) {
    console.error("Error in processRfp:", error)
    throw error
  }
}

export const updateUserAvatar = async (userId, seed) => {
  const response = await fetch(`${API_URL}/user/avatar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, seed }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export const getDocument = async (userUuid, documentHash) => {
  try {
    const response = await fetch(
      `${API_URL}/documents/get_document/${userUuid}/${documentHash}`
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

export const sendChatMessage = async (userUuid, documentHash, query) => {
  try {
    const response = await fetch(`${API_URL}/rfp/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        user_uuid: userUuid,
        document_hash: documentHash,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send chat message")
    }

    const data = await response.json()
    return data.chat_response.response
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw error
  }
}

export const getRfpFile = async (
  summary,
  filename,
  document_hash,
  user_uuid
) => {
  try {
    const response = await fetch(`${API_URL}/downloads/download_rfp_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        filename,
        document_hash,
        user_uuid,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to download RFP file")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error downloading RFP file:", error)
    throw error
  }
}
