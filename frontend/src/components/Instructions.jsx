import { FileText, MessageSquare, Download, Info } from "lucide-react"

export default function Instructions() {
  const steps = [
    {
      icon: <FileText className='h-4 w-4' />,
      title: "Upload RFP Document",
      description: "Click the + button to upload your RFP document (PDFs)",
    },
    {
      icon: <MessageSquare className='h-4 w-4' />,
      title: "Process and Analyze",
      description:
        "Wait for the document to be processed and analyzed by our LLM",
    },
    {
      icon: <Download className='h-4 w-4' />,
      title: "Review and Download",
      description:
        "Review the summary and download it as a docx file, or use the chat to ask questions",
    },
  ]

  return (
    <div className='p-4 bg-card rounded-lg shadow-sm border my-8'>
      <h3 className='font-semibold text-md mb-4 flex items-center'>
        How to Use <Info className='ml-2 h-4 w-4' />
      </h3>
      <div className='space-y-2'>
        {steps.map((step, index) => (
          <div key={index} className='flex items-start space-x-3'>
            <div className='p-2 bg-primary/10 rounded-md dark:bg-primary/20'>
              {step.icon}
            </div>
            <div>
              <h4 className='font-medium text-sm'>{step.title}</h4>
              <p className='text-sm text-muted-foreground'>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}