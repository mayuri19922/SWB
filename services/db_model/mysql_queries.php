<?php 

function work_center_query(){
	$query = "SELECT id, name 
	FROM work_center";
	return $query;
}

function work_order_query(){
	$query = "SELECT id, name FROM operations WHERE (operation_type = 'project' OR operation_type = 'work_order' )";
	return $query;
}

function resource_list_query($default_work_center){
	$resouce_where = "";
	if($default_work_center!= NULL && $default_work_center!= 'all'){
		$resouce_where = "WHERE work_center_id = '$default_work_center'";
	}
	$query = "SELECT id, name FROM resources $resouce_where";
	return $query;
}

function schedular_work_center_query(){
	$query = "SELECT wc.id as work_center_id,wc.name as work_center_name, res.id as resource_id, res.name as resource_name
	FROM work_center as wc 
	LEFT JOIN resources as res ON res.work_center_id = wc.id";
	return $query;
}

function work_order_prod($start_date, $end_date, $available_wo = NULL , $default_work_center = NULL){
	$extra_where  = "";
	if(!empty($available_wo)){
		$available_wo_str = implode("','", $available_wo);	
		$extra_where = "AND name IN ('$available_wo_str') ";
	}

	$select_work_orders = "
	SELECT *
	FROM operations
	WHERE (operation_type = 'project' OR operation_type = 'work_order' )
	";
	return $select_work_orders;
}

function operation_task_query_prod($start_date, $end_date, $work_center){
	$where ="";
	if($work_center!= NULL && $work_center!= 'all'){
		$where = "AND opr.work_center_id = '$work_center'";
	}
	$query = "SELECT tt.name as task_type_name, res.Name as resource_name, opr.*, 
	oprls.source as parent, opr.work_center_id as work_center_id
	FROM operations as opr
	LEFT JOIN resources as res ON opr.resource_id = res.id
	LEFT JOIN task_type as tt ON opr.task_type_id = tt.id 
	LEFT JOIN operations_links as oprls ON opr.id = oprls.target
	WHERE date(start_date) >= '$start_date' AND date(end_date) <= '$end_date'
	$where 
	ORDER BY opr.id ASC";

	return $query;
}

function operation_task_query_sfdc($start_date, $end_date, $work_center){
	$where ="";
	if($work_center!= NULL && $work_center!= 'all'){
		$where = "AND opr.work_center_id = '$work_center'";
	}
	$query = "SELECT tt.name as task_type_name, res.Name as resource_name, opr.*, 
	oprls.source as parent, opr.work_center_id as work_center_id
	FROM operations as opr
	LEFT JOIN resources as res ON opr.resource_id = res.id
	LEFT JOIN task_type as tt ON opr.task_type_id = tt.id 
	LEFT JOIN operations_links as oprls ON opr.id = oprls.target
	WHERE date(start_date) >= '$start_date' AND date(end_date) <= '$end_date'
	$where 
	ORDER BY opr.id ASC";

	return $query;
}

function gant_chart_links_query($operation_ids){
	$where = "";
	if($operation_ids!= ""){
		$where = "WHERE (source IN(".$operation_ids.") OR target IN(".$operation_ids.")) ";
	}

	$query = "SELECT	id, source, target, connection_type FROM operations_links $where";
	return $query;
}

function system_setting_query(){
	$action_table = "system_settings";
	$query = "SELECT `id`, `name`, `value`, `group` FROM `$action_table`";
	return $query;
}

function insert_task_query($task_details){

	$action_table = "operations";
	
	$keys = array_keys($task_details);
	$columns = implode(", ", $keys);
	//$binding = ":". implode(", :", $keys);
	
	$binding =  implode(", ", array_fill(0, count($keys), '?'));
	$values  =  "'".implode("', '", array_values($task_details))."'";
	
	$query = "INSERT INTO `$action_table`($columns) VALUES ($values)";
	return $query;

}

function update_task_query($task_details, $task_id){
	$table_arr = array();
	$action_table = "operations";

	$query_data = "";
	foreach($task_details as $column_name => $column_value){
		$query_data .= "`$column_name` =  '$column_value', ";
	}

	$query_data = rtrim($query_data, ", ");

	$where  = "  WHERE `id` = '$task_id' ";

	$table_arr['update_prod_oper'] =  "UPDATE `$action_table` SET $query_data $where";

	return $table_arr;
}

function delete_task_query($task_id){
	$action_table   = "operations";
	$action_table_2 = "operations_links";

	$select_task = "SELECT * FROM $action_table WHERE id = '$task_id'";

	$delete_task_link = "DELETE FROM $action_table_2 WHERE (source = '$task_id' OR target = '$task_id')";

	$delete_task = "DELETE FROM $action_table WHERE id='$task_id'";	

	return array(
		"select_task" => $select_task,
		"delete_task_link" => $delete_task_link,
		"delete_task" => $delete_task,
	);

}

function complete_task_query($task_id){
	$action_table = "operations";

	$select_task = "SELECT * FROM $action_table WHERE id = '$task_id'";

	$complete_task = "UPDATE $action_table SET progress = 1, status = 1 WHERE id='$task_id'";	

	return array(
		"select_task" => $select_task,
		"complete_task" => $complete_task,
	);
}


function delete_task_link_query($link_id){

	$action_table = "operations_links";

	$select_link = "SELECT * FROM $action_table WHERE id = '$link_id'";

	$delete_task = "DELETE FROM $action_table WHERE id='$link_id'";

	return array(
		"select_task" => $select_task,
		"delete_task" => $delete_task,
	);	
}


function update_system_settings($field_value, $field_name){
	$action_table = "system_settings";
	$query = "UPDATE $action_table SET value='$field_value' WHERE name='$field_name' ";
	return $query;
}

function get_all_operations(){
	return "SELECT * FROM `operations`";
}

function convert_data_to_current_date_time_query($new_start, $new_end, $id, $DocEntry = NULL ){
	$query = "UPDATE operations SET start_date = '$new_start', end_date = '$new_end' WHERE id='$id'";
	return $query;
}
?>