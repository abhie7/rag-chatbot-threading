import faiss
from sentence_transformers import SentenceTransformer
import uuid
import os
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.core import Document

model = SentenceTransformer('all-MiniLM-L6-v2')

async def create_vector_store(text):
    chunks = text.split('\n\n')
    embeddings = model.encode(chunks)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    vector_store_uuid = str(uuid.uuid4())
    faiss.write_index(index, f"vector_stores/{vector_store_uuid}.index")
    return vector_store_uuid

async def query_vector_store(vector_store_uuid, query):
    vector_store_path = f"vector_stores/{vector_store_uuid}.index"
    index = faiss.read_index(vector_store_path)
    embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FaissVectorStore(faiss_index=index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = load_index_from_storage(storage_context=storage_context, embed_model=embed_model)
    response = index.query(query)
    return response