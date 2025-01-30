// import { Download } from "lucide-react"
// import { Button } from "./ui/button"
// import ReactMarkdown from "react-markdown"
// import { useEffect, useState } from "react"
// import { getDocument } from "@/lib/api"

// export default function SummarizeView() {
//   const [summary, setSummary] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [currentDocHash, setCurrentDocHash] = useState(null)

//   useEffect(() => {
//     async function fetchSummary() {
//       try {
//         // First try to get from sessionStorage
//         const documentData = sessionStorage.getItem("document")
//         if (!documentData) {
//           setIsLoading(false)
//           return
//         }

//         const parsedData = JSON.parse(documentData)

//         // If we have summary in session storage, use it
//         if (parsedData.summary) {
//           setSummary(parsedData.summary)
//           setCurrentDocHash(parsedData.document_hash)
//           setIsLoading(false)
//           return
//         }

//         // If no summary in session storage, try to fetch from database
//         // const user = JSON.parse(sessionStorage.getItem("user") || "{}")
//         // if (user.user_uuid && parsedData.document_hash) {
//         //   const document = await getDocument(
//         //     user.user_uuid,
//         //     parsedData.document_hash
//         //   )
//         //   if (document && document.summary) {
//         //     setSummary(document.summary)
//         //     setCurrentDocHash(document.document_hash)
//         //     // Update sessionStorage with full document data
//         //     sessionStorage.setItem("document", JSON.stringify(document))
//         //   }
//         // }
//         const document = await getDocument(
//           "55d97216-1a4b-4217-8ae7-c673350be3f1",
//           "16b82316a9925a40d3453327c77abf7842404f5bb046ac4be3753464f8f6deca"
//         )
//         if (document && document.summary) {
//           setSummary(document.summary)
//           setCurrentDocHash(document.document_hash)
//           // Update sessionStorage with full document data
//           sessionStorage.setItem("document", JSON.stringify(document))
//         }
//       } catch (error) {
//         console.error("Error fetching summary:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchSummary()
//   }, [])

//   const handleDownload = () => {
//     if (!summary) return

//     const blob = new Blob([summary], { type: "text/markdown" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `rfp_summary_${currentDocHash || "unknown"}.md`
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }

//   if (isLoading) {
//     return (
//       <div className='bg-card rounded-lg p-6 border'>
//         <div className='flex justify-between items-center mb-4'>
//           <h2 className='text-2xl font-semibold'>RFP Summary</h2>
//         </div>
//         <div className='flex items-center justify-center p-4'>
//           <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
//         </div>
//       </div>
//     )
//   }

//   if (!summary) {
//     return (
//       <div className='bg-card rounded-lg p-6 border'>
//         <div className='flex justify-between items-center mb-4'>
//           <h2 className='text-2xl font-semibold'>RFP Summary</h2>
//         </div>
//         <p className='text-muted-foreground'>
//           No summary available. Please upload an RFP document first.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className='bg-card rounded-lg p-6 border'>
//       <div className='flex justify-between items-center mb-4'>
//         <h2 className='text-2xl font-semibold'>RFP Summary</h2>
//         <Button onClick={handleDownload} variant='outline' size='sm'>
//           <Download className='mr-2 h-4 w-4' />
//           Download
//         </Button>
//       </div>
//       <div className='prose dark:prose-invert max-w-none'>
//         <ReactMarkdown>{summary}</ReactMarkdown>
//       </div>
//     </div>
//   )
// }

import { Download, RefreshCcw } from "lucide-react"
import { Button } from "./ui/button"
import ReactMarkdown from "react-markdown"
import { useEffect, useState } from "react"
import { getDocument } from "@/lib/api"
import { saveAs } from "file-saver"
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
} from "docx"
import remarkGfm from "remark-gfm"

export default function SummarizeView() {
  const [summary, setSummary] = useState("")
  const [currentDocHash, setCurrentDocHash] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSummary = async () => {
    try {
      setIsRefreshing(true)

      // Check session storage first
      const documentData = sessionStorage.getItem("document")
      if (documentData) {
        const parsedData = JSON.parse(documentData)
        if (parsedData.summary) {
          setSummary(parsedData.summary)
          setCurrentDocHash(parsedData.document_hash)
          return
        }
      }

      // Fetch from API
      const document = await getDocument(
        "55d97216-1a4b-4217-8ae7-c673350be3f1",
        "16b82316a9925a40d3453327c77abf7842404f5bb046ac4be3753464f8f6deca"
      )
      if (document && document.summary) {
        setSummary(document.summary)
        setCurrentDocHash(document.document_hash)
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
  }, [])

  // Function to convert Markdown to Word with tables and proper formatting
  const convertMdToDocx = async (markdown) => {
    const lines = markdown.split("\n")
    const docChildren = []
    let tableHeader = []
    let tableRows = []

    for (const line of lines) {
      if (line.startsWith("## ")) {
        docChildren.push(
          new Paragraph({ text: line.replace("## ", ""), heading: "Heading2" })
        )
      } else if (line.startsWith("* ")) {
        docChildren.push(
          new Paragraph({ text: line.replace("* ", ""), bullet: { level: 0 } })
        )
      } else if (line.startsWith("|") && line.includes("|")) {
        const cols = line.split("|").map((col) => col.trim())
        if (line.includes("---")) continue
        if (tableHeader.length === 0) {
          tableHeader = cols
        } else {
          tableRows.push(cols)
        }
      } else {
        if (tableHeader.length > 0) {
          const table = new Table({
            rows: [
              new TableRow({
                children: tableHeader.map(
                  (text) => new TableCell({ children: [new Paragraph(text)] })
                ),
              }),
              ...tableRows.map(
                (row) =>
                  new TableRow({
                    children: row.map(
                      (text) =>
                        new TableCell({ children: [new Paragraph(text)] })
                    ),
                  })
              ),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
          docChildren.push(table)
          tableHeader = []
          tableRows = []
        }
        const boldText = line.match(/\*\*(.*?)\*\*/g)
        if (boldText) {
          const textRuns = line.split(/\*\*(.*?)\*\*/).map((text, index) => {
            if (index % 2 === 1) {
              return new TextRun({ text, bold: true })
            }
            return new TextRun(text)
          })
          docChildren.push(new Paragraph({ children: textRuns }))
        } else {
          docChildren.push(new Paragraph(line))
        }
      }
    }

    if (tableHeader.length > 0) {
      const table = new Table({
        rows: [
          new TableRow({
            children: tableHeader.map(
              (text) => new TableCell({ children: [new Paragraph(text)] })
            ),
          }),
          ...tableRows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (text) => new TableCell({ children: [new Paragraph(text)] })
                ),
              })
          ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
      docChildren.push(table)
    }

    return new Document({ sections: [{ children: docChildren }] })
  }

  const handleDownload = async () => {
    if (!summary) return

    const doc = await convertMdToDocx(summary)
    const blob = await Packer.toBlob(doc)
    const filename = `rfp_summary_${currentDocHash || "unknown"}.docx`
    saveAs(blob, filename)
  }

  return (
    <div className='bg-card rounded-lg p-6 border max-h-[88vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-md scrollbar-w-2'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold'>RFP Summary</h2>
        <div className='flex gap-2'>
          <Button
            onClick={fetchSummary}
            variant='outline'
            size='sm'
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={handleDownload} variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
        </div>
      </div>
      <div className='prose dark:prose-invert max-w-none h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400'>
        {summary ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        ) : (
          <p className='text-muted-foreground'>
            No summary available. Please upload an RFP document first.
          </p>
        )}
      </div>
    </div>
  )
}
