<?php 

error_reporting(E_ALL);
ini_set("display_errors", 1);


// common functions 
$time_format = 'H:i';
$date_formt = "d-m-Y $time_format";
$date_formt_notime = "d-m-Y";
$db_date_only_format = "Y-m-d"; 
$db_date_format = $db_date_only_format." ".$time_format;
$int_time_format  = "Gi";
$log_path = "logs/";

function convert_date_time_concat($date, $time){
	global $db_date_only_format;
	global $time_format;
	if( strtotime($date) ==""){
		$temp = explode(" ", $date);
		$date = $temp[0];
	}
	
	if((int)$time < 999){
		$time = "0".$time;
	}
	
	return date($db_date_only_format, strtotime($date)) . ' '. date($time_format, strtotime($time)) ;
}

function change_date_format($date){
	/* global $date_formt; 	$date = new DateTime($date); return $date->format($date_formt);*/ // previously using for date convert 

	global $date_formt;
	if( strtotime($date) ==""){
		if(strstr($date, ":") !=""){
			$temp = explode(":", $date);
			$date = str_replace(":".end($temp), "", $date);
		}
	}
	return date($date_formt, strtotime($date));
}

function date_corrector($date){
//	if( strtotime($date) ==""){
	if(strstr($date, ".") !=""){
		$temp = explode(".", $date);
		$date = $temp[0];
	}
//	}
	return $date;
}


function get_only_date($date){
	global $db_date_only_format;
	return date($db_date_only_format, strtotime($date));

}

function change_date_format_notime($date){
	global $date_formt_notime;
	/*$date = new DateTime($date);
	return $date->format($date_formt_notime);*/
	return date($date_formt_notime, strtotime($date));
}

function change_db_date_format($date){
	global $db_date_format;
	$date = new DateTime($date);
	return $date->format($db_date_format);
}

function change_date_to_int_time($date){
	global $int_time_format;
	if( strtotime($date) ==""){
		if(strstr($date, ".") !=""){
			$temp = explode(".", $date);
			$date = explode(" ", $temp[0])[1];
		}
	}
	return date($int_time_format, strtotime($date));
}

function change_int_to_time($date){
	global $time_format;
	return date($time_format, strtotime($date));
}

function get_date_diff_in_days($current_date, $your_date){
	$datediff = $current_date - $your_date;
	return floor($datediff / (60 * 60 * 24));
}

function get_json_file_content($file_name){

	$content = file_get_contents($file_name);
	
	$data_array = json_decode(trim($content), true);
	return $data_array;
}

// get all task types

function get_task_type(){
	$task_type_dataset = get_json_file_content('../task_type.json');
	if(!empty($task_type_dataset)){

		foreach($task_type_dataset['task_type'] as $row) {
			$temp = array(
				"key"=>(int)$row['code'],
				"label"=>ucfirst($row['description']),
				"unique_name"=> strtolower($row['key']),
			);
			$output[] = $temp;
		}

		return json_encode(array("data"=>$output));
	} else {
		return json_encode(array("data"=>'none'));
	}
}

function priority_list(){
	$priority_dataset = get_json_file_content('../priority.json');
	if(!empty($priority_dataset)){

		foreach($priority_dataset['priority'] as $row) {
			$temp = array(
				"key"=>(int)$row['code'],
				"label"=>ucfirst($row['description']),
				"min_value"=>ucfirst($row['min_value']),
				"max_value"=>ucfirst($row['max_value']),
				"range"=>ucfirst($row['range']),
			);
			$output[] = $temp;
		}

		return json_encode(array("data"=>$output));
	} else {
		return json_encode(array("data"=>'none'));
	}
};

function clean_date_field($string)  {  
	$string = preg_replace('/[^0-9-:^\s]/', '', $string);
	return $string;  
}

function log_data($application_path,$action, $data){
    global $log_path;
    global $date_formt_notime;
    global $date_formt;
    $log_data = array(
        "date" => date($date_formt),
        "action"=>$action,
        "query"=> $data,
    );

    $file_name = $application_path.$log_path.''.date($date_formt_notime).'.log';

    file_put_contents( $file_name,"\n\n".json_encode($log_data). "\n\n",FILE_APPEND);
}


?>