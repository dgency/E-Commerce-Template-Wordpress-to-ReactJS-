<?php
/**
 * Add this code to your WordPress theme's functions.php file
 * This creates a REST API endpoint to fetch menus
 */

// Register custom REST API endpoint for menus
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/menu/(?P<location>[a-zA-Z0-9-_]+)', array(
        'methods' => 'GET',
        'callback' => 'get_menu_by_location',
        'permission_callback' => '__return_true'
    ));
});

function get_menu_by_location($request) {
    $location = $request['location'];
    
    // Get menu locations
    $locations = get_nav_menu_locations();
    
    // Find menu ID for this location
    $menu_id = null;
    if (isset($locations[$location])) {
        $menu_id = $locations[$location];
    } else {
        // Try to find by slug
        $menu = wp_get_nav_menu_object($location);
        if ($menu) {
            $menu_id = $menu->term_id;
        }
    }
    
    if (!$menu_id) {
        return new WP_REST_Response(array(), 200);
    }
    
    // Get menu items
    $menu_items = wp_get_nav_menu_items($menu_id);
    
    if (!$menu_items) {
        return new WP_REST_Response(array(), 200);
    }
    
    // Format menu items
    $formatted_items = array();
    foreach ($menu_items as $item) {
        $formatted_items[] = array(
            'ID' => $item->ID,
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'slug' => $item->post_name,
            'type' => $item->type,
            'object' => $item->object,
            'menu_item_parent' => $item->menu_item_parent,
            'menu_order' => $item->menu_order,
        );
    }
    
    return new WP_REST_Response($formatted_items, 200);
}
