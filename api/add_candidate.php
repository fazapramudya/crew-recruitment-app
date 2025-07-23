<?php
// api/add_candidate.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate and sanitize input (VERY IMPORTANT!)
$name = $conn->real_escape_string($input['name']);
$position = $conn->real_escape_string($input['position']);
$experience = $conn->real_escape_string($input['experience']);
$status = $conn->real_escape_string($input['status']);
$requirementId = isset($input['requirement_id']) && $input['requirement_id'] !== null ? (int)$input['requirement_id'] : null; // Match JS property name
$history = $conn->real_escape_string($input['history']); // Should already be JSON string from JS

// Use prepared statements
$stmt = $conn->prepare("INSERT INTO candidates (name, position, experience, status, requirement_id, history) VALUES (?, ?, ?, ?, ?, ?)");
// 's' for string, 'i' for integer, 's' for string (JSON)
$stmt->bind_param("ssssis", $name, $position, $experience, $status, $requirementId, $history);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Candidate added successfully", "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add candidate: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
