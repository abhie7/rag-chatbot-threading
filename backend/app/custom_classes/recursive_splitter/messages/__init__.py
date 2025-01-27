"""**Messages** are objects used in prompts and chat conversations.

**Class hierarchy:**

.. code-block::

    BaseMessage --> SystemMessage, AIMessage, HumanMessage, ChatMessage, FunctionMessage, ToolMessage
                --> BaseMessageChunk --> SystemMessageChunk, AIMessageChunk, HumanMessageChunk, ChatMessageChunk, FunctionMessageChunk, ToolMessageChunk

**Main helpers:**

.. code-block::

    ChatPromptTemplate

"""  # noqa: E501

from app.custom_classes.recursive_splitter.messages.ai import (
    AIMessage,
    AIMessageChunk,
)
from app.custom_classes.recursive_splitter.messages.base import (
    BaseMessage,
    BaseMessageChunk,
    merge_content,
    message_to_dict,
    messages_to_dict,
)
from app.custom_classes.recursive_splitter.messages.chat import ChatMessage, ChatMessageChunk
from app.custom_classes.recursive_splitter.messages.function import FunctionMessage, FunctionMessageChunk
from app.custom_classes.recursive_splitter.messages.human import HumanMessage, HumanMessageChunk
from app.custom_classes.recursive_splitter.messages.modifier import RemoveMessage
from app.custom_classes.recursive_splitter.messages.system import SystemMessage, SystemMessageChunk
from app.custom_classes.recursive_splitter.messages.tool import (
    InvalidToolCall,
    ToolCall,
    ToolCallChunk,
    ToolMessage,
    ToolMessageChunk,
)
from app.custom_classes.recursive_splitter.messages.utils import (
    AnyMessage,
    MessageLikeRepresentation,
    _message_from_dict,
    convert_to_messages,
    convert_to_openai_messages,
    filter_messages,
    get_buffer_string,
    merge_message_runs,
    message_chunk_to_message,
    messages_from_dict,
    trim_messages,
)

__all__ = [
    "AIMessage",
    "AIMessageChunk",
    "AnyMessage",
    "BaseMessage",
    "BaseMessageChunk",
    "ChatMessage",
    "ChatMessageChunk",
    "FunctionMessage",
    "FunctionMessageChunk",
    "HumanMessage",
    "HumanMessageChunk",
    "InvalidToolCall",
    "MessageLikeRepresentation",
    "SystemMessage",
    "SystemMessageChunk",
    "ToolCall",
    "ToolCallChunk",
    "ToolMessage",
    "ToolMessageChunk",
    "RemoveMessage",
    "_message_from_dict",
    "convert_to_messages",
    "get_buffer_string",
    "merge_content",
    "message_chunk_to_message",
    "message_to_dict",
    "messages_from_dict",
    "messages_to_dict",
    "filter_messages",
    "merge_message_runs",
    "trim_messages",
    "convert_to_openai_messages",
]
