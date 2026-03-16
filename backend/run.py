import asyncio
import sys

import uvicorn


def main() -> None:
    """
    Entry point for running the FastAPI app in a Windows-safe way.

    Psycopg's async connections are incompatible with the default Proactor
    event loop used by uvicorn on Windows, so we switch to the
    WindowsSelectorEventLoopPolicy *before* uvicorn creates the loop.
    """
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()

