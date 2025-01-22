import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    document_uuid: {
        type: String,
        required: true,
        unique: true,
    },
    user_uuid: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    file_type: {
        type: String,
        enum: ['pdf', 'docx', 'doc', 'txt'],
        required: true,
    },
    original_text: String,
    vector_store_hash: String,
    summary: String,
    past_summaries: [
        {
            text: String,
            created_at: {
                type: Date,
                default: Date.now,
            },
            prompt_used: String,
        },
    ],
    chat_history: [
        {
            question: String,
            answer: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
            context_used: [String],
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
    last_accessed: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'error'],
        default: 'processing',
    },
});

export default mongoose.model('Document', documentSchema);
