import { Download } from "lucide-react"
import { Button } from "./ui/button"
import ReactMarkdown from "react-markdown"

export default function SummarizeView({ content }) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rfp_summary.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='bg-white shadow-sm rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold'>RFP Summary</h2>
        <Button onClick={handleDownload} variant='outline' size='sm'>
          <Download className='mr-2 h-4 w-4' />
          Download
        </Button>
      </div>
      <div className='prose max-w-none'>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
