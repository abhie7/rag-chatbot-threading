from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, rfp, documents, chat
from app.database import init_db
from contextlib import asynccontextmanager
import logging

from app.routes import download_rfp

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("[RFP Server] Server started.")
    yield
    logger.info("[RFP Server] Shutting down RFP Server...")

app = FastAPI(lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4040", "http://192.168.2.178:4040", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(rfp.router, prefix="/api/rfp", tags=["rfp"])
app.include_router(chat.router, prefix="/api/rfp", tags=["chat"])
app.include_router(download_rfp.router, prefix="/api/downloads", tags=["download_rfp"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4041, reload=True)

