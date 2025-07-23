<?php
// api/get_candidates.php
require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

$sql = "SELECT id, name, position, experience, status, requirement_id, history FROM candidates";
$result = $conn->query($sql);

$candidates_data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Decode history JSON string to PHP array/object if it's stored as TEXT
        // If your DB column is JSON type, it might auto-decode depending on fetch_assoc() behavior
        // For consistency, let's assume it's a string that needs decoding for JS consumption
        // If history is NULL in DB, json_decode(NULL) returns NULL, so handle that
        $row['history'] = json_decode($row['history'] ?? '[]', true); 
        $candidates_data[] = $row;
    }
}

echo json_encode($candidates_data);
$conn->close();
?>
