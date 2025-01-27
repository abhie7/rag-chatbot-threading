# i want to build a pipeline that will take a document from a directory, parse it, extract cleaned text, create a vector database for each file (create a folder - "vectorDBs", then for each doc, create a new vectorDB folder and instance inside that folder, name it the file name, also add a hash id to that folder), and then perform similarity search on the document. I have the following code snippets that I want to combine into a single pipeline, they are scattered apart so please understand the context and help me combine them into a single pipeline. I am new to python and I am trying to learn how to build pipelines. I am using FastAPI, llamaindex, faiss-cpu as my vectorDB, a custom recursive text splitter for chunking and HuggingFace's Sentence Transformers library. I have the following code snippets:

import os
import hashlib
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from app.services.doc_parser import DocumentParser


# Function to hash document content for unique identification
def hash_document_content(content):
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


# Function to parse documents in a directory and extract cleaned text
def parse_documents(directory):
    parsed_files = {}
    for file in os.listdir(directory):
        if file.endswith(('.pdf', '.doc', '.docx')):
            file_path = os.path.join(directory, file)
            parser = DocumentParser(file_path)
            try:
                cleaned_text = parser.get_cleaned_text()
                parsed_files[file] = cleaned_text
            except Exception as e:
                print(f"Failed to parse {file}: {e}\n")
    return parsed_files


# Function to create a vector database for a document
def create_vector_db(content, model_name, db_folder_path):
    # Ensure db_folder_path exists
    os.makedirs(db_folder_path, exist_ok=True)

    # Initialize the embedding model
    embed_model = HuggingFaceEmbedding(model_name=model_name)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

    # Split text into chunks
    chunks = text_splitter.split_text(content)

    # Prepare document nodes
    documents = [SimpleDirectoryReader.create_text_node(chunk) for chunk in chunks]

    # Configure FAISS vector store
    faiss_index = FaissVectorStore()
    storage_context = StorageContext.from_defaults(vector_store=faiss_index)

    # Create the index and persist it
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model)
    index.storage_context.persist(persist_dir=db_folder_path)

    print(f"Vector DB created and saved to {db_folder_path}")


# Function to perform similarity search
def similarity_search(query, db_folder_path, model_name):
    embed_model = HuggingFaceEmbedding(model_name=model_name)
    storage_context = StorageContext.from_defaults(persist_dir=db_folder_path)
    index = VectorStoreIndex.from_storage_context(storage_context=storage_context)

    # Generate embedding for the query
    query_embedding = embed_model.embed_text(query)

    # Perform similarity search
    results = index.vector_store.similarity_search(query_embedding)
    print("Similarity search results:")
    for result in results:
        print(result)


# Process a single document: parse, create vector DB, and search
def process_document(file_name, content, model_name, base_db_path):
    doc_hash = hash_document_content(content)
    doc_db_folder = os.path.join(base_db_path, doc_hash)

    # Create vector DB if it doesn't exist
    if not os.path.exists(doc_db_folder):
        create_vector_db(content, model_name, doc_db_folder)
    else:
        print(f"Vector DB for {file_name} already exists at {doc_db_folder}")

    # Perform a sample similarity search (example query)
    query = "Example query text to search for similar content"
    similarity_search(query, doc_db_folder, model_name)


# Main pipeline function
def main():
    doc_directory = r"/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/app/documents"  # Replace with your document directory
    model_name = 'sentence-transformers/all-MiniLM-L6-v2'  # HuggingFace model for embeddings
    base_db_path = "vectorDBs"  # Base directory for vector databases

    # Ensure base vectorDB folder exists
    os.makedirs(base_db_path, exist_ok=True)

    # Parse documents
    parsed_files = parse_documents(doc_directory)

    # Process each parsed document
    for file_name, content in parsed_files.items():
        process_document(file_name, content, model_name, base_db_path)


if __name__ == "__main__":
    main()
