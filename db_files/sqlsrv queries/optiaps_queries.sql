/****** Script for SelectTopNRows command from SSMS  ******/
USE optiAPS

-- check if SFDC installed 
SELECT * FROM "@OPTM_INSTPRODUCTS" WHERE U_PRODUCTCODE = 'SFDC'

-- select all work center and work center id 
SELECT DISTINCT prod_res.U_O_WC_ID, wc_msg.Code as id, wc_msg.Name as name
FROM "@OPTM_PRODRES" AS prod_res 
LEFT JOIN "@OPTMWC_MST" AS wc_msg ON prod_res.U_O_WC_ID = wc_msg.Code
WHERE U_O_WC_ID !='';

-- get resources 
SELECT DISTINCT U_O_WC_ID as work_center_id, U_O_RESID as id, U_O_RESDESC as name  
	FROM "@OPTM_PRODRES" 
	WHERE U_O_RESID != ''
		
 -- get work center wise resource id and resource name (for timeline view only)
SELECT U_O_WC_ID as work_center_id,wc_msg.Name as work_center_name, U_O_RESID as resource_id, U_O_RESDESC as resource_name  
FROM "@OPTM_PRODRES" as prod_res 
LEFT JOIN "@OPTMWC_MST" AS wc_msg ON prod_res.U_O_WC_ID = wc_msg.Code
WHERE U_O_RESID != ''

-- get work orders 
SELECT DISTINCT U_O_WC_ID as work_center_id,  A.DocEntry as head_doc_entry, A.U_O_ORDRNO as id, A.U_O_ORDRNO as work_order_id, A.U_O_ORDRNO as description, A.U_O_STARTDATE as start_date, A.U_O_ENDDATE as end_date, A.U_OPTM_PRIORITY AS priority
FROM "@OPTM_PRODORDR" A 
JOIN "@OPTM_PRODRES" C on A.DocEntry=C.DocEntry
WHERE U_O_WC_ID != '' AND A.U_O_ORDRNO IN ('WO00000003','WO00000005','WO00000003')

--update work orders
update "@OPTM_PRODORDR" SET U_O_STARTDATE = '2017-12-18', U_O_ENDDATE = '2017-12-18'

-- get work orders and operations 
SELECT A."U_O_ORDRNO" as work_order_number,  CONCAT(A."U_O_ORDRNO",'-' ,B."U_O_OPERNO") as work_order_task, B.U_O_OPR_ID as opr_id, B.U_O_OPERNO as oper_no, B.U_O_OPR_DESC as opr_desc 
FROM "@OPTM_PRODORDR" A 
JOIN "@OPTM_PRODOPER" B on A.DocEntry=B.DocEntry WHERE U_O_OPR_ID != ''

-- Get operations from productions 
SELECT top 10 ROW_NUMBER() OVER(ORDER BY A.U_O_ORDRNO,B.U_O_OPERNO,C.LineId ASC) AS id, A.DocEntry as head_doc_entry, B.DocEntry as oper_doc_entry, B.LineId as oper_line_id,  C.LineId as res_line_id,  U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, C.U_O_RESID AS resource_id, C.U_O_RESDESC as resource_name, B.U_O_OPERNO AS operation_number, B.U_O_OPR_ID AS name, B.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, B.U_OPTM_LOCKED AS readonly, B.U_O_OPERCMPFLG AS status, B.U_OPTM_OPSDATE AS start_date, B.U_OPTM_OPEDATE AS end_date, B.U_OPTM_OPLTHRS AS duration, ((B.U_O_CUMPRDCDQTY/A.U_O_ORDRQTY)*100) AS progress  
FROM "@OPTM_PRODORDR" A 
JOIN "@OPTM_PRODOPER" B on A.DocEntry=B.DocEntry 
JOIN "@OPTM_PRODRES" C on A.DocEntry=C.DocEntry and B.U_O_OPERNO=C.U_O_ISSTOOPER
ORDER BY B.U_O_OPERNO ASC

-- select unique operations from productions
SELECT X.id , X.head_doc_entry , X.oper_doc_entry  ,  X.oper_line_id  , X.res_line_id , X.work_center_id ,  X.work_order_id ,  X.resource_id , X.resource_name , X.operation_number , X.operation_code , X.description , X.priority , X.readonly , X.status , X.start_date , X.end_date , X.duration , X.progress 
from (
	SELECT 
	ROW_NUMBER() over (partition by A.U_O_ORDRNO , C.U_O_OPERNO order by  (case when isnull(G.U_OPTM_SCHEDULE , 'N') ='N' then 1 else 0 end) , G.lineID)  AS RowNumber ,
	ROW_NUMBER() OVER(ORDER BY A.U_O_ORDRNO,C.U_O_OPERNO,G.LineId ASC) AS id, A.DocEntry as head_doc_entry, C.DocEntry as oper_doc_entry, C.LineId as oper_line_id,  G.LineId as res_line_id,  G.U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, G.U_O_RESID AS resource_id, G.U_O_RESDESC as resource_name, C.U_O_OPERNO AS operation_number, C.U_O_OPR_ID AS operation_code, C.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, C.U_OPTM_LOCKED AS readonly, C.U_O_OPERCMPFLG AS status, C.U_OPTM_OPSDATE AS start_date, C.U_OPTM_OPEDATE AS end_date, C.U_OPTM_OPLTHRS AS duration, ((C.U_O_CUMPRDCDQTY/A.U_O_ORDRQTY)*100) AS progress 
	FROM "@OPTM_PRODORDR" A 
	INNER JOIN "@OPTM_PRODOPER" C ON A."DocEntry"=C."DocEntry" 
	INNER join "@OPTM_PRODRES" G on A.DocEntry=G.DocEntry and C.U_O_OPERNO = G.U_O_ISSTOOPER 
	INNER JOIN "@OPTMPRD_ROUT_HDR" B On A.U_O_PRODID=B.U_O_PRODUCT_NO and A.U_O_RUTNGSEQ=B.U_O_ROUT_SEQ and A.U_O_RTNGREV=B.U_O_REVI_NO 
	INNER JOIN "@OPTMPRD_ROUT_LINE" D on B."Code"=D."Code" and C.U_O_OPERNO=D.U_O_LINE_NO 
	INNER JOIN "@OPTMPRD_ROU_LN_RES" F on B."Code"=F."Code" and D."LineId"=F.U_O_ROUTLINE and D.U_O_LINE_NO=F.U_O_LINE_NO 
	INNER JOIN "@OPTMWC_MST" E on D.U_O_WC_ID=E."Code" 
	WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' 
) 
AS X WHERE X."RowNumber" =1 
AND X.work_center_id = 'WCM-01' 
ORDER BY X.work_order_id ASC

-- settings select 
SELECT OPTM_ID as id, OPTM_NAME as name,OPTM_value as value, OPTM_GROUP as grp 
FROM "OPTM_APS_DASHBOARD_SETTING" 

-- settings update
UPDATE "OPTM_APS_DASHBOARD_SETTING" SET OPTM_value = '50' WHERE OPTM_NAME = 'task_column_width'

-- get operation links 
SELECT OPTM_ID, OPTM_SUCC_TASK, OPTM_PRED_TASK, OPTM_CONNECTION_TYPE FROM "OPTR_OPER_LINKS"

SELECT OPTM_REF_ID,OPTM_PLAN_NAME, OPTM_FROM_DATE, OPTM_TO_DATE, OPTM_SCHEDULING_STATUS, OPTM_IS_DELETED  FROM "OPTM_APS_SCH_REF"

--select operation from local APS tables
SELECT DISTINCT task.DURATION as duration , task.MIN_DURATION as min_duration , task.WORK_ORDER_ID, task.OPERATION_NUMBER, task.OPERATION_CODE, wo.OPER_ID as parent, 
	(
	Select top 1 OPER_ID 
	from "OPTM_APS_PRODOPER" 
	Where cast (OPERATION_NUMBER as int) < cast(Task.OPERATION_NUMBER as int) and WORK_ORDER_ID = wo.WORK_ORDER_ID and operation_type = 'task' order by cast (OPERATION_NUMBER as int) DESC 
	) as source_id, 
	task.OPER_ID as id, task.REF_id as ref_id, task.HEAD_DOC_ENTRY as head_doc_entry, 
	task.OPER_DOC_ENTRY as oper_doc_entry, task.OPER_LINE_ID as oper_line_id, task.RES_LINE_ID as res_line_id, task.OPERATION_TYPE as operation_type, task.TASK_TYPE as task_type, 
	task.WORK_CENTER_ID as work_center_id, task.WORK_ORDER_ID as work_order_id, task.RESOURCE_ID as resource_id , task.RESOURCE_NAME as resource_name , 
	task.PLANNED_RESOURCE_ID as planned_resource_id , task.PLANNED_RESOURCE_NAME as planned_resource_name , task.OPERATION_NUMBER as operation_number , 
	task.OPERATION_CODE as operation_code , task.DESCRIPTION as description , task.PRIORITY as priority , task.READONLY as readonly , task.STATUS as status , task.START_DATE as start_date , 
	task.END_DATE as end_date , task.DURATION as duration , task.MIN_DURATION as min_duration , task.PROGRESS as progress , task.IS_LOCAL_TASK as is_local_task , 
	task.IS_DELETED as is_deleted , task.SPLIT_TASK_GRP_ID as split_task_grp_id, task.required_resource, task.WO_STATUS as work_order_status
	FROM "OPTM_APS_PRODOPER" as task
	LEFT JOIN "OPTM_APS_PRODOPER" as wo ON 
	task.work_order_id = wo.OPERATION_CODE AND
	task.OPER_DOC_ENTRY = wo.HEAD_DOC_ENTRY 
	AND wo.OPERATION_TYPE = 'project'
	WHERE  task.REF_id = '1'  AND  task.IS_DELETED = '0' 
	ORDER BY task.WORK_ORDER_ID, task.OPERATION_NUMBER ASC

 -- PRODUCTION PERATION DUMB QUERY 
 SELECT X.id , X.head_doc_entry , X.oper_doc_entry  ,  X.oper_line_id  , X.res_line_id , X.work_center_id ,  X.work_order_id ,  X.resource_id , X.resource_name , X.operation_number , 
	X.operation_code , X.description , X.priority , X.readonly , X.status , X.start_date , X.end_date , X.duration , X.progress , X.res_operation_number, X.work_order_status
	from (
	SELECT 
	ROW_NUMBER() over (partition by A.U_O_ORDRNO , C.U_O_OPERNO order by  (case when isnull(G.U_OPTM_SCHEDULE , 'N') ='N' then 1 else 0 end) , G.lineID)  AS row_number ,
	ROW_NUMBER() OVER(ORDER BY A.U_O_ORDRNO,C.U_O_OPERNO,G.LineId ASC) AS id, A.DocEntry as head_doc_entry, C.DocEntry as oper_doc_entry, C.LineId as oper_line_id,  G.LineId as res_line_id, 
	 G.U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, G.U_O_RESID AS resource_id, G.U_O_RESDESC as resource_name, C.U_O_OPERNO AS operation_number, C.U_O_OPR_ID AS operation_code,
	  C.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, C.U_OPTM_LOCKED AS readonly, C.U_O_OPERCMPFLG AS status, C.U_OPTM_OPSDATE AS start_date, C.U_OPTM_OPEDATE AS end_date,
	   C.U_OPTM_OPLTHRS AS duration, CEILING(C.U_OPTM_OPERPROGRESS) AS progress, G.U_O_ISSTOOPER as res_operation_number, A.U_O_STATUS as work_order_status 
	FROM "@OPTM_PRODORDR" A 
	INNER JOIN "@OPTM_PRODOPER" C ON A.DocEntry=C.DocEntry 
	INNER join "@OPTM_PRODRES" G on A.DocEntry=G.DocEntry and C.U_O_OPERNO = G.U_O_ISSTOOPER  AND G.U_OPTM_SCHEDULE = 'Y'
	INNER JOIN "@OPTMPRD_ROUT_HDR" B On A.U_O_PRODID=B.U_O_PRODUCT_NO and A.U_O_RUTNGSEQ=B.U_O_ROUT_SEQ and A.U_O_RTNGREV=B.U_O_REVI_NO 
	INNER JOIN "@OPTMPRD_ROUT_LINE" D on B.Code=D.Code and C.U_O_OPERNO=D.U_O_LINE_NO 
	INNER JOIN "@OPTMPRD_ROU_LN_RES" F on B.Code=F.Code and D.LineId=F.U_O_ROUTLINE and D.U_O_LINE_NO=F.U_O_LINE_NO 
	INNER JOIN "@OPTMWC_MST" E on D.U_O_WC_ID=E.Code 
	WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' 
	) 
	AS X WHERE X.row_number =1 
	AND (
			(X.start_date BETWEEN '2018-01-01 00:00:00' AND  '2018-06-30 00:00:00') OR 
			(X.end_date BETWEEN '2018-01-01 00:00:00' AND  '2018-06-30 00:00:00') OR
			(X.start_date > '2018-01-01 00:00:00' AND X.end_date < '2018-06-30 00:00:00') 
	)
	ORDER BY X.work_order_id ASC, X.operation_number, X.operation_code ASC

-- RESYNC STATUS QUERY 

SELECT prod_opr.U_OPTM_OPERPROGRESS, prod_head.U_OPTM_PROGRESS, prod_head.U_OPTM_PRIORITY as "priority", prod_opr.U_O_OPR_ID,  prod_head.U_O_ORDRNO, prod_head.DocEntry as head_doc_entry, 
prod_opr.DocEntry as oper_doc_entry, prod_opr.LineId as oper_line_id, OPER_ID as oper_id, REF_ID as ref_id
	FROM "@OPTM_PRODOPER" as prod_opr
	INNER JOIN "@OPTM_PRODORDR" as prod_head ON prod_head.DocEntry = prod_opr.DocEntry
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry 
	WHERE prod_head.U_O_STATUS <> '3' AND prod_head.U_O_STATUS <> '4'
	-- AND (prod_opr.U_OPTM_OPSDATE BETWEEN '' AND '')
	AND REF_ID = '1'
	ORDER BY U_O_ORDRNO, prod_opr.U_O_OPR_ID ASC 

	-- RESYNC DATA QUERY	

	SELECT DISTINCT aps_opr.OPER_ID, aps_opr.REF_ID,U_O_STARTDATE, C.U_O_WC_ID as work_center_id, A.DocEntry as head_doc_entry, A.U_O_ORDRNO as id, A.U_O_ORDRNO as work_order_id, 
	A.U_O_ORDRNO as name, A.U_O_ORDRNO as description, U_O_STARTDATE as start_date, A.U_O_ENDDATE as end_date, A.U_OPTM_PRIORITY AS priority, C.U_O_ISSTOOPER as res_operation_number,
	 A.U_OPTM_STRTTIME as start_time, A.U_OPTM_ENDTIME as end_time, CEILING(A.U_OPTM_PROGRESS) as progress, A.U_O_STATUS as prod_wo_status
	FROM "@OPTM_PRODORDR" A
	INNER JOIN "@OPTM_PRODOPER" B ON A."DocEntry"=B."DocEntry" 
	JOIN "@OPTM_PRODRES" C on A.DocEntry=C.DocEntry and B.U_O_OPERNO = C.U_O_ISSTOOPER 
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = A.DocEntry  AND aps_opr.OPER_DOC_ENTRY = C.DocEntry
	WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' 
	AND OPER_ID IS NULL

	-- Resync data for status change  and cancelled or close order 

	SELECT prod_opr.U_OPTM_OPERPROGRESS, prod_head.U_OPTM_PROGRESS, prod_head.U_OPTM_PRIORITY as "priority", prod_opr.U_O_OPR_ID,  prod_head.U_O_ORDRNO, prod_head.DocEntry as head_doc_entry, 
prod_opr.DocEntry as oper_doc_entry, prod_opr.LineId as oper_line_id, OPER_ID as oper_id, REF_ID as ref_id, prod_head.U_O_STATUS as prod_wo_status, aps_opr.WO_status as current_status
	FROM "@OPTM_PRODOPER" as prod_opr
	INNER JOIN "@OPTM_PRODORDR" as prod_head ON prod_head.DocEntry = prod_opr.DocEntry
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry 
	WHERE REF_ID = 1 AND
	prod_head.U_O_STATUS != aps_opr.WO_status AND 
	OPER_ID IS NOT NULL
	ORDER BY U_O_ORDRNO, prod_opr.U_O_OPR_ID ASC 