import { useState } from "react"
import Sidebar from "./components/Sidebar"
import SummarizeView from "./components/SummarizeView"
import ChatView from "./components/ChatView"
import axios from "axios"

export default function App() {
  const [activeTab, setActiveTab] = useState("summarize")
  const [selectedFile, setSelectedFile] = useState(null)
  const [summarizedContent, setSummarizedContent] = useState("")

  const handleSummarize = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("pdf_file", selectedFile)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/process_rfp",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      setSummarizedContent(response.data.summary)
    } catch (error) {
      console.error("Error summarizing RFP:", error)
    }
  }

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onSummarize={handleSummarize}
      />
      <main className='flex-1 overflow-y-auto p-4'>
        <div className='mb-4'>
          <nav className='flex space-x-4' aria-label='Tabs'>
            <button
              onClick={() => setActiveTab("summarize")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "summarize"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Summarize RFP
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "chat"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              RFP Chat
            </button>
          </nav>
        </div>
        {activeTab === "summarize" ? (
          <SummarizeView content={summarizedContent} />
        ) : (
          <ChatView />
        )}
      </main>
    </div>
  )
}
