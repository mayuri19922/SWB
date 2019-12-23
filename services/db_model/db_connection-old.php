<?php 

//DB CONNECTION - start
$servername = "localhost";
$username = "root";
$password = "";
$db = "aps";

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
} 

//echo '<pre>';
//header('Content-Type: text/json, utf-8');

//DB CONNECTION - end

?>