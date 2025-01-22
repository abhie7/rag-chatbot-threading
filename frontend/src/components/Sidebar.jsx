import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    ChevronFirst,
    ChevronLast,
    FileText,
    Home,
    PlusCircle,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';

export default function CollapsibleSidebar({ selectedFile, setSelectedFile }) {
    const [expanded, setExpanded] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Placeholder documents
    const documents = [
        { id: 1, name: 'Government RFP 2024.pdf', date: '2024-02-15' },
        { id: 2, name: 'Tech Project Proposal.docx', date: '2024-02-14' },
        { id: 3, name: 'Healthcare Initiative.pdf', date: '2024-02-13' },
        { id: 4, name: 'Education System RFP.pdf', date: '2024-02-12' },
    ];

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const menuItems = [{ icon: Home, label: 'Dashboard', onClick: () => {} }];

    return (
        <TooltipProvider>
            <aside
                className={`h-screen ${
                    expanded ? 'w-72' : 'w-16'
                } bg-card border-r px-4 transition-all duration-300 ease-in-out`}
            >
                <nav className='h-full flex flex-col'>
                    <div className='flex items-center justify-between py-4 border-b'>
                        {expanded && (
                            <span className='text-xl font-bold'>
                                RFP Analyzer
                            </span>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setExpanded(!expanded)}
                                    className='h-8 w-8'
                                >
                                    {expanded ? (
                                        <ChevronFirst />
                                    ) : (
                                        <ChevronLast />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {expanded
                                    ? 'Collapse sidebar'
                                    : 'Expand sidebar'}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className='flex-1 py-4 space-y-4'>
                        {menuItems.map((item) => (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        className={`w-full justify-start ${
                                            expanded ? 'px-3' : 'px-2'
                                        }`}
                                        onClick={item.onClick}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 ${
                                                expanded ? 'mr-3' : ''
                                            }`}
                                        />
                                        {expanded && <span>{item.label}</span>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{item.label}</TooltipContent>
                            </Tooltip>
                        ))}

                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            className={`w-full justify-start ${
                                                expanded ? 'px-3' : 'px-2'
                                            }`}
                                        >
                                            <FileText
                                                className={`h-5 w-5 ${
                                                    expanded ? 'mr-3' : ''
                                                }`}
                                            />
                                            {expanded && (
                                                <>
                                                    <span className='flex-1 text-left'>
                                                        My Documents
                                                    </span>
                                                    <ChevronDown className='h-4 w-4 opacity-50' />
                                                </>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>My Documents</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className='w-72'>
                                {documents.map((doc) => (
                                    <DropdownMenuItem
                                        key={doc.id}
                                        className='flex items-center py-2'
                                    >
                                        <FileText className='h-4 w-4 mr-2' />
                                        <div className='flex-1'>
                                            <p className='text-sm truncate'>
                                                {doc.name}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {doc.date}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className='border-t pt-4'>
                            <div className='flex items-center mb-4'>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className={`${
                                                expanded ? 'w-12' : 'w-full'
                                            }`}
                                        >
                                            <label
                                                htmlFor='file-upload'
                                                className='cursor-pointer flex items-center justify-center'
                                            >
                                                <PlusCircle className='h-4 w-4' />
                                                <span className='sr-only'>
                                                    Upload file
                                                </span>
                                            </label>
                                            <input
                                                id='file-upload'
                                                type='file'
                                                className='hidden'
                                                onChange={handleFileUpload}
                                                accept='.pdf,.docx,.txt'
                                            />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Upload new document
                                    </TooltipContent>
                                </Tooltip>
                                {expanded && (
                                    <Button
                                        className='ml-2 flex-1'
                                        disabled={!selectedFile}
                                    >
                                        Upload RFP
                                    </Button>
                                )}
                            </div>

                            {selectedFile && expanded && (
                                <div className='flex items-center space-x-2 p-2 bg-secondary rounded-md'>
                                    <FileText className='h-4 w-4' />
                                    <span className='text-sm truncate'>
                                        {selectedFile.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='border-t pt-4 pb-4'>
                        <div
                            className={`flex items-center ${
                                expanded ? 'justify-between' : 'justify-center'
                            }`}
                        >
                            <div className='flex items-center'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>
                                        {user.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {expanded && (
                                    <div className='ml-3'>
                                        <p className='text-sm font-medium'>
                                            {user.name}
                                        </p>
                                        <p className='text-xs text-muted-foreground truncate'>
                                            {user.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {expanded ? (
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleLogout}
                                    className='h-8 w-8'
                                >
                                    <LogOut className='h-4 w-4' />
                                </Button>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={handleLogout}
                                            className='h-8 w-8 mt-2'
                                        >
                                            <LogOut className='h-4 w-4' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Logout</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </nav>
            </aside>
        </TooltipProvider>
    );
}
