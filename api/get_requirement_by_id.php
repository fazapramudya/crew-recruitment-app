<?php
// api/get_requirement_by_id.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id === 0) {
    echo json_encode(["error" => "Requirement ID is missing."]);
    $conn->close();
    exit();
}

$stmt = $conn->prepare("SELECT id, client, position, quantity_required, quantity_filled, date_needed, status FROM requirements WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$requirement = null;
if ($result->num_rows > 0) {
    $requirement = $result->fetch_assoc();
}

echo json_encode($requirement);
$stmt->close();
$conn->close();
?>
