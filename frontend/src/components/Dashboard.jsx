import { useState } from 'react';
import CollapsibleSidebar from './Sidebar';
import SummarizeView from './SummarizeView';
import ChatView from './ChatView';
import ModeToggle from './ModeToggle';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('summarize');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);

    return (
        <div className='flex h-screen bg-background'>
            <CollapsibleSidebar
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
            />
            <main className='flex-1 overflow-hidden'>
                <div className='p-4 border-b flex justify-between items-center'>
                    <nav className='flex space-x-4'>
                        <button
                            onClick={() => setActiveTab('summarize')}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                activeTab === 'summarize'
                                    ? 'bg-secondary text-secondary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Summarize RFP
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                activeTab === 'chat'
                                    ? 'bg-secondary text-secondary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            RFP Chat
                        </button>
                    </nav>
                    <ModeToggle />
                </div>
                <div className='flex-1 overflow-y-auto p-4'>
                    {activeTab === 'summarize' ? (
                        <SummarizeView selectedDoc={selectedDoc} />
                    ) : (
                        <ChatView  selectedDoc={selectedDoc}/>
                    )}
                </div>
            </main>
        </div>
    );
}
