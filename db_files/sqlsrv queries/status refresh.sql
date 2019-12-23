use optiAPS

-- previous refresh query 
	SELECT prod_opr.U_OPTM_OPERPROGRESS, prod_head.U_OPTM_PROGRESS, prod_head.U_OPTM_PRIORITY as "priority", prod_opr.U_O_OPR_ID,  prod_head.U_O_ORDRNO, prod_head.DocEntry as head_doc_entry, prod_opr.DocEntry as oper_doc_entry, prod_opr.LineId as oper_line_id, OPER_ID as oper_id, REF_ID as ref_id
	FROM "@OPTM_PRODOPER" as prod_opr
	INNER JOIN "@OPTM_PRODORDR" as prod_head ON prod_head.DocEntry = prod_opr.DocEntry
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry 
	WHERE prod_head.U_O_STATUS <> '3' AND prod_head.U_O_STATUS <> '4'
	AND (prod_opr.U_OPTM_OPSDATE BETWEEN '2018-06-01' AND '2018-08-30')
	AND REF_ID = '1'
	ORDER BY U_O_ORDRNO, prod_opr.U_O_OPR_ID ASC;

	-- for operation header status update
	SELECT prod_head.U_OPTM_PROGRESS as progress, prod_head.U_OPTM_PRIORITY as "priority",prod_head.DocEntry, aps_opr.OPER_ID,  aps_opr.WORK_ORDER_ID, REF_ID
	FROM "@OPTM_PRODORDR" as prod_head 
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON aps_opr.HEAD_DOC_ENTRY = prod_head.DocEntry AND prod_head.U_O_ORDRNO = aps_opr.OPERATION_CODE
	WHERE prod_head.U_O_STATUS <> '3' AND prod_head.U_O_STATUS <> '4'
	AND aps_opr.OPER_ID != '' AND REF_ID = '1' AND aps_opr.OPERATION_TYPE = 'project'

	-- update work order all task priority 
	UPDATE "OPTM_APS_PRODOPER" SET "priority" = '99'  WHERE (WORK_ORDER_ID = 'WO00000007' OR OPERATION_CODE = 'WO00000007' ) AND REF_ID = '1'
	
	-- update work order progress 
	  UPDATE "OPTM_APS_PRODOPER" SET PROGRESS = '1'  WHERE OPER_ID = '1'


	-- select prod operations status
	SELECT prod_opr.U_OPTM_OPERPROGRESS as operation_progress,  aps_opr.OPER_ID,  aps_opr.TASK_TYPE
	FROM "@OPTM_PRODOPER" as prod_opr
	LEFT JOIN "OPTM_APS_PRODOPER" as aps_opr ON prod_opr.DocEntry = aps_opr.OPER_DOC_ENTRY AND  aps_opr.OPERATION_NUMBER = prod_opr.U_O_OPERNO
	WHERE aps_opr.OPER_ID != '' AND REF_ID = '1' AND aps_opr.OPERATION_TYPE = 'task'

	-- update operation progress 
	  UPDATE "OPTM_APS_PRODOPER" SET PROGRESS = '1'  WHERE OPER_ID = '1'

	SELECT U_O_OPERNO, * FROM "@OPTM_PRODOPER" 
	SELECT * FROM "@OPTM_PRODORDR"

	SELECT * FROM "OPTM_APS_PRODOPER" WHERE REF_ID  = '1' 