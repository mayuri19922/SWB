 --No of Resources
 use optiAPS
    Select U_O_NOF_AVL_RESO from "@OPTMWC_RESO" where Code = 'WCM-01' and U_O_RES_CODE='Res-Labor' 

-- Available # of Resources
   (Select U_O_NOF_AVL_RESO, *  from "@OPTMWC_RESO" where Code = 'WCM-01' and U_O_RES_CODE='Res-Labor' )

-- Available Capacity(Hrs) 
(Select OPTM_AVAILABLE_CAPACITY, *  from "OPTM_WC_RES_CAPACITY" where OPTM_WCID ='001'  and OPTM_RESID ='AB-RMD-02')

 -- # of required Resources -
(Select U_O_NOF_RESO_USED  from "@OPTMPRD_ROU_LN_RES" A inner join "@OPTMPRD_ROUT_LINE" B on A.Code = B.Code where U_O_RESO_ID ='' and U_O_WC_ID ='')

select * from "OPTM_WC_RES_CAPACITY"

Select * from "@OPTMWC_RESOSHIFT"

-----------------------------------------------------------------------------------------------------

--below query will return 1 row for each no. resource
Select OPTM_AVAILABLE_CAPACITY,* from OPTM_WC_RES_CAPACITY
 -- where OPTM_WHSCODE='01' and  OPTM_WORKDATE Between '2018-02-20' and '2018-02-20' Order by OPTM_WORKDATE

--Below table will give start and end time of shift
Select Code, Name, DocEntry, U_O_STATUS, U_O_START_TIME, U_O_END_TIME, U_O_BREAK_DURATION, U_O_AVL_TIME,	U_O_RECUID, U_OPTM_BRKSTRTTIME from "@OPTMSHIFT_MASTER"

--U_O_RESSEQ for number of req required
select U_O_RESSEQ,* from "@OPTM_PRODRES" A Join "@OPTM_PRODOPER" B on A.DocEntry=B.DocEntry and B.U_O_OPERNO=A.U_O_ISSTOOPER


-- total no of resource each row 1 resource that day 
SELECT OPTM_SHIFTID, OPTM_WHSCODE,	OPTM_WCID,	OPTM_RESID,	OPTM_WORKDATE,  U_O_START_TIME, U_O_END_TIME, U_O_BREAK_DURATION, U_O_AVL_TIME, U_OPTM_BRKSTRTTIME  
FROM OPTM_WC_RES_CAPACITY as res_cap
LEFT JOIN "@OPTMSHIFT_MASTER" as shift_tb ON shift_tb.code =  res_cap.OPTM_SHIFTID
where OPTM_WHSCODE='01' and  OPTM_WORKDATE Between '2018-03-20' and '2018-03-30' 
ORDER BY OPTM_WORKDATE

-- total number of resource capacity available per day 
SELECT OPTM_SHIFTID, OPTM_AVAILABLE_CAPACITY,OPTM_USED_CAPACITY, OPTM_BAL_CAPACITY,OPTM_WHSCODE,	OPTM_WCID,	OPTM_RESID,	OPTM_WORKDATE,  U_O_START_TIME, U_O_END_TIME, U_O_BREAK_DURATION, U_O_AVL_TIME, U_OPTM_BRKSTRTTIME 
FROM OPTM_WC_RES_CAPACITY as res_cap
LEFT JOIN "@OPTMSHIFT_MASTER" as shift_tb ON shift_tb.code =  res_cap.OPTM_SHIFTID
where OPTM_WHSCODE='01' and  OPTM_WORKDATE Between '2018-03-20' and '2018-03-30' 
Order by OPTM_WORKDATE

Select Code, Name, DocEntry, U_O_STATUS, U_O_START_TIME, U_O_END_TIME, U_O_BREAK_DURATION, U_O_AVL_TIME,	U_O_RECUID, U_OPTM_BRKSTRTTIME 
from "@OPTMSHIFT_MASTER"

select * from OPTM_WC_RES_CAPACITY

Select * from "@OPTM_PRODRES" 


SELECT G.U_OPTM_RSDATE, sum(G.U_O_RESSEQ)
--A.DocEntry as head_doc_entry, C.LineId as oper_line_id,  G.LineId as res_line_id,  G.U_O_WC_ID as work_center_id, A.U_O_ORDRNO as work_order_id, G.U_O_RESID AS resource_id, G.U_O_RESDESC as resource_name, C.U_O_OPERNO AS operation_number, C.U_O_OPR_ID AS operation_code, C.U_O_OPR_DESC AS description, A.U_OPTM_PRIORITY AS priority, C.U_OPTM_LOCKED AS readonly, C.U_O_OPERCMPFLG AS status, C.U_OPTM_OPSDATE AS start_date, C.U_OPTM_OPEDATE AS end_date, C.U_OPTM_OPLTHRS AS duration, ((C.U_O_CUMPRDCDQTY/A.U_O_ORDRQTY)*100) AS progress, A.U_OPTM_STRTTIME,A.U_OPTM_ENDTIME,C.U_OPTM_OPSTIME,C.U_OPTM_OPETIME, G.U_O_RESSEQ as required_resource 
	FROM "@OPTM_PRODORDR" A 
	INNER JOIN "@OPTM_PRODOPER" C ON A."DocEntry"=C."DocEntry" 
	INNER join "@OPTM_PRODRES" G on A.DocEntry=G.DocEntry and C.U_O_OPERNO = G.U_O_ISSTOOPER 
	INNER JOIN "@OPTMWC_MST" E on G.U_O_WC_ID=E."Code" 
	WHERE A.U_O_STATUS <> '3' AND A.U_O_STATUS <> '4' and G.U_O_WC_ID='WCM-01' and G.U_O_RESID='Res-Labor' 
	--and  G.U_OPTM_RSDATE Between '2018-03-20' and '2018-03-30' 
	Group by G.U_OPTM_RSDATE

	