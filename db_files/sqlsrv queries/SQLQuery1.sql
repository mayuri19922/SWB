USE optiAPS


SELECT * FROM "@OPTMWC_MST"  -- Code and Name

SELECT * FROM "@OPTMOPR_MST" 
SELECT * FROM "@OPTMOPR_DTL" 

select * from "@OPTMPRD_ROUT_LINE"   -- work ceter 

select * from "@OPTMPRD_ROU_LN_RES"

SELECT * FROM "@OPTM_PRODORDR" -- work order U_O_ORDRNO

SELECT * FROM "@OPTM_PRODOPER" -- operations corresponding work order - U_O_OPR_ID || Operation NUMBER - U_O_OPERNO,  ID - U_O_OPR_ID, NAME-	U_O_OPR_DESC

-- resource table
SELECT * FROM "@OPTM_PRODRES" -- U_O_WC_ID - work center id || resource id - U_O_RESID andd Resource Name - U_O_RESDESC

-- production order header
select * from "@OPTM_PRODORDR"


UPDATE "@OPTM_PRODORDR" SET U_O_STARTDATE= '2017-12-19' , U_O_ENDDATE= '2017-12-19' 
select* from "@OPTM_INSTPRODUCTS"

select * from "@OPTM_SAK2"
update "@OPTM_SAK2" set Name='FE9GcK7jOXoNUkDZyUR7jg=='

Select * from "@OPTM_PRODRES"

Select U_OPTM_LOCKED,* from "@OPTM_PRODOPER"
	
SELECT B.U_O_OPERNO AS id, B.DocEntry ,  B.U_OPTM_OPSDATE AS start_date, B.U_OPTM_OPEDATE AS end_date 
FROM "@OPTM_PRODOPER" B 

SELECT U_OPTM_PRIORITY, * FROM "@OPTM_PRODORDR" WHERE DocEntry = 8
SELECT * FROM "@OPTM_PRODOPER" WHERE DocEntry = 5
	
SELECT DISTINCT U_O_WC_ID, U_O_RESID, U_O_RESDESC, U_O_ISSTOOPER, CONCAT(U_O_WC_ID,':',U_O_RESID,':',U_O_ISSTOOPER) as unique_key
FROM "@OPTM_PRODRES" 
WHERE U_O_RESID !=''


sp_columns "OPTM_APS_PRODOPER"


SELECT * FROM "OPTM_APS_PRODOPER" ORDER BY work_order_id, OPERATION_NUMBER

select * FROM "OPTM_APS_PRODOPER" WHERE WORK_CENTER_ID = 'WCM-01' AND resource_id = 'Res-Sub'

ALTER TABLE "OPTM_APS_PRODOPER"
ADD WO_STATUS int;


ALTER TABLE "OPTM_APS_PRODOPER"
ADD required_resource int;

SELECT * FROM "OPTM_APS_PRODOPER"
WHERE IS_LOCAL_TASK = 1

 -- INSERT INTO "OPTM_APS_DSHBD_SETTINGS" (NAME, value, "group")  VALUES ( 'default_resource_load_layout', 'detail', 'system' ) 

-- INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'resource_balanced_color', '#42b849', 'system' )
-- INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'resource_overload_color', '#d96c49', 'system' )

 -- Settings Table 

 sp_columns "OPTM_APS_PRODOPER"

 

 SP_TABLES '%capacity%'

 SELECT * FROM "@OPTMSHIFT_MASTER"

 SELECT * FROM "@OPTMWC_RESOSHIFT"

 
SELECT OPTM_REF_ID as ref_id, OPTM_FROM_DATE as from_date, OPTM_TO_DATE as to_date, OPTM_SCHEDULING_STATUS as scheduling_status, OPTM_IS_DELETED as is_deleted, OPTM_PLAN_NAME as plan_name FROM "OptiAPS".."OPTM_APS_SCH_REF" 


use OptiAPS
use OptiAPS_DEV


truncate table  "OPTM_APS_SCH_REF" 
truncate table "OPTM_APS_PRODOPER"
truncate table "OPTM_APS_PRODOPER_LINKS"
-------------------------------------------------------------

-- select local table data
SELECT * FROM  "OPTM_APS_SCH_REF" 
SELECT * FROM "OPTM_APS_PRODOPER" WHERE WO_STATUS = 3 
SELECT * FROM "OPTM_APS_PRODOPER_LINKS" 
SELECT * FROM "OPTM_APS_DSHBD_SETTINGS"

update "OPTM_APS_DSHBD_SETTINGS" SET value = 'detail' where name = 'default_resource_load_layout'
SELECT ROUND(345.156, 1),CEILING(25.75) AS CeilValue , Floor(25.75) AS floor_value 

sp_columns "OPTM_APS_PRODOPER"
SELECT  * FROM "OPTIPROADMIN"

ALTER TABLE optiAPS.."OPTM_APS_SCH_REF" DROP column "working_work_center"

ALTER TABLE optiAPS.."OPTM_APS_SCH_REF" ADD WORKING_WC varchar(200) NULL 

SELECT * 
INTO OPTIAPS_DEV.."OPTM_APS_SCH_REF" 
FROM OPTIAPS.."OPTM_APS_SCH_REF"

SELECT * 
INTO OPTIAPS_DEV.."OPTM_APS_PRODOPER" 
FROM OPTIAPS.."OPTM_APS_PRODOPER"

SELECT * 
INTO OPTIAPS_DEV.."OPTM_APS_PRODOPER_LINKS" 
FROM OPTIAPS.."OPTM_APS_PRODOPER_LINKS"

SELECT * 
INTO OPTIAPS_DEV.."OPTM_APS_DSHBD_SETTINGS" 
FROM OPTIAPS.."OPTM_APS_DSHBD_SETTINGS"

update "OPTM_APS_SCH_REF" set OPTM_PLAN_NAME = 'Test Plan on dev' Where OPTM_REF_ID = 1;
USE "SFDCDB"
INSERT INTO "SFDCDB".."@OPTM_INSTPRODUCTS" values ((SELECT MAX(U_RECID) + 1 from "SFDCDB".."@OPTM_INSTPRODUCTS" ),'SWB','0.1.2','0','','0','OptiPro SWB',GETDATE(),'',GETDATE(),'')

INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'enable_auto_resync_progress', '0', 'system' );

INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'auto_resync_duration', '5', 'system' );

INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'default_day_view_layout', 'hour', 'system' );


INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'enable_minute_view_scale', '1', 'system' );
INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'enable_year_view_scale', '1', 'system' );
INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'enable_multiple_select_task', '1', 'system' );
INSERT INTO "OPTM_APS_DSHBD_SETTINGS" ( NAME, value, "group") VALUES ( 'enable_task_quick_info', '1', 'system' );




SELECT DISTINCT U_O_WC_ID as work_center_id, U_O_RESID as id, U_O_RESDESC as name  
	FROM "@OPTM_PRODRES" 
	WHERE U_O_RESID != ''

DROP table  "OPTM_APS_SCH_REF" 
DROP table "OPTM_APS_PRODOPER"
DROP table "OPTM_APS_PRODOPER_LINKS"
DROP table "OPTM_APS_DSHBD_SETTINGS"

ALTER TABLE "OPTM_APS_PRODOPER" ADD required_resource int;

SELECT TOP 1 OPTM_REF_ID FROM "OPTM_APS_SCH_REF" ORDER BY OPTM_REF_ID DESC 


SELECT "ID" AS "id", "GROUP" AS "grp", "NAME" AS "name", SUBSTRING(CAST("VALUE" AS varchar),1, 253) AS "value1", SUBSTRING(CAST("VALUE" AS varchar),254, 253) AS "value2" FROM "OPTM_APS_DSHBD_SETTINGS"

use optiAPS

	
	update "OPTM_APS_PRODOPER" SET duration = min_duration

	 use OptiAPS

	

	update "@OPTM_PRODRES" SET U_OPTM_SCHEDULE = 'Y'

	
	SELECT CEILING(U_OPTM_OPERPROGRESS),  * FROM "@OPTM_PRODOPER"

	SELECT U_OPTM_PROGRESS, * FROM "@OPTM_PRODORDR" 
 

 UPDATE "OPTM_APS_PRODOPER" SET TASK_TYPE='1',	RESOURCE_ID='Res-Labor', RESOURCE_NAME='Res-labor', OPERATION_CODE='New task', DESCRIPTION='NEw operation ', WORK_CENTER_ID='WCM-01', WORK_ORDER_ID='1', PRIORITY='99', READONLY='0', STATUS='0', START_DATE='2018-05-16 07:36', END_DATE='2018-05-16 12:36', DURATION='5', PROGRESS='0' WHERE OPER_ID = '105'

 SELECT DISTINCT U_O_WC_ID as work_center_id, U_O_RESID as id, U_O_RESDESC as name  
	FROM "@OPTM_PRODRES" 
	WHERE U_O_RESID != ''

	   sp_columns "OPTM_APS_PRODOPER"

	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN REF_ID INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN HEAD_DOC_ENTRY INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN OPER_DOC_ENTRY INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN OPER_LINE_ID INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN RES_LINE_ID INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN OPERATION_NUMBER INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN "PRIORITY" INT;
	   ALTER TABLE "OPTM_APS_PRODOPER" ALTER COLUMN PROGRESS FLOAT;
	   

	 SELECT U_O_STATUS, * FROM "@OPTM_PRODORDR" A 
	SELECT * FROM  "@OPTM_PRODOPER" C  
	SELECT * FROM  "@OPTM_PRODRES" G 

	update "@OPTM_PRODORDR" SET U_O_STATUS = 6 WHERE  U_O_ORDRNO = 'WO00000003' 

	update "OPTM_APS_PRODOPER" SET WO_STATUS = 6 WHERE OPER_ID IN (39,1)

	UPDATE "OPTM_APS_DSHBD_SETTINGS" SET VALUE = '{"1":{"tc":"#48be1a","pc":"#2a8607"},"2":{"tc":"#4682db","pc":"#1a68d9"},"3":{"tc":"#cc3d3d","pc":"#8d0e0e"},"4":{"tc":"#d96c49","pc":"#d74a1c"},"5":{"tc":"#f13535","pc":"#da2c2c"},"6":{"tc":"#33b4ea","pc":"#2a9dce"},"7":{"tc":"#c7c340","pc":"#aea913"},"8":{"tc":"#626262","pc":"#000000"},"9":{"tc":"#c5261b","pc":"#941a11"}}'
	WHERE NAME =  'task_type_color_set'