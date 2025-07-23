<?php
// api/delete_candidate.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$id = (int)$input['id'];

$stmt = $conn->prepare("DELETE FROM candidates WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Candidate deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete candidate: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
