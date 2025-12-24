FROM python:3.13-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
# Copy the application into the container.
COPY . /app

# Install the application dependencies.
WORKDIR /app
ENV UV_PROJECT_ENVIRONMENT="/venv"
ENV PATH="/venv/bin:$PATH"
RUN uv sync --frozen --no-cache

# Run the application.
CMD ["fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]
