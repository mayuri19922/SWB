-- Operations 
DROP TABLE "OPTM_APS_PRODOPER";

CREATE TABLE "OPTM_APS_PRODOPER" (
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
	SPLIT_TASK_GRP_ID VARCHAR(100) NULL,
);


-- Operations Links 

DROP TABLE "OPTM_APS_PRODOPER_LINKS";

CREATE TABLE "OPTM_APS_PRODOPER_LINKS" (
	OPR_LINK_ID  INT           NOT NULL    IDENTITY    PRIMARY KEY,
	REF_ID   VARCHAR(100)  NOT NULL,
	PRED_TASK_ID VARCHAR(20)  NOT NULL,
	SUCC_TASK_ID VARCHAR(20)  NOT NULL,
	CONNECTION_TYPE VARCHAR(20)  NOT NULL,
);


-- Plan table 

DROP TABLE "OPTM_APS_SCH_REF";

CREATE TABLE "OPTM_APS_SCH_REF" (
	OPTM_REF_ID              INT           NOT NULL    IDENTITY    PRIMARY KEY,
	OPTM_PLAN_NAME           VARCHAR(100)  NOT NULL,
	OPTM_FROM_DATE  datetime,
	OPTM_TO_DATE  datetime,
	OPTM_SCHEDULING_STATUS  VARCHAR(100),
	OPTM_IS_DELETED  tinyint,
);

 -- Settings Table 

 DROP TABLE "OPTM_APS_DSHBD_SETTINGS";

 CREATE TABLE "OPTM_APS_DSHBD_SETTINGS" (
 	ID              INT           NOT NULL    IDENTITY    PRIMARY KEY,
 	NAME varchar(400) NULL,
 	VALUE text NULL,
 	GROUP varchar(150) NULL,
 );

 INSERT INTO "OPTM_APS_DSHBD_SETTINGS" (NAME, VALUE, GROUP) VALUES
('default_work_center',	'all',	'system'),
('task_column_width',	'50',	'system'),
('chart_table_row_height',	'30',	'system'),
('left_panel_width',	'550',	'system'),
('left_panel_resize',	'1',	'system'),
('enable_keyboard_shortcut',	'1',	'system'),
('chart_header_scale_height',	'50',	'system'),
('default_timeline_view',	'day',	'system'),
('default_task_color_code',	'priority',	'system'),
('drag_lightbox',	'1',	'system'),
('lightbox_additional_height',	'120',	'system'),
('default_theme',	'material',	'system'),
('task_type_color_set',	'{"1":{"task_color":"#000000","progress_color":"#000000"},"2":{"task_color":"#000000","progress_color":"#000000"},"3":{"task_color":"#9f55ba","progress_color":"#9113e5"},"4":{"task_color":"#d75252","progress_color":"#f60f0f"},"5":{"task_color":"#000000","progress_color":"#000000"},"6":{"task_color":"#cbdc3b","progress_color":"#a4c006"},"7":{"task_color":"#000000","progress_color":"#000000"},"8":{"task_color":"#000000","progress_color":"#000000"},"9":{"task_color":"#000000","progress_color":"#000000"}}',	'system'),
('priority_color_set',	'{"1":{"task_color":"#e2643c","progress_color":"#e50e1e"},"11":{"task_color":"#4ccf54","progress_color":"#10b336"},"31":{"task_color":"#427db8","progress_color":"#0747ae"}}',	'system'),
('left_right_panel_font_size',	'12',	'system'),
('unhighlight_color',	'#aaa7a8',	'system');


INSERT INTO "OPTM_APS_DSHBD_SETTINGS" (NAME, value, "group")  VALUES ( 'default_resource_load_layout', 'detail', 'system' ) 

INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'resource_balanced_color', '#42b849', 'system' )

INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'resource_overload_color', '#d96c49', 'system' )


-- 23-03-2018

ALTER TABLE "OPTM_APS_PRODOPER" ADD required_resource int;


-- Alter queries 

use "OptiAPS"

SELECT X.id , X.head_doc_entry , X.oper_doc_entry  ,  X.oper_line_id  , X.res_line_id , X.work_center_id ,  X.work_order_id ,  X.resource_id , X.resource_name , X.operation_number , X.operation_code , X.description , X.priority , X.readonly , X.status , X.start_date , X.end_date , X.duration , X.progress , X.res_operation_number
	from (
	SELECT 
	ROW_NUMBER() over (partition by A.U_O_ORDRNO , C.U_O_OPERNO order by  (case when isnull(G.U_OPTM_SCHEDULE , 'N') ='N' then 1 else 0 end) , G.lineID)  AS row_number ,
	ROW_NUMBER() OVER(ORDER BY A.U_O_ORDRNO,C.U_O_OPERNO,G.LineId ASC) AS id, A.DocEntry as head_doc_entry, C.DocEntry as oper_doc_entry, C.LineId as oper_line_id,  G.LineId as res_line_id,  G.U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, G.U_O_RESID AS resource_id, G.U_O_RESDESC as resource_name, C.U_O_OPERNO AS operation_number, C.U_O_OPR_ID AS operation_code, C.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, C.U_OPTM_LOCKED AS readonly, C.U_O_OPERCMPFLG AS status, C.U_OPTM_OPSDATE AS start_date, C.U_OPTM_OPEDATE AS end_date, C.U_OPTM_OPLTHRS AS duration, ((C.U_O_CUMPRDCDQTY/A.U_O_ORDRQTY)*100) AS progress, G.U_O_ISSTOOPER as res_operation_number 
	FROM "@OPTM_PRODORDR" A 
	INNER JOIN "@OPTM_PRODOPER" C ON A.DocEntry=C.DocEntry 
	INNER join "@OPTM_PRODRES" G on A.DocEntry=G.DocEntry and C.U_O_OPERNO = G.U_O_ISSTOOPER 
	INNER JOIN "@OPTMPRD_ROUT_HDR" B On A.U_O_PRODID=B.U_O_PRODUCT_NO and A.U_O_RUTNGSEQ=B.U_O_ROUT_SEQ and A.U_O_RTNGREV=B.U_O_REVI_NO 
	INNER JOIN "@OPTMPRD_ROUT_LINE" D on B.Code=D.Code and C.U_O_OPERNO=D.U_O_LINE_NO 
	INNER JOIN "@OPTMPRD_ROU_LN_RES" F on B.Code=F.Code and D.LineId=F.U_O_ROUTLINE and D.U_O_LINE_NO=F.U_O_LINE_NO 
	INNER JOIN "@OPTMWC_MST" E on D.U_O_WC_ID=E.Code 
	WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' 
	) 
	AS X WHERE X.row_number =1 AND (X.start_date BETWEEN '2018-01-01 00:00:00' AND  '2018-01-31 00:00:00')
	ORDER BY X.operation_number ASC