FROM python:3.11.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_HOME="/opt/poetry"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry via official installer (not pip)
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="${POETRY_HOME}/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy only dependency files first to leverage Docker cache
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --no-root --only main

# Copy the application source code (including manage.py and Django project)
COPY . .

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
