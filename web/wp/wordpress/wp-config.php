<?php
/**
 * WordPress Configuration for Watt Remix App
 * 
 * This file contains the configuration for WordPress running
 * in the Platformatic Watt environment
 */

// Database configuration from environment variables
define( 'DB_NAME', getenv( 'WORDPRESS_DB_NAME' ) ?: 'wordpress' );
define( 'DB_USER', getenv( 'WORDPRESS_DB_USER' ) ?: 'wordpress' );
define( 'DB_PASSWORD', getenv( 'WORDPRESS_DB_PASSWORD' ) ?: 'wordpress' );
define( 'DB_HOST', getenv( 'WORDPRESS_DB_HOST' ) ?: 'localhost:3306' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// Security keys - use environment variables or generate new ones
define( 'AUTH_KEY', getenv( 'WORDPRESS_AUTH_KEY' ) ?: 'put your unique phrase here' );
define( 'SECURE_AUTH_KEY', getenv( 'WORDPRESS_SECURE_AUTH_KEY' ) ?: 'put your unique phrase here' );
define( 'LOGGED_IN_KEY', getenv( 'WORDPRESS_LOGGED_IN_KEY' ) ?: 'put your unique phrase here' );
define( 'NONCE_KEY', getenv( 'WORDPRESS_NONCE_KEY' ) ?: 'put your unique phrase here' );
define( 'AUTH_SALT', getenv( 'WORDPRESS_AUTH_SALT' ) ?: 'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', getenv( 'WORDPRESS_SECURE_AUTH_SALT' ) ?: 'put your unique phrase here' );
define( 'LOGGED_IN_SALT', getenv( 'WORDPRESS_LOGGED_IN_SALT' ) ?: 'put your unique phrase here' );
define( 'NONCE_SALT', getenv( 'WORDPRESS_NONCE_SALT' ) ?: 'put your unique phrase here' );

// WordPress table prefix
$table_prefix = 'wp_';

// WordPress debugging
define( 'WP_DEBUG', getenv( 'NODE_ENV' ) !== 'production' );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

// WordPress URLs
define( 'WP_HOME', getenv( 'WORDPRESS_URL' ) ?: 'http://localhost:3042/wp' );
define( 'WP_SITEURL', getenv( 'WORDPRESS_URL' ) ?: 'http://localhost:3042/wp' );

// File permissions
define( 'FS_METHOD', 'direct' );

// Memory limits
define( 'WP_MEMORY_LIMIT', '256M' );

// Automatic updates
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'WP_AUTO_UPDATE_CORE', false );

// Multisite (disabled by default)
// define('WP_ALLOW_MULTISITE', true);

// Content directory paths
define( 'WP_CONTENT_DIR', __DIR__ . '/wp-content' );
define( 'WP_CONTENT_URL', WP_HOME . '/wp-content' );

// Plugin directory paths
define( 'WP_PLUGIN_DIR', WP_CONTENT_DIR . '/plugins' );
define( 'WP_PLUGIN_URL', WP_CONTENT_URL . '/plugins' );

// Theme directory paths
define( 'WP_DEFAULT_THEME', 'twentytwentyfour' );

// Enable REST API and ensure CORS headers
add_action( 'rest_api_init', function () {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', function ( $value ) {
		header( 'Access-Control-Allow-Origin: *' );
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
		return $value;
	} );
} );

// Load WordPress
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';