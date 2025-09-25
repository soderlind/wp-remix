<?php
/**
 * WordPress Bootstrap for Watt Remix App
 * 
 * This file serves as the entry point for WordPress
 * in the Platformatic Watt environment
 */

// Load WordPress configuration
require_once __DIR__ . '/wp-config.php';

// Check if WordPress is installed by looking for core files
if ( ! file_exists( ABSPATH . 'wp-load.php' ) ) {
	// WordPress core is not installed
	http_response_code( 503 );
	header( 'Content-Type: application/json' );
	echo json_encode( [
		'error'        => 'WordPress not installed',
		'message'      => 'Please install WordPress core files in the wordpress directory',
		'instructions' => [
			'1. Download WordPress from https://wordpress.org/download/',
			'2. Extract to web/wp/wordpress/',
			'3. Run the WordPress installation',
		],
	] );
	exit;
}

// Load WordPress
require_once ABSPATH . 'wp-load.php';

// Handle the request
if ( ! defined( 'WP_USE_THEMES' ) ) {
	define( 'WP_USE_THEMES', true );
}

// Load WordPress template loader
require_once ABSPATH . 'wp-blog-header.php';