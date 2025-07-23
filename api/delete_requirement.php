<?php
// api/delete_requirement.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$id = (int)$input['id'];

// Before deleting a requirement, consider if you need to handle linked candidates.
// For simplicity, this example will just delete the requirement.
// In a real app, you might:
// 1. Set requirement_id of linked candidates to NULL
// 2. Delete linked candidates
// 3. Prevent deletion if there are linked candidates

$stmt = $conn->prepare("DELETE FROM requirements WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Requirement deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete requirement: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
