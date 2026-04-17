FROM php:8.2-cli

# Install necessary extensions
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && docker-php-ext-install json \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", ".", "-r", "index.php"]
