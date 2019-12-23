<?php 

function check_sfdc_installed_query(){
	$query = "SELECT * FROM \"@OPTM_INSTPRODUCTS\" WHERE U_PRODUCTCODE = 'SFDC'";
	return $query;
}

function work_center_query($default_wc_id){
	$wc_where = "";
	if($default_wc_id!= NULL && $default_wc_id!= 'all'){
		$wc_where = "AND U_O_WC_ID = '$default_wc_id'";
	}
	$query = "SELECT DISTINCT prod_res.U_O_WC_ID, wc_msg.Code as id, wc_msg.Name as name
	FROM \"@OPTM_PRODRES\" AS prod_res 
	LEFT JOIN \"@OPTMWC_MST\" AS wc_msg ON prod_res.U_O_WC_ID = wc_msg.Code
	WHERE U_O_WC_ID !='' $wc_where";
	return $query;
}

function work_order_query(){
	$query = "SELECT OPERATION_CODE as work_order_number FROM \"OPTM_APS_PRODOPER\" WHERE OPERATION_TYPE='project' ";
	return $query;
}

function resource_list_query($default_wc_id){
	$resouce_where = "";
	if($default_wc_id!= NULL && $default_wc_id!= 'all'){
		$resouce_where = "AND U_O_WC_ID = '$default_wc_id'";
	}
	$query = "SELECT DISTINCT U_O_WC_ID as work_center_id, U_O_RESID as id, U_O_RESDESC as name  
	FROM \"@OPTM_PRODRES\" 
	WHERE U_O_RESID != '' $resouce_where";
	return $query;
}

function schedular_work_center_query(){
	$query = "SELECT U_O_WC_ID as work_center_id,wc_msg.Name as work_center_name, U_O_RESID as resource_id, U_O_RESDESC as resource_name  
	FROM \"@OPTM_PRODRES\" as prod_res 
	LEFT JOIN \"@OPTMWC_MST\" AS wc_msg ON prod_res.U_O_WC_ID = wc_msg.Code
	WHERE U_O_RESID != ''";
	return $query;
}



function work_order_prod($start_date, $end_date, $available_wo = NULL , $work_center = NULL){
	$extra_where  = "";
	if(!empty($available_wo)){
		$available_wo_str = implode("','", $available_wo);	
		$extra_where = "AND A.U_O_ORDRNO IN ('$available_wo_str') ";
	}

	/*if($start_date!= NULL && $end_date!= NULL ){
		$extra_where .= "AND (U_O_STARTDATE BETWEEN '$start_date' AND '$end_date')";
	}*/

	$where ="";
	if($work_center!= NULL && $work_center!= 'all'){
		$extra_where .= "AND U_O_WC_ID = '$work_center'";
	}

	$select_work_orders = "
	SELECT DISTINCT U_O_WC_ID as work_center_id, A.DocEntry as head_doc_entry, A.U_O_ORDRNO as id, A.U_O_ORDRNO as work_order_id, A.U_O_ORDRNO as name, A.U_O_ORDRNO as description, U_O_STARTDATE as start_date, A.U_O_ENDDATE as end_date, A.U_OPTM_PRIORITY AS priority,  A.U_OPTM_STRTTIME as start_time, A.U_OPTM_ENDTIME as end_time, CEILING(A.U_OPTM_PROGRESS) as progress, A.U_O_STATUS as work_order_status
	FROM \"@OPTM_PRODORDR\" A 
	JOIN \"@OPTM_PRODRES\" C on A.DocEntry=C.DocEntry
	WHERE U_O_WC_ID != '' $extra_where
	";

	//print_r($select_work_orders);
	return $select_work_orders;
}

function operation_task_query_prod($start_date = NULL, $end_date = NULL, $work_center = NULL, $for_work_orders = NULL){
	$where ="";
	if($start_date!= NULL && $end_date!= NULL ){
		// $where = "AND (X.start_date BETWEEN '$start_date' AND '$end_date')";
		$where = "AND (
		(X.start_date BETWEEN '$start_date' AND  '$end_date') OR 
		(X.end_date BETWEEN '$start_date' AND  '$end_date') OR
		(X.start_date > '$start_date' AND X.end_date < '$end_date') 
	)";
}

	//$where ="";
if($work_center!= NULL && $work_center!= 'all'){
	$where .= "AND x.work_center_id = '$work_center'";
}

if($for_work_orders!= NULL && $for_work_orders!= 'all'){
	$work_order_string = implode("','", $for_work_orders);
	$where .= "AND x.work_order_id IN ('$work_order_string')";
}

$query = "SELECT X.id , X.head_doc_entry , X.oper_doc_entry  ,  X.oper_line_id  , X.res_line_id , X.work_center_id ,  X.work_order_id ,  X.resource_id , X.resource_name , X.operation_number , X.operation_code , X.description , X.priority , X.readonly , X.status , X.start_date , X.end_date , X.duration, X.progress , X.res_operation_number, X.opr_start_time, X.opr_end_time, X.required_resource, X.work_order_status
from (
SELECT 
ROW_NUMBER() over (partition by A.U_O_ORDRNO , C.U_O_OPERNO order by  (case when isnull(G.U_OPTM_SCHEDULE , 'N') ='N' then 1 else 0 end) , G.lineID)  AS row_number ,
ROW_NUMBER() OVER(ORDER BY A.U_O_ORDRNO,C.U_O_OPERNO,G.LineId ASC) AS id, A.DocEntry as head_doc_entry, C.DocEntry as oper_doc_entry, C.LineId as oper_line_id,  G.LineId as res_line_id,  G.U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, G.U_O_RESID AS resource_id, G.U_O_RESDESC as resource_name, C.U_O_OPERNO AS operation_number, C.U_O_OPR_ID AS operation_code, C.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, C.U_OPTM_LOCKED AS readonly, C.U_O_OPERCMPFLG AS status, C.U_OPTM_OPSDATE AS start_date, C.U_OPTM_OPEDATE AS end_date, C.U_OPTM_OPLTHRS AS duration, CEILING(C.U_OPTM_OPERPROGRESS) AS progress, G.U_O_ISSTOOPER as res_operation_number, C.U_OPTM_OPSTIME as opr_start_time, C.U_OPTM_OPETIME as opr_end_time, G.U_O_RESSEQ as required_resource, A.U_O_STATUS as work_order_status   
FROM \"@OPTM_PRODORDR\" A 
INNER JOIN \"@OPTM_PRODOPER\" C ON A.DocEntry=C.DocEntry 
INNER join \"@OPTM_PRODRES\" G on A.DocEntry=G.DocEntry and C.U_O_OPERNO = G.U_O_ISSTOOPER  AND (G.U_OPTM_SCHEDULE = 'Y' OR G.U_OPTM_SCHEDULE = '1')
INNER JOIN \"@OPTMPRD_ROUT_HDR\" B On A.U_O_PRODID=B.U_O_PRODUCT_NO and A.U_O_RUTNGSEQ=B.U_O_ROUT_SEQ and A.U_O_RTNGREV=B.U_O_REVI_NO 
INNER JOIN \"@OPTMPRD_ROUT_LINE\" D on B.Code=D.Code and C.U_O_OPERNO=D.U_O_LINE_NO 
INNER JOIN \"@OPTMPRD_ROU_LN_RES\" F on B.Code=F.Code and D.LineId=F.U_O_ROUTLINE and D.U_O_LINE_NO=F.U_O_LINE_NO 
INNER JOIN \"@OPTMWC_MST\" E on D.U_O_WC_ID=E.Code 
WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' 
) 
AS X WHERE X.row_number =1 $where
ORDER BY X.work_order_id ASC, X.operation_number, X.operation_code ASC";

return $query;
}

function gant_chart_links_query($operation_ids, $ref_id =NULL){
	$where = "";
	if($operation_ids!= ""){
		$where = "WHERE ( SUCC_TASK_ID IN(".$operation_ids.") OR PRED_TASK_ID IN(".$operation_ids.") ) ";
	}

	$query = "SELECT OPR_LINK_ID as id, REF_ID as ref_id, PRED_TASK_ID as source, SUCC_TASK_ID as target, CONNECTION_TYPE as connection_type 
	FROM \"OPTM_APS_PRODOPER_LINKS\" 
	$where";
	return $query;
}

function system_setting_query(){
	
	$query = "SELECT \"ID\" AS \"id\", \"GROUP\" AS \"grp\", \"NAME\" AS \"name\", \"VALUE\" AS \"value1\" FROM \"OPTM_APS_DSHBD_SETTINGS\" ";
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

function update_task_query($task_type, $task_details){
	$table_arr = array();
	$table_arr['update_prod_res'] = "";

	if($task_type == 'project') {

		$table_arr['update_prod_head'] = "
		UPDATE \"@OPTM_PRODORDR\" 
		SET U_OPTM_PRIORITY = '$task_details[priority]',  U_O_STARTDATE ='$task_details[start_date]', U_OPTM_STRTTIME = '$task_details[start_time]', U_O_ENDDATE = '$task_details[end_date]', U_OPTM_ENDTIME='$task_details[end_time]'
		WHERE U_O_ORDRNO = '$task_details[operation_code]' AND DocEntry = '$task_details[head_doc_entry]'";

	}

	if($task_type == 'task') {
		
		$table_arr['update_prod_oper'] = "
		UPDATE \"@OPTM_PRODOPER\" 
		SET  U_OPTM_LOCKED ='$task_details[readonly]', U_O_OPR_ID = '$task_details[operation_code]', U_O_OPR_DESC = '$task_details[description]', U_O_OPERCMPFLG = '$task_details[status]', U_OPTM_OPSDATE = '$task_details[start_date]', U_OPTM_OPSTIME='$task_details[start_time]',  U_OPTM_OPEDATE ='$task_details[end_date]', U_OPTM_OPETIME='$task_details[end_time]',  U_OPTM_OPLTHRS = '$task_details[duration]' 
		WHERE DocEntry = '$task_details[oper_doc_entry]' AND LineId = '$task_details[oper_line_id]'";
	}


	if($task_details['resource_id'] != 0) {

		$table_arr['update_prod_res'] = "UPDATE \"@OPTM_PRODRES\" 
		SET  U_O_RESID = '$task_details[resource_id]', U_O_RESDESC = '$task_details[resource_name]' 
		WHERE LineId = '$task_details[resource_id]' AND U_O_ISSTOOPER = '$task_details[res_operation_number]' ";
	}

	return $table_arr;
}

function delete_task_query($task_id){
	$action_table   = "operations";
	$action_table_2 = "operations_links";

	$select_task = "SELECT * FROM \"OPTM_APS_PRODOPER\" WHERE OPER_ID = '$task_id'";

	$delete_task_link = "DELETE FROM \"OPTM_APS_PRODOPER_LINKS\" WHERE (PRED_TASK_ID = '$task_id' OR SUCC_TASK_ID = '$task_id')";

	$delete_task = "DELETE FROM \"OPTM_APS_PRODOPER\" WHERE OPER_ID='$task_id'";	

	return array(
		"select_task" => $select_task,
		"delete_task_link" => $delete_task_link,
		"delete_task" => $delete_task,
	);

}

function complete_task_query($task_id){
	$select_task = "SELECT * FROM \"OPTM_APS_PRODOPER\" 
	WHERE OPER_ID = '$task_id'";

	$complete_task = "UPDATE \"OPTM_APS_PRODOPER\" 
	SET PROGRESS = 1, 	STATUS = 1 
	WHERE OPER_ID='$task_id'
	";	

	return array(
		"select_task" => $select_task,
		"complete_task" => $complete_task,
	);
}


function delete_task_link_query($link_id){

	$select_link = "SELECT * FROM \"OPTM_APS_PRODOPER_LINKS\"  WHERE OPR_LINK_ID = '$link_id'";

	$delete_link = "DELETE FROM \"OPTM_APS_PRODOPER_LINKS\"  WHERE OPR_LINK_ID='$link_id'";

	return array(
		"select_link" => $select_link,
		"delete_link" => $delete_link,
	);	
}


function update_system_settings($field_value, $field_name){
	
	$query = "UPDATE \"OPTM_APS_DSHBD_SETTINGS\" SET VALUE='$field_value' WHERE NAME='$field_name' ";
	return $query;
}


function get_all_operations(){
	return "SELECT B.OPER_ID AS id,  B.START_DATE AS start_date, B.END_DATE AS end_date, B.DURATION as duration, B.MIN_DURATION as min_dur
	FROM \"OPTM_APS_PRODOPER\" B";
}

function convert_data_to_current_date_time_query($new_start, $new_end, $id, $DocEntry = NULL){
	$extra_where = "";
	if($DocEntry !=""){
		// $extra_where = " AND DocEntry = $DocEntry";
	}
	$query = "UPDATE \"OPTM_APS_PRODOPER\" SET START_DATE = '$new_start', END_DATE = '$new_end' WHERE OPER_ID='$id' $extra_where";
	return $query;
}

function get_last_aps_id(){
	$query = 'SELECT TOP 1 "OPER_ID" as "id" FROM "OPTM_APS_PRODOPER" ORDER BY OPER_ID DESC';
	return $query;
}

function get_last_ref_id(){
	$query = 'SELECT TOP 1 OPTM_REF_ID as ref_id FROM "OPTM_APS_SCH_REF" ORDER BY OPTM_REF_ID DESC ';
	return $query;
}

function get_last_opr_link_id(){
	$query = 'SELECT TOP 1 "OPR_LINK_ID" as "id" FROM "OPTM_APS_PRODOPER_LINKS" ORDER BY "OPR_LINK_ID" DESC';
	return $query;
}

function get_ref_data_query($reference_id = NULL){
	$where = "";
	if($reference_id != ""){
		$where = " WHERE OPTM_REF_ID= '$reference_id' ";
	} 
	$query = "SELECT OPTM_REF_ID as ref_id, OPTM_FROM_DATE as from_date, OPTM_TO_DATE as to_date, OPTM_SCHEDULING_STATUS as scheduling_status, OPTM_IS_DELETED as is_deleted, OPTM_PLAN_NAME as plan_name, WORKING_WC as working_wc FROM \"OPTM_APS_SCH_REF\" $where ";
	return $query;
}

function insert_reference_query($schedule_name, $start_date, $end_date, $work_center){
	$start_date = $start_date;
	$end_date = $end_date;
	$insert = " INSERT INTO  \"OPTM_APS_SCH_REF\" 
	( OPTM_PLAN_NAME, OPTM_FROM_DATE, OPTM_TO_DATE, OPTM_SCHEDULING_STATUS, OPTM_IS_DELETED, WORKING_WC ) 
	VALUES 
	('$schedule_name', '$start_date', '$end_date', 'draft', '0', '$work_center' ) ";

	return $insert;
}

function update_reference_status_query($status, $reference_id){
	$where = "";
	if($reference_id != ""){
		$where = " WHERE OPTM_REF_ID= '$reference_id' ";
	} 
	$query = "UPDATE \"OPTM_APS_SCH_REF\" SET OPTM_SCHEDULING_STATUS = '$status' $where";
	return $query;
}

function insert_aps_operations($reference_id, $operation_dataset){

	$available_wo = array();
	$insert_local_opr = "INSERT INTO \"OPTM_APS_PRODOPER\" (REF_ID, HEAD_DOC_ENTRY, OPER_DOC_ENTRY, OPER_LINE_ID, RES_LINE_ID, OPERATION_TYPE, TASK_TYPE, WORK_CENTER_ID, WORK_ORDER_ID, RESOURCE_ID, RESOURCE_NAME, PLANNED_RESOURCE_ID, PLANNED_RESOURCE_NAME, OPERATION_NUMBER, OPERATION_CODE, DESCRIPTION, PRIORITY, READONLY, STATUS, START_DATE, END_DATE, DURATION, MIN_DURATION, PROGRESS, IS_LOCAL_TASK, IS_DELETED, SPLIT_TASK_GRP_ID, required_resource, WO_STATUS) VALUES ";
	foreach($operation_dataset as $row) {
		if(!in_array($row['work_order_id'], $available_wo)){
			array_push($available_wo, $row['work_order_id']);
		}

		$start_date = convert_date_time_concat($row['start_date'], $row['opr_start_time']);
		$end_date   = convert_date_time_concat($row['end_date'], $row['opr_end_time']); 

		$insert_local_opr .= "( '$reference_id','$row[head_doc_entry]','$row[oper_doc_entry]','$row[oper_line_id]','$row[res_line_id]','task','setup','$row[work_center_id]','$row[work_order_id]','$row[resource_id]','$row[resource_name]','$row[resource_id]','$row[resource_name]','$row[operation_number]','$row[operation_code]','$row[description]','$row[priority]','".(int)$row['readonly']."','$row[status]','$start_date','$end_date','$row[duration]','$row[duration]','$row[progress]','0',	'0', '0', '$row[required_resource]', '$row[work_order_status]'  ), ";

	}
	$insert_local_opr = rtrim($insert_local_opr, ", ");
	return array(
		"query" => $insert_local_opr,
		"available_wo" => $available_wo,
	);

}

function insert_aps_work_order($reference_id, $work_order_dataset){

	$insert_local_wo = "INSERT INTO \"OPTM_APS_PRODOPER\" (REF_ID, HEAD_DOC_ENTRY, OPER_DOC_ENTRY, OPER_LINE_ID, RES_LINE_ID, OPERATION_TYPE, TASK_TYPE, WORK_CENTER_ID, WORK_ORDER_ID, RESOURCE_ID, RESOURCE_NAME, PLANNED_RESOURCE_ID, PLANNED_RESOURCE_NAME, OPERATION_NUMBER, OPERATION_CODE, DESCRIPTION, PRIORITY, READONLY, STATUS, START_DATE, END_DATE, DURATION, MIN_DURATION, PROGRESS, IS_LOCAL_TASK, IS_DELETED, SPLIT_TASK_GRP_ID, WO_STATUS) VALUES ";
	$inserted_wo = array();
	foreach($work_order_dataset as $row) {
		if(!in_array($row['work_order_id'], $inserted_wo)){
			array_push($inserted_wo, $row['work_order_id']);

			$start_date = convert_date_time_concat($row['start_date'], $row['start_time']);
			$end_date   = convert_date_time_concat($row['end_date'], $row['end_time']); 

			$insert_local_wo .= "( '$reference_id','$row[head_doc_entry]','0','0','0','project','setup','$row[work_center_id]','$row[work_order_id]','0','0','0','0','0','$row[name]','$row[description]','$row[priority]','0','0','$start_date','$end_date','0','0','$row[progress]','0', '0', '0', '$row[work_order_status]' ), ";
		}

	}
	$insert_local_wo = rtrim($insert_local_wo, ", ");

	return array("insert_query" => $insert_local_wo, "inserted_wo"=>$inserted_wo);

}

function insert_aps_links($link_data_string = NULL){
	$insert_opr_links = "INSERT INTO  \"OPTM_APS_PRODOPER_LINKS\" (REF_ID, PRED_TASK_ID, SUCC_TASK_ID, CONNECTION_TYPE) VALUES ";
	// $insert_opr_links .= rtrim($link_data_string, ", ");
	$insert_opr_links  .= ' '. $link_data_string;
	return $insert_opr_links;
}


function get_aps_operations($start_date = NULL, $end_date = NULL, $ref_id= NULL, $work_center = NULL, $work_order = NULL){
	$where ="";
	
	if($ref_id != '' ){
		$where = " task.REF_id = '$ref_id' ";
	}


	if($work_center!= NULL && $work_center!= 'all'){
		if($where!="" && trim($where)!= "AND"){
			$where .=  " AND ";
		}
		$where .= " task.WORK_CENTER_ID = '$work_center' ";
	}

	if($work_order!= NULL && $work_order!= 'all'){

		if($where!="" && trim($where)!= "AND"){
			$where .=  " AND ";
		}
		$work_order_string = implode("','", $work_order);
		$where .= " task.WORK_ORDER_ID IN ('$work_order_string') ";
	}

	if($where!="" && trim($where)!= "AND"){
		$where .=  " AND ";
	}
	$where .= " task.IS_DELETED = '0'  AND task.WO_STATUS NOT IN(3) ";

	$query = "
	SELECT DISTINCT wo.OPER_ID as parent, 
	(
	Select top 1 OPER_ID 
	from \"OPTM_APS_PRODOPER\" 
	Where cast (OPERATION_NUMBER as int) < cast(Task.OPERATION_NUMBER as int) and WORK_ORDER_ID = wo.WORK_ORDER_ID and operation_type = 'task' order by cast (OPERATION_NUMBER as int) DESC 
	) as source_id, 
	task.OPER_ID as id, task.REF_id as ref_id, task.HEAD_DOC_ENTRY as head_doc_entry, 
	task.OPER_DOC_ENTRY as oper_doc_entry, task.OPER_LINE_ID as oper_line_id, task.RES_LINE_ID as res_line_id, task.OPERATION_TYPE as operation_type, task.TASK_TYPE as task_type, 
	task.WORK_CENTER_ID as work_center_id, task.WORK_ORDER_ID as work_order_id, task.RESOURCE_ID as resource_id , task.RESOURCE_NAME as resource_name , task.PLANNED_RESOURCE_ID as planned_resource_id , task.PLANNED_RESOURCE_NAME as planned_resource_name , task.OPERATION_NUMBER as operation_number , task.OPERATION_CODE as operation_code , task.DESCRIPTION as description , task.PRIORITY as priority , task.READONLY as readonly , task.STATUS as status , task.START_DATE as start_date , task.END_DATE as end_date , task.DURATION as duration , task.MIN_DURATION as min_duration , task.PROGRESS as progress , task.IS_LOCAL_TASK as is_local_task , task.IS_DELETED as is_deleted , task.SPLIT_TASK_GRP_ID as split_task_grp_id, task.required_resource
	FROM \"OPTM_APS_PRODOPER\" as task
	LEFT JOIN \"OPTM_APS_PRODOPER\" as wo ON 
	task.work_order_id = wo.OPERATION_CODE AND
	task.OPER_DOC_ENTRY = wo.HEAD_DOC_ENTRY 
	AND wo.OPERATION_TYPE = 'project'
	WHERE $where
	
	ORDER BY task.WORK_ORDER_ID, task.OPERATION_NUMBER, task.OPERATION_CODE ASC
	";
	//, id,  task.OPERATION_TYPE
	// AND OPERATION_TYPE = 'task'
	return $query;
}

function update_aps_operations($tasks, $task_id){
	$update_query  = "UPDATE \"OPTM_APS_PRODOPER\" SET
	TASK_TYPE='$tasks[task_type]',	
	RESOURCE_ID='$tasks[resource]',
	RESOURCE_NAME='$tasks[resource_name]', 
	OPERATION_CODE='$tasks[text]',
	DESCRIPTION='$tasks[description]',
	WORK_CENTER_ID='$tasks[work_center]',
	WORK_ORDER_ID='$tasks[work_order_id]',
	PRIORITY='$tasks[priority]',
	READONLY='$tasks[readonly]',
	STATUS='$tasks[status]',
	START_DATE='$tasks[start_date]',
	END_DATE='$tasks[end_date]',
	DURATION='$tasks[duration]',
	PROGRESS='$tasks[progress]'
	WHERE OPER_ID = '$task_id'";

	return $update_query;
}

function update_aps_links($query_data, $links_id){
	$query = "UPDATE  \"OPTM_APS_PRODOPER_LINKS\" SET
	REF_ID='$query_data[ref_id]', 
	PRED_TASK_ID='$query_data[source]', 
	SUCC_TASK_ID='$query_data[target]', 
	CONNECTION_TYPE='$query_data[type]'
	WHERE OPR_LINK_ID = '$links_id'";
	return $query;

}

function insert_new_aps_opr($reference_id, $task_data){
	$available_wo = array();
	
	$work_center_id = $task_data['work_center'];
	

	$work_order_id = "";
	if(@$task_data['work_order_id'] != ""){
		$work_order_id = @$task_data['work_order_id'];
	} else {
		$work_order_id = 1; 
	}
	$insert_local_opr = "INSERT INTO \"OPTM_APS_PRODOPER\" (REF_ID, HEAD_DOC_ENTRY, OPER_DOC_ENTRY, OPER_LINE_ID, RES_LINE_ID, OPERATION_TYPE, TASK_TYPE, WORK_CENTER_ID, WORK_ORDER_ID, RESOURCE_ID, RESOURCE_NAME, PLANNED_RESOURCE_ID, PLANNED_RESOURCE_NAME, OPERATION_NUMBER, OPERATION_CODE, DESCRIPTION, PRIORITY, READONLY, STATUS, START_DATE, END_DATE, DURATION, MIN_DURATION, PROGRESS, IS_LOCAL_TASK, IS_DELETED, SPLIT_TASK_GRP_ID) VALUES  ( '$reference_id','$task_data[head_doc_entry]','$task_data[oper_doc_entry]','$task_data[oper_line_id]','$task_data[res_line_id]','task','$task_data[task_type]','$work_center_id','$work_order_id','$task_data[resource]','$task_data[resource_name]','$task_data[resource]','$task_data[resource_name]','$task_data[operation_number]','$task_data[text]','$task_data[description]','$task_data[priority]','$task_data[readonly]','0','$task_data[start_date]','$task_data[end_date]','$task_data[duration]','$task_data[min_duration]','$task_data[progress]','1',	'0', '$task_data[split_task_group_id]' )";

	return $insert_local_opr;
}

 function get_work_order_prod_status_query($reference_id){
 	$query = "	SELECT prod_head.U_OPTM_PROGRESS as progress, prod_head.U_OPTM_PRIORITY as \"priority\",prod_head.DocEntry, aps_opr.OPER_ID as oper_id,  aps_opr.WORK_ORDER_ID as wo_id, REF_ID as ref_id
	FROM \"@OPTM_PRODORDR\" as prod_head 
	LEFT JOIN \"OPTM_APS_PRODOPER\" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry AND prod_head.U_O_ORDRNO = aps_opr.OPERATION_CODE
	WHERE prod_head.U_O_STATUS <> '3' AND prod_head.U_O_STATUS <> '4'
	AND aps_opr.OPER_ID != '' AND REF_ID = '$reference_id' AND aps_opr.OPERATION_TYPE = 'project'";
 	return $query;
 }

 function get_operation_status_query($reference_id){
 	$query = "SELECT prod_opr.U_OPTM_OPERPROGRESS as operation_progress,  aps_opr.OPER_ID as oper_id
	FROM \"@OPTM_PRODOPER\" as prod_opr
	LEFT JOIN \"OPTM_APS_PRODOPER\" as aps_opr ON prod_opr.DocEntry = aps_opr.OPER_DOC_ENTRY AND  aps_opr.OPERATION_NUMBER = prod_opr.U_O_OPERNO
	WHERE aps_opr.OPER_ID != '' AND REF_ID = '$reference_id' AND aps_opr.OPERATION_TYPE = 'task'";
	return $query;
 }

 function update_work_order_prod_status_query($operation_id, $ref_id, $work_order_id, $priority, $progress){

 	$priority_query = "UPDATE \"OPTM_APS_PRODOPER\" SET \"priority\" = '$priority'  WHERE (WORK_ORDER_ID = '$work_order_id' OR OPERATION_CODE = '$work_order_id' ) AND REF_ID = '$ref_id'";

 	$progress_query = "UPDATE \"OPTM_APS_PRODOPER\" SET PROGRESS = '$progress'  WHERE OPER_ID = '$operation_id'";

 	return array("priority_query" => $priority_query, "progress_query" => $progress_query);
 }

function update_oper_status_query($oper_id, $progress){
	$query = "  UPDATE \"OPTM_APS_PRODOPER\" SET PROGRESS = '$progress'  WHERE OPER_ID = '$oper_id' ";
	return $query;
}



function refresh_work_order_prod_query($start_date, $end_date, $work_center = NULL){
	$extra_where  = "";

	if($start_date!= NULL && $end_date!= NULL ){
		$extra_where .= " AND (A.U_O_STARTDATE BETWEEN '$start_date' AND '$end_date')";
	}

	$where ="";
	if($work_center!= NULL && $work_center!= 'all'){
		$extra_where .= " AND C.U_O_WC_ID = '$work_center'";
	}
	$select_query = 'SELECT DISTINCT aps_opr.OPER_ID, aps_opr.REF_ID,U_O_STARTDATE, C.U_O_WC_ID as work_center_id, A.DocEntry as head_doc_entry, A.U_O_ORDRNO as id, A.U_O_ORDRNO as work_order_id, 
	A.U_O_ORDRNO as name, A.U_O_ORDRNO as description, U_O_STARTDATE as start_date, A.U_O_ENDDATE as end_date, A.U_OPTM_PRIORITY AS priority, C.U_O_ISSTOOPER as res_operation_number, A.U_OPTM_STRTTIME as start_time, A.U_OPTM_ENDTIME as end_time, CEILING(A.U_OPTM_PROGRESS) as progress, A.U_O_STATUS as work_order_status
	FROM "@OPTM_PRODORDR" A
	INNER JOIN "@OPTM_PRODOPER" B ON A."DocEntry"=B."DocEntry" 
	JOIN "@OPTM_PRODRES" C on A.DocEntry=C.DocEntry and B.U_O_OPERNO = C.U_O_ISSTOOPER 
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = A.DocEntry  AND aps_opr.OPER_DOC_ENTRY = C.DocEntry
	WHERE A.U_O_STATUS <> \'3\' AND A.U_O_STATUS <> \'4\' 
	'.$extra_where.' 
	AND OPER_ID IS NULL';

	return $select_query;
}

function shift_capacity_details_query($from_date = NULL, $to_date = NULL, $reference_id = NULL, $work_center= NULL){

	$extra_where  = " WHERE ";

	if($from_date!= NULL && $to_date!= NULL ){
		$extra_where .= "  (OPTM_WORKDATE BETWEEN '$from_date' AND '$to_date')";
	}

	if($work_center!= NULL && $work_center!= 'all'){
		$extra_where .= " AND OPTM_WHSCODE = '$work_center'";
	}


	$total_resource_query = "SELECT OPTM_SHIFTID as shift_id, OPTM_WHSCODE as wh_id,	OPTM_WCID as work_center_id,	OPTM_RESID as resource,	OPTM_WORKDATE as shift_date,  U_O_START_TIME as shift_start, U_O_END_TIME as shift_end, U_O_BREAK_DURATION as break_duration, U_O_AVL_TIME as available_time, U_OPTM_BRKSTRTTIME as break_start_time  
	FROM OPTM_WC_RES_CAPACITY as res_cap
	LEFT JOIN \"@OPTMSHIFT_MASTER\" as shift_tb ON shift_tb.code =  res_cap.OPTM_SHIFTID
	$extra_where
	ORDER BY OPTM_WCID";
	// $extra_where


	$res_cap_avail_per_day_query = "SELECT OPTM_SHIFTID as shift_id, OPTM_AVAILABLE_CAPACITY as avail_capacity, OPTM_USED_CAPACITY as used_capacity, OPTM_BAL_CAPACITY as bal_capacity, OPTM_WHSCODE as wh_id,	OPTM_WCID as work_center_id,	OPTM_RESID as resource,	OPTM_WORKDATE as shift_date,  U_O_START_TIME as shift_start, U_O_END_TIME as shift_end, U_O_BREAK_DURATION as break_duration, U_O_AVL_TIME as available_time, U_OPTM_BRKSTRTTIME as break_start_time 
	FROM OPTM_WC_RES_CAPACITY as res_cap
	LEFT JOIN \"@OPTMSHIFT_MASTER\" as shift_tb ON shift_tb.code =  res_cap.OPTM_SHIFTID
	$extra_where
	Order by OPTM_WCID";
	// $extra_where


	return array(
		'total_res_query' =>$total_resource_query,
		'total_avail_res_query' =>$res_cap_avail_per_day_query,
	);

}


function installation_queries($post_data, $db_name){

	$queries = array();

	$queries['create_table_ref'] = '
	CREATE TABLE '.$db_name.'.."OPTM_APS_SCH_REF" (
	OPTM_REF_ID              INT           NOT NULL    IDENTITY    PRIMARY KEY,
	OPTM_PLAN_NAME           VARCHAR(100)  NOT NULL,
	OPTM_FROM_DATE  datetime,
	OPTM_TO_DATE  datetime,
	OPTM_SCHEDULING_STATUS  VARCHAR(100),
	OPTM_IS_DELETED  tinyint,
)';


$queries['create_table_dshbd'] = '
CREATE TABLE '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" (
ID              INT           NOT NULL    IDENTITY    PRIMARY KEY,
NAME varchar(400) NULL,
VALUE text NULL,
"GROUP" varchar(150) NULL,
)';
$queries['insert_dshbd_setting'] = " INSERT INTO $db_name..\"OPTM_APS_DSHBD_SETTINGS\" (NAME, VALUE, \"GROUP\") VALUES
('default_work_center',	'all',	'system'),
('task_column_width',	'$post_data[task_column_width]',	'system'),
('chart_table_row_height',	'$post_data[chart_table_row_height]',	'system'),
('left_panel_width',	'$post_data[left_panel_width]',	'system'),
('left_panel_resize',	'$post_data[left_panel_resize]',	'system'),
('enable_keyboard_shortcut',	'$post_data[enable_keyboard_shortcut]',	'system'),
('chart_header_scale_height',	'50',	'system'),
('default_timeline_view',	'$post_data[default_timeline_view]',	'system'),
('default_task_color_code',	'$post_data[default_task_color_code]',	'system'),
('drag_lightbox',	'$post_data[drag_lightbox]',	'system'),
('lightbox_additional_height',	'$post_data[lightbox_additional_height]',	'system'),
('default_theme',	'$post_data[default_theme]',	'system'),
('task_type_color_set',	'$post_data[task_type_color_set_json]',	'system'),
('priority_color_set',	'$post_data[priority_color_set_json]',	'system'),
('left_right_panel_font_size',	'$post_data[left_right_panel_font_size]',	'system'),
('unhighlight_color',	'$post_data[unhighlight_color]',	'system'),
( 'default_resource_load_layout', '$post_data[default_resource_load_layout]', 'system'),
( 'resource_balanced_color', '$post_data[resource_balanced_color]', 'system'),
( 'resource_overload_color', '$post_data[resource_overload_color]', 'system' );";


$queries['create_table_data_tble'] = '
CREATE TABLE '.$db_name.'.."OPTM_APS_PRODOPER" (
OPER_ID  INT           NOT NULL    IDENTITY    PRIMARY KEY,
REF_ID   VARCHAR(100)  NOT NULL,
HEAD_DOC_ENTRY VARCHAR(20)  NOT NULL,
OPER_DOC_ENTRY VARCHAR(20)  NOT NULL,
OPER_LINE_ID VARCHAR(20)  NOT NULL,
RES_LINE_ID VARCHAR(20)  NOT NULL,
OPERATION_TYPE VARCHAR(20)  NOT NULL,
TASK_TYPE VARCHAR(20)  NOT NULL,
WORK_CENTER_ID VARCHAR(100)  NOT NULL,
WORK_ORDER_ID VARCHAR(100)  NOT NULL, 
RESOURCE_ID VARCHAR(100)  NOT NULL,
RESOURCE_NAME  VARCHAR(100)  NOT NULL,
PLANNED_RESOURCE_ID VARCHAR(100)  NOT NULL,
PLANNED_RESOURCE_NAME  VARCHAR(100)  NOT NULL,
OPERATION_NUMBER VARCHAR(100)  NOT NULL,
OPERATION_CODE VARCHAR(100)  NOT NULL,
DESCRIPTION VARCHAR(100)  NOT NULL,
PRIORITY VARCHAR(100)  NOT NULL,
READONLY  tinyint,
STATUS VARCHAR(50)  NOT NULL,
START_DATE datetime,
END_DATE datetime,
DURATION VARCHAR(50)  NOT NULL,
MIN_DURATION VARCHAR(50)  NOT NULL,
PROGRESS VARCHAR(50)  NOT NULL,
IS_LOCAL_TASK  tinyint,
IS_DELETED tinyint,
SPLIT_TASK_GRP_ID VARCHAR(100) NULL
)';



$queries['create_table_links_tble'] = '
CREATE TABLE '.$db_name.'.."OPTM_APS_PRODOPER_LINKS" (
OPR_LINK_ID  INT           NOT NULL    IDENTITY    PRIMARY KEY,
REF_ID   VARCHAR(100)  NOT NULL,
PRED_TASK_ID VARCHAR(20)  NOT NULL,
SUCC_TASK_ID VARCHAR(20)  NOT NULL,
CONNECTION_TYPE VARCHAR(20)  NOT NULL,
)';	


return $queries;
} 

// v.0.02

function upgradation_queries($db_name){
	$queries['0.1.1'] = array(
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ADD required_resource int;'
	);

	$queries['0.1.2'] = array(
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_auto_resync_progress\', \'0\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'auto_resync_duration\', \'5\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'default_day_view_layout\', \'hour\', \'system\' )',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_SCH_REF" ADD WORKING_WC varchar(200) NULL'
	);

	$queries['0.1.3'] = array(
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_minute_view_scale\', \'1\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_year_view_scale\', \'1\', \'system\' )'
	);

	$queries['0.1.4'] = array(
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN REF_ID INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN HEAD_DOC_ENTRY INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN OPER_DOC_ENTRY INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN OPER_LINE_ID INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN RES_LINE_ID INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN OPERATION_NUMBER INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN "PRIORITY" INT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ALTER COLUMN PROGRESS FLOAT',
		'ALTER TABLE '.$db_name.'.."OPTM_APS_PRODOPER" ADD WO_STATUS int;',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_today_marker\', \'1\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'highlight_weekend\', \'1\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_multiple_select_task\', \'1\', \'system\' )',
		'INSERT INTO '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( \'enable_task_quick_info\', \'1\', \'system\' )',
		'UPDATE '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS" SET VALUE = \'{"1":{"tc":"#48be1a","pc":"#2a8607"},"2":{"tc":"#4682db","pc":"#1a68d9"},"3":{"tc":"#cc3d3d","pc":"#8d0e0e"},"4":{"tc":"#d96c49","pc":"#d74a1c"},"5":{"tc":"#f13535","pc":"#da2c2c"},"6":{"tc":"#33b4ea","pc":"#2a9dce"},"7":{"tc":"#c7c340","pc":"#aea913"},"8":{"tc":"#626262","pc":"#000000"},"9":{"tc":"#c5261b","pc":"#941a11"}}\' WHERE NAME =  \'task_type_color_set\''

	);

	return $queries;
}

function uninstall_queries($db_name, $post_data){

	$queries['drop_opr_links'] = 'DROP TABLE '.$db_name.'.."OPTM_APS_SCH_REF" '; 

	$queries['drop_opr'] = 'DROP TABLE '.$db_name.'.."OPTM_APS_PRODOPER" '; 

	$queries['drop_settings'] = 'DROP TABLE '.$db_name.'.."OPTM_APS_PRODOPER_LINKS" '; 

	$queries['drop_ref'] = 'DROP TABLE '.$db_name.'.."OPTM_APS_DSHBD_SETTINGS"'; 

	return $queries;

}

function get_current_schedule_detail_query($reference_id){

	$query = "SELECT * FROM \"OPTM_APS_SCH_REF\" WHERE OPTM_REF_ID = '$reference_id' ";
	return $query;

}

//This will get the URL from DB
function get_login_service_URL_query(){

	$query = "select OPTM_URL From OPTIPROADMIN..OPTM_MGSDFLT where Default_Key = 'OptiAdmin'";
	return $query;

}

//This will get All the Data Bases of the Server
function get_all_server_db(){

	$query = 'select distinct dbName,cmpName from "SBO-COMMON"..SRGC';
	return $query;

}

//This will get All the Version Details of the Server
function get_installed_product_query($company_name){

	$query = "select \"U_PRODUCTVERSION\" from \"$company_name\"..\"@OPTM_INSTPRODUCTS\"where U_PRODUCTCODE = 'SWB'";
	return $query;

}

//This function will insert an product version insert into the '@OPTM_INSTPRODUCTS' Table
function insert_swb_product($dbname, $version){
	$query = "INSERT INTO \"$dbname\"..\"@OPTM_INSTPRODUCTS\" values ((SELECT MAX(U_RECID) + 1 from \"$dbname\"..\"@OPTM_INSTPRODUCTS\" ),'SWB','$version','0','','0','OptiPro SWB',GETDATE(),'',GETDATE(),'')";
	return $query;
}


//This function will update an product version into the '@OPTM_INSTPRODUCTS' Table
function update_swb_product($dbname, $version){
	$query = "update \"$dbname\"..\"@OPTM_INSTPRODUCTS\" set U_PRODUCTVERSION = '$version',U_OLDPRODUCTVERSION = (SELECT U_PRODUCTVERSION from \"$dbname\"..\"@OPTM_INSTPRODUCTS\" where  U_PRODUCTCODE = 'SWB'),U_UPDATEDON = GETDATE(),U_RECDATE= GETDATE() where U_PRODUCTCODE = 'SWB'";
	return $query;
}

// 0.1.4

// check for cancelled orderes with this query
function refresh_wo_status_change_query($ref_id){
	$query = "SELECT prod_opr.U_OPTM_OPERPROGRESS, prod_head.U_OPTM_PROGRESS, prod_head.U_OPTM_PRIORITY as \"priority\", prod_opr.U_O_OPR_ID,  prod_head.U_O_ORDRNO, prod_head.DocEntry as head_doc_entry, 
prod_opr.DocEntry as oper_doc_entry, prod_opr.LineId as oper_line_id, OPER_ID as oper_id, REF_ID as ref_id, prod_head.U_O_STATUS as prod_wo_status, aps_opr.WO_status as current_status
	FROM \"@OPTM_PRODOPER\" as prod_opr
	INNER JOIN \"@OPTM_PRODORDR\" as prod_head ON prod_head.DocEntry = prod_opr.DocEntry
	LEFT JOIN \"OPTM_APS_PRODOPER\" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry 
	WHERE REF_ID = '$ref_id' AND
	prod_head.U_O_STATUS != aps_opr.WO_status AND 
	OPER_ID IS NOT NULL
	ORDER BY U_O_ORDRNO, prod_opr.U_O_OPR_ID ASC";

	return $query;
}

function aps_wo_oper_status_update_query($operation_id,  $wo_status){
	$query = "UPDATE \"OPTM_APS_PRODOPER\" 
	SET WO_STATUS = '$wo_status' 
	WHERE OPER_ID = '$operation_id'";
	return $query;
}