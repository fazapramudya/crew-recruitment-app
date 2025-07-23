<?php
// api/get_candidate_by_id.php
// This file fetches a single candidate's data by their ID.

require_once 'db_connect.php'; // Include the database connection file
header('Content-Type: application/json');

// Get the candidate ID from the URL query parameter
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Validate if ID is provided and is a positive integer
if ($id === 0) {
    echo json_encode(["error" => "Candidate ID is missing or invalid."]);
    $conn->close();
    exit();
}

// Prepare the SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, name, position, experience, status, requirement_id, history FROM candidates WHERE id = ?");
$stmt->bind_param("i", $id); // 'i' denotes integer type for the ID
$stmt->execute();
$result = $stmt->get_result(); // Get the result set from the executed statement

$candidate = null; // Initialize candidate as null
if ($result->num_rows > 0) {
    $candidate = $result->fetch_assoc(); // Fetch the candidate data as an associative array
    // Decode history JSON string to PHP array/object
    // The '??' operator handles cases where 'history' might be NULL in the DB
    $candidate['history'] = json_decode($candidate['history'] ?? '[]', true); 
}

echo json_encode($candidate); // Output the candidate data as JSON
$stmt->close(); // Close the prepared statement
$conn->close(); // Close the database connection
?>
