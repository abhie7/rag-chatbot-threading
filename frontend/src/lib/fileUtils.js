import * as PDFJS from "pdfjs-dist"
import mammoth from "mammoth"

export async function extractTextFromFile(file) {
  const fileType = file.type
  let text = ""

  if (fileType === "application/pdf") {
    text = await extractTextFromPDF(file)
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword"
  ) {
    text = await extractTextFromDOCX(file)
  } else if (fileType === "text/plain") {
    text = await file.text()
  } else {
    throw new Error("Unsupported file type")
  }

  return text
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise
  let text = ""

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(" ") + "\n"
  }
  console.log("[PDF TEXT]", text)
  return text
}

async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  console.log("[DOCX TEXT]", result.value)
  return result.value
}

