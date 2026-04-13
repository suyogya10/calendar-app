FROM webdevops/php-nginx:8.4

ENV WEB_DOCUMENT_ROOT=/app/public
ENV PHP_DATE_TIMEZONE=Asia/Kathmandu

WORKDIR /app

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install dependencies (ignoring scripts for now)
RUN composer install --no-interaction --no-dev --no-scripts --no-autoloader

# Copy Nginx static CORS configuration
COPY cors-static.conf /opt/docker/etc/nginx/vhost.common.d/cors-static.conf

# Copy the rest of the application
COPY . /app

# Now generate the autoloader and run clear/optimizations if needed
RUN composer dump-autoload --optimize

# Create storage symlink so public/storage points to storage/app/public
RUN php artisan storage:link

# Ensure the 'application' user (used by webdevops images) has correct permissions
RUN chown -R application:application /app/storage /app/bootstrap/cache /app/public
