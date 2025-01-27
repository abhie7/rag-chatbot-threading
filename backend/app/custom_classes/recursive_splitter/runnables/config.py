from __future__ import annotations

import asyncio
import uuid
import warnings
from collections.abc import Awaitable, Generator, Iterable, Iterator, Sequence
from concurrent.futures import Executor, Future, ThreadPoolExecutor
from contextlib import contextmanager
from contextvars import ContextVar, copy_context
from functools import partial
from typing import TYPE_CHECKING, Any, Callable, Optional, TypeVar, Union, cast

from typing_extensions import ParamSpec, TypedDict


if TYPE_CHECKING:
    from app.custom_classes.recursive_splitter.callbacks.base import Callbacks
else:
    # Pydantic validates through typed dicts, but
    # the callbacks need forward refs updated
    Callbacks = Optional[Union[list, Any]]


class EmptyDict(TypedDict, total=False):
    """Empty dict type."""


class RunnableConfig(TypedDict, total=False):
    """Configuration for a Runnable."""

    tags: list[str]
    """
    Tags for this call and any sub-calls (eg. a Chain calling an LLM).
    You can use these to filter calls.
    """

    metadata: dict[str, Any]
    """
    Metadata for this call and any sub-calls (eg. a Chain calling an LLM).
    Keys should be strings, values should be JSON-serializable.
    """

    callbacks: Callbacks
    """
    Callbacks for this call and any sub-calls (eg. a Chain calling an LLM).
    Tags are passed to all callbacks, metadata is passed to handle*Start callbacks.
    """

    run_name: str
    """
    Name for the tracer run for this call. Defaults to the name of the class.
    """

    max_concurrency: Optional[int]
    """
    Maximum number of parallel calls to make. If not provided, defaults to
    ThreadPoolExecutor's default.
    """

    recursion_limit: int
    """
    Maximum number of times a call can recurse. If not provided, defaults to 25.
    """

    configurable: dict[str, Any]
    """
    Runtime values for attributes previously made configurable on this Runnable,
    or sub-Runnables, through .configurable_fields() or .configurable_alternatives().
    Check .output_schema() for a description of the attributes that have been made
    configurable.
    """

    run_id: Optional[uuid.UUID]
    """
    Unique identifier for the tracer run for this call. If not provided, a new UUID
        will be generated.
    """


CONFIG_KEYS = [
    "tags",
    "metadata",
    "callbacks",
    "run_name",
    "max_concurrency",
    "recursion_limit",
    "configurable",
    "run_id",
]

COPIABLE_KEYS = [
    "tags",
    "metadata",
    "callbacks",
    "configurable",
]

DEFAULT_RECURSION_LIMIT = 25


var_child_runnable_config: ContextVar[RunnableConfig | None] = ContextVar(
    "child_runnable_config", default=None
)



P = ParamSpec("P")
T = TypeVar("T")



async def run_in_executor(
    executor_or_config: Optional[Union[Executor, RunnableConfig]],
    func: Callable[P, T],
    *args: P.args,
    **kwargs: P.kwargs,
) -> T:
    """Run a function in an executor.

    Args:
        executor_or_config: The executor or config to run in.
        func (Callable[P, Output]): The function.
        *args (Any): The positional arguments to the function.
        **kwargs (Any): The keyword arguments to the function.

    Returns:
        Output: The output of the function.

    Raises:
        RuntimeError: If the function raises a StopIteration.
    """

    def wrapper() -> T:
        try:
            return func(*args, **kwargs)
        except StopIteration as exc:
            # StopIteration can't be set on an asyncio.Future
            # it raises a TypeError and leaves the Future pending forever
            # so we need to convert it to a RuntimeError
            raise RuntimeError from exc

    if executor_or_config is None or isinstance(executor_or_config, dict):
        # Use default executor with context copied from current context
        return await asyncio.get_running_loop().run_in_executor(
            None,
            cast(Callable[..., T], partial(copy_context().run, wrapper)),
        )

    return await asyncio.get_running_loop().run_in_executor(executor_or_config, wrapper)