<?php
// api/update_requirement.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$id = (int)$input['id'];
$updates = [];
$params = [];
$types = "";

if (isset($input['quantity_filled'])) {
    $updates[] = "quantity_filled = ?";
    $params[] = (int)$input['quantity_filled'];
    $types .= "i";
}
if (isset($input['status'])) {
    $updates[] = "status = ?";
    $params[] = $conn->real_escape_string($input['status']);
    $types .= "s";
}
// Add more fields if you need to update them

if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "No fields to update."]);
    $conn->close();
    exit();
}

$sql = "UPDATE requirements SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);

// Bind parameters dynamically
$params[] = $id; // Add ID to the end of parameters
$types .= "i"; // Add type for ID

// Use call_user_func_array to bind parameters
$bind_names = [$types];
for ($i = 0; $i < count($params); $i++) {
    $bind_name = 'bind' . $i;
    $$bind_name = &$params[$i];
    $bind_names[] = &$$bind_name;
}
call_user_func_array([$stmt, 'bind_param'], $bind_names);


if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Requirement updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update requirement: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
