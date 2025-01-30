import pymupdf4llm
import hashlib
from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
from llama_index.core import Document
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from datetime import datetime


async def parse_pdf_to_md(local_file_path):
    try:
        if local_file_path.endswith('.pdf'):
            md_text = pymupdf4llm.to_markdown(local_file_path)
            return md_text
        else:
            raise ValueError(f"[Process RFP][{await get_time()}] The provided file is not a PDF.")
    except Exception as e:
        print(f"[Process RFP][{await get_time()}] Failed to parse {local_file_path}: {e}\n")
        return None, local_file_path

async def hash_document_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()
  
async def recursive_split_text(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(text)
    return chunks

async def convert_to_llamaindex_document(chunks, file_path):
    documents = [Document(text=chunk, metadata={"source": file_path}) for chunk in chunks]
    # documents = [Document(text=chunks, metadata={"source": file_path})]
    return documents

async def custom_jsonable_encoder(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    return jsonable_encoder(obj)

async def get_time():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")