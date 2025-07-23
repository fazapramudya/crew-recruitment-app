<?php
// api/update_candidate.php
// This file updates a candidate's information in the database.

require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json'); // Ensure this header is sent

// Enable error reporting for debugging (TEMPORARY - REMOVE IN PRODUCTION)
error_reporting(E_ALL);
ini_set('display_errors', 1);

$input = json_decode(file_get_contents('php://input'), true);

// Check if JSON decoding failed
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input: " . json_last_error_msg()]);
    $conn->close();
    exit();
}

// Basic validation for ID
if (!isset($input['id'])) {
    echo json_encode(["success" => false, "message" => "Candidate ID is missing."]);
    $conn->close();
    exit();
}
$id = (int)$input['id'];

$updates = [];
$params = [];
$types = "";

if (isset($input['status'])) {
    $updates[] = "status = ?";
    $params[] = $conn->real_escape_string($input['status']);
    $types .= "s";
}
if (isset($input['history'])) {
    $updates[] = "history = ?";
    $params[] = $conn->real_escape_string($input['history']);
    $types .= "s";
}
// Add more fields if you need to update them (e.g., name, position, experience, requirement_id)
if (isset($input['name'])) {
    $updates[] = "name = ?";
    $params[] = $conn->real_escape_string($input['name']);
    $types .= "s";
}
if (isset($input['position'])) {
    $updates[] = "position = ?";
    $params[] = $conn->real_escape_string($input['position']);
    $types .= "s";
}
if (isset($input['experience'])) {
    $updates[] = "experience = ?";
    $params[] = $conn->real_escape_string($input['experience']);
    $types .= "s";
}
if (isset($input['requirement_id'])) {
    // Handle null for requirement_id if it's sent as null from JS
    $updates[] = "requirement_id = ?";
    $params[] = ($input['requirement_id'] !== null) ? (int)$input['requirement_id'] : null;
    $types .= "i"; // 'i' for integer, even if null, PHP handles it
}


if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "No fields to update."]);
    $conn->close();
    exit();
}

$sql = "UPDATE candidates SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);

// Check if statement preparation failed
if ($stmt === false) {
    echo json_encode(["success" => false, "message" => "Failed to prepare statement: " . $conn->error]);
    $conn->close();
    exit();
}

// Bind parameters dynamically
$params[] = $id; // Add ID to the end of parameters
$types .= "i"; // Add type for ID

// Use call_user_func_array to bind parameters
// This part is a bit tricky for dynamic binding, ensure the types string matches the params count
// For simplicity, let's assume 'i' for ID is always last.
// If you have many dynamic types, a more robust binding is needed.
// For now, let's ensure the count matches.
if (strlen($types) !== count($params)) {
    echo json_encode(["success" => false, "message" => "Parameter type string length does not match parameter count."]);
    $stmt->close();
    $conn->close();
    exit();
}

// The issue might be here: call_user_func_array needs actual references for bind_param
// Re-creating references for bind_param
$bind_args = [$types];
foreach ($params as $key => $value) {
    $bind_args[] = &$params[$key]; // Pass by reference
}
call_user_func_array([$stmt, 'bind_param'], $bind_args);


if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Candidate updated successfully"]);
} else {
    // THIS IS THE KEY PART: Log the specific SQL error if execution fails
    echo json_encode(["success" => false, "message" => "Failed to update candidate: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
