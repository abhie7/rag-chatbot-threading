import os
import hashlib
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.core import Document
import faiss
import mammoth
import pymupdf4llm
from app.services.minio_handler import MinioHandler
# from model2vec import StaticModel

# Load a model from the HuggingFace hub (in this case the potion-base-8M model)
# model = StaticModel.from_pretrained("minishlab/potion-base-8M")

def hash_document_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()
  
def convert_docx_to_md(file_path):
    with open(file_path, "rb") as docx_file:
        result = mammoth.convert_to_markdown(docx_file)
    return result.value

def download_file_from_minio(file_name = 'RFP-SIA-Website-Design-Development-and-Maintenance-Services 2 copy.pdf'):
    folder_name='documents'
    
    minio_handler = MinioHandler()
    
    minio_handler.download_file(
        bucket_name='rfp-automation',
        object_name=f'{folder_name}/{file_name}',
        local_file_path=r'/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/app/documents'
    )
    
    return file_name
    
      
def parse_documents(directory=r'/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/app/documents'):
    for file in os.listdir(directory):
        if file.endswith(('.pdf')):
            file_path = os.path.join(directory, file)
            try:
                # md_text = convert_docx_to_md(file_path)
                md_text = pymupdf4llm.to_markdown(file_path)
                return md_text, file_path
            except Exception as e:
                print(f"Failed to parse {file}: {e}\n")

def recursive_split_text(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(text)
    return chunks

def convert_to_llamaindex_document(chunks, file_path):
    documents = [Document(text=chunk, metadata={"source": file_path}) for chunk in chunks]
    # documents = [Document(text=chunks, metadata={"source": file_path})]
    return documents
  
def save_faiss_index(documents, db_path):
    if not os.path.exists(db_path):
        os.makedirs(db_path)

    # dimensions of text-ada-embedding-002
    d = 384
    faiss_index = faiss.IndexFlatL2(d)
    
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    # embed_model = HuggingFaceEmbedding(model_name="minishlab/potion-base-8M")
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=embed_model)
    
    # save index to disk
    index.storage_context.persist(persist_dir=db_path)
    print(f"Vector DB created and saved to {db_path}")

def main(text, base_db_path=r'./vectorDBs'):
    doc_hash = hash_document_text(text)
    print(f"Document hash: {doc_hash}")
    doc_db_folder = os.path.join(base_db_path, doc_hash)
    print(f"Document DB folder: {doc_db_folder}")
    if not os.path.exists(doc_db_folder):
        # file_name = download_file_from_minio()
        # print(f"File name: {file_name}")

        chunks = recursive_split_text(md_text)
        # print(f"Chunks: {chunks}")
        documents = convert_to_llamaindex_document(chunks, file_path)
        print(f"Documents: {documents}")
        save_faiss_index(documents=documents, db_path=doc_db_folder)
        print(f"Vector DB created and saved to {doc_db_folder}")
    else:
        print(f"Vector DB for already exists at {doc_db_folder}")


if __name__ == "__main__":
  
    md_text, file_path = parse_documents()
    # print(f"MD text: {md_text}")
    main(text=md_text, base_db_path=r'./vectorDBs')