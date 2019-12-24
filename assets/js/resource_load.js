//===============
// Resource Load Table function -  
//=============== 

//===============
// Default Load Report -  Gantt Layouts
//===============

function shouldHighlightResource(resource){
	//debugger;
	var selectedTaskId = gantt.getState().selected_task;
	if(gantt.isTaskExists(selectedTaskId)){
		var selectedTask = gantt.getTask(selectedTaskId),
		selectedResource = selectedTask[gantt.config.resource_property];

		if(resource.id == selectedResource){
			return true;
		} else if(gantt.$resourcesStore.isChildOf(selectedResource, resource.id)){
			return true;
		}
	}
	return false;
}



function getCapacity(date, resource) {
    //debugger;
    /* it is sample function your could to define your own function for get Capability of resources in day */
    if (resourcesStore.hasChild(resource.id)) {
        return -1;
    }

    var val = date.valueOf();
    if (!cap[val + resource.id]) {
        cap[val + resource.id] = [0, 1, 2, 3][Math.floor(Math.random() * 100) % 4];
    }
    return cap[val + resource.id] * WORK_DAY;
}

// function getAllocatedValue(tasks, resource) {
//     //debugger;
//     var result = 0;
//     //var tasks = getResourceTasks(resource.id);
//    // tasks.forEach(function(item) {
//         //if(item.value>0){
//         //result += Number(item.value);
//       //  }
//     //});
//     return result;
// }

function getAllocatedValue(tasks,resource){
	var allocation_result=0;
	if(tasks.length>0){
		tasks.forEach(function (item){
			if(item.duration>0){
				allocation_result+=Number(item.duration);
			}
		});
	}
	return allocation_result;
}


function getResourceTasks(resource_id, resource_wc){
	//debugger;
	var res = [];
	gantt.eachTask(function(task){
		if( (task.resource == resource_id) && (task.work_center == resource_wc) &&  (task.type != gantt.config.types.project) ) {
			res.push(task);
		}
	});
	return res;
}


function resource_time_grid(tasks, step){
	//debugger;
	var timegrid = {};

	for(var i = 0; i < tasks.length; i++){
		var task = tasks[i];

		var currDate = gantt.date[step + "_start"](new Date(task.start_date));

		while(currDate < task.end_date){

			var date = currDate;
			currDate = gantt.date.add(currDate, 1, step);

			if(!gantt.isWorkTime({date:date, task:task})){
				continue;
			}

			var timestamp = date.valueOf();
			if(!timegrid[timestamp])
				timegrid[timestamp] = 0;

			timegrid[timestamp] += 1;
		}
	}

	return timegrid;
}

function calculateResourceLoad(tasks, scale){
	//debugger;
	var step = scale.unit;
	var timegrid = resource_time_grid(tasks, step);

	var timetable = [];
	var start, end;
	for(var i in timegrid){
		start = new Date(i*1);
		end = gantt.date.add(start, 1, step);
		timetable.push({
			start_date: start,
			end_date: end,
			value: timegrid[i]
		});
	}

	return timetable;
}

var renderResourceLine = function(resource, timeline){
	//debugger;
//  log_data(timeline.getScale());
var tasks = getResourceTasks(resource.key, resource.work_center_id);

if(tasks.length > 0 ){

	var timetable = calculateResourceLoad(tasks, timeline.getScale());

	var row = document.createElement("div");

	for(var i = 0; i < timetable.length; i++){

		var day = timetable[i];

		var css = "";
		if(!day.value){
			css = "workday_idle";
		}else if(day.value <= 1){
			css = "workday_ok";
		}else{
			css = "workday_over";
		}

		var sizes = timeline.getItemPosition(resource, day.start_date, day.end_date);

		var el = document.createElement('div');
		el.className = css;

		el.style.cssText = [
		'left:'+ sizes.left + 'px',
		'width:'+ sizes.width + 'px',
		'position:absolute',
		'height:'+ (gantt.config.row_height - 1) + 'px',
		'line-height:'+ sizes.height + 'px',
		'top:'+ (sizes.top) + 'px'

		].join(";");
		el.setAttribute("resouce_id", resource.key);
		el.setAttribute("resouce_label", resource.label);
		el.innerHTML = day.value;
		row.appendChild(el);
	}
	return row;
}
};


//===============
// Custom Load Report  - Custom Layout
//=============== 

function generate_resource_load_report(){
	//debugger;
	var table_content = '';
	var load_resources = gantt.serverList('resource');
//  log_data(load_resources);

var global_task_data = gantt.getTaskByTime();
var hourScale =  "";
var hourScaledata =  "";
var hourScaledataLoad =  "";
$("#load_table_section_revamp").html("");

var total_row_height  = gantt.config.row_height;

//  $("#load_table_section").html(table_content);
var total_width = gantt.config.grid_width;
var head_ele_width = (total_width/2);
head_ele_width = head_ele_width + 20;
var head_sec_half = (head_ele_width/2);
head_sec_half = head_sec_half - 30;
var temp_content_left = '';
var temp_content_right = '';

var content_css = '    height: '+total_row_height+'px; line-height:'+total_row_height+'px; font-size: '+system_settings['left_right_panel_font_size']+'px; overflow: hidden;';
var border_bottom = '  border-bottom:1px solid #ccc; ';
var sub_content_css = ' text-align:left; ' + border_bottom;
var content_height  = '49px';
var font_size_css = 'font-size: '+system_settings['left_right_panel_font_size']+'px; '; 
var head_style = font_size_css + ' height: '+content_height+';line-height: '+content_height+'; font-size: '+system_settings['left_right_panel_font_size']+'px;text-align: left; ';
// var grid_height = 'height:420px; '; 
var $task_cell_width = ($(".gantt_task_cell:first").length > 0) ? $(".gantt_task_cell:first").attr('style') : "width: "+system_settings['task_column_width']+"px; font-size: "+system_settings['left_right_panel_font_size']+"px ";


var inner_content_wid_height = $task_cell_width +` height:`+total_row_height+`px; line-height:`+total_row_height+`px;  `;
var required_columns = {
	"total_res":$_LANG['total_res'],
	"avail_res":$_LANG['avail_res'],
	"avail_cap":$_LANG['avail_capacity'],
	"req_res":$_LANG['total_req_res'],
	"req_cap":$_LANG['req_capacity'],
	"per_load":$_LANG['per_load'],
};
var chart_scale = gantt.getScale();
var timeline_unit = chart_scale.unit; 
var timeline_x =  chart_scale.trace_x;
var timeline_x_length = timeline_x.length;

if(current_timeline_view == 'day'){
	timeline_x_length = (timeline_x_length-1);
}
var view_type = '';

var server_response = {};
var send_data = {
	timeline_view : current_timeline_view,
	start_date :  gantt.config.start_date,
	end_date :gantt.config.end_date,
	reference_id : (current_plan_details!=undefined) ? current_plan_details['ref_id'] : "",
};

$.ajax({
	url: service_url + "?action=shift_capacity_details&company="+ current_company,
	type: 'GET',
	dataType: 'JSON',
	async : false,
	cache : false,
	data : send_data,
	success : function(res){
		debugger;
	    console.log(res);
		server_response = res;
	}, 
});

if(server_response.success != "none"){
	debugger;
	var calculated_row_height = total_row_height*6;
	var load_class = "";
	var total_no_of_res = 0;

	for (var resource_key = 0; resource_key < load_resources.length; resource_key++) {
		var ele_id = gantt.uid();
		var current_res_data = load_resources[resource_key];

		var $time_gen = '';
		var $total_res = '';
		var $avail_res = '';
		var $bal_res = '';
		var avail_no_of_res = "";
		var bal_no_of_res = "";
		var $avail_capacity = '';

		var $required_cap ='';
		var $load_per = '';

		if($.isEmptyObject(server_response['total_resource'][current_res_data.work_center_id])){
			total_no_of_res = 0;
		} else {
			total_no_of_res = (server_response['total_resource'][current_res_data.work_center_id][current_res_data.key]!== undefined ) ? server_response['total_resource'][current_res_data.work_center_id][current_res_data.key] : 0;
		}

		temp_content_left += `
		<div class="left_content_section gantt_row odd" style="width:`+total_width+`px; text-align:left; height:`+total_row_height+`px; " data-left_resource_load_row="`+resource_key+`">
		<div class="resource_block gantt_cell" id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ border_bottom +`">
		<div class="gantt_tree_content" style="`+ content_css + `width:`+head_ele_width+`px; padding-left:10px; ">
		<b> <i class="fa fa-plus load_tbl_par_el_icon"></i></b> `+current_res_data.label +`
		</div>
		<div class="gantt_tree_content" style="`+ content_css + `width:`+head_sec_half+`px;padding-left:10px; ">
		`+ total_no_of_res +`
		</div>
		<div class="gantt_tree_content" style="`+ content_css + `width:`+head_sec_half+`px; padding-left:10px;">
		`+ total_no_of_res +`
		</div>
		</div>
		<div class="sub_elements  hide" data-parent="`+ele_id+`_res_ele"
		style="height:`+calculated_row_height+`px;">`;

		for (elements_keys in required_columns) {
			var label = required_columns[elements_keys];
			temp_content_left += `
			<div class"cell_row" style="width:100%">
			<div class="gantt_cell" style='width:`+head_ele_width+`px; `+ content_css + sub_content_css +`; padding-left: 60px;'>
			<div class="gantt_tree_content">
			`+ label +`
			</div>
			</div>
			<div class="gantt_cell" style='width:`+head_sec_half+`px; `+ content_css + sub_content_css +`'>
			<div class="gantt_tree_content">
			`+ ' ' +`
			</div>
			</div>
			<div class="gantt_cell" style='width:`+head_sec_half+`px; `+ content_css + sub_content_css +`'>
			<div class="gantt_tree_content">
			`+ ' ' +`
			</div>
			</div>
			</div>
			`;
		}
		temp_content_left += `</div>
		</div>`;

		temp_content_right+= `<div class="gantt_task_row odd" data-right_resource_load_row="`+resource_key+`" resource_load_data_store_id="`+ele_id+`main_row" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_total_res = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_avail_res = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_avail_cap = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_req_res = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_req_cap = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;

		var sub_per_load = `<div class="gantt_task_row sub_element_right hide odd" data-right_resource_load_row="`+ele_id+`" resource_load_data_store_id="`+ele_id+`_res_ele" style="height:`+total_row_height+`px; `+ font_size_css +`">`;
		
		for (var i = 0; i <= timeline_x_length; i++) {
			var lst_cell_cls = "";
			if(i == timeline_x_length){
				lst_cell_cls = "gantt_last_cell";
			}
			var j = i;
			j--;
			if(i <= 10){
				$time_gen = "0"+j+'00';
			} else {
				$time_gen = j+'00';
			}

			avail_no_of_res  = '';
			var $break_point = '';
			if($.isEmptyObject(server_response['total_avail'][current_res_data.work_center_id])){
				avail_no_of_res = '';
			} else {
				avail_no_of_res = (server_response['total_avail'][current_res_data.work_center_id][current_res_data.key]!== undefined ) ? server_response['total_avail'][current_res_data.work_center_id][current_res_data.key] : "";
				$break_point = (server_response['total_avail'][current_res_data.work_center_id][current_res_data.key]!== undefined && server_response['total_avail'][current_res_data.work_center_id][current_res_data.key]['break_time']!== undefined) ? server_response['total_avail'][current_res_data.work_center_id][current_res_data.key]['break_time'] : "";
			}
			
			bal_no_of_res  = '';
			if($.isEmptyObject(server_response['total_bal'][current_res_data.work_center_id])){
				bal_no_of_res = '';
			} else {
				bal_no_of_res = (server_response['total_bal'][current_res_data.work_center_id][current_res_data.key]!== undefined ) ? server_response['total_bal'][current_res_data.work_center_id][current_res_data.key] : "";
			}

			$total_res = '';
			$avail_res  = '';
			$bal_res = '';
			if(avail_no_of_res != '' && avail_no_of_res[$time_gen] !== undefined){
				if(avail_no_of_res[$time_gen]!="")	{
					$avail_res = avail_no_of_res[$time_gen];
					$total_res = total_no_of_res;
					$bal_res = (bal_no_of_res[$time_gen] !== undefined) ? bal_no_of_res[$time_gen] : '';
				}	
			}

			var capacity_mult = '';
			if(current_timeline_view == 'day'){
				capacity_mult = 1;
			} else if(current_timeline_view == 'week'){
				capacity_mult = 7;
			} else if(current_timeline_view == 'month'){
				capacity_mult = 1;
			}

			$avail_capacity = '';
			if($avail_res!=""){
				$avail_capacity = $avail_res*capacity_mult;
			}

			$required_cap ='';
			$load_per = '';
			for(task in global_task_data){
				if(global_task_data[task].resource == current_res_data.key && global_task_data[task].work_center == current_res_data.work_center_id){
					if(global_task_data[task].type!="project"){
						if(check_date_in_range(global_task_data[task].start_date, global_task_data[task].end_date)){
							if((i >= global_task_data[task].start_date.getHours()) && (i <= global_task_data[task].end_date.getHours())){
								if(global_task_data[task].progress != 1 && $time_gen != $break_point){
									$required_cap++;
								}

								if($avail_capacity != ""){
									$load_per = Math.ceil($required_cap / $avail_capacity) * 100;
								} else {
									$load_per = Math.ceil($required_cap /1) * 100;
								}
							}
						}	
					}
				}	
			}
			
			load_class ='';
			if($load_per <= 100 && $load_per != '' ){
				/*if($required_cap!= '' &&  $total_res == '' && $avail_res == ''){
					load_class = "workday_over";
				} else {
					load_class = "workday_ok";
				}*/
				load_class = "workday_ok";
				$load_per = $load_per+'%';

			} else if($load_per >= 100){
				load_class = "workday_over";
				$load_per = $load_per+'%';

			} else if($load_per = ''){
				load_class = '';
			}

			temp_content_right+= `<div class="`+load_class+` align_center_middle gantt_task_cell `+lst_cell_cls+` " style="`+inner_content_wid_height+`">
			`+ $load_per +`
			</div>`;

			sub_total_res+= `<div class=" gantt_task_cell align_center_middle  total_res" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+ $total_res +` 
			</div>`;

			sub_avail_res += `<div class="gantt_task_cell align_center_middle  avail_res" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+ $avail_res+`
			</div>`;

			sub_avail_cap += `<div class="gantt_task_cell align_center_middle  avail_cap" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+ $avail_capacity +`
			</div>`;

			sub_req_res += `<div class="gantt_task_cell align_center_middle  req_res" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+ $required_cap +`	
			</div>`;

			sub_req_cap += `<div class="gantt_task_cell align_center_middle  req_cap" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+$required_cap+`
			</div>`;

			sub_per_load += `<div class="`+load_class+` gantt_task_cell align_center_middle  per_load" data-parent="`+resource_key+`_res_ele" style="`+inner_content_wid_height+`">
			`+$load_per+`
			</div>`;

			if(i == timeline_x_length) {
				sub_total_res += `</div>`;
				sub_avail_res += `</div>`;
				sub_avail_cap += `</div>`;
				sub_req_res += `</div>`;
				sub_req_cap += `</div>`;
				sub_per_load += `</div>`;
			}
		}
		temp_content_right+= `</div>`;
		temp_content_right += sub_total_res +  sub_avail_res +sub_avail_cap + sub_req_res + sub_req_cap + sub_per_load;
	}

	var gantt_task_scale_style = $(document).find(".gantt_task_scale:first").attr("style");
	var gantt_task_scale_content = $(document).find(".gantt_task_scale:first").html();
	var timeline_cell_style = $(document).find(".timeline_cell").attr("style");
	var gantt_data_area_css = $(document).find(".gantt_data_area:first").attr("style");
	var gantt_data_area_inner_css = $(document).find(".gantt_data_area:first div").attr("style");
	var grid_height = $(document).find(".gantt_layout_content:first").attr("style");
	var grid_v_scroll_height = $(document).find(".gantt_ver_scroll:first").attr("style");
	var grid_h_scroll_style = $(document).find(".scrollHor_cell:first").attr("style");
	var gantt_grid_data_style = $(document).find(".gantt_grid_data:first").attr("style");
	var standard_scroll_size = "19px";
	var div_content = 
	`<div class="load_container_section" style="overflow: hidden; `+ border_bottom +`">
	<div class="gantt_layout_cell gantt_layout gantt_layout_x gantt_layout_cell_border_bottom" style=""> 

	<div class="left_grid gantt_layout_cell  resourceGrid_cell gantt_layout_outer_scroll gantt_layout_outer_scroll_vertical gantt_layout_cell_border_right" style="width:`+total_width+`px">
	<div class="gantt_layout_content " style='`+ grid_height +`; overflow: hidden;'>
	<div class="gantt_grid">
	<div class="gantt_grid_scale heading">
	<div class="gantt_grid_head_cell gantt_grid_head_name" style="`+head_style+`  padding-left:20px; width:`+head_ele_width+`px; "> `+$_LANG['resource_name']+` </div>
	<div class="gantt_grid_head_cell gantt_grid_head_name" style="`+head_style+`width:`+head_sec_half+`px; ">`+$_LANG['avail_capacity']+` </div>
	<div class="gantt_grid_head_cell gantt_grid_head_name" style="`+head_style+`width:`+head_sec_half+`px; "> `+$_LANG['total_res_short']+` </div>
	</div>
	<div class="gantt_grid_data inner_custom_load_grid" style="`+gantt_grid_data_style+` overflow-y:scroll;" > `+ temp_content_left +` </div>
	</div>
	</div>
	</div>
	<div class="gantt_layout_cell gantt_resizer gantt_resizer_x gantt_layout_cell_border_right" style="margin-right: -1px; width: 1px; height: 166px;"><div class="gantt_layout_content gantt_resizer_x"></div></div>
	<div class="right_timeline gantt_layout_cell  resourceTimeline_cell gantt_layout_outer_scroll gantt_layout_outer_scroll_vertical gantt_layout_outer_scroll gantt_layout_outer_scroll_horizontal gantt_layout_cell_border_right" style="`+timeline_cell_style+`;  left: -3px; top:2px;">
	<div class="gantt_layout_content custom_gantt_layout_content" style='`+ grid_height +`'>
	<div class="gantt_task" style="width:inherit;height:inherit;">
	<div class="gantt_task_scale custom_load_res_table_scale" style="`+gantt_task_scale_style+`; position: absolute;overflow-y: hidden;">
	`+ gantt_task_scale_content +`
	</div>
	<div class="gantt_data_area custm_load_table_area" style="top:`+content_height+`; `+gantt_data_area_css+`;" >

	<div data-layer="true" class="inner_custom_load_table" style="`+gantt_data_area_inner_css+`; height:100%; overflow-y:scroll;" >
	`+ temp_content_right +` 
	</div>

	</div>
	</div>
	</div>
	</div>
	<div class="gantt_layout_cell  scrollVer_cell" data-cell-id="hhscrl_`+resource_key+`" style="width: `+standard_scroll_size+`; `+ grid_height +`; left:-5px;">
	<div class="gantt_layout_content " style="`+ grid_height +`">
	<div class="gantt_layout_cell gantt_ver_scroll bottom_vertical_scroll gantt_layout_cell_border_top bottom_scroll_section_common_right" style="`+ grid_v_scroll_height +`">
	<div style="height: 900px;" >
	</div>
	</div>
	</div>
	</div>
	</div>
	<div class="gantt_layout_cell  scrollHor_cell " data-cell-id="rrscroll_`+resource_key+`" style="`+grid_h_scroll_style+`">
	<div class="gantt_layout_content " style="height: `+standard_scroll_size+`;">
	<div class="gantt_layout_cell gantt_hor_scroll bottom_custom_horizontal_scroll " style="`+grid_h_scroll_style+` top: auto;">
	<div style="width: 1801px;">
	</div>
	</div>
	</div>
	</div>
	</div>
	`;

	$("#load_table_section_revamp").html(div_content);

	setTimeout(function(){
		var temp_width = $(document).find(".inner_custom_load_table").width();
		temp_width = temp_width + 20;
		$(document).find(".inner_custom_load_table").css("width", temp_width);
		$(".bottom_custom_horizontal_scroll").scrollLeft( $(".gantt_hor_scroll:first").scrollLeft() );
		$(document).find(".custom_load_res_table_scale").css("left", '-'+$(".gantt_hor_scroll:first").scrollLeft()+'px');
		resource_load_bind_event();
	}, default_pause_mid_short);	
} 


}


function resource_load_bind_event(){ 
	$(".inner_custom_load_table").on("scroll", function(event){

		$(document).find(".bottom_vertical_scroll").scrollTop( $(this).scrollTop() );

		$(document).find(".inner_custom_load_grid").scrollTop( $(this).scrollTop() );
	});

	$(".inner_custom_load_grid").on("scroll", function(event){

		$(document).find(".inner_custom_load_table").scrollTop( $(this).scrollTop() );
		$(document).find(".bottom_vertical_scroll").scrollTop( $(this).scrollTop() );

	});

	$(".bottom_vertical_scroll").on("scroll", function(event){

		$(document).find(".inner_custom_load_grid").scrollTop( $(this).scrollTop() );
		$(document).find(".inner_custom_load_table").scrollTop( $(this).scrollTop() );
	});

	$(".gantt_hor_scroll:first").on("scroll", function(){
		var left = $(this).scrollLeft();
		$(".bottom_custom_horizontal_scroll").scrollLeft( left );
	}); 

	$(".bottom_custom_horizontal_scroll").on("scroll", function(event){

		var left = $(this).scrollLeft();
		$(document).find(".custom_load_res_table_scale").html($(document).find(".gantt_task_scale:first").html());
		$(document).find(".custom_load_res_table_scale").css("left", '-'+left+'px');
		$(document).find(".custm_load_table_area").css("left", '-'+left+'px');
		gantt.scrollTo(left, null);
	});
}
