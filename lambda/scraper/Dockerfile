FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY lambda_function.py .
COPY tests/ ./tests/

CMD ["python", "-m", "pytest", "tests/", "-v"]