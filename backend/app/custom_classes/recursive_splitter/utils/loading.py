"""Utilities for loading configurations from app.custom_classes.recursive_splitter-hub."""

import warnings
from typing import Any

from app.custom_classes.recursive_splitter._api.deprecation import deprecated


@deprecated(
    since="0.1.30",
    removal="1.0",
    message=(
        "Using the hwchase17/langchain-hub "
        "repo for prompts is deprecated. Please use "
        "<https://smith.langchain.com/hub> instead."
    ),
)
def try_load_from_hub(
    *args: Any,
    **kwargs: Any,
) -> Any:
    warnings.warn(
        "Loading from the deprecated github-based Hub is no longer supported. "
        "Please use the new LangChain Hub at https://smith.langchain.com/hub instead.",
        DeprecationWarning,
        stacklevel=2,
    )
    # return None, which indicates that we shouldn't load from old hub
    # and might just be a filepath for e.g. load_chain
    return None
