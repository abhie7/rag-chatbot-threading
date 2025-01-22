import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback } from "./ui/avatar"

export default function ChatView() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I assist you with the RFP today?",
      sender: "bot",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: input, sender: "user" },
      ])
      setInput("")
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "I'm processing your request. How else can I help you with the RFP?",
            sender: "bot",
          },
        ])
      }, 1000)
    }
  }

  return (
    <div className='bg-white shadow-sm rounded-lg flex flex-col h-[calc(100vh-8rem)]'>
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
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
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
          />
          <Button type='submit'>
            <Send className='h-4 w-4' />
            <span className='sr-only'>Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
