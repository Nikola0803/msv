<?php
/**
 * Plugin Name: MSV CMS
 * Plugin URI:  https://mysecretvitality.com
 * Description: Content management for the My Secret Vitality React frontend. Manages homepage sections, FAQs, testimonials, blog posts, COA files, and exposes all content via REST API. Also includes a Zelle order management panel.
 * Version:     1.1.0
 * Author:      Velocity72
 * Text Domain: msv-cms
 * Requires WP: 6.0
 * Requires PHP: 8.0
 */

defined( 'ABSPATH' ) || exit;

define( 'MSV_VERSION', '1.1.0' );
define( 'MSV_DIR',     plugin_dir_path( __FILE__ ) );
define( 'MSV_URL',     plugin_dir_url( __FILE__ ) );

// ── Autoload modules ──────────────────────────────────────────────────────────
require_once MSV_DIR . 'includes/class-msv-post-types.php';
require_once MSV_DIR . 'includes/class-msv-options.php';
require_once MSV_DIR . 'includes/class-msv-rest-api.php';
require_once MSV_DIR . 'includes/class-msv-order-panel.php';
require_once MSV_DIR . 'includes/class-msv-admin.php';

// ── Bootstrap ─────────────────────────────────────────────────────────────────
add_action( 'plugins_loaded', function () {
    MSV_Post_Types::init();
    MSV_Options::init();
    MSV_REST_API::init();
    MSV_Order_Panel::init();
    MSV_Admin::init();
} );

// ── Activation: flush rewrite rules ───────────────────────────────────────────
register_activation_hook( __FILE__, function () {
    MSV_Post_Types::register_all();
    flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
