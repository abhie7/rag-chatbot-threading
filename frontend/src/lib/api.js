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

// Add this new function to update avatar
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
  const response = await fetch(`${API_URL}/process_rfp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      filename: file.name,
      fileType: file.type,
      text: extractedText,
      user_uuid: user.user_uuid,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.message || "Something went wrong")
  }

  return response.json()
}

// create a new function to send pdf file to the backend using minio client
