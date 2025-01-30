/* eslint-disable react/prop-types */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  ChevronFirst,
  ChevronLast,
  ChevronRight,
  FileText,
  Home,
  Upload,
  LogOut,
  FolderOpen,
  Loader,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Instructions from "@/components/Instructions"
import { uploadFileToMinio, processRfp, getDocument } from "../lib/api"

export default function CollapsibleSidebar({ selectedFile, setSelectedFile }) {
  const [expanded, setExpanded] = useState(true)
  const navigate = useNavigate()
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user") || "{}")
  )
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)

  const handleDocClick = async (doc) => {
    try {
      setSelectedDoc(doc)
      // Fetch full document from database
      const fullDoc = await getDocument(user.user_uuid, doc.document_hash)
      if (fullDoc) {
        sessionStorage.setItem("document", JSON.stringify(fullDoc))
      }
    } catch (error) {
      console.error("Error fetching document:", error)
    }
  }

  // const documents = user.documents || []
  // sample documents array for testing
  // const documents = [
  //   {
  //     document_hash: "1",
  //     filename: "sample.pdf",
  //     created_at: new Date().toISOString(),
  //   },
  //   {
  //     document_hash: "2",
  //     filename: "sample.docx",
  //     created_at: new Date().toISOString(),
  //   },
  // ];

  const authToken = user.access_token

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsUploading(true)

      try {
        const response = await uploadFileToMinio(file)
        console.log("[File Upload]", response)
        const { bucket, objectName, url, etag } = response

        const result = await processRfp({
          user_uuid: user.user_uuid,
          bucket,
          object_name: objectName,
          url,
          etag,
          filename: file.name,
          file_size: file.size,
          content_type: file.type,
          upload_date: new Date().toISOString(),
        })

        console.log("[Process RFP]", result)
        sessionStorage.setItem("document", JSON.stringify(result))

        // Update user in session storage with new document
        const updatedUser = {
          ...user,
          documents: [
            {
              document_hash: result.document_hash,
              filename: file.name,
              created_at: result.created_at,
            },
            ...(user.documents || []),
          ],
        }
        setUser(updatedUser)
        sessionStorage.setItem("user", JSON.stringify(updatedUser))

        setSelectedFile(null)
      } catch (error) {
        console.error("Error processing file:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    navigate("/login")
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", onClick: () => navigate("/dashboard") },
    { icon: FolderOpen, label: "My Documents", collapsible: true },
  ]

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?"
    )
  }

  return (
    <TooltipProvider>
      <aside
        className={`h-screen ${
          expanded ? "w-72" : "w-16"
        } bg-card border-r px-4 transition-all duration-300 ease-in-out`}
      >
        <nav className='h-full flex flex-col'>
          <div className='flex items-center justify-between py-4 border-b'>
            {expanded && (
              <span className='text-xl font-bold'>RFP Analyzer</span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setExpanded(!expanded)}
                  className='h-8 w-8'
                >
                  {expanded ? <ChevronFirst /> : <ChevronLast />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {expanded ? "Collapse sidebar" : "Expand sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className='flex-1 pt-4 space-y-4 '>
            {menuItems.map((item) =>
              item.collapsible ? (
                <Collapsible key={item.label}>
                  <SidebarGroup className='inline-flex flex-col justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground w-full'>
                    <SidebarGroupLabel className='text-sm text-sidebar-foreground'>
                      <CollapsibleTrigger
                        className={`flex items-center w-full ${
                          expanded ? "justify-between" : "justify-center"
                        }`}
                      >
                        <div className='flex items-center'>
                          <item.icon
                            className={`h-4 w-4 transition-transform ${
                              expanded ? "mr-3" : ""
                            }`}
                          />
                          {expanded && (
                            <span className='ms-1 font-semibold'>
                              {item.label}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expanded ? "rotate-90" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent className='mx-1 my-2'>
                        {user.documents?.length > 0 ? (
                          user.documents.map((doc) => (
                            <button
                              key={doc.document_hash}
                              className={`flex items-center w-full p-2 text-sm rounded-md hover:bg-accent ${
                                selectedDoc?.document_hash === doc.document_hash
                                  ? "bg-accent"
                                  : ""
                              }`}
                              onClick={() => handleDocClick(doc)}
                            >
                              <FileText className='h-4 w-4 mr-2' />
                              <div className='flex-1 text-left'>
                                <div className='truncate'>{doc.filename}</div>
                                <div className='text-xs text-muted-foreground'>
                                  {new Date(
                                    doc.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className='py-2 text-sm text-muted-foreground'>
                            No documents yet
                          </div>
                        )}
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ) : (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      className={`w-full justify-start ${
                        expanded ? "px-3" : "px-2"
                      }`}
                      onClick={item.onClick}
                    >
                      <item.icon
                        className={`h-5 w-5 ${expanded ? "mr-3" : ""}`}
                      />
                      {expanded && (
                        <span className='font-semibold'>{item.label}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              )
            )}

            <div className='border-t pt-4'>
              <div className='flex items-center mb-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`flex items-center px-2 ${
                        expanded ? "w-full" : "w-12"
                      } transition-all`}
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader className='h-4 w-4 animate-spin mr-2' />
                          {expanded && <span>Uploading...</span>}
                        </>
                      ) : (
                        <>
                          {expanded && (
                            <span className='font-semibold'>Upload RFP</span>
                          )}
                          <Upload className='h-4 w-4' />
                        </>
                      )}
                      <input
                        id='file-upload'
                        type='file'
                        className='hidden'
                        onChange={handleFileUpload}
                        accept='.pdf'
                        disabled={isUploading}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload new document</TooltipContent>
                </Tooltip>
              </div>

              {selectedFile && expanded && (
                <div className='flex items-center space-x-2 p-2 bg-secondary rounded-md'>
                  <FileText className='h-4 w-4' />
                  <span className='text-sm truncate'>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`flex items-center ${expanded ? "flex" : "hidden"}`}>
            <Instructions />
          </div>

          <div className='border-t pt-4 pb-4'>
            <div
              className={`flex items-center ${
                expanded ? "justify-between" : "justify-center"
              }`}
            >
              <div className='flex items-center'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.avatar_seed}`}
                    alt={user.display_name}
                  />
                  <AvatarFallback>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                {expanded && (
                  <div className='ml-3'>
                    <p className='text-sm font-medium'>{user.display_name}</p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleLogout}
                    className='h-8 w-8'
                  >
                    <LogOut className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='right'>Logout</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
