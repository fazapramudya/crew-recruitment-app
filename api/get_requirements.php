<?php
// api/get_requirements.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$sql = "SELECT id, client, position, quantity_required, quantity_filled, date_needed, status FROM requirements";
$result = $conn->query($sql);

$requirements_data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $requirements_data[] = $row;
    }
}

echo json_encode($requirements_data);
$conn->close();
?>
