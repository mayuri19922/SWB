<?php 
header("Content-Type: text/html; charset=utf-8");

function connection_db($config_file, $connect_db = ''){
	$SYSTEM_CONFIG = get_json_file_content($config_file);


	$db_driver = $SYSTEM_CONFIG['default_db_driver'];
	$conn = "";
	// configuration parameters
	$db_parameters = $SYSTEM_CONFIG['connection_parameter'][$db_driver];

	$username = $db_parameters['username'];
	$password = $db_parameters['password'];
	
	// v0.0.2
	// $connect_db = $db_parameters['pointing_db'];
	if($connect_db == ""){
		//connect_db = "OPTIPROADMIN"; // connection to default db when no database if found, useful for services like login and before login
		$connect_db = "DEVSCHEDULING";
	}

if($db_driver == "sap_hana"){ // Connection to HANA

	$driver      = $db_parameters['driver']; 
	$server_name  = $db_parameters['server_name'] .':'. $db_parameters['port']; 
	$dsn ="odbc:Driver=$driver;ServerNode=$server_name;Database=$connect_db;charset=utf8";

	require_once 'sap_hana_queries.php';

} else if($db_driver == "ms_sql_srv"){ // Connection to MS SQL Server

	$server_name = $db_parameters['server_name']; 
	$dsn = "sqlsrv:Server=$server_name;Database=$connect_db";

	require_once 'ms_sqlsrv_queries.php';

} else if($db_driver == "mysql"){ // Connection to MYSQL 

	$server_name = $db_parameters['server_name']; 
	$dsn = "mysql:host=localhost;dbname=$connect_db;charset=utf8";

	require_once 'mysql_queries.php';

}
// Create connection to either HANA or MS sql server
try {
	$conn = new PDO($dsn, 
		$username, 
		$password,
		array(
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
  )
	);
	
	if($db_driver == "sap_hana"){ $conn->exec("set schema $connect_db"); }
//	$conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
    
	return $conn;
}
catch (Exception $e) {
	print_r($e); die;
}
}

