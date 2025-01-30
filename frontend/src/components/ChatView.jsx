import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { sendChatMessage } from "../lib/api"
import ReactMarkdown from "react-markdown"

export default function ChatView({ selectedDoc }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedDoc) {
      const documentData = JSON.parse(
        sessionStorage.getItem("document") || "{}"
      )
      if (documentData.chat_history) {
        setMessages(documentData.chat_history)
      } else {
        setMessages([
          {
            id: 1,
            text: "Hello! How can I assist you with the RFP today?",
            sender: "bot",
          },
        ])
      }
    }
  }, [selectedDoc])

  const handleSend = async () => {
    if (!input.trim() || !selectedDoc) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}")
      const response = await sendChatMessage(
        user.user_uuid,
        selectedDoc.document_hash,
        input
      )

      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])

      // Update chat history in document storage
      const documentData = JSON.parse(
        sessionStorage.getItem("document") || "{}"
      )
      const updatedDocument = {
        ...documentData,
        chat_history: [...messages, userMessage, botMessage],
      }
      sessionStorage.setItem("document", JSON.stringify(updatedDocument))
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: "Sorry, I encountered an error processing your request.",
          sender: "bot",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedDoc) {
    return (
      <div className='bg-card rounded-lg p-6 border h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>
          Please select an RFP document to start chatting.
        </p>
      </div>
    )
  }

  return (
    <div className='bg-card rounded-lg flex flex-col h-[calc(100vh-8rem)] border'>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${
                message.sender === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              <Avatar className='w-8 h-8'>
                <AvatarFallback>
                  {message.sender === "user" ? "U" : "B"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.sender === "bot" ? (
                  <ReactMarkdown className='prose dark:prose-invert max-w-none'>
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='flex items-center space-x-2'>
              <Avatar className='w-8 h-8'>
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className='bg-muted rounded-lg p-3'>
                <div className='flex space-x-2'>
                  <div className='w-2 h-2 bg-current rounded-full animate-bounce' />
                  <div
                    className='w-2 h-2 bg-current rounded-full animate-bounce'
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className='w-2 h-2 bg-current rounded-full animate-bounce'
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='border-t p-4'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className='flex space-x-2'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            className='flex-1'
            disabled={isLoading || !selectedDoc}
          />
          <Button type='submit' disabled={isLoading || !selectedDoc}>
            <Send className='h-4 w-4' />
            <span className='sr-only'>Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
