
<?php 
require_once 'functions/common.php';

require_once 'db_model/connection.php'; 


$current_company ='';
if(isset($_GET['company']) && $_GET['company']!=""){
$current_company = $_GET['company'];
} if(isset($_POST['company']) && $_POST['company']!=""){
$current_company = $_POST['company'];
}


$conn = connection_db('../config.json', $current_company);

require_once 'functions/db_gantt_chart.php';

require_once 'functions/db_data_dump.php';


// Define actions 
$action = "";
$presentation_type = "";
$default_work_center = "";
if(isset($_GET['action']) && $_GET['action']!=""){
	$action = $_GET['action']; 
	$presentation_type = (isset($_GET['display_type']) && $_GET['display_type']!="") ? $_GET['display_type'] : "";
	$default_work_center = (isset($_GET['default_work_center']) && $_GET['default_work_center']!="") ? $_GET['default_work_center'] : "";
} else {
	echo 'No action Parameter';
	die;
}
// service call
switch ($action) {
	case 'get_all_list':
	echo get_resources_task_priority($presentation_type, $default_work_center);
	break;

	case 'get_resources':
	echo get_all_resources($default_work_center);
	break;

	case 'get_task_type':
	echo get_task_type();
	break;

	case 'priority_list':
	echo priority_list();
	break;

	case 'get_work_centers':
	echo get_work_centers();
	break;

	case 'get_schedular_work_center_resources':
	echo get_schedular_work_center_resources();
	break;

	case 'get_operations':
	// echo '<pre>';
	echo get_operations($presentation_type, $default_work_center);
	break;

	case 'save_update':
	echo save_update_task();
	break;

	case  'push_to_production':
	echo push_to_production();
	break;

	case  'get_refresh_status':
	echo get_refresh_status();
	break;

	case  'get_refresh_data':
	echo get_refresh_data();
	break;
	
	case 'delete_saved_task':
	echo delete_saved_task();
	break;

	case 'delete_task_link':
	echo delete_task_link();
	break;

	case 'complete_selected_task':
	echo complete_selected_task();
	break;

	case 'get_system_settings':
	echo get_system_settings();
	break;
	
	case 'save_system_settings':
	echo save_system_settings();
	break;
	
	case 'get_all_schedule':
	echo get_scheduling_ref_list();
	break;
	
	case 'start_scheduling':
	echo start_scheduling();
	break;

	case 'shift_capacity_details':
	echo shift_capacity_details();
	break;


	case 'convert_data_to_current_date_time':
	echo convert_data_to_current_date_time();
	break;

	case 'get_current_schedule_detail' :
	echo get_current_schedule_detail();
	break;	

	case 'get_login_service_URL' :
	echo get_login_service_URL();
	break;
	
	default:
	echo 'No method to be called'; die;
	break;
}


?>