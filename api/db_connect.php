<?php
// api/db_connect.php
$servername = "localhost";
$username = "root"; // Default XAMPP username
$password = "";     // Default XAMPP password (usually empty)
$dbname = "crew_recruitment_db"; // Your database name (pastikan ini sama dengan nama database yang Anda buat di phpMyAdmin)

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // In a production environment, avoid exposing sensitive error details
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Set headers for CORS (Cross-Origin Resource Sharing)
// This is CRUCIAL for your JavaScript running in the browser to talk to your PHP backend.
header('Access-Control-Allow-Origin: *'); // Allows requests from any domain (for development)
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request (browser sends this before actual PUT/DELETE requests)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
