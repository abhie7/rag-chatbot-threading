import MinioService from "./minioClient"

const API_URL = import.meta.env.VITE_API_URL

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

export const processRfp = async (file, extractedText, user, accessToken) => {
  try {
    // First, upload the file using MinioService
    const uploadResult = await MinioService.uploadFile(
      file,
      "rfp-automation",
      "/uploaded-files/"
    )

    console.log("Upload result:", uploadResult)

    // Then, send the processing request to the backend
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/process_rfp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
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
