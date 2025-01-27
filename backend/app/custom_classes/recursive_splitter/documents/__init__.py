"""**Document** module is a collection of classes that handle documents
and their transformations.

"""

from app.custom_classes.recursive_splitter.documents.base import Document
from app.custom_classes.recursive_splitter.documents.transformers import BaseDocumentTransformer

__all__ = ["Document", "BaseDocumentTransformer", "BaseDocumentCompressor"]