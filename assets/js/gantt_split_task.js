//===============
//Split task functions 
//=============== 

function split_task_only(){
  debugger;

 var t_ref_id = right_click_task.ref_id; 
 var c_split_task_id = right_click_task.id;

 var  start_point = get_int_hour(right_click_task.start_date);
 var  end_point = get_int_hour(right_click_task.end_date);
 var mid_point = Math.round((start_point + end_point)/2);

 if((new Date(right_click_task.start_date).getDate()) !== (new Date(right_click_task.end_date).getDate())){
   if(current_timeline_view == 'day'){
    show_toast("warning_gantt", $_LANG['cannot_split_task_validation']);
    return false;
  }
} 

var split_duration_options = '';
var selected_split = ''; var dur_in_size = 1;
var total_hours_dur = get_date_diff_hours(right_click_task.start_date, right_click_task.end_date);
var xyz_r = start_point;
for(var xyz= 0; xyz < total_hours_dur-1; xyz++){
  selected_split  ='';
  xyz_r = xyz_r+1;
  if(xyz_r == 24){
    xyz_r = 0;
  }
  
  var temp_dd_val = (xyz_r < 10) ? "0" + xyz_r+ ":00" : xyz_r +":00"
  if((mid_point) == xyz){
   selected_split = 'selected';
 }
 split_duration_options +=  '<option value="'+dur_in_size+'" '+selected_split+'>'+ temp_dd_val +'</option>';
 dur_in_size++;
}
var start_point_id = 'input_'+gantt.uid();
var split_type_id = 'input_'+gantt.uid();

split_task_start_point = (mid_point-1);

split_task_split_type = 'start_squential';

gantt.modalbox({
  type:"split_task_popup",
  title:`<div class="gantt_cal_ltitle">
  <div class="gantt_title">`+ $_LANG['split_task_options'] +`</div>
  </div>`,
  text: `
  <div class=" gantt_split_popup_area" style="text-align:left">
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection"><label for="`+start_point_id+`">`+split_start_point+`</label></div>
  <div class="gantt_cal_ltext" style="height:40px;">
  <select  class="split_task_start_point" style="width:100%; height:30px;" id="`+start_point_id+`" name="`+start_point_id+`">`+split_duration_options+`</select>
  </div>
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection"><label for="`+split_type_id+`">`+split_type+`</label></div>
  <div class="gantt_cal_ltext" style="height:45px;">
  <input type="radio"  class="split_task_type" height:"30px;" id="`+split_type_id+`" name="`+split_type_id+`" value="start_squential" checked /> `+start_squence+` 
  <br />
  <input type="radio"  class="split_task_type" height:"30px;" id="`+split_type_id+`" name="`+split_type_id+`" value="start_simuntanous" disabled /> `+start_simuntanous+`
  </div>
  `,
  buttons: [
  { label:$_LANG['split'],  value:"split",  css: "btn_split_action_save" },
  { label:$_LANG['cancel'], value:"cancel", css: "btn_split_action_cancel" },
  ],
  callback: function(result){

    if(result == 'split'){

     var task_duration = (right_click_task.duration);
     var half_duration = (parseInt(split_task_start_point) > right_click_task.duration) ? ((right_click_task.min_duration)/2) : parseInt(split_task_start_point);
     var second_half_dur = (task_duration - half_duration);
    //  var half_min_duration = ((right_click_task.min_duration)/2);

    var first_half_min_dur =  half_duration;
    var second_half_min_dur = (right_click_task.min_duration - half_duration);
    if(second_half_min_dur < 0){
      second_half_min_dur = 0;
    }

    var t_start_time = right_click_task.start_date;
    var t_end_time = right_click_task.end_time;


    var first_half_end = new Date(t_start_time).setHours(t_start_time.getHours() + Math.round(half_duration));
    first_half_end = new Date(first_half_end);
    
    var source_link = right_click_task.$source;
    var target_link = right_click_task.$target;

    var right_click_task_parent = right_click_task.parent; 

    var first_half_task_details = {
      id:gantt.uid(),
      text:right_click_task.text + " - 01",
      start_date:t_start_time,
      open:true,
      ref_id:  t_ref_id,
      work_center: right_click_task.work_center,
      end_date:first_half_end,
      operation_number:  right_click_task.operation_number,
      status: right_click_task.status,
      is_saved: 0,
      resource:right_click_task.resource,
      resource_name:right_click_task.resource_name,
      priority:right_click_task.priority,
      progress: 0,
      parent: right_click_task_parent,
      work_order : right_click_task.work_order,
      duration:  half_duration,
      min_duration: first_half_min_dur,
      description: right_click_task.description + " - 01",
      readonly: right_click_task.readonly,
      is_local_task: 1,
      split_task_group_id: c_split_task_id,
      head_doc_entry  : right_click_task.head_doc_entry,
      oper_doc_entry  : right_click_task.oper_doc_entry,
      oper_line_id  : right_click_task.oper_line_id,
      res_line_id: right_click_task.res_line_id,
      task_type : right_click_task.task_type,
      required_resource : right_click_task.required_resource
    };

    var second_half_start = '';
    if(split_task_split_type == "start_squential"){
      second_half_end = new Date(first_half_end).setHours(first_half_end.getHours() + Math.floor(second_half_dur) );
      second_half_end  = new Date(second_half_end);
      second_half_start = first_half_end;
    } else  if(split_task_split_type == "start_simuntanous"){
      second_half_end = new Date(t_start_time).setHours(t_start_time.getHours() + Math.floor(second_half_dur) );
      second_half_end  = new Date(second_half_end);
      second_half_start = t_start_time;
    }
 

    var second_half_task_details = {
      id:gantt.uid(),
      text:right_click_task.text + " - 02",
      start_date:second_half_start,
      open:true,
      ref_id:  t_ref_id,
      work_center: right_click_task.work_center,
      end_date:second_half_end,
      operation_number:  right_click_task.operation_number,
      status: right_click_task.status,
      is_saved: 0,
      resource:right_click_task.resource,
      resource_name:right_click_task.resource_name,
      priority:right_click_task.priority,
      progress: 0,
      parent: right_click_task_parent,
      work_order : right_click_task.work_order,
      duration:  second_half_dur,
      min_duration: second_half_min_dur,
      description: right_click_task.description + " - 02",
      readonly: right_click_task.readonly,
      is_local_task: 1,
      split_task_group_id: c_split_task_id,
      head_doc_entry  : right_click_task.head_doc_entry,
      oper_doc_entry  : right_click_task.oper_doc_entry,
      oper_line_id  : right_click_task.oper_line_id,
      res_line_id: right_click_task.res_line_id,
      task_type : right_click_task.task_type,
      required_resource : right_click_task.required_resource
    };

    var localtask_index = gantt.getTaskIndex(c_split_task_id);

 // updating and removing the previous task that is split now                      
 gantt.getTask(c_split_task_id).$source = [];
 gantt.getTask(c_split_task_id).$target = [];
 gantt.updateTask(c_split_task_id);
 gantt.deleteTask(c_split_task_id);

  // Add new tasks
  
  var first_half_id = gantt.addTask(first_half_task_details, right_click_task_parent, localtask_index);
  var second_half_id = gantt.addTask(second_half_task_details, right_click_task_parent, parseInt(localtask_index+1));

  if(split_task_split_type == "start_squential"){

    var intermediate_link = {
      id: gantt.uid(),
      ref_id:t_ref_id,
      source: first_half_id,
      target:second_half_id,
      type:0,
      is_saved:0
    };
    var linkId = gantt.addLink(intermediate_link);

    // update existing links 
    if(source_link.length > 0){
      gantt.getLink(source_link[0]).source = second_half_id;
      gantt.updateLink(source_link[0]);
      gantt.refreshLink(source_link[0]);
    }

    if(target_link.length > 0){
      gantt.getLink(target_link[0]).target = first_half_id;
      gantt.updateLink(target_link[0]);
      gantt.refreshLink(target_link[0]);
    }
  } else if(split_task_split_type == "start_simuntanous"){


    if(target_link.length > 0){
      var parallel_link = {
        id: gantt.uid(),
        ref_id:t_ref_id,
        source: first_half_id,
        target:second_half_id,
        type:1,
        is_saved:0
      };
      var linkId = gantt.addLink(parallel_link);

      gantt.getLink(target_link[0]).target = first_half_id;
      gantt.updateLink(target_link[0]);
      gantt.refreshLink(target_link[0]);
    }

  }

//  return;
  // delete existing task
  setTimeout(function(){

  // gantt.deleteTask(c_split_task_id);
  delete_saved_task(c_split_task_id, 0 , function(res){
    if(res == 'error'){
      return false;
    } 
  });


  save_all_tasks();
 // show_toast("custom_success", "Success");
 right_click_task = [];
}, default_pause_short);
} else if(result == 'cancel'){
  return true;
}

}
});

}


function split_task_insert(){
  var opr_code_id = 'input_'+gantt.uid();
  var task_type_id = 'input_'+gantt.uid();
  var duration_id = 'input_'+gantt.uid();

  split_opr_code = '';
  split_task_task = 1;
  split_task_dur = 2;


  var  start_point = get_int_hour(right_click_task.start_date);
  var  end_point = get_int_hour(right_click_task.end_date);
  var mid_point = Math.round((start_point + end_point)/2);

  if((new Date(right_click_task.start_date).getDate()) !== (new Date(right_click_task.end_date).getDate())){
   if(current_timeline_view == 'day'){
    show_toast("warning_gantt", $_LANG['cannot_split_task_validation']);
    return false;
  }
} 

var split_duration_options = '';
var selected_split = ''; var dur_in_size = 1;
var total_hours_dur = get_date_diff_hours(right_click_task.start_date, right_click_task.end_date);
var xyz_r = start_point;
for(var xyz= 0; xyz < total_hours_dur-1; xyz++){
  selected_split  ='';
  xyz_r = xyz_r+1;
  if(xyz_r == 24){
    xyz_r = 0;
  }

  var temp_dd_val = (xyz_r < 10) ? "0" + xyz_r+ ":00" : xyz_r +":00"
  if((mid_point) == xyz){
   selected_split = 'selected';
 }
 split_duration_options +=  '<option value="'+dur_in_size+'" '+selected_split+'>'+ temp_dd_val +'</option>';
 dur_in_size++;
}
var start_point_id = 'input_'+gantt.uid();

split_task_start_point = (mid_point-1);

gantt.modalbox({
  type:"split_task_popup",
  title:`<div class="gantt_cal_ltitle">
  <div class="gantt_title">`+$_LANG['mid_task_details']+`</div>
  </div>`,
  text: `<div class=" gantt_split_popup_area" style="text-align:left">
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection">
  <label for="`+opr_code_id+`">`+gantt.locale.labels.column_task_name+`</label></div>
  <div class="gantt_cal_ltext" style="height:40px;">
  <textarea style="line-height: 30px;" id="`+opr_code_id+`" name="`+opr_code_id+`" value="`+split_opr_code+`" placeholder="Breakdown, Maintenance.." class="split_task_opr_code" ></textarea>
  </div>
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection">
  <label for="`+task_type_id+`">`+gantt.locale.labels.column_task_type+`</label>
  </div>
  <div class="gantt_cal_ltext" style="height: 40px; display: block;">
  <select style="width:100%; border: 1px solid #D7D7D7; height: 38px;" id="`+task_type_id+`" class="split_task_task_type">
  `+task_type_option_list+`
  </select>
  </div>
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection"><label for="`+start_point_id+`">`+split_start_point+`</label></div>
  <div class="gantt_cal_ltext" style="height:40px;">
  <select  class="split_task_start_point" style="width:100%; height:30px;" id="`+start_point_id+`" name="`+start_point_id+`">`+split_duration_options+`</select>
  </div>
  <div id="area_`+gantt.uid()+`" class="gantt_cal_lsection">
  <label for="`+duration_id+`">`+gantt.locale.labels.column_opr_hrs_duration+`</label>
  </div>
  <div className="gantt_selection_time"> 
  <div class="gantt_duration split_popup_duration_area">
  <input type="button" class="gantt_duration_dec split_duration_dec" value="−">
  <input type="text" value="`+split_task_dur+`" id="`+duration_id+`" class="gantt_duration_value split_duration_value" aria-label="Duration" aria-valuemin="0">
  <input type="button" class="gantt_duration_inc split_duration_inc" value="+"> Hours 
  </div>
  </div>
  </div>
  `,
  buttons: [
  { label:$_LANG['split'],  value:"split",  css: "btn_split_action_save" },
  { label:$_LANG['cancel'], value:"cancel", css: "btn_split_action_cancel" },
  ],
  callback: function(result){
    log_data(result);
    if(result == 'split'){

      if(split_opr_code == ""){
       show_toast("error", split_task_opr_code_blank_error);
       return;
     }

    // var half_duration = ((right_click_task.duration)/2);
    var task_duration = (right_click_task.duration);
    var half_duration = (parseInt(split_task_start_point) > right_click_task.duration) ? ((right_click_task.min_duration)/2) : parseInt(split_task_start_point);
    var second_half_dur = (task_duration - half_duration);
    // var half_min_duration = ((right_click_task.min_duration)/2);

    var first_half_min_dur =  half_duration;
    var second_half_min_dur = (right_click_task.min_duration - half_duration);
    if(second_half_min_dur < 0){
      second_half_min_dur = 0;
    }
    var t_start_time = right_click_task.start_date;
    var t_end_time = right_click_task.end_time;

    var first_half_end = new Date(t_start_time).setHours(t_start_time.getHours() + Math.round(half_duration));
    first_half_end = new Date(first_half_end);

    var source_link = right_click_task.$source;
    var target_link = right_click_task.$target;

    var t_ref_id = right_click_task.ref_id; 
    var c_split_task_id = right_click_task.id;


    var right_click_task_parent = right_click_task.parent; 

    var first_half_task_details = {
      id:gantt.uid(),
      text:right_click_task.text + " - 01",
      start_date:t_start_time,
      open:true,
      ref_id:  t_ref_id,
      work_center: right_click_task.work_center,
      end_date:first_half_end,
      operation_number:  right_click_task.operation_number,
      status: right_click_task.status,
      is_saved: 0,
      resource:right_click_task.resource,
      resource_name:right_click_task.resource_name,
      priority:right_click_task.priority,
      progress: 0,
      parent: right_click_task_parent,
      work_order : right_click_task.work_order,
      duration:  half_duration,
      min_duration: first_half_min_dur,
      description: right_click_task.description + " - 01",
      readonly: right_click_task.readonly,
      is_local_task: 1,
      split_task_group_id: c_split_task_id,
      head_doc_entry  : right_click_task.head_doc_entry,
      oper_doc_entry  : right_click_task.oper_doc_entry,
      oper_line_id  : right_click_task.oper_line_id,
      res_line_id: right_click_task.res_line_id,
      task_type : right_click_task.task_type,
      required_resource : right_click_task.required_resource
    };

    var middle_end = new Date(first_half_end).setHours(first_half_end.getHours() + Math.floor(split_task_dur));
    middle_end = new Date(middle_end);  

    var middle_task_details = {
      id:gantt.uid(),
      text: split_opr_code,
      start_date:first_half_end,
      open:true,
      ref_id:  t_ref_id,
      work_center: right_click_task.work_center,
      end_date:middle_end,
      operation_number:  right_click_task.operation_number,
      status: right_click_task.status,
      is_saved: 0,
      resource:right_click_task.resource,
      resource_name:right_click_task.resource_name,
      priority:right_click_task.priority,
      progress: 0,
      parent: right_click_task_parent,
      work_order : right_click_task.work_order,
      duration:  split_task_dur,
      min_duration: split_task_dur,
      description: split_opr_code,
      readonly: right_click_task.readonly,
      is_local_task: 1,
      split_task_group_id: c_split_task_id,
      head_doc_entry  : right_click_task.head_doc_entry,
      oper_doc_entry  : right_click_task.oper_doc_entry,
      oper_line_id  : right_click_task.oper_line_id,
      res_line_id: right_click_task.res_line_id,
      task_type : split_task_task,
      required_resource : right_click_task.required_resource
    };


    var  second_half_end = new Date(middle_end).setHours(middle_end.getHours() + Math.floor(second_half_dur) );
    second_half_end  = new Date(second_half_end);

    var second_half_task_details = {
      id:gantt.uid(),
      text:right_click_task.text + " - 02",
      start_date:middle_end,
      open:true,
      ref_id:  t_ref_id,
      work_center: right_click_task.work_center,
      end_date:second_half_end,
      operation_number:  right_click_task.operation_number,
      status: right_click_task.status,
      is_saved: 0,
      resource:right_click_task.resource,
      resource_name:right_click_task.resource_name,
      priority:right_click_task.priority,
      progress: 0,
      parent: right_click_task_parent,
      work_order : right_click_task.work_order,
      duration:  second_half_dur,
      min_duration: second_half_min_dur,
      description: right_click_task.description + " - 02",
      readonly: right_click_task.readonly,
      is_local_task: 1,
      split_task_group_id: c_split_task_id,
      head_doc_entry  : right_click_task.head_doc_entry,
      oper_doc_entry  : right_click_task.oper_doc_entry,
      oper_line_id  : right_click_task.oper_line_id,
      res_line_id: right_click_task.res_line_id,
      task_type : right_click_task.task_type,
      required_resource : right_click_task.required_resource
    };

    var localtask_index = gantt.getTaskIndex(c_split_task_id);

   // updating and removing the previous task that is split now                      
   gantt.getTask(c_split_task_id).$source = [];
   gantt.getTask(c_split_task_id).$target = [];
   gantt.updateTask(c_split_task_id);
   gantt.deleteTask(c_split_task_id);

  // Add new tasks
  
  var first_half_id = gantt.addTask(first_half_task_details, right_click_task_parent, localtask_index);
  var middle_task_id = gantt.addTask(middle_task_details, right_click_task_parent, parseInt(localtask_index+1));
  var second_half_id = gantt.addTask(second_half_task_details, right_click_task_parent, parseInt(localtask_index+2));


  var first_intermediate_link = {
    id: gantt.uid(),
    ref_id:t_ref_id,
    source: first_half_id,
    target:middle_task_id,
    type:0,
    is_saved:0
  };
  var linkId = gantt.addLink(first_intermediate_link);

  var second_intermediate_link = {
    id: gantt.uid(),
    ref_id:t_ref_id,
    source: middle_task_id,
    target:second_half_id,
    type:0,
    is_saved:0
  };
  var linkId = gantt.addLink(second_intermediate_link);


  // update existing links 
  if(source_link.length > 0){
    gantt.getLink(source_link[0]).source = second_half_id;
    gantt.updateLink(source_link[0]);
    gantt.refreshLink(source_link[0]);
  }

  if(target_link.length > 0){
    gantt.getLink(target_link[0]).target = first_half_id;
    gantt.updateLink(target_link[0]);
    gantt.refreshLink(target_link[0]);
  }

 //   return;
  // delete existing task
  setTimeout(function(){

  // gantt.deleteTask(c_split_task_id);
  delete_saved_task(c_split_task_id, 0 , function(res){
    if(res == 'error'){
      return false;
    } 
  });


  save_all_tasks();
 // show_toast("custom_success", "Success");
 right_click_task = [];
}, default_pause_short);


} else if(result == 'cancel'){
  return true;
}
}
});
}