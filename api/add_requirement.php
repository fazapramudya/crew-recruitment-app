<?php
// api/add_requirement.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate and sanitize input (VERY IMPORTANT!)
$client = $conn->real_escape_string($input['client']);
$position = $conn->real_escape_string($input['position']);
$quantityRequired = (int)$input['quantity_required']; // Match JS property name
$dateNeeded = $conn->real_escape_string($input['date_needed']); // Match JS property name
$quantityFilled = 0; // Default value
$status = 'Open'; // Default value

// Use prepared statements to prevent SQL Injection
$stmt = $conn->prepare("INSERT INTO requirements (client, position, quantity_required, quantity_filled, date_needed, status) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiss", $client, $position, $quantityRequired, $quantityFilled, $dateNeeded, $status);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Requirement added successfully", "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add requirement: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
