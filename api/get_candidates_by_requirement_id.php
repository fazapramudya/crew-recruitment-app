<?php
// api/get_candidates_by_requirement_id.php
// This file fetches candidates linked to a specific requirement ID.

require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

// Get the requirement ID from the URL query parameter
$requirement_id = isset($_GET['requirement_id']) ? (int)$_GET['requirement_id'] : 0;

// Validate if requirement ID is provided and is a positive integer
if ($requirement_id === 0) {
    echo json_encode(["error" => "Requirement ID is missing or invalid."]);
    $conn->close();
    exit();
}

// Prepare the SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, name, position, experience, status, requirement_id, history FROM candidates WHERE requirement_id = ?");
$stmt->bind_param("i", $requirement_id); // 'i' denotes integer type for the requirement_id
$stmt->execute();
$result = $stmt->get_result(); // Get the result set from the executed statement

$candidates_data = []; // Initialize an empty array for candidates
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Decode history JSON string to PHP array/object
        $row['history'] = json_decode($row['history'] ?? '[]', true);
        $candidates_data[] = $row; // Add each fetched row to the array
    }
}

echo json_encode($candidates_data); // Output the array of candidates as JSON
$stmt->close(); // Close the prepared statement
$conn->close(); // Close the database connection
?>
