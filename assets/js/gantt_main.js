// Start When Document is ready
//=============== 

$(document).ready(function() {

	set_title(app_title);

	check_installation();   

	check_is_login(); 

	current_plan_details = get_cookie();
	log_data(current_plan_details);
	if($.isEmptyObject(current_plan_details)){
		plan_change();
		return false;
	} else {
		if(current_plan_details['from_date']===undefined || current_plan_details['to_date']===undefined || current_plan_details['ref_id']===undefined  ){
			if(get_cookie('is_logged_in') === undefined){
				sign_out(); 
			} else {
				plan_change();
			}	
			return false;
		}
	}

	current_company = current_plan_details['company'];
//===============
// Saved Settings
//=============== 

service_call("get_system_settings", "", "", function(res){
	if(res.success == "error"){
		show_toast(res.success, res.message);
	} else {
		system_settings = res.data;
		priority_color_set = system_settings['priority_color_set'];
		task_type_color_set = system_settings['task_type_color_set'];
		if(system_settings['default_resource_load_layout'] == "detail"){
			$("#gantt_here").css("height", "45%");
		} else if(system_settings['default_resource_load_layout'] == "none" || system_settings['default_resource_load_layout'] == "basic"){
			$("#gantt_here").css("height", "90%");
		}

		if(current_plan_details['working_wc'] != 'all'){
			system_settings['default_work_center'] = current_plan_details['working_wc'];
			$("#default_work_center").attr('disabled', true);
		}
	}
});

//===============
//Configuration
//===============

gantt.config.sort = true; 
// gantt.config.min_duration = 1000*60;
// gantt.config.duration_unit = "minute";
gantt.config.time_step = 1;
gantt.config.step = 0.1;
gantt.config.min_column_width = system_settings['task_column_width'];
gantt.config.scale_height = system_settings['chart_header_scale_height'];

gantt.config.grid_width = system_settings['left_panel_width'];

gantt.config.row_height = system_settings['chart_table_row_height'];
gantt.config.grid_resize = system_settings['left_panel_resize'];
gantt.config.drag_lightbox = system_settings['drag_lightbox'];
gantt.config.lightbox_additional_height = system_settings['lightbox_additional_height'];  
gantt.config.lightbox['project_sections'] = "";

gantt.config.auto_scheduling = true;
gantt.config.auto_scheduling_strict = false;

gantt.config.details_on_create = true;

gantt.config.drag_move = true;
gantt.config.drag_drop = true;

gantt.config.order_branch = false;
gantt.config.order_branch_free = false;
gantt.config.open_tree_initially = true;

// gantt.config.touch = "force";
// gantt.config.readonly = true;
//gantt.config.work_time = true;

// gantt.config.rtl = true;

gantt.config.api_date = "%d-%m-%Y %H:%i";
gantt.config.xml_date = "%d-%m-%Y %H:%i";

date_view_configuration();

// Day View configuration - start
if(system_settings['default_timeline_view'] == "minute"){
	// Initializing current date
	minute_view_configuration();
}
// Day View configuration - end

// Day View configuration - start
if(system_settings['default_timeline_view'] == "day"){
	// Initializing current date
	date_view_configuration();
}
// Day View configuration - end

// Week View configuration - start
if(system_settings['default_timeline_view'] == "week"){
	week_view_configuration();
}
// Week View configuration - end

// Month View configuration - start
if(system_settings['default_timeline_view'] == "month"){
	month_view_configuration();
}
// Month View configuration - end


// Month View configuration - start
if(system_settings['default_timeline_view'] == "year"){
	year_view_configuration();
}
// Month View configuration - end

current_timeline_view = system_settings['default_timeline_view'];

$(".menu_actions").find("li").each(function(){
	var menuObj = $(this);
	if(menuObj.find("a").attr("id") == system_settings['default_timeline_view']) {
		menuObj.addClass('active');
	}
});



//===============
// Server List 
//=============== 
service_call("get_all_list", "",  system_settings['default_work_center'], function(res){
	if(res.resources != "none"){
		gantt.serverList("resource", res.resources);
		gantt.serverList("task_type", res.task_type);
		gantt.serverList("priority", res.priority_list);
		gantt.serverList("work_center", res.work_centers);
		gantt.serverList("work_order", res.work_order);

		// generate list of all work center for select box 
		var work_center_select_option = '<option value="all">All</option>';
		work_center_select_option += generate_options(modify_wc_serverlist(gantt.serverList("work_center")), 'key', 'label');
		$("#default_work_center").html(work_center_select_option);


		priority_color_table(gantt.serverList("priority"));

		generate_task_type_color_table(gantt.serverList("task_type"));

		$("."+system_settings['default_task_color_code']+"_box").show();
		if(system_settings['enable_auto_resync_progress'] == 1){
			$(".enable_auto_resync_progress_box").show();
		}

		if($("." + system_settings['default_timeline_view']+"_box").length > 0){
			$("." + system_settings['default_timeline_view']+"_box").show();
		}

		if(system_settings['enable_auto_resync_progress'] == 0){
			$(".resync_progess_toggle_line_item").remove();
		} else {
			$(".resync_progess_toggle_line_item").show();
		}

		if(system_settings['enable_minute_view_scale'] == 0){
			$("#minute").parent("li").remove();
		} else {
			$("#minute").parent("li").show();
		}

		if(system_settings['enable_year_view_scale'] == 0){
			$("#year").parent("li").remove();
		} else {
			$("#year").parent("li").show();
		}
	}
});


//===============
// set all system settings into customisation popup 
//=============== 

set_settings_in_popup(system_settings);


//===============
// Color Customization
//=============== 
setTimeout(function(){
	$(".gantt_grid div,.gantt_data_area div").css('font-size', system_settings['left_right_panel_font_size'] +'px');
}, default_pause);  


priority_color_css = generate_color_code_style(gantt.serverList("priority"), 'label', priority_color_set);
$("#color_code_block").append(priority_color_css);


task_type_color_css = generate_color_code_style(gantt.serverList("task_type"), 'unique_name', task_type_color_set);
$("#color_code_block").append(task_type_color_css);


// additional css for greout task color 
var additional_color = "";
var temp_grey_color = (system_settings['unhighlight_color'] !== undefined) ? system_settings['unhighlight_color'] : "#00000";
if(system_settings['unhighlight_color']!=""){
	additional_color += '\
	.'+ grey_class +'{\
		border:2px solid ' + temp_grey_color + '  ;\
		color: ' + temp_grey_color + '  ;\
		background: ' + temp_grey_color + '  ;\
	}\
	.'+ grey_class +' .gantt_task_progress{\
		background: '+ temp_grey_color +' ;\
	}\
	.'+ grey_link_class +' div{\
		background-color: '+ temp_grey_color +';\
	}\
	.'+ grey_link_arrow_class +'{\
		border-left-color: '+ temp_grey_color +';\
	}\
	';

	$("#color_code_block").append(additional_color);
}

// css for load analysis table 
var balanceload_color= (system_settings['resource_balanced_color'] !== undefined) ? system_settings['resource_balanced_color'] : "#42b849";
var overload_color   = (system_settings['resource_overload_color'] !== undefined) ? system_settings['resource_overload_color'] : "#d96c49";


if(system_settings['default_resource_load_layout'] == "detail"){
	if(system_settings['resource_balanced_color']!=""){
		additional_color += '\
		.workday_ok{\
			text-align:center;\
			background: '+ balanceload_color +';\
		}\
		';

		$("#color_code_block").append(additional_color);
	}

	if(system_settings['resource_overload_color']!=""){
		additional_color += '\
		.workday_over{\
			text-align:center;\
			background: '+ overload_color +';\
		}\
		';

		$("#color_code_block").append(additional_color);
	}
} else if(system_settings['default_resource_load_layout'] == "basic"){
	if(system_settings['resource_balanced_color']!=""){
		additional_color += '\
		.resource_marker.workday_ok div{\
			text-align:center;\
			background: '+ balanceload_color +';\
		}\
		';
		$("#color_code_block").append(additional_color);
	}

	if(system_settings['resource_overload_color']!=""){
		additional_color += '\
		..resource_marker.workday_over div{\
			text-align:center;\
			background: '+ overload_color +';\
		}\
		';
		$("#color_code_block").append(additional_color);
	}
}

if(system_settings['default_theme'] == 'contrast_black'){
	additional_color += '\
	.gantt_grid .gantt_grid_scale .gantt_grid_head_cell, .gantt_task .gantt_task_scale .gantt_scale_cell {\
		color: rgba(247, 247, 247, 0.7) !important;\
	}';

	$("#color_code_block").append(additional_color);
}



//===============
// Default  Theme
//=============== 
changeSkin(system_settings['default_theme']);

//===============
// Locale 
//=============== 
gantt.locale.labels.column_task_type = gantt.locale.labels.section_task_type = $_LANG['task_type'];
gantt.locale.labels.column_priority = gantt.locale.labels.section_priority = $_LANG['priority'];
gantt.locale.labels.column_resource = gantt.locale.labels.section_resource = $_LANG['resource'];
gantt.locale.labels.column_work_center = gantt.locale.labels.section_work_center = $_LANG['work_center'];
gantt.locale.labels.column_task_name = gantt.locale.labels.section_task_name = $_LANG['operation_code'];
gantt.locale.labels.column_opr_desc = gantt.locale.labels.section_opr_desc = $_LANG['operation_desc'];
gantt.locale.labels.column_opr_hrs_duration = gantt.locale.labels.section_opr_hrs_duration = $_LANG['time_period'];

//===============
// Chart Columns
//=============== 

gantt.config.columns = left_matrix_configuration();

//===============
// Resource Grid Options
//=============== 

var resourceGridConfig = {
	scale_height: 30,
	subscales: [],
	columns: [
	{
		name: "name", label: $_LANG['name'], tree:false, width:'*' , resize: true ,  template: function (resource) {
			return   resource.label ;
		}
	},
	{
		name: "progress", label: $_LANG['complete'], resize: true,  width:'*', align:"center",template: function (resource) {
			var tasks = getResourceTasks(resource.key, resource.work_center_id);
			var totalToDo = 0,
			totalDone = 0;
			tasks.forEach(function(task){
				totalToDo += task.duration;
				totalDone += task.duration * (task.progress || 0);
			});

			var completion = 0;
			if(totalToDo){
				completion = Math.floor((totalDone / totalToDo)*100);
			}

			return Math.floor(completion) + "%";
		}
	},
	{
		name: "workload", label: $_LANG['workload'],  width:'*', align:"center", template: function (resource) {
			var tasks = getResourceTasks(resource.key, resource.work_center_id);
			var totalDuration = 0;
			tasks.forEach(function(task){
				totalDuration += task.duration;
			});

			return (totalDuration || 0) * 8 + "h";
		}, resize: true
	},

	{
		name: "capacity", label: $_LANG['capacity'],  width:'*', align:"center",template: function (resource) {
			var store = gantt.getDatastore('resource_load_data_store');
			var n = store.hasChild(resource.id) ? store.getChildren(resource.id).length : 1

			var state = gantt.getState();

			return gantt.calculateDuration(state.min_date, state.max_date) * n * 8 + "h";
		}
	} 

	]
};

//===============
// Timeline Layout
//=============== 
var resource_load_layout = "";
if(system_settings['default_resource_load_layout'] == "detail"){
	resource_load_layout =  {
		css: "gantt_container",
		rows:[
		{
			gravity:1,
			cols: [
			{view: "grid", group:"grids", scrollY: "scrollVer"},
			{resizer: true, width: 1},
			{view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
			{view: "scrollbar", id: "scrollVer", group:"vertical"}
			]
		},
		{view: "scrollbar", scroll: "x", id:"scrollHor"}
		]
	};
} else if(system_settings['default_resource_load_layout'] == "basic"){
	gantt.config.resource_store = "resource_load_data_store";
	gantt.config.resource_property = "resourceID";
	resource_load_layout = {
		css: "gantt_container",
		rows: [
		{
			gravity: 1,
			cols: [
			{view: "grid", group:"grids", scrollY: "scrollVer"},
			{resizer: true, width: 1},
			{view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
			{view: "scrollbar", id: "scrollVer", group:"vertical"}
			]
		},
		{ resizer: true, width: 1, next: "resource_load_grid"},
		{
			height: 35,
			cols: [
			{ html:"", group:"grids"},
			{ resizer: true, width: 1},
			{ html:"<label class='active' >Hours per day <input checked type='radio' class='resource_radio_change' name='resource-mode' value='hours'></label>" +
			"<label>Tasks per day <input type='radio' name='resource-mode' class='resource_radio_change' value='tasks'></label>", css:"resource-controls"}
			]
		},
		{
			gravity:1,
			id: "resource_load_grid",
			config: resourceGridConfig,
			templates: "",
			cols: [
			{ view: "resourceGrid", group:"grids", scrollY: "resourceVScroll" },
			{ resizer: true, width: 1},
			{ view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll"},
			{ view: "scrollbar", id: "resourceVScroll", group:"vertical"}
			]
		},
		{view: "scrollbar", id: "scrollHor"}
		]	
	};

} else if(system_settings['default_resource_load_layout'] == "none"){
	resource_load_layout =  {
		css: "gantt_container",
		rows:[
		{
			gravity:1,
			cols: [
			{view: "grid", group:"grids", scrollY: "scrollVer"},
			{resizer: true, width: 1},
			{view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
			{view: "scrollbar", id: "scrollVer", group:"vertical"}
			]
		},
		{view: "scrollbar", scroll: "x", id:"scrollHor"}
		]
	};
}
gantt.config.layout = resource_load_layout;


//===============
// Menu - Initialize
//=============== 
header_menu_init();

right_click_menu_init();

//===============
//Load Table Resource List
//=============== 

resourcesStore = gantt.createDatastore({
	name:"resource_load_data_store",
	type: "treeDatastore",
	initItem: function(item){
		// item.id = gantt.uid();
		item.parent = 0;
		item.owner_id = 0;
		item.open = true;
		item.text = item.label;

		return item;
	}
});

resourcesStore.parse(gantt.serverList("resource"));


resourcesStore.attachEvent("onAfterSelect", function(id){
	gantt.refreshData();
});


//===============
// Template Options
//=============== 

gantt.templates.progress_text = function(start, end, task){
	
	var task_progress = task.progress;
	if($.trim(task.progress) <= 100) {
		task_progress = task.progress;
	} else {
		task_progress = task.progress*100;
	}
	
	return "<span style='text-align:left;'>"+Math.round(task_progress)+ "% </span>";
};

/*gantt.templates.task_cell_class = function(task, date){
	var task_cell_class = "";
		if(gantt.isWorkTime(date) == false){
			task_cell_class += "week_end";
		}

		return task_cell_class;
	};*/


	gantt.templates.grid_row_class = 
	gantt.templates.task_row_class = function(start, end, task){
		var task_row_class = "";
		if(task.$virtual){
			task_row_class += "summary-row"
		}

		return task_row_class;
	};

	gantt.templates.task_class  = function(start, end, task){
		var task_class = ''; 
		if(task.$virtual){
			task_class += " summary-bar sumarry-row";
		}

		if(task.readonly == 1){
			task_class += " task_readonly";
		}

		if(system_settings['default_task_color_code'] == "priority"){
			var temp_priority_key_value = get_priority_from_range(task.priority);
			if(temp_priority_key_value!="" && temp_priority_key_value!= undefined){
				task_class += " " + temp_priority_key_value['label'].toLowerCase() ||  "";

			}
		} else if(system_settings['default_task_color_code'] == "task_type"){
			for (var i = 0; i < gantt.serverList("task_type").length; i++) {
				var temp_task_key_value = (gantt.serverList("task_type")[i]);
				if((task.task_type == temp_task_key_value['key']) || (task.task_type == temp_task_key_value['unique_name'])){
					task_class += " " + temp_task_key_value['unique_name'].toLowerCase();
				}
			}
		}

		if(task.task_type == "overload" || task.task_type == "maintenance" || task.task_type == "interruption" || task.task_type == "machine_down" || task.task_type == "breakdown" || task.task_type == "power_cut" ){
			task_class += " " + task.task_type;
		}

		return task_class;
	};

//===============
// QuickInfo Template Classes
//=============== 
gantt.templates.quick_info_class = function(start, end, task){ 
	return 'quick_info_popup_buttons';
};


gantt.templates.quick_info_content = function(start, end, task){
	var temp_strt = start.toString().split('GMT');
	var temp_end = end.toString().split('GMT');
	var opr_qinfo = task.details || task.text;
	return `<div>
	<div class="text-primary"><b> `+ opr_qinfo  +`</b></div> <br />
	<div class=""> `+ temp_strt[0] + ` - `+ temp_end[0] +`</div> <br />

	</div>`; 
};

//===============
// Resource Grid Layout Template
//=============== 
var resourceTemplates = {
	grid_row_class: function(start, end, resource){
		return "";
	},
	task_row_class: function(start, end, resource){
		return "";

	}
}; 

gantt.templates.resource_cell_class = function(start_date, end_date, resource, tasks){
	var css = [];
	css.push("resource_marker");
	if (tasks.length <= 1) {
		css.push("workday_ok");
	} else {
		css.push("workday_over");
	}
	return css.join(" ");
};

gantt.templates.resource_cell_value = function(start_date, end_date, resource, tasks){
	var html = "<div style=\"margin: -10px; border-radius: 50px; \">"
	if(resourceMode == "hours"){
		html += tasks.length * 8;
	}else{
		html += tasks.length;
	}
	html += "</div>";
	return html;
};


//===============
// Gantt Initialize
//=============== 
gantt.init("gantt_here");

//===============
// Light Box Buttons Config
//=============== 
gantt.config.buttons_left=["dhx_save_btn","complete_button"];
gantt.config.buttons_right = ["dhx_cancel_btn", "dhx_delete_btn"];
gantt.locale.labels.dhx_save_btn = $_LANG['save'];
gantt.locale.labels.dhx_cancel_btn = $_LANG['cancel'];
gantt.locale.labels.dhx_delete_btn= $_LANG['delete'];
gantt.locale.labels.complete_button = $_LANG['complete'];
gantt.resetLightbox();

//===============
//Data loading
//===============

service_call("get_operations", "gantt_chart", system_settings['default_work_center'], function(res){
	$(".loading_div").hide();
	$("#icon_action_menu").show();
	if(res.data != "none"){
		data_source = { "data" : res.data, "links": res.links  };
	} else {
		data_source = { "data" : "", "links": ""  };
	}

	gantt.parse(data_source);
	
	detail_layout_call();
	
	log_data(data_source);
});


//===============
//Custom lightbox Configuration 
//===============
gantt.showLightbox = function(id) {
	current_popup_task_id = id;
	var task = gantt.getTask(current_popup_task_id);
	
	//  Filling light box values
	var form = custom_lightbox_form('lightbox_modal');

	custom_lightbox_fill_data(task, current_popup_task_id);

	// lightbox validations 
	if(task.type== "project" || task.type== "work_order"){

		disable_hideshow_custom_lightbox("time", 0); // disable date time picker
		disable_hideshow_custom_lightbox("resource", 0); // disable resources
		disable_hideshow_custom_lightbox("priority", 1); // enable priority
		disable_hideshow_custom_lightbox("task_type", 0); // disable task type
	} else {
		disable_hideshow_custom_lightbox("priority", 0); // disable priority
		disable_hideshow_custom_lightbox("time", 1); // enable date time picker
		disable_hideshow_custom_lightbox("resource", 1); // enable resources
		disable_hideshow_custom_lightbox("task_type", 1); // enable task type
	}

	if(task.is_local_task == 0){
		disable_visible_custom_lightbox('work_center', 0);
		disable_visible_custom_lightbox('resource', 0);
		disable_visible_custom_lightbox('operation_code', 0);
		disable_visible_custom_lightbox('operation_description', 0);
		disable_visible_custom_lightbox('task_type', 0);
		$('#complete_action').attr('disabled', true);
	} else {
		if(task.split_task_grp_id == 0){
			disable_visible_custom_lightbox('work_center', 0);
		} else{
			disable_visible_custom_lightbox('work_center', 1);
		}
		disable_visible_custom_lightbox('operation_code', 1);
		disable_visible_custom_lightbox('operation_description', 1);
		disable_visible_custom_lightbox('task_type', 1);
		disable_visible_custom_lightbox('resource', 1);
		$('#complete_action').attr('disabled', false);
	}

	form.style.display = "block"; 
	show_custom_lightbox('lightbox_modal');
	form.querySelector("[name='close_lightbox_custom']").onclick = close_custom_lightbox;
};

gantt.hideLightbox = function(){
	custom_lightbox_form('lightbox_modal').style.display = ""; 
	hide_custom_lightbox('lightbox_modal');
	current_popup_task_id = null;
	selected_task_id = null;
}

//===============
//Attach Events
//===============
gantt.attachEvent("onRowDragStart", function(id, target, e) {
	g_task_drag_drop_id = id;
	return true;
});

gantt.attachEvent("onRowDragEnd", function(id, target) {
	g_task_drag_drop_id = null;
	gantt.render();
});

gantt.attachEvent("onBeforeAutoSchedule", function(){
	return true;
});

gantt.attachEvent("onAfterTaskAutoSchedule", function(task, new_date, constraint, predecessor){ });

gantt.attachEvent("onBeforeTaskMove", function(id, parent, tindex){

});

gantt.attachEvent("onAfterLinkDelete", function(id,item){
	delete_task_link(item.link_id)
});

gantt.attachEvent("onTaskClick", function(id,e){
	var temp_class = get_task_class(id);
	var t_task = gantt.getTask(id);
	var task_h_flag = check_highlight(id);

	setTimeout(function(){
		if(selected_task_id == null){
			selected_task_id = id;
		} else {
			if(selected_task_id == id){
				un_select_task();
				if(task_h_flag){
					set_unset_higlight(t_task.$source.concat(t_task.$target), 1);
				}
				set_task_class(id, temp_class);     
				return false;
			} else {
				selected_task_id = id;
			}
		}
		if(task_h_flag){
			set_unset_higlight(t_task.$source.concat(t_task.$target), 1);
		}
		set_task_class(id, temp_class);  
		change_lock_unlock_icon();

		if($(".gantt_cal_quick_info").length > 0){
			var quickinfo_position = $(".gantt_cal_quick_info").css('top').replace("px", "");
			// $(".gantt_cal_quick_info").css('top', (quickinfo_position-190)+'px');
		}
		
	}, default_pause_short);
	return true;
});

gantt.attachEvent("onTaskDblClick", function(id,e){
	if(id !== undefined && id !== null && id !== ''){
		gantt.showLightbox(id); return false;	
	}
	return true;
});

gantt.attachEvent("onTaskUnselected", function(id,item){
	if(highlighted_task_list.length > 0){ // for greyed out task  
		var task_avail = (highlighted_task_list.filter(function(h_task_id){ return h_task_id == id; }));
		if(task_avail.length == 0){
			var t_task = gantt.getTask(id);
			var temp_cls = get_task_class(id) + ' ' + grey_class;
			set_task_class(id, temp_cls);
			set_unset_higlight(t_task.$source.concat(t_task.$target), 1);
		}
	}

});

gantt.attachEvent("onBeforeTaskDrag", function(id, mode, e){
	if(mode == "resize"){
		resize_task_details = gantt.getTask(id);
	}
	return true;
});

gantt.attachEvent("onTaskDrag", function(id, mode, task, original){});



gantt.attachEvent("onBeforeTaskChanged", function(id, mode, task){
	if(mode == "resize"){
		if(task.min_duration != 0 && task.min_duration != '0'){

			if(resize_task_details.duration  < task.min_duration){
				task.auto_scheduling = false;
				return false;
			}
		}
	}
	task.auto_scheduling = true;
	detail_layout_call();
	return true;
});

/*gantt.attachEvent("onGanttScroll", function (left, top){
	//setTimeout(function(){
	  log_data("onGanttScroll + ");
		$(document).find(".custom_load_res_table_scale").html($(document).find(".gantt_task_scale:first").html());
		$(document).find(".custom_load_res_table_scale").css("left", '-'+left+'px');
		$(document).find(".custm_load_table_area").css("left", '-'+left+'px');
		$(".bottom_custom_horizontal_scroll").scrollLeft( left );
//	}, 10);
});*/

//===============
// Light Box events
//===============

gantt.attachEvent("onLightboxSave", function(id, task, is_new){

	task.text = $("#oper_code").val();
	task.description = $("#operation_description").val();
	task.task_type = $("#task_type_select").val();
	task.work_center = $("#task_wc_code").val();
	task.resource = $("#task_assigned_res").val();
	task.priority = $("#priority_select").val();
	var start_hours = ($("#popup_start_hours").val()!=0) ? ($("#popup_start_hours").val()/60) : 0;
	var end_hours = ($("#popup_end_hours").val()!=0) ? ($("#popup_end_hours").val()/60) : 0;
	
	var $field_sd = ($("#popup_start_date").val()).split("-");
	task.start_date = new Date( $field_sd[2], ( $field_sd[1]-1),  $field_sd[0], start_hours, $("#popup_start_minutes").val(), 00, 00);
	
	var $field_ed = ($("#popup_end_date").val()).split('-');
	task.end_date = new Date($field_ed[2], ($field_ed[1]-1), $field_ed[0], end_hours, $("#popup_end_minutes").val(), 00, 00);

	if(!task.text){
		gantt.message({type:"error", text:$_LANG['desc_required']});
		return false;
	} 

	if(!task.$new && task.type == "project"){
		change_priority_of_target(id, task.priority);

		undo_redo_priority_task_arr.push(id);
	}
	var temp_res_dtl = get_resource_detail(task.resource, task.work_center);
	task.resource_name = temp_res_dtl['resource_name'];

	if(task.$new){
		task.priority = 99;
		task.min_duration = 0; // task.duration;
		task.split_task_grp_id =0;

		gantt.addTask(task,task.parent);
		var rand_val =  Math.round(Math.random()*999)+100;
		task.operation_number = rand_val;
		task.work_order_id = rand_val;
	}else{
		gantt.updateTask(task.id);
	}

	setTimeout(function(){
		save_all_tasks(task, 1);
		gantt.render();
		gantt.hideLightbox();
	}, default_pause);

	
	return true;
});

gantt.attachEvent("onLightboxDelete", function(id){
	delete_task_id = id;
	delete_task_detail = gantt.getTask(delete_task_id);
	log_data(delete_task_detail);
	if(delete_task_detail.is_local_task == 0 || delete_task_detail.split_task_grp_id != 0){
		show_toast("warning_gantt", delete_prod_opr); 
		return false;
	}
	delete_confirm(delete_task_id, 1);
	return true;
});

gantt.attachEvent("onLightboxButton", function(button_id, node, e){
	if(button_id == "complete_button"){
		// var id = gantt.getState().lightbox;
		complete_confirm(current_popup_task_id, 1);
	}
});

//===============
// Attach Link events
//===============

gantt.attachEvent("onAfterLinkAdd", function(id,item){  });

gantt.attachEvent("onLinkClick", function(id,e){
	return false;
});

/*gantt.attachEvent("onLinkDblClick", function(id,e){
	return false;
});*/

//===============
// Menu Events
//===============

main_header_menu.attachEvent("onClick", function(item_id){
	switch(item_id) {
		case 'new_task':
		$(".gantt_grid_head_add").trigger('click');
		break;
		case "save":
		save_all_tasks();
		break;
		case "save_as":
		push_to_production();
		break;
		
		case "refresh_status_data":
		refresh_status();
		break;
		
		case "refresh_fresh_data":
		refresh_data();
		break;
		
		case "print_as_pdf":
		break;

		case "print_as_png":
		gantt.exportToPNG();
		break;

		case "print_as_ms_project":
		break;

		case "print_as_excel":
		break;

		case "sign_out":
		signout_system();
		break;

		case "plan_change_schedule":
		confirm_plan_change();
		break;

		case "close":
		window.close();
		break;

		case "edit_undo":
		task_undo()
		break;

		case "edit_redo":
		task_redo()
		break;

		case "duplicate_task":
		duplicate_selected_task();
		break; 

		case "delete_task":
		delete_selected_task();
		break;

		case "complete_task":
		complete_selected_task();
		break;

		case "lock_task":
		lock_selected_task();
		break; 

		case "hide_show_left_grid":
		$(".toggle_sidebar").trigger('click');
		break;

		case "collapse_expand":
		$(".expand_collapse_task").trigger('click');
		break;

		case "fullscreen":
		fullscreen_toggle();
		break;

		case "presentation_mode":
		presentation_mode_toggle();
		break;

		case "group_by_priority":
		showGroups('priority');
		break;

		case "group_by_resource":
		showGroups('resource');
		break;

		case "remove_grouping":
		showGroups();
		break;

		case "preferences":
		// $("#myModal").modal("show");
		$(".configuration_launch").trigger("click");
		break;
		case 'about':
		about_us_toggle();
		break;
		case 'aps_help' :
		open_help_manual_popup();
		break;
		/*case 'aps_schedule_name':
		schedule_details_popup();
		break;*/
	}
});


gantt.attachEvent("onContextMenu", function(taskId, linkId, event){

	var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	if(taskId ){
		// return false; // disabling split task for this build will remove and work on split task in future
		right_click_task = gantt.getTask(taskId);
		right_click_menu.showContextMenu(x, y);

		if(right_click_task.type == 'project' || right_click_task.type == 'work_order'){
			right_click_menu.setItemDisabled('split_task');
		} else {
			right_click_menu.setItemEnabled('split_task');
		}	
		
		if(check_highlight(right_click_task.id) == false && highlighted_task!=""){
			right_click_menu.showItem('remove_highlight');  
			right_click_menu.hideItem('highlight_task');  

		} else {
			right_click_menu.hideItem('remove_highlight');  
			right_click_menu.showItem('highlight_task');  
		}
		log_data(right_click_task);
		
		return false;
	}
	return true;
});


right_click_menu.attachEvent("onClick", function(item_id){
	switch(item_id) {
		case "split_task":
		break;
		
		case "split_task_only": 
		split_task_only();
		break;
		
		case "split_task_insert": 
		split_task_insert();
		break;
		
		case "highlight_task": 

		highlighted_task_list.length = 0;
		remove_highlight(0);
		gantt.eachTask(function(task){
			if(!task.$virtual){
				if(right_click_task.work_order !== task.work_order){
					set_highlight(task.id);
					set_unset_higlight(task.$source.concat(task.$target), 1);
				} else if(right_click_task.work_order == task.work_order){
					highlighted_task_list.push(task.id);
					set_unset_higlight(task.$source.concat(task.$target), 0);

				}
			}
		});
		highlighted_task = right_click_task;
		break;
		
		case "remove_highlight": 
		remove_highlight(0);
		break;
	}
});

//===============
// Custom jQuery Events
//===============

document.addEventListener('webkitfullscreenchange', exit_handler, false);
document.addEventListener('mozfullscreenchange', exit_handler, false);
document.addEventListener('fullscreenchange', exit_handler, false);
document.addEventListener('MSFullscreenChange', exit_handler, false);


setTimeout(function(){
	resource_load_bind_event();
}, default_pause);


/*$(document).on("click", ".gantt_popup_button.gantt_ok_button", function(event){
	event.preventDefault();
	if(delete_task_detail.is_saved == 1){
		if(delete_task_detail.is_local_task == 0 || delete_task_detail.split_task_grp_id != 0){
			show_toast("warning_gantt", delete_prod_opr); 
			return false;
		}
		
		delete_saved_task(delete_task_id, 1, function(res){
			if(res == 'error'){
				return false;
			}
		});
		delete_task_id = "";
	}
});*/

$(document).on("submit", ".configuration_form", function(event){
	event.preventDefault();
	var popup_submit_btn_id = $(this).find("button[type='submit']").attr("id");
	var org_btn_text = $("#"+popup_submit_btn_id).html();
	show_button_loading(popup_submit_btn_id, "Saving");
	ajax_form_submit("save_system_settings", $(this).serialize(), function(response){
		setTimeout(function(){
			show_toast(response.success, $_LANG[response.message]);
			hide_button_loading(popup_submit_btn_id, org_btn_text);
			if(response.success != "error"){
				window.location.reload();
			}
		}, default_pause);
	});
	// hide_button_loading(popup_submit_btn_id, org_btn_text);
});

$(document).on("click", ".change_chart_view", function(event){
	var vObj = $(this);
	vObj.parents("li").siblings('li').removeClass('active');
	vObj.parents("li").addClass('active');
	if(vObj.attr("id") == "minute"){
		minute_view_configuration();
		$(".load_table_box").show();  // temp for GA Release March 
	} else if(vObj.attr("id") == "day"){
		date_view_configuration();
		$(".load_table_box").show();  // temp for GA Release March 
	} else if(vObj.attr("id") == "week"){
		week_view_configuration();
		$(".load_table_box").hide(); // temp for GA Release March 
	} else if(vObj.attr("id") == "month"){
		month_view_configuration();
		$(".load_table_box").hide(); // temp for GA Release March 
	} else if(vObj.attr("id") == "year"){
		year_view_configuration();
		$(".load_table_box").hide(); // temp for GA Release March 
	}

	current_timeline_view = vObj.attr("id");

	detail_layout_call();
	gantt.render();
});


$(document).on("click", ".change_dashboard_display", function(event){
	var curObj = $(this);
	var curObjId = curObj.attr("id");
	timeline_navigation(curObjId);
	detail_layout_call();
});

$(document).on("click", ".current_date", function(event){
	var current_date_flag  = 'current';
	timeline_navigation(current_date_flag);
	detail_layout_call();
});


// toggle sidebar 
$(document).on("click", ".toggle_sidebar", function(){
	var t_title = '';
	var t_icon = '';
	show_details = !show_details;
	for (var i = 0; i < gantt.config.columns.length; i++) {
		gantt.getGridColumn(gantt.config.columns[i].name).hide = !show_details;
	}
	
	if($(this).attr("data-visible") == 0){
		gantt.config.grid_width = system_settings['left_panel_width'];
		$(this).attr("data-visible", 1)
		t_title = $(this).attr("title").replace("Show", "Hide") ;
		t_icon = 'fa fa-eye-slash';

	} else {
		gantt.config.grid_width = 1;
		$(this).attr("data-visible", 0)
		t_title = $(this).attr("title").replace("Hide", "Show");
		t_icon = 'fa fa-eye';
	}
	$(this).attr("title",  t_title);
	main_header_menu.setItemText('hide_show_left_grid', t_title);
	main_header_menu.setItemImage('hide_show_left_grid', t_icon, t_icon);

	if(highlighted_task!="" && highlighted_task!== undefined){
		remove_highlight(0);
	}
	gantt.render();

})

$(document).on("click", ".top_menu_items", function(){
	$(this).blur();
});

$(document).on("click", ".expand_collapse_task", function(){
	var temp_flag = true;
	var t_title = '';
	var t_icon_add = '';
	var t_icon_remove = '';
	if($(this).attr("data-hide") == 0){
		temp_flag = true;
		$(this).attr("data-hide", 1);
		t_title =  $(this).attr("title").replace("Expand", "Collapse");
		t_icon_add = 'fa-compress';
		t_icon_remove = "fa-expand";
	} else {
		temp_flag = false;
		$(this).attr("data-hide", 0);
		t_title =  $(this).attr("title").replace("Collapse", "Expand");
		t_icon_add = 'fa-expand';
		t_icon_remove = "fa-compress";
	}
	$(this).attr("title", t_title);
	$(this).find("i").removeClass(t_icon_remove).addClass(t_icon_add);
	main_header_menu.setItemText('collapse_expand', t_title);
	main_header_menu.setItemImage('collapse_expand', "fa "+ t_icon_add, "fa "+t_icon_add);

	gantt.eachTask(function(task){
		task.$open = temp_flag;
	});

	if(highlighted_task!="" && highlighted_task!== undefined){
		remove_highlight(0);
	}

	gantt.render();
});

$(document).on("change, keyup", ".close_setting_popup_alert", function(){
	close_setting_popup_alert = 1;
});

$(document).on("click", ".close_configuration_popup", function(){
	if(close_setting_popup_alert == 1){
		gantt.confirm({
			text: $_LANG['unsaved_changes_lost_alert'],
			ok:'<i class="fa fa-check"></i> ' + $_LANG['yes'], 
			cancel:'<i class="fa fa-times"></i> ' + $_LANG['no'],
			callback: function(result){
				if(result == true){
					$("#myModal").modal('hide');
					close_setting_popup_alert = 0;
				}
			}
		});
	} else if(close_setting_popup_alert == 0){
		$("#myModal").modal('hide');
		close_setting_popup_alert= 0;
	}
});

$(document).on("keyup, change", ".close_task_popup_alert", function(){
	close_task_popup_alert = 1;
});

$(document).on("change", "#default_task_color_code", function(){
	$(".color_scheme").hide();
	color_scheme_div = "."+$(this).val()+"_box";
	$(color_scheme_div).show();
});

$(document).on("click", ".resource_block", function(){
	var res_obj_t = $(this);
	var parent_ele_id = res_obj_t.attr("id");
	if(res_obj_t.parent().find(".sub_elements").hasClass('hide')){

		res_obj_t.parent().find(".sub_elements").removeClass('hide');
		res_obj_t.find(".load_tbl_par_el_icon").removeClass('fa-plus').addClass('fa-minus');
		$(document).find(".sub_element_right[resource_load_data_store_id='"+parent_ele_id+"']").removeClass("hide");
		res_obj_t.parent().css("height", "auto");
	} else {
		res_obj_t.parent().find(".sub_elements").addClass('hide');
		res_obj_t.find(".load_tbl_par_el_icon").removeClass('fa-minus').addClass('fa-plus');
		$(document).find(".sub_element_right[resource_load_data_store_id='"+parent_ele_id+"']").addClass("hide");
		res_obj_t.parent().css("height", gantt.config.row_height);
	}
});

$(document).on("click", ".split_duration_dec", function(){
	var temp_duration = $(".split_duration_value").val();
	temp_duration--;
	if(temp_duration < 1){
		temp_duration = 1;
	}

	$(".split_duration_value").val(temp_duration);
	split_task_dur = temp_duration;

});

$(document).on("click", ".split_duration_inc", function(){
	var temp_duration = $(".split_duration_value").val();
	temp_duration++;
	$(".split_duration_value").val(temp_duration);
	split_task_dur = temp_duration;
});

$(document).on("keyup", ".split_task_opr_code", function(){
	split_opr_code = $(this).val();
});


$(document).on("change", ".split_task_task_type", function(){
	split_task_task = $(this).val();
});

$(document).on("change", ".split_task_start_point", function(){
	split_task_start_point = $(this).val();
});

$(document).on("change", ".split_task_type", function(){
	split_task_split_type = $(this).val();
});

$(document).on("click", ".work_center_popup_select_change", function(){
	var cObj = $(this);
	var current_elem_id = cObj.attr('id');
	lightbox_work_center_res_list(current_elem_id, cObj.val());
});


$(document).on("change", "#auto_resync_toggle", function(){
	if(system_settings['enable_auto_resync_progress'] == 1){
		var sync_dur_in_milisec = (system_settings.auto_resync_duration*60*1000);
		if($(this).is(":checked") == true){

			show_toast("info_gantt", string_replacer($_LANG['enabled_auto_refresh'], '{__DURATION__}', system_settings.auto_resync_duration ), toast_msg_duration_long);

			refresh_status_interval = setInterval(function(){
				refresh_status();
			}, sync_dur_in_milisec);
		}  else if($(this).is(":checked") == false){
			if(refresh_status_interval!=""){
				clearInterval(refresh_status_interval);	
				show_toast("info_gantt", auto_refresh_disabled_msg, toast_msg_duration_long);
			}
		}
	} 
});

$(document).on("change", ".add_remove_timeline_option", function(){
	var armo = $(this);
	var toggle_option_timeline_view_name = armo.data("timeline_option");
	if(armo.is(":checked")){
		$("#default_timeline_view").find("option[value='"+toggle_option_timeline_view_name+"']").show();

		$("#"+toggle_option_timeline_view_name).parent("li").show();
	} else {
		$("#default_timeline_view").find("option[value='"+toggle_option_timeline_view_name+"']").hide();
		$("#"+toggle_option_timeline_view_name).parent("li").hide();
		if(toggle_option_timeline_view_name == "minute"){
			$("#default_timeline_view").removeAttr('selected').find('option[value="day"]').prop('selected', true);
		}
	}
});

$(document).on("change", ".check_uncheck_value_switcher", function(){
	var cuvs = $(this);
	if(cuvs.is(":checked")){
		$("#"+cuvs.data("linked_field")).attr("value", 1);
	} else {
		$("#"+cuvs.data("linked_field")).attr("value", 0);
	}
});

$(window).resize(function(){
	detail_layout_call();
});

// popup navigation events events
$(document).on("click", ".configuration_launch", function(){
	set_settings_in_popup(system_settings);
	$("#myModal").modal('show');
	$(".popup_navigation").prop("disabled", true);
	var current_step = $(".popup_sections[data-display='1']").data("step");
	if(current_step == 1){
		$("#popup_next_btn").attr("disabled", false);
	} else {
		$("#popup_prev_btn").attr("disabled", false);

	}
});

$(document).on("click", "#popup_prev_btn", function(){
	
	var current_step = $(".popup_sections[data-display='1']").data("step");
	$(".popup_sections[data-display='1']").addClass('hide').attr("data-display", 0);
	var prev_step = current_step-1;
	if($(".popup_sections[data-step='"+prev_step+"']").length){
		$(".popup_sections[data-step='"+prev_step+"']").attr("data-display", 1).removeClass('hide');
		$("#popup_next_btn").attr("disabled", false);
		var pre_prev_step = prev_step-1;
		if($(".popup_sections[data-step='"+pre_prev_step+"']").length == 0){
			$("#popup_prev_btn").attr("disabled", true);
		}
	}
});

$(document).on("click", "#popup_next_btn", function(){
	var current_step = $(".popup_sections[data-display='1']").data("step");
	$(".popup_sections[data-display='1']").addClass('hide').attr("data-display", 0);
	var next_step = current_step+1;
	if($(".popup_sections[data-step='"+next_step+"']").length){
		$(".popup_sections[data-step='"+next_step+"']").attr("data-display", 1).removeClass('hide');
		$("#popup_prev_btn").attr("disabled", false);

		var further_next_step = next_step+1;
		if($(".popup_sections[data-step='"+further_next_step+"']").length == 0){
			$("#popup_next_btn").attr("disabled", true);
		}
	}	
});

$(document).on("change", "#enable_auto_resync_progress_toggle", function(){
	var enable_resync_div = $(".enable_auto_resync_progress_box");
	if($(this).is(":checked")){
		enable_resync_div.show();
	} else {
		enable_resync_div.hide();
	}
});

$(document).on("click", "[name='save_update_lightbox_task']", function(e){
	log_data(gantt.getTask(current_popup_task_id));
	var task = gantt.getTask(current_popup_task_id);
	gantt.callEvent('onLightboxSave', new Array(current_popup_task_id, task, task.$new));
});


$(document).find("[name='delete_lightbox_task']").on("click", function(e){
	gantt.callEvent('onLightboxDelete', new Array(current_popup_task_id));
});

$(document).find("[name='complete_action']").on("click", function(e){
	gantt.callEvent('onLightboxButton', new Array('complete_button'));
});

$(document).on("change", ".resource_radio_change", function(event){
	var rrc = $(this);
	rrc.parents(".gantt_layout_content").find("label").each(function(){
		$(this).parents(".gantt_layout_content").find("label").removeClass('active');
	});
	resourceMode = rrc.val();
	rrc.parent("label").addClass('active');	
	gantt.getDatastore('resource_load_data_store').refresh();
});



//===============
// Key Events
//===============

$(document).keydown(function(e){
	if(system_settings['enable_keyboard_shortcut'] == 1){

		// log_data(e.keyCode);
		if( e.ctrlKey == true && e.keyCode === 89 ){
			task_redo();
		}
		else if( e.ctrlKey == true && e.keyCode === 90 ){
			task_undo();
		}          
		else if( e.ctrlKey == true && e.keyCode === 83 ){
			e.preventDefault();
			save_all_tasks();
		}          
		else if(e.keyCode === 46 ){
			e.preventDefault();
			delete_selected_task()
		} 
		else if(e.keyCode === 27 ){
			exit_handler();
		}


	}
});

//===============
// Additional Libray Initialize and Configure 
//===============

$('.colorpicker-component').colorpicker({
	format : "hex",
	inline: false,
	container: true,	
});

$('a.keyboard_shortcut_help').tooltip({
	title: "<div>\
	<h5> "+ $_LANG['keyboard_shortcuts'] +" </h5>\
	<p>"+ $_LANG['undo'] +"   : Ctrl + Z</p>\
	<p>"+ $_LANG['redo'] +"   : Ctrl + Y</p>\
	<p>"+ $_LANG['save'] +"   : Ctrl + S</p>\
	<p>"+ $_LANG['delete'] +" : Delete</p>\
	</div>", 
	html: true, 
	placement: "left"
}); 

$('li.current_plan_detail_quicklook').tooltip({
	template: '<div class="tooltip brown_background"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	title: "<div>\
	"+$_LANG['current_sch']+" - <h5><b>"+ current_plan_details['plan_name'] +"</b> </h5>\
	</div>", 
	html: true, 
	placement: "left"
});

$('a.auto_resyn_desc').tooltip({
	title:  "<div><h5>"+ $_LANG['auto_resync_progress'] +" </h5><br />"+ $_LANG['auto_update_internval'] +"</div>", 
	html: true, 
	placement: "right"
}); 
 
var plan_from = "";
 if(current_plan_details!=undefined){
 	var temp_plan_from = (current_plan_details['from_date']).replace(" 00:00", '').split('-');
 	plan_from = new Date(parseInt( temp_plan_from[0]), (parseInt(temp_plan_from[1])-1),temp_plan_from[2]);

 } else {
	plan_from =  new Date();
 }

var checkin =  $('#popup_start_date_picker').datepicker({
	autoclose : true,
	format : "dd-mm-yyyy",
	keyboardNavigation : true,
	todayHighlight : true,
	startDate: plan_from
}).on('changeDate', function(ev) {

	/*var newDate = new Date(ev.date);
	newDate.setDate(newDate.getDate());
	$('#popup_end_date_picker').datepicker('update', newDate);
	$('#popup_end_date_picker').datepicker('setStartDate', newDate);

	checkin.hide();
	$("#popup_start_date").removeAttr('style');*/
}).data('datepicker')

var checkout =  $('#popup_end_date_picker').datepicker({
	autoclose : true,
	format : "dd-mm-yyyy",
	keyboardNavigation : true,
	todayHighlight : true
}).on('changeDate', function(ev) {
	/*checkout.hide();
	$("#popup_start_date").removeAttr('style');*/
}).data('datepicker');

}); // document ready

