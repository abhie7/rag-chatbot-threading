"""**Output** classes are used to represent the output of a language model call
and the output of a chat.

The top container for information is the `LLMResult` object. `LLMResult` is used by
both chat models and LLMs. This object contains the output of the language
model and any additional information that the model provider wants to return.

When invoking models via the standard runnable methods (e.g. invoke, batch, etc.):
- Chat models will return `AIMessage` objects.
- LLMs will return regular text strings.

In addition, users can access the raw output of either LLMs or chat models via
callbacks. The on_chat_model_end and on_llm_end callbacks will return an
LLMResult object containing the generated outputs and any additional information
returned by the model provider.

In general, if information is already available
in the AIMessage object, it is recommended to access it from there rather than
from the `LLMResult` object.
"""

from app.custom_classes.recursive_splitter.outputs.chat_generation import ChatGeneration, ChatGenerationChunk
from app.custom_classes.recursive_splitter.outputs.chat_result import ChatResult
from app.custom_classes.recursive_splitter.outputs.generation import Generation, GenerationChunk
from app.custom_classes.recursive_splitter.outputs.llm_result import LLMResult
from app.custom_classes.recursive_splitter.outputs.run_info import RunInfo

__all__ = [
    "ChatGeneration",
    "ChatGenerationChunk",
    "ChatResult",
    "Generation",
    "GenerationChunk",
    "LLMResult",
    "RunInfo",
]
