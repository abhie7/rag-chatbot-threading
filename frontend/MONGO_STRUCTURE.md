// MongoDB Collections Structure
```
// Users Collection
{
  _id: ObjectId,
  user_uuid: String,  // Unique identifier for the user
  email: String,      // User's email (unique)
  username: String
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

provided .docx/.doc/.pdf/.txt file and then send the text as payload to my backend server. 

- backend server will divide the processes into 2 main threads:
- the thread 1 will convert the text into vector embeddings and store them in a vectorDB (Faiss by Meta) which will be identified using a hash (vector_store_uuid), so every uploaded file will have a different hash and a vectorDB.
- the thread 2 will take the embedding array from the RAM from the thread 1 and will call the process_rfp(). till then show a loading sign.
- i want everything to be dynamic and want to save everything inside a mongo database - collection for users.collection consisting of their login info, etc. each user will have a uuid - user_uuid, and in the users.collection, each user will have a vectorDB_uuid which will link to their very own vectorDB_uuid.collection where each object will consist of their files' data - filename, vectorDB_hash, user_uuid, summary, past_summaries, chat_history, etc.

```
// Documents Collection - Collection Name: user_uuid.documents
{
  _id: ObjectId,
  document_uuid: String,     // Unique identifier for the document
  user_uuid: String,         // Reference to user
  filename: String,
  file_type: String,         // pdf, docx, doc, txt
  original_text: String,     // Original extracted text
  vector_store_uuid: String,   // Reference to vector store
  summary: String,           // Latest summary
  past_summaries: [{              // History of summaries
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
  last_accessed: Date
}
```
