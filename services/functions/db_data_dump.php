<?php 


function get_scheduling_ref_list(){
	global $conn;
	$query = get_ref_data_query();
	$result = $conn->query($query);
	$ref_dataset = $result->fetchAll(PDO::FETCH_ASSOC);

	
	if (count($ref_dataset) > 0) {
		$output = array();	
		foreach($ref_dataset as $ref){
			$temp['ref_id'] = $ref['ref_id'];
			$temp['plan_name'] = $ref['plan_name'];
			$temp['status'] = $ref['scheduling_status'];
			$temp['from_date'] = change_date_format_notime(trim($ref['from_date']));
			$temp['to_date'] = change_date_format_notime(trim($ref['to_date']));

			$output[] = $temp;
		}
		return json_encode(array("data"=>$output));
	} else {
		return json_encode(array("data"=>'none'));
	}

}

function start_scheduling(){
	global $conn;
	$post_data  = $_POST;
	
	if(!empty($post_data)){
		$response_code = "error";
		$response_msg = 'global_error_msg';
		$data = array();
		if($post_data['choose'] == "create_new"){
			$start_date  = change_db_date_format($post_data['start_date']);
			$end_date = change_db_date_format($post_data['end_date']);
			$work_center  = (isset($post_data['work_center']) && $post_data['work_center']) ? $post_data['work_center'] : "";
			$query = insert_reference_query($post_data['schedule_name'], $start_date, $end_date, $work_center);
			// echo $query; die;
			$result = $conn->query($query);

			if($result->rowCount() > 0){
				$response_code = "custom_success";
				$response_msg = 'wait_load_dashboard';

				$get_ref_id_sql = get_last_ref_id();
				$ref_result = $conn->query($get_ref_id_sql);
				$reference_id = $ref_result->fetch(PDO::FETCH_ASSOC)['ref_id'];
				// $reference_id = $conn->lastInsertId('OPTM_REF_ID');
				
				$data['ref_id'] = $reference_id;
				$data['plan_name'] = ($post_data['schedule_name']);
				$data['from_date'] = $start_date;
				$data['to_date'] = $end_date;
				$data['working_wc'] = $work_center;

				// dump data - operation 
				$insert_opr_links="";
				$select_operation = operation_task_query_prod($start_date, $end_date, $work_center);
				// echo $select_operation; die;
				$select_operation_result = $conn->query($select_operation);
				$operation_dataset = $select_operation_result->fetchAll();
				if (count($operation_dataset) > 0) {
					$available_wo = array();
					$insert_local_opr = insert_aps_operations($reference_id, $operation_dataset);
					// echo $insert_local_opr['query']; die;
					if(strstr($insert_local_opr['query'], ";")){
						$query_arr = explode(';', $insert_local_opr['query']);
						foreach($query_arr as $insert){
							if(trim($insert)!=""){
								$insert_local_res = $conn->query(($insert));	
							}
						}
					} else {
						$insert_local_res = $conn->query(($insert_local_opr['query']));

					}
					if($insert_local_res->rowCount() > 0){
						// dump data - Work orders 

						$select_work_orders = work_order_prod($start_date, $end_date, $insert_local_opr['available_wo'], $work_center);
						$select_work_orders_result = $conn->query($select_work_orders);
						$work_order_dataset = $select_work_orders_result->fetchAll();
						if (count($work_order_dataset) > 0) {
							$insert_local_wo = insert_aps_work_order($reference_id, $work_order_dataset);

							if(strstr($insert_local_wo['insert_query'], ";")){
								$query_arr = explode(';', $insert_local_wo['insert_query']);
								foreach($query_arr as $insert){
									if(trim($insert)!=""){
										$insert_local_wo_res = $conn->query(($insert));	
									}
								}
							} else {
								$insert_local_wo_res = $conn->query(($insert_local_wo['insert_query']));

							}			
						}

						// dump data - Operations Links
						$operation_query = get_aps_operations($start_date, $end_date, $reference_id , $work_center);
						// echo '<pre>'. $operation_query; die;
						$select_operation_result = $conn->query($operation_query);
						$operation_dataset = $select_operation_result->fetchAll();
						if (count($operation_dataset) > 0) {
							
							$insert_opr_links  = insert_aps_links();
							
							foreach($operation_dataset as $row) {
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
									$temp_string = " ('$reference_id', '$parent_task','$target_opr','$connection')";
									
									$query = $insert_opr_links . ' '. $temp_string;
									$insert_opr_result = $conn->query($query);
								}
								
							}
							
						}

					}  
					// print_r($insert_local); die;
				}
				
			} else {
				$response_code = "error";
				$response_msg = 'global_error_msg';	
			}
			
		} else if($post_data['choose'] == "modify_existing"){
			$reference_id = $post_data['schedule_reference_number'];

			$update_ref = update_reference_status_query("draft", $reference_id);
			$update_ref_res = $conn->query($update_ref);

			$query = get_ref_data_query($reference_id);
			$result = $conn->query($query);
			$ref_dataset = $result->fetchAll(PDO::FETCH_ASSOC);

			if (count($ref_dataset) > 0) {
				$response_code = "custom_success";
				$response_msg = 'wait_load_dashboard';
				foreach($ref_dataset as $ref){
					$data['ref_id'] = $ref['ref_id'];
					$data['plan_name'] = $ref['plan_name'];
					$data['from_date'] = change_db_date_format($ref['from_date']);
					$data['to_date'] = change_db_date_format($ref['to_date']);
					$data['working_wc'] = $ref['working_wc'];
				}
			}
		}

		$output = array(
			"success" => $response_code,
			"message" => $response_msg,
			"data" => $data,
		    // 	"aps_query"=> $operation_query,
			//  "links_query"=>$insert_opr_links
		);

	} else {
		$output = array(
			"success" => 'error',
			"message" => 'global_error_msg',
		);

	}
	return json_encode($output);
}


function convert_data_to_current_date_time(){
	global $conn;
	global $date_formt;
	global $db_date_format;
	echo $query = get_all_operations();
	$query_res = $conn->query($query);
	$dataset = $query_res->fetchAll();
	if (count($dataset) > 0) {
		$total_updated = 0;
		foreach($dataset as $row) {
			
			$rand = rand(2, 5);
			$new_start = date($db_date_format, strtotime("+$rand hours"));
			$rand = $rand+ rand(2, 5);
			$new_end = date($db_date_format, strtotime($new_start . "+$rand hours"));
			$update_query =  convert_data_to_current_date_time_query($new_start, $new_end, $row['id'], @$row['DocEntry']);
			echo $update_query; echo '<br>';
			$update_res = $conn->query($update_query);

			if($update_res){

				$total_updated++;
			}

		}

		return $total_updated. " number of records updated to todays date";

	} else {
		return 0;
	}
}

?>