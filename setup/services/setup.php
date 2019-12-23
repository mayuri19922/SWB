<?php 
$post_data = $_POST;
$get_data = $_GET['action'];

$application_path = "../../";

$global_services_path = $application_path.'services';

$default_db = "OPTIPROADMIN";

require_once $global_services_path.'/functions/common.php';

function create_con($post_data){
	global $default_db;	
	global $global_services_path;	

	if($post_data['choose_db'] == "sap_hana"){ // Connection to HANA
		$hana_driver         = $post_data['hana_driver'];
		$hana_server_name    = $post_data['hana_server_name'];
		$hana_server_port    = $post_data['hana_server_port'];
		$username            = $post_data['hana_username'];
		$password            = $post_data['hana_password'];
		$connect_db          = $default_db; //$post_data['hana_db'];

		$server_name         = $hana_server_name .':'. $hana_server_port; 
		$dsn ="odbc:Driver=$hana_driver;ServerNode=$server_name;Database=$connect_db;";
		require_once $global_services_path.'/db_model/sap_hana_queries.php';
	} else if($post_data['choose_db'] == "ms_sql_srv"){ // Connection to MS SQL Server


		$server_name	     = $post_data['sql_server_name'];
		$username            = $post_data['sql_server_username'];
		$password            = $post_data['sql_server_password'];
		$connect_db          = $default_db; //$post_data['sql_server_db'];
		$dsn = "sqlsrv:Server=$server_name;Database=$connect_db";
		require_once $global_services_path.'/db_model/ms_sqlsrv_queries.php';
	}

	$output = '';
	try {
		$conn = new PDO($dsn, $username, $password);
		$output = array("status"=>1, 'connection_obj' =>$conn);
		
	}
	catch (Exception $e) {
		$output = array("status"=>0);
	}
	return $output; 
	

}

//function for installation of the applicaiton
function install_SWB($conn,$post_data,$db_name){
	global $application_path;
	$install_queries = installation_queries($post_data,$db_name);

	// echo '<pre>'; print_r($install_queries);  die;
	$error = 0;
	foreach($install_queries as $key => $query){
		try{
			if(strstr($query, ";") !=""){
				
				$query_arr = explode(';', $query);
				foreach($query_arr as $insert){
					if(trim($insert)!=""){
						log_data($application_path, "install_SWB", $insert);
						$create_aps_table_res = $conn->query($insert);	
					}
				}
			} else {
				log_data($application_path, "install_SWB", $query);
				$create_aps_table_res = $conn->query($query);
			}
		} catch(PDOException $e) {
			// echo $e->getMessage();  
			$error++;
		}
	}
	if($error==0){
		return 1;
	} else {
		return 0;
	}
}


//function for upgradation of the applicaiton
function upgrade_SWB($conn,$post_data,$db_name,$db_version = 0){
	global $application_path;
	$upgrade_queries = upgradation_queries($db_name);
	//print_r($upgrade_queries);
	// echo $current_version;
	$all_version_list = array_keys($upgrade_queries);
	$filered_versions= array_filter($all_version_list, function($ver ) use($db_version) { 
		return ($ver > $db_version);
	});
	 //echo '<pre>'; print_r($upgrade_queries);  die;
	$error = 0;
	 //If version is blank i.e we will run from scrap
	if(!empty($filered_versions)){
		foreach($filered_versions as $ver){
			if(!empty($upgrade_queries[$ver]) && $upgrade_queries[$ver]!=""){
				foreach($upgrade_queries[$ver] as $query){
					try{
						log_data($application_path, "upgrade_SWB", $query);
						$upgrade_aps_table_res = $conn->query($query);
					} catch(PDOException $e) {
					// print_r($e);
						$error++;
					}
				}
			}
			
		}

	}
	
	if($error==0){
		return 1;
	} else {
		return 0;
	}
}

//function for upgradation of the applicaiton
function uninstall_SWB($conn, $db_name, $post_data){
	global $application_path;
	$uninstall_queries = uninstall_queries($db_name, $post_data);
	// echo '<pre>'; print_r($uninstall_queries);  die;
	$error = 0;
	foreach($uninstall_queries as $key => $query){
		try{
			if(strstr($query, ";") !=""){
				$query_arr = explode(';', $query);
				foreach($query_arr as $drop){
					if(trim($drop)!=""){
						log_data($application_path, "uninstall_SWB", $drop);
						$drop_aps_table_res = $conn->query($drop);	
					}
				}
			} else {
				log_data($application_path, "install_SWB", $query);
				$drop_aps_table_res = $conn->query($query);
			}
		} catch(PDOException $e) {
			// echo $e->getMessage();  
			$error++;
		}
	}
	if($error==0){
		return 1;
	} else {
		return 0;
	}

	
}



if(isset($get_data) && $get_data=="extension_check" ){
	$required_extensions = array(
		"date"=>0, "session"=>0, "json"=>0, "PDO"=>0, "PDO_ODBC"=>0, "pdo_sqlsrv"=>0,
	);
	$ext = get_loaded_extensions();

	asort($ext);
	foreach ($ext as $ext_name) {
		if(isset($required_extensions[$ext_name]) && $required_extensions[$ext_name] == 0){
			$required_extensions[$ext_name] = 1;
		}
	}
	
	echo json_encode($required_extensions);
	exit;

}  else if(isset($get_data) && $get_data=="try_connection" ){
	$try_connection = create_con($post_data);
	if($try_connection['status'] == 1) {
		$conn = $try_connection['connection_obj'];
		$query = get_all_server_db(); 
		// echo '<pre>'; echo $query; die;
		$aps_result = $conn->query($query);
		$res = "";
		$data = "";
		if($aps_result->rowCount()){
			$data = $aps_result->fetchAll(PDO::FETCH_ASSOC);
			$escaped_data = array();
			foreach($data as $data_set){
				$escaped_data[] = array("dbName"=>($data_set['dbName']), "cmpName"=>($data_set['cmpName']));
			}
			$res = "custom_success";
			$msg = "Connection Established";
			
		} else {
			$res = "error";
			$msg = "Connection Established, No database found";
		}
		$output = array("success" => $res , "message"=> $msg, "data"=> $escaped_data);

	} else {
		$output = array("success"=>'error', "message"=> "Connection Failed");
	}
	echo json_encode($output); die;

}  else if(isset($get_data) && $get_data=="start_installation" ){
    //print_r($post_data);
	$priority_color_set = "";
	$task_type_color_set = "";
	//print_r($post_data); die;
	$config_file_path = $application_path."config.json";
	// echo $config_file_path; die;
	$config = get_json_file_content($config_file_path);
	$config['default_db_driver']= $post_data['choose_db'];

	
	if($post_data['choose_db'] == "sap_hana"){ 
		
		$config['connection_parameter'][$config['default_db_driver']]['driver'] = $post_data['hana_driver'];
		$config['connection_parameter'][$config['default_db_driver']]['server_name'] = $post_data['hana_server_name'];
		$config['connection_parameter'][$config['default_db_driver']]['port'] = $post_data['hana_server_port'];
		$config['connection_parameter'][$config['default_db_driver']]['username'] = $post_data['hana_username'];
		$config['connection_parameter'][$config['default_db_driver']]['password'] = $post_data['hana_password'];
		$config['connection_parameter'][$config['default_db_driver']]['pointing_db'] = ""; // $post_data['hana_db'];
	} else if($post_data['choose_db'] == "ms_sql_srv"){ 

		$config['connection_parameter'][$config['default_db_driver']]['server_name'] = $post_data['sql_server_name'];
		$config['connection_parameter'][$config['default_db_driver']]['username'] = $post_data['sql_server_username'];
		$config['connection_parameter'][$config['default_db_driver']]['password'] = $post_data['sql_server_password'];
		$config['connection_parameter'][$config['default_db_driver']]['pointing_db'] =""; // $post_data['sql_server_db'];
	}

	
	$config['theme'] = $post_data['default_theme']; 
	$config['installed'] = 1;
	$config['base_url'] = $post_data['app_url'];

	file_put_contents($config_file_path,json_encode($config));
	
	require_once $global_services_path.'/db_model/connection.php';
	$conn = connection_db($config_file_path);
	$conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$post_data['priority_color_set_json'] = json_encode(@$post_data['priority_color_set']);
	$post_data['task_type_color_set_json'] = json_encode(@$post_data['task_type_color_set']);
	// print_r($post_data);	
	if(isset($post_data['filtered_db'])){
		$db_obj = json_decode($post_data['filtered_db'], true);
		$is_error =  0;
		foreach($db_obj as $db){
			 	//For each DB we will call a method which will create all tables
			if(isset($post_data['install_option']) && $post_data['install_option'] == "install_only"){
				
				$install_res=install_SWB($conn,$post_data,$db['db_name']);
				$install_res = 1;
				if($install_res > 0){
					$upgrade_res = upgrade_SWB($conn,$post_data,$db['db_name'],0);
					if($upgrade_res > 0){
						// SWB Row in installed product 
						$opti_install_query  = insert_swb_product($db['db_name'], $config['system_version']);
						$opti_install_res = $conn->query($opti_install_query);
						if(!$opti_install_res){
							$is_error++;
						}
					} else {
						$is_error++;
					}
				}
				else{
					$is_error++;
				}
				
			} else if(isset($post_data['install_option']) && $post_data['install_option'] == "upgrade_only"){
					//upgrade_SWB();
				$upgrade_res = upgrade_SWB($conn,$post_data,$db['db_name'], $db['version']);
				if($upgrade_res > 0){
					//After the sucessfull upgradation the version will be updated into the system
					$opti_upgrade_query = update_swb_product($db['db_name'], $config['system_version']);
					$opti_upgrade_res = $conn->query($opti_upgrade_query);
					if(!$opti_upgrade_res){
						$is_error++;
					}
				} else {
					$is_error++;
				}
				
			} else if(isset($post_data['install_option']) && $post_data['install_option'] == "uninstall_install"){
				if($db['is_installed'] == 'Yes'){
					$res = uninstall_SWB($conn, $db['db_name'], $post_data);
					if($res > 0){
					} 
				}
				$install_res = install_SWB($conn,$post_data,$db['db_name']);
				if($install_res > 0){
					$upgrade_res = upgrade_SWB($conn,$post_data,$db['db_name'],0);
					if($upgrade_res > 0){
							// SWB Row in installed product
						$opti_install_query  = insert_swb_product($db['db_name'], $config['system_version']);
						$opti_install_res = $conn->query($opti_install_query);
						if(!$opti_install_res){
							$is_error++;
						}
					} else {
						$is_error++;

					}
				} else{
					$is_error++;
				}
			} 
		}
		// die;
		if($is_error > 0){
			$output = array("success"=>'error', "message"=> "Installation Failed, Check with your administrator for more information.");
		} else {
			$output = array("success"=>'custom_success', "message"=>"Installation Sucessful." );
			
		}
	}	else {
		$output = array("success"=>'error', "message"=> "No SDatabase selected, please select DB from connection step.");
	}	


	echo json_encode($output);  die;	

}else if(isset($get_data) && $get_data=="get_db_inst_details" ){
	$try_connection = create_con($post_data);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);
	if($try_connection['status'] == 1) {
		$conn = $try_connection['connection_obj'];
		if(isset($post_data['checked_db']) && $post_data['checked_db']!=""){
			$checked_db = $post_data['checked_db'];
			$data_array = array();
			foreach($checked_db as $company_name){
				$temp_array = array();
				$product_res = $conn->query(get_installed_product_query($company_name));
				if($product_res != false){
					if($product_res->rowCount()){
						$product_res_data = $product_res->fetch(PDO::FETCH_ASSOC);
						$temp_array = array("db_name"=> $company_name, "is_installed"=> "Yes", "ver"=>$product_res_data['U_PRODUCTVERSION'],"font_color"=>"green","is_optipro_installed"=> "Yes");
					} else {
						$temp_array = array("db_name"=> $company_name, "is_installed"=> "No", "ver"=>'N/A',"font_color"=>"red","is_optipro_installed"=> "Yes");
					}
				}else{
							//array_push($is_optipro_installed, $company_name);
					$temp_array = array("db_name"=> $company_name, "is_installed"=> "<b>X</b>", "ver"=>'<b>X</b>',"font_color"=>"red","is_optipro_installed"=> "No");

				}
				$data_array[] = $temp_array;
			}
			$output = array("success"=>'custom_success', "message"=> "", "data"=> $data_array);
		} else {
			$output = array("success"=>'error', "message"=> "No DB list found. please select DB/company.");	
		}

	} else {
		$output = array("success"=>'error', "message"=> "There was some error, please try again.");	
	}

	echo json_encode($output);  die;	
} 
else {
	$output = array("success"=>'error', "message"=> "There was some error. Please try again.");
	echo json_encode($output);  die;
} 


?>