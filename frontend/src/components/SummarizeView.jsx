/* eslint-disable react/prop-types */
import { Download } from "lucide-react"
import { Button } from "./ui/button"
import ReactMarkdown from "react-markdown"
import { useEffect, useState } from "react"
import { getDocument, getRfpFile } from "@/lib/api"
import remarkGfm from "remark-gfm"
import { saveAs } from "file-saver"

export default function SummarizeView({ selectedDoc }) {
  const [summary, setSummary] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const fetchSummary = async () => {
    if (!selectedDoc) {
      setSummary("")
      return
    }

    try {
      setIsRefreshing(true)

      const document = await getDocument(
        user.user_uuid,
        selectedDoc.document_hash
      )
      if (document && document.summary) {
        setSummary(document.summary)
        // Update session storage with full document data
        sessionStorage.setItem("document", JSON.stringify(document))
      }
    } catch (error) {
      console.error("Error fetching summary:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [selectedDoc]) // Re-fetch when selectedDoc changes

  const handleDownloadRfp = async () => {
    try {
      console.log(selectedDoc)
      const data = await getRfpFile(
        summary,
        selectedDoc.filename,
        selectedDoc.document_hash,
        user.user_uuid
      )
      const response = await fetch(
        `https://${import.meta.env.VITE_MINIO_ENDPOINT}/${data.bucket}/${
          data.object_name
        }`
      )
      if (!response.ok) {
        throw new Error("Failed to download file from Minio")
      }
      const blob = await response.blob()
      saveAs(blob, `${selectedDoc.filename}.docx`)
    } catch (error) {
      console.error("Error handling RFP download:", error)
    }
  }

  const customRenderers = {
    h2: ({ node, ...props }) => (
      <h2
        className='text-xl font-bold my-4 text-primary-foreground'
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className='mt-8 text-sm font-medium text-foreground' {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul
        className='list-disc font-medium text-sm list-inside my-2 text-foreground'
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className='list-decimal text-sm list-inside my-2 text-foreground'
        {...props}
      />
    ),
    table: ({ node, ...props }) => (
      <table
        className='table-auto text-sm max-w-[80vw] border-collapse my-4 border border-border'
        {...props}
      />
    ),
    thead: ({ node, ...props }) => (
      <thead
        className='bg-secondary font-bold text-sm text-secondary-foreground'
        {...props}
      />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className='bg-card text-sm text-card-foreground' {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className='border-b text-sm border-border' {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className='border text-sm px-4 py-2 text-left border-border bg-muted text-muted-foreground'
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className='border text-sm font-medium px-4 py-2 border-border text-foreground'
        {...props}
      />
    ),
  }

  return (
    <div className='bg-card rounded-lg p-6 border max-h-[88vh] overflow-y-auto'>
      <div className='flex justify-between items-center pb-4 border-b mb-4'>
        <h2 className='text-2xl font-semibold'>
          RFP Summary: {selectedDoc ? selectedDoc.filename : ""}
        </h2>
        <div className='flex gap-2'>
          <Button onClick={handleDownloadRfp} variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
        </div>
      </div>
      <div className='prose dark:prose-invert max-w-none'>
        {summary ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={customRenderers}
          >
            {summary}
          </ReactMarkdown>
        ) : (
          <p className='text-muted-foreground'>
            {selectedDoc
              ? "Loading summary..."
              : "No summary available. Please select an RFP document from the sidebar."}
          </p>
        )}
      </div>
    </div>
  )
}
