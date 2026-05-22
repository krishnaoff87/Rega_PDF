# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Install system dependencies, specifically Ghostscript for PDF compression
RUN apt-get update && \
    apt-get install -y ghostscript && \
    rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn flask-cors

# Create uploads and output directories and grant full permissions for Hugging Face non-root user
RUN mkdir -p uploads output && chmod 777 uploads output

# Make port 7860 available to the world outside this container
EXPOSE 7860

# Define environment variable
ENV FLASK_ENV=production
ENV IS_CLOUD=1

# Run gunicorn when the container launches
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--timeout", "120", "--workers", "2", "app:app"]
