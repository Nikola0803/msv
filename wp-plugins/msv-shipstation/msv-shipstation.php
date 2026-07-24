<?php
/**
 * Plugin Name:  My Secret Vitality — ShipStation & P2P
 * Plugin URI:   https://mysecretvitality.com
 * Description:  Pushes WooCommerce orders to ShipStation when status changes to Processing,
 *               and provides the inbound webhook endpoint for ShipStation to mark orders
 *               Completed and inject tracking numbers.
 * Version:      1.0.0
 * Author:       Velocity72
 * Requires WC:  6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ─── Constants ────────────────────────────────────────────────────────────────

define( 'MSV_SS_VERSION',    '1.1.0' );
define( 'MSV_SS_OPTION_KEY', 'msv_ss_api_key' );
define( 'MSV_SS_OPTION_SEC', 'msv_ss_api_secret' );
define( 'MSV_SS_OPTION_WHK', 'msv_ss_webhook_secret' );
define( 'MSV_SS_API_BASE',   'https://ssapi.shipstation.com' );

// Payment accounts rotation constants
define( 'MSV_P2P_ACCOUNTS_KEY',  'msv_p2p_accounts' );
define( 'MSV_P2P_ROTATION_KEY',  'msv_p2p_rotation_index' );

// ─── Admin Menu ───────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'msv_ss_admin_menu' );
function msv_ss_admin_menu() {
    add_submenu_page(
        'woocommerce',
        'ShipStation Sync',
        'ShipStation Sync',
        'manage_woocommerce',
        'msv-shipstation',
        'msv_ss_settings_page'
    );
    add_submenu_page(
        'woocommerce',
        'Payment Accounts',
        'Payment Accounts',
        'manage_woocommerce',
        'msv-payment-accounts',
        'msv_p2p_accounts_page'
    );
}

add_action( 'admin_init', 'msv_ss_register_settings' );
function msv_ss_register_settings() {
    register_setting( 'msv_ss_settings', MSV_SS_OPTION_KEY,  [ 'sanitize_callback' => 'sanitize_text_field' ] );
    register_setting( 'msv_ss_settings', MSV_SS_OPTION_SEC,  [ 'sanitize_callback' => 'sanitize_text_field' ] );
    register_setting( 'msv_ss_settings', MSV_SS_OPTION_WHK,  [ 'sanitize_callback' => 'sanitize_text_field' ] );
}

function msv_ss_settings_page() {
    $api_key    = get_option( MSV_SS_OPTION_KEY, '' );
    $api_secret = get_option( MSV_SS_OPTION_SEC, '' );
    $whk_secret = get_option( MSV_SS_OPTION_WHK, '' );
    $webhook_url = home_url( '/wp-json/msv-ss/v1/shipped' );
    ?>
    <div class="wrap">
      <h1>ShipStation Sync Settings</h1>
      <p>Inbound webhook URL (enter in ShipStation → Settings → Webhooks):</p>
      <code style="background:#f6f7f7;padding:6px 10px;display:inline-block;margin-bottom:16px;"><?php echo esc_html( $webhook_url ); ?></code>

      <form method="post" action="options.php">
        <?php settings_fields( 'msv_ss_settings' ); ?>
        <table class="form-table">
          <tr>
            <th><label for="<?php echo MSV_SS_OPTION_KEY; ?>">ShipStation API Key</label></th>
            <td><input type="text" id="<?php echo MSV_SS_OPTION_KEY; ?>" name="<?php echo MSV_SS_OPTION_KEY; ?>"
                       value="<?php echo esc_attr( $api_key ); ?>" class="regular-text" /></td>
          </tr>
          <tr>
            <th><label for="<?php echo MSV_SS_OPTION_SEC; ?>">ShipStation API Secret</label></th>
            <td><input type="password" id="<?php echo MSV_SS_OPTION_SEC; ?>" name="<?php echo MSV_SS_OPTION_SEC; ?>"
                       value="<?php echo esc_attr( $api_secret ); ?>" class="regular-text" /></td>
          </tr>
          <tr>
            <th><label for="<?php echo MSV_SS_OPTION_WHK; ?>">Webhook Shared Secret</label></th>
            <td>
              <input type="text" id="<?php echo MSV_SS_OPTION_WHK; ?>" name="<?php echo MSV_SS_OPTION_WHK; ?>"
                     value="<?php echo esc_attr( $whk_secret ); ?>" class="regular-text" />
              <p class="description">Set this same value in ShipStation webhook configuration.</p>
            </td>
          </tr>
        </table>
        <?php submit_button(); ?>
      </form>
    </div>
    <?php
}

// ─── Payment Accounts: Helpers ───────────────────────────────────────────────

function msv_p2p_get_accounts(): array {
    $raw = get_option( MSV_P2P_ACCOUNTS_KEY, '[]' );
    $accounts = json_decode( $raw, true );
    return is_array( $accounts ) ? $accounts : [];
}

function msv_p2p_save_accounts( array $accounts ): void {
    update_option( MSV_P2P_ACCOUNTS_KEY, wp_json_encode( array_values( $accounts ) ) );
}

function msv_p2p_get_rotation_index(): int {
    return (int) get_option( MSV_P2P_ROTATION_KEY, 0 );
}

function msv_p2p_advance_rotation( int $pool_size ): int {
    $idx = msv_p2p_get_rotation_index();
    update_option( MSV_P2P_ROTATION_KEY, ( $idx + 1 ) % max( 1, $pool_size ) );
    return $idx;
}

/** Returns active accounts that have a handle for the given method */
function msv_p2p_active_pool( string $method ): array {
    return array_values( array_filter(
        msv_p2p_get_accounts(),
        fn( $a ) => ! empty( $a['active'] ) && ! empty( $a[ $method ] )
    ) );
}

// ─── Payment Accounts: Admin Page ────────────────────────────────────────────

add_action( 'admin_init', 'msv_p2p_handle_account_actions' );
function msv_p2p_handle_account_actions(): void {
    if ( empty( $_POST['msv_p2p_action'] ) ) return;
    if ( ! current_user_can( 'manage_woocommerce' ) ) wp_die( 'Unauthorized' );
    check_admin_referer( 'msv_p2p_accounts_nonce' );

    $accounts = msv_p2p_get_accounts();
    $action   = sanitize_text_field( $_POST['msv_p2p_action'] );

    if ( $action === 'add' || $action === 'edit' ) {
        $id   = sanitize_text_field( $_POST['account_id'] ?? '' );
        $entry = [
            'id'      => $id ?: 'worker-' . time(),
            'name'    => sanitize_text_field( $_POST['account_name'] ?? '' ),
            'zelle'   => sanitize_text_field( $_POST['account_zelle'] ?? '' ),
            'cashapp' => sanitize_text_field( $_POST['account_cashapp'] ?? '' ),
            'venmo'   => sanitize_text_field( $_POST['account_venmo'] ?? '' ),
            'active'  => ! empty( $_POST['account_active'] ),
        ];
        if ( $action === 'edit' && $id ) {
            foreach ( $accounts as &$a ) {
                if ( $a['id'] === $id ) { $a = $entry; break; }
            }
            unset( $a );
        } else {
            $accounts[] = $entry;
        }
    }

    if ( $action === 'delete' ) {
        $id = sanitize_text_field( $_POST['account_id'] ?? '' );
        $accounts = array_filter( $accounts, fn( $a ) => $a['id'] !== $id );
    }

    if ( $action === 'toggle' ) {
        $id = sanitize_text_field( $_POST['account_id'] ?? '' );
        foreach ( $accounts as &$a ) {
            if ( $a['id'] === $id ) { $a['active'] = ! $a['active']; break; }
        }
        unset( $a );
    }

    if ( $action === 'reset_rotation' ) {
        update_option( MSV_P2P_ROTATION_KEY, 0 );
    }

    msv_p2p_save_accounts( $accounts );
    wp_redirect( admin_url( 'admin.php?page=msv-payment-accounts&saved=1' ) );
    exit;
}

function msv_p2p_accounts_page(): void {
    $accounts  = msv_p2p_get_accounts();
    $rotation  = msv_p2p_get_rotation_index();
    $edit_id   = sanitize_text_field( $_GET['edit'] ?? '' );
    $edit_acct = $edit_id ? current( array_filter( $accounts, fn( $a ) => $a['id'] === $edit_id ) ) : null;

    // Per-method pool sizes
    $pool_z = count( msv_p2p_active_pool( 'zelle' ) );
    $pool_c = count( msv_p2p_active_pool( 'cashapp' ) );
    $pool_v = count( msv_p2p_active_pool( 'venmo' ) );
    ?>
    <div class="wrap">
      <h1>Payment Accounts — Worker Rotation</h1>
      <?php if ( ! empty( $_GET['saved'] ) ): ?>
        <div class="notice notice-success is-dismissible"><p>Saved.</p></div>
      <?php endif; ?>

      <!-- Stats bar -->
      <div style="display:flex;gap:16px;margin:16px 0 24px;flex-wrap:wrap;">
        <?php foreach ( [ 'Zelle' => $pool_z, 'Cash App' => $pool_c, 'Venmo' => $pool_v ] as $label => $n ): ?>
        <div style="background:#fff;border:1px solid #ddd;padding:12px 20px;min-width:140px;border-radius:3px;">
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;"><?php echo esc_html( $label ); ?></div>
          <div style="font-size:24px;font-weight:600;color:#1d2327;margin-top:4px;"><?php echo $n; ?> <span style="font-size:13px;font-weight:400;color:#888;">active</span></div>
        </div>
        <?php endforeach; ?>
        <div style="background:#fff;border:1px solid #ddd;padding:12px 20px;min-width:140px;border-radius:3px;">
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em;">Rotation Index</div>
          <div style="font-size:24px;font-weight:600;color:#1d2327;margin-top:4px;"><?php echo $rotation; ?></div>
        </div>
      </div>

      <!-- Reset rotation -->
      <form method="post" style="display:inline;margin-bottom:16px;">
        <?php wp_nonce_field( 'msv_p2p_accounts_nonce' ); ?>
        <input type="hidden" name="msv_p2p_action" value="reset_rotation">
        <button type="submit" class="button" onclick="return confirm('Reset rotation counter to 0?')">Reset Rotation</button>
      </form>

      <!-- Account table -->
      <table class="wp-list-table widefat fixed striped" style="margin-top:16px;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Zelle</th>
            <th>Cash App</th>
            <th>Venmo</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if ( empty( $accounts ) ): ?>
            <tr><td colspan="6" style="text-align:center;color:#888;padding:24px;">No accounts yet. Add one below.</td></tr>
          <?php else: ?>
            <?php foreach ( $accounts as $acct ): ?>
            <tr>
              <td><strong><?php echo esc_html( $acct['name'] ); ?></strong><br>
                  <small style="color:#888;"><?php echo esc_html( $acct['id'] ); ?></small></td>
              <td><?php echo esc_html( $acct['zelle'] ?: '—' ); ?></td>
              <td><?php echo esc_html( $acct['cashapp'] ?: '—' ); ?></td>
              <td><?php echo esc_html( $acct['venmo'] ?: '—' ); ?></td>
              <td>
                <form method="post" style="display:inline;">
                  <?php wp_nonce_field( 'msv_p2p_accounts_nonce' ); ?>
                  <input type="hidden" name="msv_p2p_action" value="toggle">
                  <input type="hidden" name="account_id" value="<?php echo esc_attr( $acct['id'] ); ?>">
                  <button type="submit" class="button button-small"
                    style="color:<?php echo $acct['active'] ? '#00a32a' : '#d63638'; ?>">
                    <?php echo $acct['active'] ? '● Active' : '○ Inactive'; ?>
                  </button>
                </form>
              </td>
              <td>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=msv-payment-accounts&edit=' . $acct['id'] ) ); ?>"
                   class="button button-small">Edit</a>
                <form method="post" style="display:inline;">
                  <?php wp_nonce_field( 'msv_p2p_accounts_nonce' ); ?>
                  <input type="hidden" name="msv_p2p_action" value="delete">
                  <input type="hidden" name="account_id" value="<?php echo esc_attr( $acct['id'] ); ?>">
                  <button type="submit" class="button button-small"
                    onclick="return confirm('Delete <?php echo esc_js( $acct['name'] ); ?>?')"
                    style="color:#d63638;">Delete</button>
                </form>
              </td>
            </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>

      <!-- Add / Edit form -->
      <h2 style="margin-top:32px;"><?php echo $edit_acct ? 'Edit Account' : 'Add Account'; ?></h2>
      <form method="post" style="max-width:520px;">
        <?php wp_nonce_field( 'msv_p2p_accounts_nonce' ); ?>
        <input type="hidden" name="msv_p2p_action" value="<?php echo $edit_acct ? 'edit' : 'add'; ?>">
        <input type="hidden" name="account_id" value="<?php echo esc_attr( $edit_acct['id'] ?? '' ); ?>">
        <table class="form-table">
          <tr>
            <th><label>Name *</label></th>
            <td><input type="text" name="account_name" required class="regular-text"
                value="<?php echo esc_attr( $edit_acct['name'] ?? '' ); ?>" placeholder="Worker 1"></td>
          </tr>
          <tr>
            <th><label>Zelle handle</label></th>
            <td><input type="text" name="account_zelle" class="regular-text"
                value="<?php echo esc_attr( $edit_acct['zelle'] ?? '' ); ?>" placeholder="worker1@email.com">
                <p class="description">Phone number or email registered with Zelle.</p></td>
          </tr>
          <tr>
            <th><label>Cash App $tag</label></th>
            <td><input type="text" name="account_cashapp" class="regular-text"
                value="<?php echo esc_attr( $edit_acct['cashapp'] ?? '' ); ?>" placeholder="$CashTag"></td>
          </tr>
          <tr>
            <th><label>Venmo @handle</label></th>
            <td><input type="text" name="account_venmo" class="regular-text"
                value="<?php echo esc_attr( $edit_acct['venmo'] ?? '' ); ?>" placeholder="@VenmoHandle"></td>
          </tr>
          <tr>
            <th><label>Active</label></th>
            <td><input type="checkbox" name="account_active" value="1"
                <?php checked( $edit_acct['active'] ?? true ); ?>>
                <span class="description">Uncheck to pull from rotation without deleting.</span></td>
          </tr>
        </table>
        <?php submit_button( $edit_acct ? 'Update Account' : 'Add Account' ); ?>
        <?php if ( $edit_acct ): ?>
          <a href="<?php echo esc_url( admin_url( 'admin.php?page=msv-payment-accounts' ) ); ?>" class="button">Cancel</a>
        <?php endif; ?>
      </form>
    </div>
    <?php
}

// ─── Payment Accounts: REST API ───────────────────────────────────────────────

add_action( 'rest_api_init', 'msv_p2p_register_rest_routes' );
function msv_p2p_register_rest_routes(): void {
    // Public: called by React checkout to get assigned handle + advance rotation
    register_rest_route( 'msv-p2p/v1', '/assign', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'msv_p2p_rest_assign',
        'permission_callback' => '__return_true',
        'args'                => [
            'method' => [
                'required'          => true,
                'validate_callback' => fn( $v ) => in_array( $v, [ 'zelle', 'cashapp', 'venmo' ], true ),
            ],
        ],
    ] );

    // Admin: list all accounts
    register_rest_route( 'msv-p2p/v1', '/accounts', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => fn() => rest_ensure_response( msv_p2p_get_accounts() ),
            'permission_callback' => fn() => current_user_can( 'manage_woocommerce' ),
        ],
        // Admin: add account
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'msv_p2p_rest_add_account',
            'permission_callback' => fn() => current_user_can( 'manage_woocommerce' ),
        ],
    ] );

    // Admin: update / delete single account
    register_rest_route( 'msv-p2p/v1', '/accounts/(?P<id>[a-zA-Z0-9_-]+)', [
        [
            'methods'             => 'PUT',
            'callback'            => 'msv_p2p_rest_update_account',
            'permission_callback' => fn() => current_user_can( 'manage_woocommerce' ),
        ],
        [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => 'msv_p2p_rest_delete_account',
            'permission_callback' => fn() => current_user_can( 'manage_woocommerce' ),
        ],
    ] );

    // Admin: rotation stats
    register_rest_route( 'msv-p2p/v1', '/stats', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'msv_p2p_rest_stats',
        'permission_callback' => fn() => current_user_can( 'manage_woocommerce' ),
    ] );
}

/**
 * GET /wp-json/msv-p2p/v1/assign?method=zelle|cashapp|venmo
 * Returns the next worker's handle for the requested method and advances
 * the server-side rotation counter.
 */
function msv_p2p_rest_assign( WP_REST_Request $request ): WP_REST_Response {
    $method = $request->get_param( 'method' );
    $pool   = msv_p2p_active_pool( $method );

    if ( empty( $pool ) ) {
        return new WP_REST_Response(
            [ 'error' => 'No active accounts for method: ' . $method ],
            503
        );
    }

    $idx    = msv_p2p_advance_rotation( count( $pool ) );
    $worker = $pool[ $idx % count( $pool ) ];

    return new WP_REST_Response( [
        'worker_id'   => $worker['id'],
        'worker_name' => $worker['name'],
        'handle'      => $worker[ $method ],
        'method'      => $method,
    ], 200 );
}

function msv_p2p_rest_add_account( WP_REST_Request $request ): WP_REST_Response {
    $body     = $request->get_json_params();
    $accounts = msv_p2p_get_accounts();
    $entry    = [
        'id'      => sanitize_text_field( $body['id'] ?? ( 'worker-' . time() ) ),
        'name'    => sanitize_text_field( $body['name'] ?? '' ),
        'zelle'   => sanitize_text_field( $body['zelle'] ?? '' ),
        'cashapp' => sanitize_text_field( $body['cashapp'] ?? '' ),
        'venmo'   => sanitize_text_field( $body['venmo'] ?? '' ),
        'active'  => (bool) ( $body['active'] ?? true ),
    ];
    if ( ! $entry['name'] ) {
        return new WP_REST_Response( [ 'error' => 'name is required' ], 400 );
    }
    $accounts[] = $entry;
    msv_p2p_save_accounts( $accounts );
    return new WP_REST_Response( $entry, 201 );
}

function msv_p2p_rest_update_account( WP_REST_Request $request ): WP_REST_Response {
    $id       = $request->get_param( 'id' );
    $body     = $request->get_json_params();
    $accounts = msv_p2p_get_accounts();
    $found    = false;
    foreach ( $accounts as &$a ) {
        if ( $a['id'] === $id ) {
            if ( isset( $body['name'] ) )    $a['name']    = sanitize_text_field( $body['name'] );
            if ( isset( $body['zelle'] ) )   $a['zelle']   = sanitize_text_field( $body['zelle'] );
            if ( isset( $body['cashapp'] ) ) $a['cashapp'] = sanitize_text_field( $body['cashapp'] );
            if ( isset( $body['venmo'] ) )   $a['venmo']   = sanitize_text_field( $body['venmo'] );
            if ( isset( $body['active'] ) )  $a['active']  = (bool) $body['active'];
            $found = $a;
            break;
        }
    }
    unset( $a );
    if ( ! $found ) return new WP_REST_Response( [ 'error' => 'Not found' ], 404 );
    msv_p2p_save_accounts( $accounts );
    return new WP_REST_Response( $found, 200 );
}

function msv_p2p_rest_delete_account( WP_REST_Request $request ): WP_REST_Response {
    $id       = $request->get_param( 'id' );
    $accounts = msv_p2p_get_accounts();
    $filtered = array_filter( $accounts, fn( $a ) => $a['id'] !== $id );
    if ( count( $filtered ) === count( $accounts ) ) {
        return new WP_REST_Response( [ 'error' => 'Not found' ], 404 );
    }
    msv_p2p_save_accounts( $filtered );
    return new WP_REST_Response( [ 'deleted' => $id ], 200 );
}

function msv_p2p_rest_stats( WP_REST_Request $request ): WP_REST_Response {
    global $wpdb;
    $accounts = msv_p2p_get_accounts();
    $stats    = [];
    foreach ( $accounts as $acct ) {
        $count = $wpdb->get_var( $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = 'assigned_worker_id' AND meta_value = %s",
            $acct['id']
        ) );
        $stats[] = [
            'id'          => $acct['id'],
            'name'        => $acct['name'],
            'active'      => $acct['active'],
            'order_count' => (int) $count,
        ];
    }
    return new WP_REST_Response( [
        'rotation_index' => msv_p2p_get_rotation_index(),
        'accounts'       => $stats,
    ], 200 );
}

// ─── Outbound: WC → ShipStation ───────────────────────────────────────────────

add_action( 'woocommerce_order_status_processing', 'msv_ss_push_order', 10, 1 );
function msv_ss_push_order( $order_id ) {
    $order      = wc_get_order( $order_id );
    $api_key    = get_option( MSV_SS_OPTION_KEY, '' );
    $api_secret = get_option( MSV_SS_OPTION_SEC, '' );

    if ( ! $order || ! $api_key || ! $api_secret ) {
        return;
    }

    // Avoid double-push if already synced
    if ( $order->get_meta( '_ss_order_id' ) ) {
        return;
    }

    $memo        = $order->get_meta( 'memo_code' ) ?: '';
    $invoice_id  = $order->get_meta( 'invoice_id' ) ?: ( 'MSV-' . $order_id );
    $created     = $order->get_date_created();
    $paid        = $order->get_date_paid();

    // ── Build ShipStation order payload ──────────────────────────────────────

    $line_items = [];
    foreach ( $order->get_items() as $item ) {
        /** @var WC_Order_Item_Product $item */
        $product = $item->get_product();
        $sku     = $product ? $product->get_sku() : 'MSV-' . $item->get_product_id();
        $qty     = $item->get_quantity();
        $price   = $qty > 0 ? floatval( $item->get_subtotal() ) / $qty : 0;

        $line_items[] = [
            'lineItemKey' => (string) $item->get_id(),
            'sku'         => $sku ?: ( 'MSV-' . $item->get_product_id() ),
            'name'        => $item->get_name(),
            'quantity'    => $qty,
            'unitPrice'   => $price,
            'taxAmount'   => floatval( $item->get_total_tax() ),
            'weight'      => [ 'value' => 0, 'units' => 'ounces' ],
        ];
    }

    $ship_name = trim(
        $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name()
    ) ?: trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );

    $payload = [
        'orderNumber'              => $invoice_id,
        'orderKey'                 => $invoice_id,
        'orderDate'                => $created ? $created->format( DATE_ATOM ) : date( DATE_ATOM ),
        'paymentDate'              => $paid ? $paid->format( DATE_ATOM ) : null,
        'orderStatus'              => 'awaiting_shipment',
        'customerUsername'         => $order->get_billing_email(),
        'customerEmail'            => $order->get_billing_email(),
        'billTo'                   => [
            'name'       => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
            'street1'    => $order->get_billing_address_1(),
            'street2'    => $order->get_billing_address_2(),
            'city'       => $order->get_billing_city(),
            'state'      => $order->get_billing_state(),
            'postalCode' => $order->get_billing_postcode(),
            'country'    => $order->get_billing_country() ?: 'US',
            'phone'      => $order->get_billing_phone(),
            'residential'=> true,
        ],
        'shipTo'                   => [
            'name'       => $ship_name,
            'street1'    => $order->get_shipping_address_1() ?: $order->get_billing_address_1(),
            'street2'    => $order->get_shipping_address_2() ?: $order->get_billing_address_2(),
            'city'       => $order->get_shipping_city() ?: $order->get_billing_city(),
            'state'      => $order->get_shipping_state() ?: $order->get_billing_state(),
            'postalCode' => $order->get_shipping_postcode() ?: $order->get_billing_postcode(),
            'country'    => $order->get_shipping_country() ?: $order->get_billing_country() ?: 'US',
            'phone'      => $order->get_billing_phone(),
            'residential'=> true,
        ],
        'items'                    => $line_items,
        'amountPaid'               => floatval( $order->get_total() ),
        'taxAmount'                => floatval( $order->get_total_tax() ),
        'shippingAmount'           => floatval( $order->get_shipping_total() ),
        'customerNotes'            => $order->get_customer_note(),
        'internalNotes'            => $memo ? 'Memo: ' . $memo : '',
        'gift'                     => false,
        'requestedShippingService' => 'USPS Priority Mail',
        'paymentMethod'            => $order->get_payment_method_title(),
        'source'                   => 'MySecretVitality.com',
        'weight'                   => [ 'value' => 0, 'units' => 'ounces' ],
        'dimensions'               => [ 'units' => 'inches', 'length' => 0, 'width' => 0, 'height' => 0 ],
    ];

    // ── POST to ShipStation ───────────────────────────────────────────────────

    $response = wp_remote_post(
        MSV_SS_API_BASE . '/orders/createorder',
        [
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Basic ' . base64_encode( $api_key . ':' . $api_secret ),
            ],
            'body'    => wp_json_encode( $payload ),
            'timeout' => 30,
        ]
    );

    if ( is_wp_error( $response ) ) {
        $order->add_order_note( '⚠️ ShipStation sync failed: ' . $response->get_error_message() );
        return;
    }

    $code = wp_remote_retrieve_response_code( $response );
    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $code === 200 && ! empty( $body['orderId'] ) ) {
        $order->update_meta_data( '_ss_order_id', $body['orderId'] );
        $order->save();
        $order->add_order_note(
            '✅ Synced to ShipStation. SS Order ID: ' . $body['orderId'] .
            ( $memo ? ' | Memo: ' . $memo : '' )
        );
    } else {
        $err = isset( $body['ExceptionMessage'] ) ? $body['ExceptionMessage'] : wp_remote_retrieve_body( $response );
        $order->add_order_note( '⚠️ ShipStation API error (' . $code . '): ' . esc_html( $err ) );
    }
}

// ─── Inbound REST endpoint: ShipStation → WC ─────────────────────────────────
// ShipStation fires POST /wp-json/msv-ss/v1/shipped when an order ships.
// Payload: { "resource_url": "...", "resource_type": "SHIP_NOTIFY" }

add_action( 'rest_api_init', 'msv_ss_register_rest_routes' );
function msv_ss_register_rest_routes() {
    register_rest_route(
        'msv-ss/v1',
        '/shipped',
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'msv_ss_handle_ship_notify',
            'permission_callback' => 'msv_ss_verify_webhook',
        ]
    );
}

function msv_ss_verify_webhook( WP_REST_Request $request ) {
    $secret   = get_option( MSV_SS_OPTION_WHK, '' );
    $provided = $request->get_header( 'x-ss-signature' );

    if ( empty( $secret ) ) {
        return true; // no secret configured — allow (not recommended for production)
    }

    $body = $request->get_body();
    $expected = hash_hmac( 'sha256', $body, $secret );

    return hash_equals( $expected, (string) $provided );
}

function msv_ss_handle_ship_notify( WP_REST_Request $request ) {
    $api_key    = get_option( MSV_SS_OPTION_KEY, '' );
    $api_secret = get_option( MSV_SS_OPTION_SEC, '' );

    if ( ! $api_key || ! $api_secret ) {
        return new WP_REST_Response( [ 'error' => 'SS keys not configured' ], 500 );
    }

    $data         = $request->get_json_params();
    $resource_url = $data['resource_url'] ?? '';
    $resource_type = $data['resource_type'] ?? '';

    if ( $resource_type !== 'SHIP_NOTIFY' || ! $resource_url ) {
        return new WP_REST_Response( [ 'ok' => true, 'note' => 'ignored' ], 200 );
    }

    // Fetch shipment details from ShipStation
    $ss_response = wp_remote_get(
        $resource_url,
        [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode( $api_key . ':' . $api_secret ),
            ],
            'timeout' => 30,
        ]
    );

    if ( is_wp_error( $ss_response ) ) {
        return new WP_REST_Response( [ 'error' => $ss_response->get_error_message() ], 500 );
    }

    $shipments = json_decode( wp_remote_retrieve_body( $ss_response ), true );
    $results   = [];

    foreach ( ( $shipments['shipments'] ?? [] ) as $shipment ) {
        $order_number = $shipment['orderNumber'] ?? '';
        $tracking     = $shipment['trackingNumber'] ?? '';
        $carrier      = $shipment['carrierCode'] ?? '';
        $carrier_name = $shipment['serviceCode'] ?? $carrier;
        $ship_date    = $shipment['shipDate'] ?? '';

        // ShipStation orderNumber = invoice_id, so we look up by meta
        $orders = wc_get_orders( [
            'meta_key'   => 'invoice_id',
            'meta_value' => $order_number,
            'limit'      => 1,
        ] );

        // Fallback: try matching by _ss_order_id (ShipStation internal order key)
        if ( empty( $orders ) ) {
            $orders = wc_get_orders( [
                'meta_key'   => '_ss_order_id',
                'meta_value' => $shipment['orderId'] ?? '',
                'limit'      => 1,
            ] );
        }

        if ( empty( $orders ) ) {
            $results[] = [ 'order' => $order_number, 'status' => 'not_found' ];
            continue;
        }

        /** @var WC_Order $order */
        $order = $orders[0];

        // Update order status to completed
        $order->update_status( 'completed', 'Order shipped via ShipStation.' );

        // Inject tracking info
        $order->update_meta_data( '_tracking_number', $tracking );
        $order->update_meta_data( '_tracking_carrier', $carrier );
        $order->update_meta_data( '_tracking_carrier_name', $carrier_name );
        $order->update_meta_data( '_ship_date', $ship_date );
        $order->save();

        $order->add_order_note(
            sprintf(
                '📦 Shipped via %s. Tracking: %s (ShipStation shipment ID: %s)',
                esc_html( $carrier_name ),
                esc_html( $tracking ),
                esc_html( $shipment['shipmentId'] ?? '' )
            )
        );

        // Trigger shipping confirmation email via WC action
        do_action( 'msv_ss_send_shipping_email', $order->get_id(), $tracking, $carrier_name );

        $results[] = [
            'order'    => $order_number,
            'wc_id'    => $order->get_id(),
            'tracking' => $tracking,
            'status'   => 'completed',
        ];
    }

    return new WP_REST_Response( [ 'ok' => true, 'processed' => $results ], 200 );
}

// ─── SMTP Shipping Confirmation Email ─────────────────────────────────────────

add_action( 'msv_ss_send_shipping_email', 'msv_ss_dispatch_shipping_email', 10, 3 );
function msv_ss_dispatch_shipping_email( $order_id, $tracking_number, $carrier_name ) {
    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $to       = $order->get_billing_email();
    $name     = $order->get_billing_first_name();
    $subject  = '📦 Your My Secret Vitality order has shipped — ' . $order->get_meta( 'invoice_id' );
    $memo     = $order->get_meta( 'memo_code' );
    $items_html = '';

    foreach ( $order->get_items() as $item ) {
        $items_html .= '<tr>'
            . '<td style="padding:8px 12px;font-family:monospace;font-size:13px;color:#2c1a0e;border-bottom:1px solid #e8dcc8;">'
            . esc_html( $item->get_name() ) . ' &times; ' . $item->get_quantity()
            . '</td>'
            . '<td style="padding:8px 12px;font-family:monospace;font-size:13px;color:#b8942a;font-weight:bold;text-align:right;border-bottom:1px solid #e8dcc8;">'
            . '$' . number_format( floatval( $item->get_subtotal() ), 2 )
            . '</td>'
            . '</tr>';
    }

    $tracking_url = msv_ss_tracking_url( $carrier_name, $tracking_number );

    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order has shipped</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fdf8f0;border:1px solid #d4c4a0;">

        <!-- Header -->
        <tr>
          <td style="background:#1e0f02;padding:28px 40px;text-align:center;border-bottom:2px solid #b8942a;">
            <p style="margin:0;color:#b8942a;font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">My Secret Vitality</p>
            <h1 style="margin:8px 0 0;color:#f5f0e8;font-family:'Georgia',serif;font-size:24px;letter-spacing:0.12em;font-weight:400;text-transform:uppercase;">
              Order Shipped
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;color:#2c1a0e;font-size:15px;line-height:1.6;">
              Hi {$name}, your research order is on its way.
            </p>

            <!-- Tracking box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9ee;border:1px solid #b8942a;margin-bottom:28px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <p style="margin:0 0 6px;font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#7a5c2e;">Tracking Number</p>
                  <p style="margin:0 0 4px;font-family:monospace;font-size:22px;color:#b8942a;font-weight:bold;letter-spacing:0.08em;">{$tracking_number}</p>
                  <p style="margin:0 0 16px;font-size:12px;color:#7a5c2e;">{$carrier_name}</p>
                  <a href="{$tracking_url}"
                     style="display:inline-block;background:#b8942a;color:#1e0f02;font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:12px 28px;text-decoration:none;border:1px solid #b8942a;">
                    Track Your Package
                  </a>
                </td>
              </tr>
            </table>

            <!-- Order details -->
            <p style="margin:0 0 12px;font-family:monospace;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#7a5c2e;">Order Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8dcc8;margin-bottom:24px;">
              <tr style="background:#f5f0e8;">
                <th style="padding:8px 12px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5c2e;text-align:left;border-bottom:1px solid #e8dcc8;">Item</th>
                <th style="padding:8px 12px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5c2e;text-align:right;border-bottom:1px solid #e8dcc8;">Amount</th>
              </tr>
              {$items_html}
              <tr>
                <td style="padding:10px 12px;font-family:monospace;font-size:12px;font-weight:bold;color:#2c1a0e;">Total</td>
                <td style="padding:10px 12px;font-family:monospace;font-size:14px;font-weight:bold;color:#b8942a;text-align:right;">
                  ${$order->get_total()}
                </td>
              </tr>
            </table>

            <!-- Disclaimer -->
            <p style="margin:0;font-size:11px;color:#9c8060;line-height:1.6;border-top:1px dashed #d4c4a0;padding-top:20px;">
              These products are for laboratory research use only. Not for human consumption, injection, or therapeutic use.
              Invoice: {$order->get_meta( 'invoice_id' )} &bull; Memo: {$memo}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e0f02;padding:20px 40px;text-align:center;border-top:2px solid #b8942a;">
            <p style="margin:0;font-family:monospace;font-size:10px;color:#7a5c2e;letter-spacing:0.2em;text-transform:uppercase;">
              mysecretvitality.com &bull; support@mysecretvitality.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'From: My Secret Vitality <no-reply@mysecretvitality.com>',
    ];

    wp_mail( $to, $subject, $html, $headers );
}

// ─── Tracking URL helper ──────────────────────────────────────────────────────

function msv_ss_tracking_url( $carrier, $tracking ) {
    $carrier = strtolower( $carrier );
    if ( strpos( $carrier, 'usps' ) !== false ) {
        return 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' . urlencode( $tracking );
    }
    if ( strpos( $carrier, 'ups' ) !== false ) {
        return 'https://www.ups.com/track?tracknum=' . urlencode( $tracking );
    }
    if ( strpos( $carrier, 'fedex' ) !== false ) {
        return 'https://www.fedex.com/fedextrack/?trknbr=' . urlencode( $tracking );
    }
    if ( strpos( $carrier, 'dhl' ) !== false ) {
        return 'https://www.dhl.com/en/express/tracking.html?AWB=' . urlencode( $tracking );
    }
    return 'https://www.google.com/search?q=' . urlencode( $carrier . ' tracking ' . $tracking );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BTC HD-WALLET PAYMENT MODULE
// Stores operator zpub + derivation index. Vercel functions derive addresses
// and call these endpoints to manage the index and record assignments.
// ═══════════════════════════════════════════════════════════════════════════════

define( 'MSV_BTC_ZPUB_KEY',    'msv_btc_zpub' );
define( 'MSV_BTC_INDEX_KEY',   'msv_btc_index' );
define( 'MSV_BTC_ASSIGN_KEY',  'msv_btc_assignments' ); // { address → invoiceId }

// ─── Admin submenu ────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'msv_btc_admin_menu' );
function msv_btc_admin_menu() {
    add_submenu_page(
        'woocommerce',
        'BTC Payments',
        'BTC Payments',
        'manage_woocommerce',
        'msv-btc-payments',
        'msv_btc_settings_page'
    );
}

add_action( 'admin_init', 'msv_btc_register_settings' );
function msv_btc_register_settings() {
    register_setting( 'msv_btc_settings', MSV_BTC_ZPUB_KEY, [ 'sanitize_callback' => 'sanitize_text_field' ] );
}

function msv_btc_settings_page() {
    $zpub  = get_option( MSV_BTC_ZPUB_KEY, '' );
    $index = (int) get_option( MSV_BTC_INDEX_KEY, 0 );
    $assignments = get_option( MSV_BTC_ASSIGN_KEY, [] );
    ?>
    <div class="wrap">
      <h1>BTC Payments</h1>
      <p>Configure the zpub (or xpub) key used to generate unique Bitcoin receive addresses per order.
         The derivation index increments automatically with each new order.</p>

      <form method="post" action="options.php">
        <?php settings_fields( 'msv_btc_settings' ); ?>
        <table class="form-table">
          <tr>
            <th scope="row"><label for="<?php echo MSV_BTC_ZPUB_KEY; ?>">zpub / xpub Key</label></th>
            <td>
              <input type="text" id="<?php echo MSV_BTC_ZPUB_KEY; ?>" name="<?php echo MSV_BTC_ZPUB_KEY; ?>"
                     value="<?php echo esc_attr( $zpub ); ?>" class="large-text" autocomplete="off" />
              <p class="description">Paste your wallet's extended public key (zpub for native SegWit bc1... addresses, or xpub for legacy).
                 Private keys never leave your wallet — this key only generates receive addresses.</p>
            </td>
          </tr>
        </table>
        <?php submit_button( 'Save zpub' ); ?>
      </form>

      <hr />
      <h2>Derivation Stats</h2>
      <table class="widefat" style="max-width:500px;">
        <tbody>
          <tr><th>Current index</th><td><?php echo esc_html( $index ); ?></td></tr>
          <tr><th>Addresses issued</th><td><?php echo esc_html( count( $assignments ) ); ?></td></tr>
        </tbody>
      </table>

      <?php if ( ! empty( $assignments ) ) : ?>
        <h3 style="margin-top:24px;">Address → Invoice Log</h3>
        <table class="widefat striped" style="max-width:900px;">
          <thead>
            <tr><th>BTC Address</th><th>Invoice ID</th><th>Assigned At</th></tr>
          </thead>
          <tbody>
            <?php foreach ( array_reverse( $assignments ) as $entry ) : ?>
              <tr>
                <td><code><?php echo esc_html( $entry['address'] ); ?></code></td>
                <td><?php echo esc_html( $entry['invoiceId'] ); ?></td>
                <td><?php echo esc_html( $entry['at'] ?? '—' ); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>

      <hr />
      <h2>Manual Index Reset</h2>
      <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
        <input type="hidden" name="action" value="msv_btc_reset_index" />
        <?php wp_nonce_field( 'msv_btc_reset_index' ); ?>
        <p>
          <input type="number" name="new_index" value="<?php echo esc_attr( $index ); ?>" min="0" style="width:120px;" />
          <?php submit_button( 'Update Index', 'secondary', 'submit', false ); ?>
        </p>
        <p class="description">Only change this if you need to re-sync with your wallet's current derivation state.</p>
      </form>
    </div>
    <?php
}

add_action( 'admin_post_msv_btc_reset_index', 'msv_btc_handle_reset_index' );
function msv_btc_handle_reset_index() {
    check_admin_referer( 'msv_btc_reset_index' );
    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        wp_die( 'Unauthorized' );
    }
    $new_index = max( 0, (int) ( $_POST['new_index'] ?? 0 ) );
    update_option( MSV_BTC_INDEX_KEY, $new_index );
    wp_redirect( admin_url( 'admin.php?page=msv-btc-payments&updated=1' ) );
    exit;
}

// ─── REST API ─────────────────────────────────────────────────────────────────

add_action( 'rest_api_init', 'msv_btc_register_routes' );
function msv_btc_register_routes() {
    // GET /wp-json/msv-btc/v1/next-index
    // Atomically returns current derivation index and increments it.
    // Returns: { index, zpub }
    register_rest_route( 'msv-btc/v1', '/next-index', [
        'methods'             => 'GET',
        'callback'            => 'msv_btc_rest_next_index',
        'permission_callback' => 'msv_btc_rest_auth',
    ] );

    // POST /wp-json/msv-btc/v1/record-assignment
    // Body: { invoiceId, address, index }
    // Saves the address → invoiceId mapping for the admin log.
    register_rest_route( 'msv-btc/v1', '/record-assignment', [
        'methods'             => 'POST',
        'callback'            => 'msv_btc_rest_record_assignment',
        'permission_callback' => 'msv_btc_rest_auth',
    ] );

    // GET /wp-json/msv-btc/v1/order-by-address?address=bc1...
    // Used by the payment notify webhook to find the WC order for a BTC address.
    register_rest_route( 'msv-btc/v1', '/order-by-address', [
        'methods'             => 'GET',
        'callback'            => 'msv_btc_rest_order_by_address',
        'permission_callback' => 'msv_btc_rest_auth',
    ] );
}

function msv_btc_rest_auth(): bool {
    return current_user_can( 'manage_woocommerce' );
}

function msv_btc_rest_next_index( WP_REST_Request $request ): WP_REST_Response {
    // Atomic read-increment using a mutex option
    $lock_key = MSV_BTC_INDEX_KEY . '_lock';
    $attempts = 0;
    do {
        $got_lock = add_option( $lock_key, 1, '', 'no' );
        if ( ! $got_lock ) {
            usleep( 50000 ); // 50 ms back-off
        }
        $attempts++;
    } while ( ! $got_lock && $attempts < 20 );

    $index = (int) get_option( MSV_BTC_INDEX_KEY, 0 );
    update_option( MSV_BTC_INDEX_KEY, $index + 1 );
    delete_option( $lock_key );

    $zpub = get_option( MSV_BTC_ZPUB_KEY, '' );

    return new WP_REST_Response( [ 'index' => $index, 'zpub' => $zpub ], 200 );
}

function msv_btc_rest_record_assignment( WP_REST_Request $request ): WP_REST_Response {
    $body      = $request->get_json_params();
    $invoice   = sanitize_text_field( $body['invoiceId'] ?? '' );
    $address   = sanitize_text_field( $body['address']   ?? '' );
    $idx       = (int) ( $body['index'] ?? -1 );

    if ( ! $invoice || ! $address ) {
        return new WP_REST_Response( [ 'error' => 'invoiceId and address required' ], 400 );
    }

    $assignments   = get_option( MSV_BTC_ASSIGN_KEY, [] );
    $assignments[] = [
        'address'   => $address,
        'invoiceId' => $invoice,
        'index'     => $idx,
        'at'        => current_time( 'mysql' ),
    ];
    update_option( MSV_BTC_ASSIGN_KEY, $assignments );

    return new WP_REST_Response( [ 'recorded' => true ], 201 );
}

function msv_btc_rest_order_by_address( WP_REST_Request $request ): WP_REST_Response {
    $address = sanitize_text_field( $request->get_param( 'address' ) ?? '' );
    if ( ! $address ) {
        return new WP_REST_Response( [ 'error' => 'address param required' ], 400 );
    }

    $orders = wc_get_orders( [
        'meta_key'   => 'btc_address',
        'meta_value' => $address,
        'limit'      => 1,
        'return'     => 'ids',
    ] );

    if ( empty( $orders ) ) {
        return new WP_REST_Response( [ 'orderId' => null ], 200 );
    }

    return new WP_REST_Response( [ 'orderId' => $orders[0] ], 200 );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT SETTINGS MODULE
// Stores operator-level USDC/USDT addresses, BTC xpub, Cash App / Venmo handles.
// Also adds confirm-payment REST endpoint for Vercel webhook to flip order status.
// ═══════════════════════════════════════════════════════════════════════════════

define( 'MSV_BTC_VERSION',       '1.0.0' );

// Payment Settings option keys
define( 'MSVSS_BTC_XPUB',        'msvss_btc_xpub' );
define( 'MSVSS_BTC_SURCHARGE',   'msvss_btc_surcharge' );
define( 'MSVSS_BTC_ENABLED',     'msvss_btc_enabled' );
define( 'MSVSS_BTC_ADDR_IDX',    'msvss_btc_address_index' );
define( 'MSVSS_CASHAPP_HANDLE',  'msvss_cashapp_handle' );
define( 'MSVSS_VENMO_HANDLE',    'msvss_venmo_handle' );
define( 'MSVSS_USDC_ADDRESS',    'msvss_usdc_address' );
define( 'MSVSS_USDT_ADDRESS',    'msvss_usdt_address' );

// ─── Admin submenu: Payment Settings ─────────────────────────────────────────

add_action( 'admin_menu', 'msv_btc_payment_settings_menu' );
function msv_btc_payment_settings_menu(): void {
    add_submenu_page(
        'woocommerce',
        'Payment Settings',
        'Payment Settings',
        'manage_woocommerce',
        'msv-payment-settings',
        'msv_btc_payment_settings_page'
    );
}

add_action( 'admin_init', 'msv_btc_register_payment_settings' );
function msv_btc_register_payment_settings(): void {
    $group = 'msvss_payment_settings';
    $opts  = [
        MSVSS_BTC_XPUB,
        MSVSS_BTC_SURCHARGE,
        MSVSS_BTC_ENABLED,
        MSVSS_CASHAPP_HANDLE,
        MSVSS_VENMO_HANDLE,
        MSVSS_USDC_ADDRESS,
        MSVSS_USDT_ADDRESS,
    ];
    foreach ( $opts as $key ) {
        register_setting( $group, $key, [ 'sanitize_callback' => 'sanitize_text_field' ] );
    }
    // BTC enabled is boolean-ish; override sanitize to intval
    register_setting( $group, MSVSS_BTC_ENABLED, [ 'sanitize_callback' => 'absint' ] );
}

function msv_btc_payment_settings_page(): void {
    $xpub      = get_option( MSVSS_BTC_XPUB, '' );
    $surcharge = get_option( MSVSS_BTC_SURCHARGE, '5' );
    $enabled   = (int) get_option( MSVSS_BTC_ENABLED, 1 );
    $cashapp   = get_option( MSVSS_CASHAPP_HANDLE, '' );
    $venmo     = get_option( MSVSS_VENMO_HANDLE, '' );
    $usdc      = get_option( MSVSS_USDC_ADDRESS, '' );
    $usdt      = get_option( MSVSS_USDT_ADDRESS, '' );
    $addr_idx  = (int) get_option( MSVSS_BTC_ADDR_IDX, 0 );
    ?>
    <div class="wrap">
      <h1>Payment Settings</h1>
      <p>Configure crypto wallet addresses and P2P payment handles used by the checkout flow.</p>

      <?php if ( isset( $_GET['settings-updated'] ) && $_GET['settings-updated'] ) : ?>
        <div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>
      <?php endif; ?>

      <form method="post" action="options.php">
        <?php settings_fields( 'msvss_payment_settings' ); ?>

        <h2 class="title">Bitcoin (BTC)</h2>
        <table class="form-table">
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_BTC_XPUB ); ?>">zpub / xpub Key</label></th>
            <td>
              <input type="text" id="<?php echo esc_attr( MSVSS_BTC_XPUB ); ?>"
                     name="<?php echo esc_attr( MSVSS_BTC_XPUB ); ?>"
                     value="<?php echo esc_attr( $xpub ); ?>" class="large-text" autocomplete="off" />
              <p class="description">Extended public key used to derive unique receive addresses per order. Never store private keys here.</p>
            </td>
          </tr>
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_BTC_SURCHARGE ); ?>">Surcharge %</label></th>
            <td>
              <input type="number" id="<?php echo esc_attr( MSVSS_BTC_SURCHARGE ); ?>"
                     name="<?php echo esc_attr( MSVSS_BTC_SURCHARGE ); ?>"
                     value="<?php echo esc_attr( $surcharge ); ?>" min="0" max="100" step="0.1" style="width:100px;" />
              <p class="description">Extra percentage added to the BTC amount to cover network fees (default 5).</p>
            </td>
          </tr>
          <tr>
            <th scope="row">BTC Enabled</th>
            <td>
              <label>
                <input type="checkbox" name="<?php echo esc_attr( MSVSS_BTC_ENABLED ); ?>" value="1"
                       <?php checked( $enabled, 1 ); ?> />
                Show Bitcoin as a payment option at checkout
              </label>
            </td>
          </tr>
          <tr>
            <th scope="row">Current Address Index</th>
            <td>
              <code><?php echo esc_html( $addr_idx ); ?></code>
              <p class="description">Read-only. Incremented automatically by the Vercel API on each new BTC order.</p>
            </td>
          </tr>
        </table>

        <h2 class="title">Cash App &amp; Venmo</h2>
        <table class="form-table">
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_CASHAPP_HANDLE ); ?>">Cash App $tag</label></th>
            <td>
              <input type="text" id="<?php echo esc_attr( MSVSS_CASHAPP_HANDLE ); ?>"
                     name="<?php echo esc_attr( MSVSS_CASHAPP_HANDLE ); ?>"
                     value="<?php echo esc_attr( $cashapp ); ?>" class="regular-text"
                     placeholder="$YourCashTag" />
            </td>
          </tr>
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_VENMO_HANDLE ); ?>">Venmo @handle</label></th>
            <td>
              <input type="text" id="<?php echo esc_attr( MSVSS_VENMO_HANDLE ); ?>"
                     name="<?php echo esc_attr( MSVSS_VENMO_HANDLE ); ?>"
                     value="<?php echo esc_attr( $venmo ); ?>" class="regular-text"
                     placeholder="@YourVenmoHandle" />
            </td>
          </tr>
        </table>

        <h2 class="title">Stablecoins (ERC-20 &amp; Solana)</h2>
        <p class="description" style="margin-bottom:12px;">
          Paste your wallet address for each stablecoin. For ERC-20 (Ethereum / Polygon / Base) and Solana,
          store the appropriate address — or use one address per network separated by a newline if you need both.
        </p>
        <table class="form-table">
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_USDC_ADDRESS ); ?>">USDC Wallet Address</label></th>
            <td>
              <textarea id="<?php echo esc_attr( MSVSS_USDC_ADDRESS ); ?>"
                        name="<?php echo esc_attr( MSVSS_USDC_ADDRESS ); ?>"
                        class="large-text" rows="3"
                        placeholder="0x... (ERC-20) or SolanaBase58Address..."><?php echo esc_textarea( $usdc ); ?></textarea>
              <p class="description">ERC-20 address (0x…) and/or Solana address — one per line.</p>
            </td>
          </tr>
          <tr>
            <th scope="row"><label for="<?php echo esc_attr( MSVSS_USDT_ADDRESS ); ?>">USDT Wallet Address</label></th>
            <td>
              <textarea id="<?php echo esc_attr( MSVSS_USDT_ADDRESS ); ?>"
                        name="<?php echo esc_attr( MSVSS_USDT_ADDRESS ); ?>"
                        class="large-text" rows="3"
                        placeholder="0x... (ERC-20) or SolanaBase58Address..."><?php echo esc_textarea( $usdt ); ?></textarea>
              <p class="description">ERC-20 address (0x…) and/or Solana address — one per line.</p>
            </td>
          </tr>
        </table>

        <?php submit_button( 'Save Payment Settings' ); ?>
      </form>
    </div>
    <?php
}

// ─── Additional BTC REST endpoints ───────────────────────────────────────────
// Registers the confirm-payment endpoint (plus enhanced record-assignment and
// order-by-address variants that use per-address WP options for O(1) lookups).

add_action( 'rest_api_init', 'msv_btc_register_extra_routes' );
function msv_btc_register_extra_routes(): void {
    // POST /wp-json/msv-btc/v1/confirm-payment
    // Body: { order_id, tx_hash, confirmations }
    register_rest_route( 'msv-btc/v1', '/confirm-payment', [
        'methods'             => 'POST',
        'callback'            => 'msv_btc_rest_confirm_payment',
        'permission_callback' => 'msv_btc_rest_permission',
    ] );

    // POST /wp-json/msv-btc/v1/assign-address
    // Enhanced variant: stores per-address WP options for fast lookup.
    // Body: { invoiceId, address, index }
    register_rest_route( 'msv-btc/v1', '/assign-address', [
        'methods'             => 'POST',
        'callback'            => 'msv_btc_rest_assign_address',
        'permission_callback' => 'msv_btc_rest_permission',
    ] );

    // GET /wp-json/msv-btc/v1/lookup-by-address?address=bc1...
    // Enhanced variant: uses per-address WP options and falls back to WC meta.
    register_rest_route( 'msv-btc/v1', '/lookup-by-address', [
        'methods'             => 'GET',
        'callback'            => 'msv_btc_rest_lookup_by_address',
        'permission_callback' => 'msv_btc_rest_permission',
    ] );
}

/**
 * Permission callback for all msv-btc/v1 endpoints.
 * Requires WP Application Password auth (is_user_logged_in + role check).
 */
function msv_btc_rest_permission(): bool {
    return is_user_logged_in() && current_user_can( 'edit_shop_orders' );
}

/**
 * POST /wp-json/msv-btc/v1/confirm-payment
 *
 * Body JSON: { order_id, tx_hash, confirmations }
 * Flips a pending/on-hold WC order to "processing", records the TX hash,
 * and adds an order note.
 */
function msv_btc_rest_confirm_payment( WP_REST_Request $request ): WP_REST_Response {
    $body          = $request->get_json_params();
    $order_id      = absint( $body['order_id'] ?? 0 );
    $tx_hash       = sanitize_text_field( $body['tx_hash'] ?? '' );
    $confirmations = absint( $body['confirmations'] ?? 0 );

    if ( ! $order_id ) {
        return new WP_REST_Response( [ 'error' => 'order_id is required' ], 400 );
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return new WP_REST_Response( [ 'error' => 'Order not found' ], 404 );
    }

    $status = $order->get_status(); // e.g. "pending", "on-hold"
    if ( in_array( $status, [ 'pending', 'on-hold' ], true ) ) {
        $order->update_status(
            'processing',
            sprintf(
                'BTC payment confirmed. TX: %s. Confirmations: %d',
                $tx_hash,
                $confirmations
            )
        );
    } else {
        // Already beyond pending — just add a note without changing status.
        $order->add_order_note(
            sprintf(
                'BTC payment confirmed (status already "%s"). TX: %s. Confirmations: %d',
                $status,
                $tx_hash,
                $confirmations
            )
        );
    }

    if ( $tx_hash ) {
        $order->update_meta_data( '_btc_tx_hash', $tx_hash );
    }
    $order->save();

    return new WP_REST_Response(
        [ 'success' => true, 'order_id' => $order_id ],
        200
    );
}

/**
 * POST /wp-json/msv-btc/v1/assign-address
 *
 * Body JSON: { invoiceId, address, index }
 * Stores two WP options:
 *   msvss_btc_addr_{address}    → { invoiceId, index, timestamp }
 *   msvss_btc_invoice_{invoiceId} → address
 */
function msv_btc_rest_assign_address( WP_REST_Request $request ): WP_REST_Response {
    $body      = $request->get_json_params();
    $invoice   = sanitize_text_field( $body['invoiceId'] ?? '' );
    $address   = sanitize_text_field( $body['address']   ?? '' );
    $idx       = (int) ( $body['index'] ?? -1 );

    if ( ! $invoice || ! $address ) {
        return new WP_REST_Response( [ 'error' => 'invoiceId and address are required' ], 400 );
    }

    $payload = [
        'invoiceId' => $invoice,
        'index'     => $idx,
        'timestamp' => time(),
    ];

    // Per-address lookup: msvss_btc_addr_{address} → payload
    update_option( 'msvss_btc_addr_' . $address, $payload, false );

    // Per-invoice lookup: msvss_btc_invoice_{invoiceId} → address
    update_option( 'msvss_btc_invoice_' . $invoice, $address, false );

    return new WP_REST_Response( [ 'success' => true ], 200 );
}

/**
 * GET /wp-json/msv-btc/v1/lookup-by-address?address={addr}
 *
 * Looks up msvss_btc_addr_{address}, retrieves the invoiceId, then finds
 * the WC order by memo_code meta. Returns { order_id } or 404.
 */
function msv_btc_rest_lookup_by_address( WP_REST_Request $request ): WP_REST_Response {
    $address = sanitize_text_field( $request->get_param( 'address' ) ?? '' );
    if ( ! $address ) {
        return new WP_REST_Response( [ 'error' => 'address param required' ], 400 );
    }

    $assignment = get_option( 'msvss_btc_addr_' . $address, null );
    if ( ! $assignment || empty( $assignment['invoiceId'] ) ) {
        return new WP_REST_Response( [ 'error' => 'Address not found' ], 404 );
    }

    $invoice_id = $assignment['invoiceId'];

    // Try memo_code meta first
    $orders = wc_get_orders( [
        'meta_key'   => 'memo_code',
        'meta_value' => $invoice_id,
        'limit'      => 1,
        'return'     => 'ids',
    ] );

    // Fallback: try _order_key
    if ( empty( $orders ) ) {
        $orders = wc_get_orders( [
            'meta_key'   => '_order_key',
            'meta_value' => $invoice_id,
            'limit'      => 1,
            'return'     => 'ids',
        ] );
    }

    if ( empty( $orders ) ) {
        return new WP_REST_Response(
            [ 'error' => 'No order found for invoiceId: ' . $invoice_id ],
            404
        );
    }

    return new WP_REST_Response( [ 'order_id' => $orders[0] ], 200 );
}
