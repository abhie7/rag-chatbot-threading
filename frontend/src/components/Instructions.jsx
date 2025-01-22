import { FileText, MessageSquare, Download } from 'lucide-react';

export default function Instructions() {
    const steps = [
        {
            icon: <FileText className='h-5 w-5' />,
            title: 'Upload RFP Document',
            description:
                'Click the + button to upload your RFP document (PDF, DOCX, or TXT)',
        },
        {
            icon: <MessageSquare className='h-5 w-5' />,
            title: 'Process and Analyze',
            description:
                "Click 'Summarize RFP' to generate a concise summary of the document",
        },
        {
            icon: <Download className='h-5 w-5' />,
            title: 'Review and Download',
            description:
                'Review the summary and download it as a markdown file, or use the chat to ask questions',
        },
    ];

    return (
        <div className='p-4 bg-card rounded-lg shadow-sm border mt-8'>
            <h3 className='font-semibold text-lg mb-4'>How to Use</h3>
            <div className='space-y-4'>
                {steps.map((step, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                        <div className='p-2 bg-primary/10 rounded-md dark:bg-primary/20'>
                            {step.icon}
                        </div>
                        <div>
                            <h4 className='font-medium'>{step.title}</h4>
                            <p className='text-sm text-muted-foreground'>
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
