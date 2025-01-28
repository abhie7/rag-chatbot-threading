from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, rfp, minio
from app.database import init_db
from contextlib import asynccontextmanager
import logging

from app.custom_classes.recursive_splitter import RecursiveCharacterTextSplitter
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
    allow_origins=["http://localhost:4040", "http://192.168.2.178:4040", "*"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(rfp.router, prefix="/api", tags=["rfp"])
app.include_router(minio.router, prefix="/api", tags=["rfp"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

