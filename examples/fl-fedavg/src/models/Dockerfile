# Start from a Python slim image

FROM --platform=linux/amd64  python:3.12.1


# Set environment variables to non-interactive mode to avoid user prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    wget \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a working directory
WORKDIR /app

# Copy the requirements.txt if you have additional Python dependencies
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -i https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/ORT/pypi/simple/ onnxruntime-training-cpu==1.18.0

# Set the default command to run when the container starts
CMD ["python"]
