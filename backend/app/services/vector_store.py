import asyncio
import os
from typing import List, Optional
import faiss
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.llms.lmstudio import LMStudio
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.core.chat_engine.types import ChatMode
import pymupdf4llm
from openai import OpenAI, APIConnectionError, OpenAIError

LMSTUDIO_MODEL = os.getenv("LMSTUDIO_MODEL", "llama-3.2-3b-instruct")
LMSTUDIO_BASE_URL = os.getenv("LMSTUDIO_BASE_URL", "http://192.168.3.202:1234/v1")
LMSTUDIO_API_KEY = os.getenv("LMSTUDIO_API_KEY", "lm_studio")

# llm = LMStudio(
#     model_name=LMSTUDIO_MODEL,
#     base_url=LMSTUDIO_BASE_URL,
#     temperature=0.5
# )

async def lmstudio_llm(inputs: str) -> Optional[str]:
    client = OpenAI(base_url=LMSTUDIO_BASE_URL, api_key=LMSTUDIO_API_KEY)
    
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=LMSTUDIO_MODEL,  
                messages=[{"role": "user", "content": inputs}],
                temperature=0.2,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content.strip()
        
        except APIConnectionError as e:
            print(f"[ERROR] Connection failed (attempt {attempt+1}/3): {e}")
        
        except OpenAIError as e:
            print(f"[ERROR] OpenAI API error: {e}")
            return None  # Stop retrying if the error is not connection-related
        
        await asyncio.sleep(5)  # Proper async sleep for retry
    
    print("[ERROR] Failed to connect after multiple attempts.")
    return None

class LMStudioLLM:
    async def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        response = await lmstudio_llm(prompt)
        if response is None:
            raise RuntimeError("LLM failed to generate a response.")
        return response

async def save_faiss_index(documents, db_path):
    if not os.path.exists(db_path):
        os.makedirs(db_path)

    # dimensions of all-MiniLM-L6-v2
    d = 384
    faiss_index = faiss.IndexFlatL2(d)
    
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    
    storage_context = StorageContext.from_defaults(
        vector_store=vector_store
    )
    
    embed_model = HuggingFaceEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    index = VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        embed_model=embed_model
    )
    
    # save index to disk
    index.storage_context.persist(persist_dir=db_path)
    print(f"Vector DB created and saved to {db_path}")

async def generate_rfp_prompt(text: str) -> str:
    prompt = f"""
Please extract the following things from the PDF text:
- Current Challenges (Current issues or work or summary of existing solutions)
- Scope of Work/Statement of Work/Statement of Services
- Evaluation Criteria (generate answer in table format with criteria and points)
- Forms/Documentation Required
- Compliance (certificate, qualification)
- Project Goals
- Additional Features (Future Scalability)
- Important Dates or schedule including Question and answer date and must include submission date or due date (consider all the dates, in a table format)
- Submission process or method (Proposal contains, response method ,submission requirements)
- Please include Mandatory or must-have requirements mentioned in the document.
Here is the PDF text:
{text}
Please include Mandatory or must-have requirements mentioned in the document.
"""
    return prompt

async def get_chat(vector_db_path):
    print('[Process RFP] Summarization has started!')

    try:
        embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # load index from disk
        vector_store = FaissVectorStore.from_persist_dir(vector_db_path)

        storage_context = StorageContext.from_defaults(
            vector_store=vector_store, persist_dir=vector_db_path
        )
        
        index = load_index_from_storage(storage_context=storage_context, embed_model=embed_model)
        
        query_engine = index.as_chat_engine(llm=..., chat_mode=ChatMode.CONTEXT)
        
        response = query_engine.chat(await generate_rfp_prompt())
        print(response)
        return(response)
    except Exception as e:
        print(e)

async def get_summary(text: str) -> str:
    try:
        prompt = await generate_rfp_prompt(text)
        llm = LMStudioLLM()
        summary = await llm._call(prompt)
        
        print(summary)
        return(summary)
    except Exception as e:
        print('[Process RFP] Summarization failed')
        return None

async def main():
    with open('backend/app/documents/sample.md', 'r') as f:
        text = f.read()
        
    summary = await get_summary(text)
    print(summary)

if __name__ == '__main__':
    asyncio.run(main())