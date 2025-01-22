// MongoDB Collections Structure
```
// Users Collection
{
  _id: ObjectId,
  user_uuid: String,  // Unique identifier for the user
  email: String,      // User's email (unique)
  password: String,   // Hashed password
  created_at: Date,
  last_login: Date,
  documents: [{       // Reference to user's documents
    document_uuid: String,
    filename: String,
    created_at: Date,
    last_accessed: Date
  }]
}
```
```
// Documents Collection - Collection Name: user_uuid.collection
{
  _id: ObjectId,
  document_uuid: String,     // Unique identifier for the document
  user_uuid: String,         // Reference to user
  filename: String,
  file_type: String,         // pdf, docx, doc, txt
  original_text: String,     // Original extracted text
  vector_store_id: String,   // Reference to vector store
  summary: String,           // Latest summary
  summaries: [{              // History of summaries
    text: String,
    created_at: Date,
    prompt_used: String
  }],
  chat_history: [{           // Chat interactions
    question: String,
    answer: String,
    timestamp: Date,
    context_used: [String]   // References to chunks used for answer
  }],
  created_at: Date,
  last_accessed: Date,
  status: String            // processing, completed, error
}
```
// VectorStores Collection
{
  _id: ObjectId,
  vector_store_id: String,  // Unique identifier for vector store
  document_uuid: String,    // Reference to document
  user_uuid: String,        // Reference to user
  chunks: [{                // Text chunks and their vectors
    text: String,
    vector: [Number],       // Embedding vector
    chunk_hash: String      // Hash of the chunk for deduplication
  }],
  created_at: Date
}
