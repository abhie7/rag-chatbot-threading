import { PlusCircle, FileText } from "lucide-react"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export default function Sidebar({
  selectedFile,
  setSelectedFile,
  onSummarize,
}) {
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className='w-64 bg-white shadow-md p-4 flex flex-col'>
      <h2 className='text-xl font-semibold mb-4'>RFP Documents</h2>
      <Select value={selectedFile?.name} onValueChange={() => {}}>
        <SelectTrigger className='w-full mb-4'>
          <SelectValue placeholder='Select a file' />
        </SelectTrigger>
        <SelectContent>
          {selectedFile && (
            <SelectItem value={selectedFile.name}>
              <div className='flex items-center'>
                <FileText className='mr-2 h-4 w-4' />
                <span>{selectedFile.name}</span>
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <div className='flex space-x-2 mb-4'>
        <Button variant='outline' size='icon' className='flex-1'>
          <label
            htmlFor='file-upload'
            className='cursor-pointer flex items-center justify-center'
          >
            <PlusCircle className='h-4 w-4' />
            <span className='sr-only'>Upload file</span>
          </label>
          <input
            id='file-upload'
            type='file'
            className='hidden'
            onChange={handleFileUpload}
            accept='.pdf,.docx,.txt'
          />
        </Button>
        <Button
          onClick={onSummarize}
          className='flex-1'
          disabled={!selectedFile}
        >
          Summarize RFP
        </Button>
      </div>
    </div>
  )
}
