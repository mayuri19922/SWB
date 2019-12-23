<?php 


// database functions
// set SQL modes 
try{
	$conn->query("SET global sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
	
}  catch(PDOException $e) {
	// echo $e->getMessage(); 
}

function is_sfdc_installed(){
	global $conn;
	$query = check_sfdc_installed_query();
	$result = $conn->query($query);
	$installed_prod_data = $result->fetchAll();	
	if (count($installed_prod_data) > 0) {
		return 1;
	} else {
		return 0;
	}
}


//  Data functions 
function get_resources_task_priority($presentation_type = NULL, $default_work_center ){
	$get_all_resources  = get_all_resources($default_work_center);
	$get_task_type      = get_task_type();
	$priority_list      = priority_list();
	$work_centers       = get_work_centers($default_work_center);
	$work_order         = get_work_order();

	$get_all_resources  = json_decode($get_all_resources, true);
	$get_task_type      = json_decode($get_task_type, true);
	$priority_list      = json_decode($priority_list, true);
	$work_centers       = json_decode($work_centers, true);
	$work_order         = json_decode($work_order, true);

	$get_all_resources  = $get_all_resources['data'];
	$get_task_type      = $get_task_type['data'];
	$priority_list      = $priority_list['data'];
	$work_centers       = $work_centers['data'];
	$work_order         = $work_order['data'];

	return  json_encode(
		array(
			"resources"      => $get_all_resources, 
			"task_type"      => $get_task_type, 
			"priority_list"  => $priority_list,
			"work_centers"   => $work_centers,
			"work_order"     => $work_order,
		) 
	);
}


function get_work_order(){
	global $conn;
	$sql = work_order_query();
	$result = $conn->query($sql);
	if($result){

		$work_order_dataset = $result->fetchAll();	
		if (count($work_order_dataset) > 0) {
			$output = "";
			foreach($work_order_dataset as $row) {
				$temp = array(
					"key"=>$row['work_order_number'],
					"label"=>ucfirst($row['work_order_number']),
				);
				$output[] = $temp;
			}

			return json_encode(array("data"=>$output));

		} else {
			return json_encode(array("data"=>'none'));
		}
	} else {
		return json_encode(array("data"=>'none'));
	}
}


function get_work_centers($default_work_center = NULL){
	global $conn;
	$sql = work_center_query($default_work_center);
	$result = $conn->query($sql);
	$work_center_dataset = $result->fetchAll();	
	if (count($work_center_dataset) > 0) {
		$output = "";
		foreach($work_center_dataset as $row) {
			$temp = array(
				"key"=>$row['id'],
				"label"=>utf8_encode(ucfirst($row['name'])),
			);
			$output[] = $temp;
		}
		// print_r($output); die;
		return json_encode(array("data"=>$output));

	} else {
		return json_encode(array("data"=>'none'));
	}

}

function get_all_resources($default_work_center = NULL){
	global $conn;
	
	$sql = resource_list_query($default_work_center);
	$result = $conn->query($sql);
	$resource_dataset = $result->fetchAll();	
	
	if (count($resource_dataset) > 0) {
		$output = "";
		$res_id = 1;
		foreach($resource_dataset as $row) {
			$temp = array(
				"id" => $res_id,
				"key" => $row['id'],
				"label" => ucfirst(utf8_encode($row['work_center_id']). ' - ' . utf8_encode($row['name'])),
				"resource_name" => utf8_encode($row['name']),
				"work_center_id" => $row['work_center_id']
			);
			$output[] = $temp;
			$res_id++;
		}		

		return json_encode(array("data"=>$output));

	} else {
		return json_encode(array("data"=>'none'));
	}

}

function get_schedular_work_center_resources(){
	global $conn;
	$sql = schedular_work_center_query();
	$result = $conn->query($sql);
	$schedular_wc_dataset = $result->fetchAll();
	if (count($schedular_wc_dataset) > 0) {
		$output = "";
		$temp_data = array();
		foreach($schedular_wc_dataset as $row) {
			$temp = array(
				"key"=>"wc-".$row['work_center_id'],
				"label"=>(ucfirst($row['work_center_name'])),
				"open"=> (boolean)1,
				"children"=> [],
			);
			if(!isset($temp_data[$row['work_center_id']])){
				$temp_data[$row['work_center_id']] = $temp;
			}

			if($row['resource_id']!=""){
				$temp_data[$row['work_center_id']]["children"][] = array("key" => $row['resource_id'], "label" => (ucfirst($row['resource_name'])));
			}
		}
		$temp_data = array_values($temp_data);	
		return json_encode(array("data"=>$temp_data));

	} else {
		return json_encode(array("data"=>'none'));
	}

}

/*function get_refresh_status(){
	global $conn;
	$get_data  = $_GET;
	$from_date  = (isset($get_data['from_date'])) ? $get_data['from_date'] : "";
	$to_date  = (isset($get_data['to_date'])) ? $get_data['to_date'] : "";
	$reference_id  = (isset($get_data['reference_id'])) ? $get_data['reference_id'] : "";

	$status_query = refresh_status_query($from_date, $to_date, $reference_id);
	// echo $status_query; die;
	$status_query_res = $conn->query($status_query);
	$status_dataset = $status_query_res->fetchAll();
	if (count($status_dataset) > 0) {
		$progress_data = array();
		foreach($status_dataset as $row) {
			$progress = ''; 
			if($row['U_OPTM_OPERPROGRESS']!=''){
				$progress = $row['U_OPTM_OPERPROGRESS']; 
			} else if($row['U_OPTM_PROGRESS']!=''){
				$progress = $row['U_OPTM_PROGRESS']; 
			}
			$priority = $row['priority'];
			
			$update_query = aps_progress_update_query($row['oper_id'], $progress, $row['head_doc_entry'], $row['oper_doc_entry'], $row['oper_line_id'], $priority );
			// echo $update_query; echo '<br>';
			$update_query_res = $conn->exec($update_query);

			$progress_data[] = array("oper_id" => $row['oper_id'], "progress" => $progress, 'priority' => $priority);

		}
		return json_encode(array("data" => $progress_data));
	} else {
		return json_encode(array("data" => 'none'));
	}

	exit;
}*/

function get_refresh_status(){
	global $conn;
	$get_data  = $_GET;
	$from_date  = (isset($get_data['from_date'])) ? $get_data['from_date'] : "";
	$to_date  = (isset($get_data['to_date'])) ? $get_data['to_date'] : "";
	$reference_id  = (isset($get_data['reference_id'])) ? $get_data['reference_id'] : "";
	$result = 0;
	$progress_data = array();
	$wo_status_query = get_work_order_prod_status_query($reference_id);
	// echo $wo_status_query; 
	$wo_status_query_res = $conn->query($wo_status_query);
	$wo_status_dataset = $wo_status_query_res->fetchAll();
	if (count($wo_status_dataset) > 0) {
		
		foreach($wo_status_dataset as $row) {
			$progress = ($row['progress']!= "" && $row['progress']!=NULL) ? $row['progress'] : 0;
			if($progress != 0){
				$progress = ($progress/100);
			}

			$priority = $row['priority'];
			if($priority >= 1 && $priority <= 10 ){ // high
				$priority  = 1;
			} else if($priority >= 11 && $priority <= 30 ){ // medium
				$priority  = 11;
			} else if($priority >= 31 && $priority <= 99 ){  //low 
				$priority  = 31;
			}

			$wo_update_query = update_work_order_prod_status_query($row['oper_id'], $row['ref_id'], $row['wo_id'], $priority, $progress);

			$priority_query_res = $conn->query($wo_update_query['priority_query']);

			$progress_query_res = $conn->query($wo_update_query['progress_query']);	

			$progress_data[$row['oper_id']] = array("oper_id" => $row['oper_id'], "progress" => $progress, 'priority' => $priority);
		}
		
	} 
	
	$oper_status_query = get_operation_status_query($reference_id);
	// echo $oper_status_query; die;
	$oper_status_query_res = $conn->query($oper_status_query);
	$oper_status_dataset = $oper_status_query_res->fetchAll();
	if (count($oper_status_dataset) > 0) {
		foreach($oper_status_dataset as $row) {
			$progress = ($row['operation_progress']!= "" && $row['operation_progress']!=NULL) ? $row['operation_progress'] : 0;
			if($progress != 0){
				$progress = ($progress/100);
			}
			$operation_progress = update_oper_status_query($row['oper_id'], $progress);
			$operation_progress_query_res = $conn->query($operation_progress);	
			$progress_data[$row['oper_id']] = array("oper_id" => $row['oper_id'], "progress" => $progress);
		}
		
	} 

	return  json_encode(array("data" => $progress_data));
}

function get_refresh_data(){
	global $conn;
	$get_data  = $_GET;
	$from_date  = (isset($get_data['from_date'])) ? $get_data['from_date'] : "";
	$to_date  = (isset($get_data['to_date'])) ? $get_data['to_date'] : "";
	$reference_id  = (isset($get_data['reference_id'])) ? $get_data['reference_id'] : "";
	$work_center = (isset($get_data['default_work_center']) && $get_data['default_work_center']!="") ? $get_data['default_work_center'] : "";

	$select_work_orders = refresh_work_order_prod_query($from_date, $to_date, $work_center);
	// echo $select_work_orders; die;
	$select_work_orders_result = $conn->query($select_work_orders);
	$work_order_dataset = $select_work_orders_result->fetchAll();
	$return_data = 'none';
	if (count($work_order_dataset) > 0) {
		$data_local_wo = insert_aps_work_order($reference_id, $work_order_dataset);
		// echo $data_local_wo; die;
		if(strstr($data_local_wo['insert_query'], ";")){
			$query_arr = explode(';', $data_local_wo['insert_query']);
			foreach($query_arr as $insert){
				if(trim($insert)!=""){
					$insert_local_wo_res = $conn->query($insert);	
				}
			}
		} else {
			$insert_local_wo_res = $conn->query($data_local_wo['insert_query']);

		}

		// $work_order_id = $conn->lastInsertId();
		$select_operation = operation_task_query_prod("", "", $work_center, $data_local_wo['inserted_wo'] );
		// echo $select_operation; die;
		$select_operation_result = $conn->query($select_operation);
		$operation_dataset = $select_operation_result->fetchAll();
		if (count($operation_dataset) > 0) {
			$insert_local_opr = insert_aps_operations($reference_id, $operation_dataset);
			// echo $insert_local_opr; die;
			if(strstr($insert_local_opr['query'], ";")){
				$query_arr = explode(';', $insert_local_opr['query']);
				foreach($query_arr as $insert){
					if(trim($insert)!=""){
						$insert_local_res = $conn->query($insert);	
					}
				}
			} else {
				$insert_local_res = $conn->query($insert_local_opr['query']);

			}
			// dump data - Operations Links
			$operation_query = get_aps_operations("", "", $reference_id , $work_center, $data_local_wo['inserted_wo']);
			// echo $operation_query; die;
			$aps_opr_select = $conn->query($operation_query);
			$aps_opr_dataset = $aps_opr_select->fetchAll();

			if (count($aps_opr_dataset) > 0) {

				$insert_opr_links  = insert_aps_links();
				foreach($aps_opr_dataset as $row) {
					$temp_string = "";
					$parent_wo  = $row['parent'];
					$source_opr =  $row['source_id'];
					$target_opr = $row['id'];
					if($row['operation_type'] != "project"){
						if($source_opr!=""){
							$connection = 0;
							$parent_task = $source_opr;
						} else if($parent_wo!=""){
							$connection = 1;
							$parent_task = $parent_wo;
						}
						$temp_string = " ('$reference_id', '$parent_task','$target_opr','$connection') ";
						
						$query = $insert_opr_links . ' '. $temp_string;
						$insert_opr_result = $conn->query($query);
						
					}
					
				}

				$return_data = '1';
			}
		}

		$response = get_cancelled_status($reference_id);
		if($response == 1){
			$return_data = '1';
		} 

		return json_encode(array("data"   =>  $return_data));

	} else {
		$response = get_cancelled_status($reference_id);
		if($response == 1){
			$return_data = '1';
		} 

		return json_encode(array("data" => $return_data));
	}
	die;
}

function get_cancelled_status($ref_id){
	global $conn;

	$cancelled_order_query = refresh_wo_status_change_query($ref_id);
	$cancelled_order_query_res = $conn->query($cancelled_order_query);
	$status_dataset = $cancelled_order_query_res->fetchAll();
	if (count($status_dataset) > 0) {
		foreach($status_dataset as $row){
			$update_query = aps_wo_oper_status_update_query($row['oper_id'],  $row['prod_wo_status'] );
			$update_query_res = $conn->exec($update_query);
		}
		return 1;
	} else {
		return 0;
	}

}

function get_operations($presentation_type = NULL, $work_center = NULL){
	global $conn;
	global $db_date_format;
	if(isset($_GET['action']) && $_GET['action']!=""){
		$start_date = date($db_date_format, strtotime($_GET['from_date']));
		$end_date   = date($db_date_format, strtotime($_GET['to_date']));
		
	} else {

		$range_for_data  =(6 - date('w'));

		$start_date = date($db_date_format, strtotime("-". $range_for_data ." days"));
		$end_date = date($db_date_format, strtotime("+". $range_for_data ." days"));
	}

	$ref_id = (isset($_GET['reference_id']) && $_GET['reference_id']!="") ? $_GET['reference_id'] : "";
	
	$task_data = "";
	
	$select_operation = get_aps_operations($start_date, $end_date, $ref_id, $work_center);
	 // echo '<pre>'. $select_operation; 
	$select_operation_result = $conn->query($select_operation);
	$operation_dataset = $select_operation_result->fetchAll();
	if (count($operation_dataset) > 0) {
		
		$task_links = "";
		$open = "true";
		$get_limited_links = array();
		$available_wo = array();
		foreach($operation_dataset as $row) {
			if($work_center!=""){
				$get_limited_links[] = (int)$row['id'];
			}
			$readonly = "";
			if($row['readonly'] == "true"){
				$readonly = 1;
			} else {
				$readonly = 0;
			}
			if($presentation_type == "gantt_chart"){
				$resourceID = "";
				$res_list = json_decode(get_all_resources($work_center), true);
				if($res_list['data']!= 'none'){
					foreach ($res_list['data'] as $key => $val) {
						if ($val['key'] == trim($row['resource_id']) && $val['work_center_id'] == trim($row['work_center_id'])) {
							$resourceID = ($res_list['data'][$key]["id"]);
						}
					}	
				}
				

				$data_temp = array(
					"id"                       => (int)$row['id'], 
					"ref_id"                   => (int)$row['ref_id'], 
					"task_type"                => $row['task_type'], 
					"type"                     => $row['operation_type'],
					"work_center"              => $row['work_center_id'],
					"start_date"               => change_date_format(trim($row['start_date'])),
					"end_date"                 => change_date_format(trim($row['end_date'])),
					"work_order"               => ($row['operation_type'] =="task") ? $row['work_order_id'] : (int)0,
					"operation_number"         => utf8_encode($row['operation_number']),
					"status"                   => ($row['status']) ? $row['status'] : (int)0,
					"head_doc_entry"           => (int)$row['head_doc_entry'],
					"oper_doc_entry"           => (int)$row['oper_doc_entry'],
					"oper_line_id"             => (int)$row['oper_line_id'],
					"res_line_id"              => (int)$row['res_line_id'],
					"is_saved"                 => (int)1,
					"required_resource"        =>  trim($row['required_resource']), 
					"resourceID"               =>  $resourceID,
					"resource"                 =>  utf8_encode(trim($row['resource_id'])), 
					"resource_name"            =>  utf8_encode(trim($row['resource_name'])), 
					"text"                     =>  utf8_encode($row['operation_code']), 
					"priority"                 => (int)$row['priority'], 
					"progress"                 => (float)$row['progress'], 
					"parent"                   => (int)$row['parent'], 
					"duration"                 => ((int)$row['duration']!= 0 && $row['duration']!="") ? (int) $row['duration'] : (int) $row['min_duration'], 
					"min_duration"             =>  (int)$row['min_duration'], 
					"description"              => utf8_encode($row['description']), 
					"is_local_task"            => (int)$row['is_local_task'], 
					"split_task_grp_id"        => (int)$row['split_task_grp_id'], 
					"readonly"                 => (boolean)$readonly, 
					"open"                     => (boolean)1,

				);

				if(!in_array($row['work_order_id'], $available_wo)){
					array_push($available_wo, $row['work_order_id']);
				}
				

			} else if($presentation_type == "schedular") {
				if($row['operation_type'] != "work_order"){

					$data_temp = array(
						"id"                   => $row['id'], 
						"text"                 => ucfirst($row['name']), 
						"start_date"           => $row['start_date'],
						"end_date"             => $row['end_date'],
						"section_id"           => $row['resource_id'], 
						"open"                 => $open, 
					//	"color"                => priority_data($row['priority'], "color"), //$row['priority']
						"is_saved"             => 1,
					);
				}
			}

			if(isset($data_temp) && $data_temp!=""){
				$task_data[] = $data_temp;
			}
		}

		// task links 
		if($presentation_type == "gantt_chart"){

			$operation_ids = "";
			if(!empty($get_limited_links)){
				$get_limited_links = array_unique($get_limited_links);
				$operation_ids = "'".implode("','", $get_limited_links)."'";
				
			}
			
			$select_operation_links = gant_chart_links_query($operation_ids, $ref_id); 
			//  echo $select_operation_links; die;
			$select_operation_links_res = $conn->query($select_operation_links);
			$operation_link_dataset = $select_operation_links_res->fetchAll();
			if (count($operation_link_dataset) > 0) {
				foreach($operation_link_dataset as $link_row) {
					$link_temp = array(
						"id"             => "link-".$link_row['id'],
						"ref_id"        => $link_row['ref_id'],
						"is_saved"       => 1,
						"source"         => $link_row['source'],
						"target"         => $link_row['target'],
						"type"           => (int)$link_row['connection_type'],
						"link_id"        => $link_row['id'],
						
					);	

					$task_links[] = $link_temp;
				}
			}
		}

		return json_encode(
			array(
				"data"=>$task_data, 
				"links"=> $task_links, 
			)
		);
	} else {
		return json_encode(array("data"=>'none'));
	}

	exit;
	
}


function save_update_task(){
	global $conn;
	$post_data  = $_POST;
	$task_data  = (isset($post_data['task_data'])) ? $post_data['task_data'] : "";
	$link_data  = (isset($post_data['links'])) ? $post_data['links'] : "";
	$from_date  = (isset($post_data['from_date'])) ? $post_data['from_date'] : "";
	$to_date  = (isset($post_data['to_date'])) ? $post_data['to_date'] : "";
	$reference_id  = (isset($post_data['reference_id'])) ? $post_data['reference_id'] : "";
	
	// print_r($task_data); die;
	$count = 0;
	$new_tasks = array();
	$new_links = array();
	if($task_data!="") {
		foreach($task_data as $key => $tasks){
			// print_r($tasks);
			if(!isset($tasks['$virtual'])){
		//		echo 'in action ';
		//		echo '<br>';
				$start_date = (isset($tasks['start_date']) && $tasks['start_date']!="") ? explode("(", $tasks['start_date'])[0]: "";
				$end_date   = (isset($tasks['start_date']) && $tasks['start_date']!="") ? explode("(",$tasks['end_date'])[0]: "";

				$tasks['readonly'] = (isset($tasks['readonly']) && $tasks['readonly']!='') ? $tasks['readonly'] : (int)0;
				
				if($tasks['readonly'] == 'false'){
					$tasks['readonly'] = 0;
				} else { 
					$tasks['readonly'] = 1;
				}

				$tasks['start_date'] = change_db_date_format($start_date);
				$tasks['end_date'] = change_db_date_format($end_date);
				$tasks['progress'] = (isset($tasks['progress']) && $tasks['progress']!="") ? $tasks['progress'] : (int)0;
				$tasks['resource'] = (isset($tasks['resource']) && $tasks['resource']!="") ? $tasks['resource'] : (int)0;
				$tasks['resource_name'] = (isset($tasks['resource_name']) && $tasks['resource_name']!="") ? ($tasks['resource_name']) : "";
				$tasks['priority'] = (isset($tasks['priority']) && $tasks['priority']!="") ? $tasks['priority'] : (int)99;
				$tasks['status']   = (isset($tasks['status']) && $tasks['status']!="") ? $tasks['status'] : (int)0;
				$tasks['task_type']= (isset($tasks['task_type']) && $tasks['task_type']!="") ? $tasks['task_type'] : 'operation';
				$tasks['work_order_id'] = (isset($tasks['work_order']) && $tasks['work_order']!="") ? utf8_decode($tasks['work_order']) : (int)rand(99,999);
				$tasks['work_center'] = (isset($tasks['work_center']) && $tasks['work_center']!="") ? utf8_decode($tasks['work_center']) : (int)0;

				$tasks['head_doc_entry'] = (isset($tasks['head_doc_entry']) && $tasks['head_doc_entry']!="") ? $tasks['head_doc_entry'] : (int)0;
				$tasks['oper_doc_entry'] = (isset($tasks['oper_doc_entry']) && $tasks['oper_doc_entry']!="") ? $tasks['oper_doc_entry'] : (int)0;
				$tasks['oper_line_id'] = (isset($tasks['oper_line_id']) && $tasks['oper_line_id']!="") ? $tasks['oper_line_id'] : (int)0;
				$tasks['res_line_id'] = (isset($tasks['res_line_id']) && $tasks['res_line_id']!="") ? $tasks['res_line_id'] : (int)0;
				$tasks['split_task_group_id']   = (isset($tasks['split_task_group_id']) && $tasks['split_task_group_id']!="") ? $tasks['split_task_group_id'] : (int)0;
				$tasks['text'] = (isset($tasks['text']) && $tasks['text']!="") ? utf8_decode($tasks['text']) : "";
				$tasks['description'] = (isset($tasks['description']) && $tasks['description']!="") ? utf8_decode($tasks['description']) : '';
				$tasks['duration'] = (isset($tasks['duration']) && $tasks['duration']!="") ? $tasks['duration'] : "";
				$tasks['min_duration']   = (isset($tasks['min_duration']) && $tasks['min_duration']!="") ? $tasks['min_duration'] : $tasks['duration'];
				
				$tasks['operation_number'] = (isset($tasks['operation_number']) && $tasks['operation_number']!="") ? $tasks['operation_number'] : rand(99,999);

				$result = "";
				if(isset($tasks['is_saved']) && $tasks['is_saved']== 1){
					
					$query = update_aps_operations($tasks, $tasks['id']);
					$result = $conn->query($query);
				} else {
					$tasks['status'] = 0;
					$tasks['work_center_id'] = 1;
					$tasks['is_local_task'] = 1;
					
					$query  = insert_new_aps_opr($reference_id, $tasks);	
					$result = $conn->query($query); 	
					//$insert_id = $conn->lastInsertId();
					$get_aps_id_query = get_last_aps_id();
					$aps_result = $conn->query($get_aps_id_query);
					$insert_id = $aps_result->fetch(PDO::FETCH_ASSOC)['id'];

					$new_tasks[$tasks['id']] = array("current_id"=> $tasks['id'], "new_id"=> $insert_id);
				}

				if($result){
					$count++;
				}
				$result= "";
			}
		}
	}

	 // update links
	$links_new_soure_target = array();
	if($link_data!=""){

		// echo '<pre>';	print_r($link_data); die;
		foreach($link_data as $key => $links){
			if(isset($new_tasks[$links['source']]) && $new_tasks[$links['source']]!= ""){
				$links['source'] = $new_tasks[$links['source']]['new_id'];
			}
			
			if(isset($new_tasks[$links['target']]) && $new_tasks[$links['target']]!= ""){
				$links['target'] = $new_tasks[$links['target']]['new_id'];
			}

			if(isset($links['is_saved']) && $links['is_saved']== 1){
				$link = explode('link-', $links['id']);
				$query = update_aps_links($links, $link[1]);
				// echo $query; echo '<br><br>';
				$result = $conn->query($query);
				$links_new_soure_target[$links['id']] = array("source"=>$links['source'], "target"=>$links['target']);	
				
			} else {
				

				$ref_id = (isset($links['ref_id']) && $links['ref_id']!="") ? $links['ref_id'] : $reference_id;
				$link_query = "('$ref_id', '$links[source]', '$links[target]', '$links[type]' )";
				$query = insert_aps_links($link_query);
				$result = $conn->query($query);
				// $insert_id = $conn->lastInsertId();
				$get_opr_link_query = get_last_opr_link_id();
				$link_result = $conn->query($get_opr_link_query);
				$insert_id = $link_result->fetch(PDO::FETCH_ASSOC)['id'];


				$new_links[] = array("current_id"=> $links['id'], "new_id"=> $insert_id);
				$links_new_soure_target["link-".$insert_id] = array("source"=>$links['source'], "target"=>$links['target']);	
			}
			
		}
	}

	if($count > 0){
		$update_ref = update_reference_status_query("draft", $reference_id);
		$update_ref_res = $conn->query($update_ref);
		$output = array("success"=>true, "data"=> $new_tasks, "links"=>$new_links, "new_source_target"=>$links_new_soure_target);
		// print_r($output); die;
		return json_encode($output);

	} else {
		return json_encode(array("success"=>false, "data"=> ""));

	}

}

function push_to_production(){
	global $conn;
	
	$reference_id = (isset($_POST['reference_id']) && $_POST['reference_id']!="") ? $_POST['reference_id'] : "";
	$select_operation = get_aps_operations("", "", $reference_id, '');
	//   echo '<pre>'. $select_operation; die;
	$select_operation_result = $conn->query($select_operation);
	$operation_dataset = $select_operation_result->fetchAll();
	$success_count = 0;
	if (count($operation_dataset) > 0) {
		foreach($operation_dataset as $row) {
			if($row['is_local_task'] != 1) {
				$row['start_time'] = change_date_to_int_time($row['start_date']);
				
				$row['end_time']   = change_date_to_int_time($row['end_date']);

				$row['readonly'] = (isset($row['readonly']) && trim($row['readonly'])!=='') ? $row['readonly']: '';
				$row['description'] = (isset($row['description']) && trim($row['description'])!=='') ? ($row['description']): '';

				$row['status'] = (isset($row['status']) && trim($row['status'])!=='') ? $row['status']: ''; 

				$row['duration'] = (isset($row['duration']) && trim($row['duration'])!=='') ? $row['duration']: '000';

				$update_query = update_task_query($row['operation_type'], $row);
			//	echo '<pre>'; print_r($update_query); 
				if($row['operation_type'] == 'project') {
					$update_query_res = $conn->query($update_query['update_prod_head']);
				} else if($row['operation_type'] == 'task') {
					$update_query_res = $conn->query($update_query['update_prod_oper']);
				}

				if($update_query_res->rowCount()) {
					$success_count++;
				}
				
			}
		}

		if($success_count > 0) {
			$update_ref = update_reference_status_query("pushed", $reference_id);
			$update_ref_res = $conn->query($update_ref);
			$output = array("success" => true, "data"=> array(), "links"=> array(), "new_source_target"=> array());
		} else {
			$output = array("success" => false, "data"=> array(), "links"=> array(), "new_source_target"=> array());	
		}
	} else {
		$output = array("success" => false, "data"=> array(), "links"=> array(), "new_source_target"=> array());
	}

	return json_encode($output);
}	

function delete_saved_task(){
	global $conn;
	
	$task_id = (isset($_GET['task_id']) && $_GET['task_id']!="") ? $_GET['task_id'] : "";
	$reference_id = (isset($_GET['reference_id']) && $_GET['reference_id']!="") ? $_GET['reference_id'] : "";
	$delete_task_queries = delete_task_query($task_id);
	
	$select_task = $delete_task_queries['select_task'];
	$select_task_res = $conn->query($select_task);
	if (count($select_task_res->fetch(PDO::FETCH_ASSOC)) > 0) {

		$del_link = (isset($_GET['delete_link']) && $_GET['delete_link']!="") ? $_GET['delete_link'] : "";
		if($del_link == 1){
			$delete_task_link = $delete_task_queries['delete_task_link'];
			$delete_task_link_res = $conn->query($delete_task_link);
		}	

		$delete_task = $delete_task_queries['delete_task'];	
		$delete_task_res = $conn->query($delete_task);

		if($delete_task_res->rowCount() > 0){
			$update_ref = update_reference_status_query("draft", $reference_id);
			$update_ref_res = $conn->query($update_ref);

			$output = array(
				"success" => 'custom_success',
				"message" => "task_is_deleted",
				"task_id"=>$task_id,
			);
		} else {
			$output = array(
				"success" => 'error',
				"message" => 'global_error_msg',
				"task_id"=>'',
			);	
		}

	} else {
		$output = array(
			"success" => 'error',
			"message" => 'no_such_opr_exists',
			"task_id"=>'',
		);
	}

	return json_encode($output);
}

function complete_selected_task(){
	global $conn;
	$task_id = (isset($_GET['task_id']) && $_GET['task_id']!="") ? $_GET['task_id'] : "";
	$reference_id = (isset($_GET['reference_id']) && $_GET['reference_id']!="") ? $_GET['reference_id'] : "";
	if(is_sfdc_installed()){
		$completed_task_query = complete_task_query($task_id);
	} else {
		$completed_task_query = complete_task_query($task_id);
	}
	$select_task = $completed_task_query['select_task'];
	$select_task_res = $conn->query($select_task);
	if (count($select_task_res->fetch(PDO::FETCH_ASSOC)) > 0) {
		
		$complete_task_res = $conn->query($completed_task_query['complete_task']);

		if($complete_task_res->rowCount() > 0){
			$update_ref = update_reference_status_query("draft", $reference_id);
			$update_ref_res = $conn->query($update_ref);
			$output = array(
				"success" => 'custom_success',
				"message" => "task_is_completed",
				"task_id"=>$task_id,
			);
		} else {
			$output = array(
				"success" => 'error',
				"message" => 'global_error_msg',
				"task_id"=>'',
			);	
		}

	} else {
		$output = array(
			"success" => 'error',
			"message" => 'no_such_opr_exists',
			"task_id"=>'',
		);
	}
	return json_encode($output);
}

function delete_task_link(){
	global $conn;
	
	$link_id = (isset($_GET['link_id']) && $_GET['link_id']!="") ? $_GET['link_id'] : "";
	$reference_id = (isset($_GET['reference_id']) && $_GET['reference_id']!="") ? $_GET['reference_id'] : "";
	if($link_id!=""){

		$delete_task_link_queries = delete_task_link_query($link_id);
		// print_r($delete_task_link_queries); 

		$select_link = $delete_task_link_queries['select_link'];
		$select_link_res = $conn->query($select_link);
		if ($select_link_res) {
			$delete_task = $delete_task_link_queries['delete_link'];	
			$delete_task_res = $conn->query($delete_task);

			if($delete_task_res->rowCount() > 0){
				$update_ref = update_reference_status_query("draft", $reference_id);
				$update_ref_res = $conn->query($update_ref);
				$output = array(
					"success" => 'custom_success',
					"message" => "link_is_deleted",
					"link_id" => $link_id,
				);
			} else {
				$output = array(
					"success" => 'error',
					"message" => 'global_error_msg',
					"link_id" =>'',
				);	
			}
		} else {
			$output = array(
				"success" => 'error',
				"message" => 'no_such_link_exists',
				"link_id" =>'',
			);
		}
	} else {
		$output = array(
			"success" => 'error',
			"message" => 'link_id_missing',
		);
	}

	return json_encode($output);
}


function get_system_settings(){
	global $conn;
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$select_settings_query = system_setting_query();
	// echo $select_settings_query;
	$select_setting_res = $conn->query($select_settings_query);
	//print_r($select_setting_res);
	$setting_dataset = $select_setting_res->fetchAll(PDO::FETCH_ASSOC);
	// echo '<pre>';  print_r($setting_dataset); print_r($select_setting_res->fetchColumn());

	//die;
	if (count($setting_dataset) > 0) {
		$setting_data = array();
		foreach($setting_dataset as $setting_row) {

			$setting_value = $setting_row['value1']. ''. @$setting_row['value2'];
			if(is_numeric($setting_value)){
				$setting_value = (int)$setting_value;
			} 
			if(is_array(json_decode($setting_value, true))){
				$setting_value = json_decode($setting_value, true);
			}
			$setting_data[$setting_row['name'] ] = $setting_value;
		}	
		$output = array(
			"success" => 'custom_success',
			"message" => 'no_config_exist',
			"data"    => $setting_data
		);
	} else {
		$output = array(
			"success" => 'error',
			"message" => 'config_avail',
		);
	}

	return json_encode($output);
}

function save_system_settings(){
	global $conn;
	$post_data  = $_POST;
	// print_r($post_data);
	
	$succes_count = 0;
	foreach($post_data as $field_name => $field_value){
		if(is_array($field_value)){
			$field_value = json_encode($field_value);
		}
		$update_settings = update_system_settings($field_value, $field_name);
		$update_settings_res = $conn->query($update_settings);
		if($update_settings_res->rowCount() > 0){
			$succes_count++;
		}
	}
	if($succes_count > 0){
		$output = array(
			"success" => 'custom_success',
			"message" => 'config_saved',
		);
	} else {
		$output = array(
			"success" => 'error',
			"message" => 'global_error_msg',
		);
	}
	return json_encode($output);
}


function shift_capacity_details(){
	// echo '<pre>';
	global $conn;

	$get_data  = $_GET;
	$from_date  = (isset($get_data['from_date'])) ? $get_data['from_date'] : "";
	$to_date  = (isset($get_data['to_date'])) ? $get_data['to_date'] : "";
	$reference_id  = (isset($get_data['reference_id'])) ? $get_data['reference_id'] : "";
	$work_center = (isset($get_data['default_work_center']) && $get_data['default_work_center']!="") ? $get_data['default_work_center'] : "";

	$from_date = (isset($from_date) && $from_date!="") ? explode("(", $from_date)[0]: "";
	$to_date   = (isset($to_date) && $to_date!="") ? explode("(",$to_date)[0]: "";

	// echo '<br>';
	$from_date = change_db_date_format($from_date);
	$to_date = change_db_date_format($to_date);

	$capacity_query = shift_capacity_details_query(get_only_date($from_date), get_only_date($to_date), $reference_id, $work_center);
	// print_r($capacity_query); die;
	// echo '<br>'. $capacity_query['total_avail_res_query'];  
	$total_resource_res = $conn->query($capacity_query['total_res_query']);
	$total_res_dataset = $total_resource_res->fetchAll();
	
	$total_res_data = array();
	if (count($total_res_dataset) > 0) {
		foreach($total_res_dataset as $total_row) {
			$total_row['shift_id'] = utf8_encode($total_row['shift_id']);
			$total_row[0] = utf8_encode($total_row[0]);
			$total_row['work_center_id'] = utf8_encode($total_row['work_center_id']);
			$total_row[2] = utf8_encode($total_row[2]);
			$total_row['resource'] = utf8_encode($total_row['resource']);
			$total_row[3] = utf8_encode($total_row[3]);
			if(!isset($total_res_data[$total_row['work_center_id']]) || (!isset($total_res_data[$total_row['work_center_id']][$total_row['resource']]))) {
				$total_res_data[$total_row['work_center_id']][$total_row['resource']] = 0;
			}
			($total_res_data[$total_row['work_center_id']][$total_row['resource']]=="")? $total_res_data[$total_row['work_center_id']][$total_row['resource']]=+1 : $total_res_data[$total_row['work_center_id']][$total_row['resource']]++;
			
		}
	}

	// echo '<pre>'; print_r($total_res_data);
	// echo '<br>'.  $capacity_query['total_avail_res_query'];//  die;
	$total_avail_res = $conn->query($capacity_query['total_avail_res_query']);
	$total_avail_dataset = $total_avail_res->fetchAll();
	
	$total_avail_data = array();
	$total_bal_data = array();
	if (count($total_avail_dataset) > 0) {
		
		foreach($total_avail_dataset as $avail_row) {
			$avail_row['shift_id'] = utf8_encode($avail_row['shift_id']);
			$avail_row[0] = utf8_encode($avail_row[0]);
			$avail_row['work_center_id'] = utf8_encode($avail_row['work_center_id']);
			$avail_row[5] = utf8_encode($avail_row[5]);
			$avail_row['resource'] = utf8_encode($avail_row['resource']);
			$avail_row[6] = utf8_encode($avail_row[6]);
			$temp_shift_array = array();
			if(!isset($total_res_data[$total_row['work_center_id']])) {
				$total_avail_data[$avail_row['work_center_id']][$avail_row['resource']] = 0;
			}

			if($avail_row['shift_start']!=""){
				$shift_start_val = $avail_row['shift_start'];
			} else {
				$shift_start_val = str_pad(0, 3, 0, STR_PAD_LEFT);
			}

			for($j = 0; $j <= round($avail_row['avail_capacity']); $j++){

				$new_start_time = ($shift_start_val + $j*100);
				if($new_start_time <= 900){
					$new_start_time = "0".$new_start_time; 
				} 
				$temp_shift_array[$new_start_time] = ($new_start_time != $avail_row['break_start_time']) ? $total_res_data[$avail_row['work_center_id']][$avail_row['resource']] : 0;
			}
			$total_avail_data[$avail_row['work_center_id']][$avail_row['resource']] = $temp_shift_array;
			$total_avail_data[$avail_row['work_center_id']][$avail_row['resource']]['break_time']= $avail_row['break_start_time'];

			$temp_bal_array = array();
			if(!isset($total_res_data[$total_row['work_center_id']])) {
				$total_bal_data[$avail_row['work_center_id']][$avail_row['resource']] = 0;
			}

			for($j = 0; $j <= round($avail_row['avail_capacity']); $j++){
				$new_start_time_2 =($shift_start_val + $j*100);

				$temp_bal_array[$new_start_time_2] = ($new_start_time_2 != $avail_row['break_start_time']) ? $total_res_data[$avail_row['work_center_id']][$avail_row['resource']] : 0;
			}
			$total_bal_data[$avail_row['work_center_id']][$avail_row['resource']] = $temp_bal_array;
		}

	}
	

	if(!empty($total_res_data) && !empty($total_avail_data)){
		$output = array(
			"success"=> 'custom_success',
			"message"=> 'caacity_found_msg',
			"total_resource" => $total_res_data, 
			'total_avail'=>$total_avail_data,
			'total_bal'=>$total_bal_data,
		);

	} else {
		$output = array(
			"success"=> 'none',
			"message"=> 'global_error_msg',
			"total_resource" => $total_res_data, 
			'total_avail'=>$total_avail_data
		);
	}
	// print_r($output); die;
	echo json_encode($output);
}

//  V0.1.2
function get_current_schedule_detail(){
	global $conn;
	$get_data  = $_GET;
	$reference_id  = (isset($get_data['reference_id'])) ? $get_data['reference_id'] : "";

	$get_plan_details_query = get_current_schedule_detail_query($reference_id);
	$aps_result = $conn->query($get_plan_details_query);
	if($aps_result->rowCount()){
		$sch_data = $aps_result->fetch(PDO::FETCH_ASSOC);
		$data = array(
			"sch_id"=> $sch_data['OPTM_REF_ID'], 
			"sch_name"=> $sch_data['OPTM_PLAN_NAME'], 
			"from_date"=> change_date_format_notime($sch_data['OPTM_FROM_DATE']), 
			"to_date"=> change_date_format_notime($sch_data['OPTM_TO_DATE']), 
			"current_status"=> ucfirst($sch_data['OPTM_SCHEDULING_STATUS']), 
		);

		$output = array(
			"success"=> 'custom_success',
			"message"=> 'current_ref_found',
			"data"=> $data,
		);
	} else{
		$output = array(
			"success"=> 'error',
			"message"=> 'global_error_msg'
		);
	}
	echo json_encode($output);


}

function get_login_service_URL()  {  
	global $conn;
	$aps_result = $conn->query(get_login_service_URL_query());

	if($aps_result->rowCount()){
		$sch_data = $aps_result->fetch(PDO::FETCH_ASSOC);
		$data = array(
			"url"=> $sch_data['OPTM_URL']
		);

		$output = array(
			"success"=> 'custom_success',
			"message"=> 'success',
			"data"=> $data,
		);
	} else{
		$output = array(
			"success"=> 'error',
			"message"=> 'global_error_msg'
		);
	}
	echo json_encode($output);
}
?>