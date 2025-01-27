import os
import hashlib
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.core import Document
import faiss
import mammoth
import pymupdf4llm
from app.services.minio_handler import MinioHandler
from llama_index.core.chat_engine.types import ChatMode

from llama_index.core.agent.react.base import ReActAgent
from llama_index.llms.lmstudio import LMStudio
from llama_index.core.tools import QueryEngineTool, ToolMetadata
import openai
from llama_index.llms.openai import OpenAI

import faiss
import numpy as np
from llama_index.llms.lmstudio import LMStudio


llm = LMStudio(
    model_name=os.getenv('LMSTUDIO_MODEL'),
    base_url=os.getenv('LMSTUDIO_BASE_URL'),
    temperature=0.5
)

embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
# embed_model = HuggingFaceEmbedding(model_name="minishlab/potion-base-8M")

# load index from disk
vector_store = FaissVectorStore.from_persist_dir(r"/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/vectorDBs/d6803bc8286260eb8400e2e3e3b850be2b2c13337266106603dcc49b7ef39d72")

storage_context = StorageContext.from_defaults(
    vector_store=vector_store, persist_dir=r"/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/vectorDBs/d6803bc8286260eb8400e2e3e3b850be2b2c13337266106603dcc49b7ef39d72"
)
index = load_index_from_storage(storage_context=storage_context, embed_model=embed_model)

def print_retrieved_chunks(response):
    for source_node in response.source_nodes:
        print(f"\n\n{'-'*75}Retrieved Chunks: {source_node.node.get_content()}")

################## APPROACH-1 ####################
query_engine = index.as_chat_engine(llm=llm, chat_mode=ChatMode.CONTEXT)
response = query_engine.chat("what are all the some important licenses mentioned?")
print(response)
print_retrieved_chunks(response)



################## APPROACH-2 ####################
# index_engine = index.as_query_engine(similarity_top_k=5, llm=llm)

# query_engine_tool = QueryEngineTool(
#     query_engine=index_engine,
#     metadata=ToolMetadata(
#         name="query_engine_tool",
#         description=(
#             "Answers the queries related o Request for Proposals (RFP) from the provided context (indexed RFP). Understand the Context and the Query thoroughly and answer from my context properly."
#         ),
#     ),
# )

# agent = ReActAgent.from_tools([query_engine_tool], llm=llm, max_iterations=4, verbose=True)

# query = "Who is Alannah Toft?"
# response = agent.chat(query)
# print(response)



################## APPROACH-3 ####################
# To use this add open .venv/llama_index.llms.openai.utils and add "llama-3.2-3b-instruct" to the list of models in "GPT4_MODELS: Dict[str, int] = {}"
# llm2 = OpenAI(
#     model=os.getenv('LMSTUDIO_MODEL'),
#     api_key=os.getenv('LMSTUDIO_API_KEY'),
#     api_base=os.getenv('LMSTUDIO_BASE_URL'),
#     temperature=0.5
# )

# index_engine = index.as_query_engine(similarity_top_k=3, llm=llm2)

# query_engine_tool = QueryEngineTool(
#     query_engine=index_engine,
#     metadata=ToolMetadata(
#         name="query_engine_tool",
#         description=(
#             "Answers the queries related o Request for Proposals (RFP) from the provided context (indexed RFP). Understand the Context and the Query thoroughly and answer from my context properly."
#         ),
#     ),
# )

# from llama_index.agent.openai import OpenAIAgent

# agent = OpenAIAgent.from_tools(
#     tools=[query_engine_tool],
#     llm=llm2,
#     verbose=True,
#     system_prompt="You are an agent designed to answer queries related to RFPs using the provided context.",
#     max_function_calls=3
# )

# query = "what are all the some important licenses mentioned?"
# response = agent.chat(query)
# print(response)
