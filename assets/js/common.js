//===============
// GET GLOBAL CONFIGURATION
//=============== 
var $_CONFIG = ''
basic_request_call("config.json", function (res) {
  $_CONFIG = res;
});

var default_lang = ($_CONFIG['locale'] !== undefined) ? $_CONFIG['locale'] : "en";

var $_LANG;
basic_request_call("locale/" + default_lang + ".json", function (res) {
  $_LANG = res;
  assign_language($_LANG)
});



//===============
// Other Variables and messages
//=============== 
var app_title = $_CONFIG['app_title']; // 'Scheduling Workbench';
var system_version = $_CONFIG['system_version']; // "V0.1.1 Beta";
var base_url = $_CONFIG['base_url'] // "http://localhost:8080/aps/swb_sql/"; 
var service_url = base_url + "services/api.php";
var global_error_msg = $_LANG['global_error_msg'];
var success_msg = $_LANG["success_task_load"];
var success_msg_short = $_LANG['success'];
var un_lock_string = $_LANG["unlock_task"];
var lock_string = $_LANG["lock_task"];
var no_task_select = $_LANG["no_task_selected"];
var delete_prod_opr = $_LANG['no_prod_ordr_delete'];
var confirm_delete_msg = $_LANG['confirm_selected_delete'];
var task_complete_confirm = $_LANG['mark_complete'];
var push_to_production_msg = $_LANG['all_changes_submit_prod'];
var refresh_status_hold_msg = $_LANG['fetch_curent_status'];
var refresh_data_hold_msg = $_LANG['wait_fetch_wo'];
var required_msg = $_LANG['field_required'];
var split_task_opr_code_blank_error = $_LANG['split_opr_code_unspecifined'];
var copyright_content = string_replacer($_LANG['copy_right_company'], "{__COMPANY_NAME__}", $_CONFIG['company_name']);;
var auto_refresh_enabled_msg = $_LANG['enabled_auto_refresh'];
var auto_refresh_disabled_msg = $_LANG['auto_refrresh_disabled'];
var invalid_user_credentials = $_LANG['invalid_user_pass'];
var user_deactivated = $_LANG['not_active_user'];
var split_start_point = $_LANG['split_start_point'];
var split_type = $_LANG['split_type'];
var start_squence = $_LANG['start_squence'];
var start_simuntanous = $_LANG['start_simuntanous'];
var is_product_permitted = $_LANG['permission_denied'];
var first_install_optipro = $_LANG['first_install_optipro'];

//===============
// Constants And Variables
//===============

var data_source;
var delete_task_id = "";
var delete_task_detail = "";
var data_source = "";
var g_task_drag_drop_id = null;
var resize_task_details = null;
var system_settings;
var show_details = true;
var left_panel_width_constant = 0;
var priority_color_css;
var task_type_color_css;
var priority_color_set = '';
var task_type_color_set = '';
var assets_path = "assets/";
var right_click_menu;
var current_plan_details;
var toast_msg_duration = 4000;
var toast_msg_duration_long = 8000;
var default_pause = 1000;
var default_pause_medium = 500;
var default_pause_mid_short = 150;
var default_pause_short = 5;
var cookie_expiry_days = 1;
var gant_chart_page_link = 'gantt.html';
var schedulng_page_link = 'schedular.html';
var login_page_link = 'login.html';
var installer_page_link = "installer.html";
var scheduling_criteria_page_link = 'schedular_criteria.html';
var current_popup_task_id = "";
var right_click_task = '';
var highlighted_task = "";
var grey_class = "greyed_out_tasks";
var grey_link_class = "gantt_grey_line_wrapper";
var grey_link_arrow_class = "gantt_grey_arrow";
var grey_line_inc_index = "grey_line_inc_index";
var selected_task_id = null;
var highlighted_task_list = [];
var highlighted_task_link_list = {};
var is_full_screen_enabled = 0;
var is_presentation_mode_on = 0;
var task_type_option_list = '';
var split_opr_code = '';
var split_task_task = '';
var split_task_dur = '';
var split_task_start_point = '';
var split_task_split_type = '';
var one_day_in_ms = 86400000;
var undo_redo_priority_task_arr = [];
var opr_src_tar_link_data = [];
var current_timeline_view = '';
var loader_btn_icon = 'fa fa-spin fa-spinner';
var refresh_status_interval = '';
var current_company = '';
var resourcesStore = '';
var resourceMode = "hours";
var close_task_popup_alert = 0;
var close_setting_popup_alert = 0;
var WORK_DAY = 8; //for histogram
var cap = {};  //for histogram
var filterValue;
var head_doc_entry_task;
var oper_doc_entry_task;
var work_order_id;
var wo_status;
var is_local_tasks;
var left_matrix_editor;
var timeline_selected_value;
var inlineEditors = gantt.ext.inlineEditors;
var task_old_start_date;
var task_old_end_date;
var task_old_start_time;
var task_old_end_time;
//===============
// Variables and Constants
//=============== 
var global_task_data = [];

//===============
// Variables and Constants
//=============== 

function assign_language($language_array) {
  for (lang_attr_id in $language_array) {
    if ($("[data-lang='" + lang_attr_id + "']").length > 0) {
      $("[data-lang='" + lang_attr_id + "']").html($language_array[lang_attr_id]);

    }

    if ($("[data-title-lang='" + lang_attr_id + "']").length > 0) {
      $("[data-title-lang='" + lang_attr_id + "']").attr("placeholder", $language_array[lang_attr_id]);
      $("[data-title-lang='" + lang_attr_id + "']").attr("title", $language_array[lang_attr_id]);
    }
  }
}

//===============
// Common and Global Functions
//=============== 

function string_replacer(string_msg, find, replace) {
  var temp_new_str = string_msg.replace(find, replace);
  return temp_new_str;
}


function check_installation() {
  // check swb is installed or not if not installed redirect to setup
  setTimeout(function () {
    if ($_CONFIG['installed'] === undefined || $_CONFIG['installed'] === 'undefined' || $_CONFIG['installed'] == "0") {
      show_toast("warning_gantt", string_replacer($_LANG['app_not_installed'], '{__APP_TITLE__}', app_title));
      window.location = installer_page_link;
    }
  }, default_pause_medium);
}


function check_is_login() {
  var is_logged_in = get_cookie('is_logged_in');
  if (is_logged_in == 'undefined' || is_logged_in === undefined) {
    show_toast("warning_gantt", $_LANG['no_session_found']);

    setTimeout(function () {
      window.location = 'login.html';
    }, default_pause);
  }
}

function user_redirection(req_from) {
  if (get_cookie('is_logged_in') != undefined && get_cookie('is_logged_in') == 1) {
    //if User is already working on Schedule then wll redirect to dashboard
    if (get_cookie('ref_id') != undefined && get_cookie('from_date') != undefined && get_cookie('to_date') != undefined) {
      window.location = gant_chart_page_link;
    }
    else {
      window.location = scheduling_criteria_page_link;
    }
  }
  else {
    if (req_from == "index") {
      window.location = "login.html";
    }
  }
}

function set_title(add_text) {
  var show_title = app_title;
  if (add_text != "") {
    show_title = app_title + ' : ' + add_text;
  }
  $(".app_title").html(show_title);
  $(".app_title_heading").html(add_text);
  $(".app_name").html(app_title);
}

function modSampleHeight() {
  var headHeight = 300;
  gantt.setSizes();
}

function get_list_value_by_id(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].key == id)
      return list[i] || "";
  }
  return "";
}

function show_toast(type, msg, duration) {
  if (duration == undefined || duration == 'undefined') {
    duration = toast_msg_duration;
  }

  if ($(".gantt-warning_gantt").length > 0) {
    $(".gantt-warning_gantt").remove();
  }

  if ($(".gantt-custom_success").length > 0) {
    $(".gantt-custom_success").remove();
  }

  gantt.message({
    type: type,
    text: msg,
    expire: duration,
    position: "bottom"
  });
}

function loading_toast(msg) {
  $(".operation_loader").show();

  if ($(".gantt-info_gantt").length > 0) {
    $(".gantt-info_gantt").remove();
  }
  show_toast("info_gantt", '<i class="' + loader_btn_icon + '"></i> ' + msg, toast_msg_duration_long);
}

function hide_loading_toast() {
  if ($(".gantt-info_gantt.dhtmlx-info_gantt").length > 0) {
    $(".gantt-info_gantt.dhtmlx-info_gantt").remove();
  }

  $(".operation_loader").hide();
}

function task_undo() {
  gantt.undo();
  detail_layout_call();
}


function task_redo() {
  gantt.redo();
  detail_layout_call();
}

function log_data(data) {
  console.log(data);
}

function log_schedular_data() {
  log_data(gantt.getTaskByTime());
  log_data(gantt.getLinks());
}

function showPassword() {
  var key_attr = $('#key').attr('type');
  if (key_attr != 'text') {
    $('.checkbox').addClass('show');
    $('#key').attr('type', 'text');
  } else {
    $('.checkbox').removeClass('show');
    $('#key').attr('type', 'password');
  }
}

function array_search(list, lookup_key, return_key, search_value) {
  var value;
  for (var i = 0; i < list.length; i++) {
    if (list[i] !== undefined) {
      if (list[i][lookup_key] == search_value) {
        value = (list[i][return_key]); break;
      }
    }
  }
  return value;
}

function default_label(){
  if(timeline_selected_value!=undefined && timeline_selected_value!=''){
    gantt.locale.labels.column_capacity="Capacity" + "("+ timeline_selected_value+ ")";
  }
  else{
    timeline_selected_value='';
    var date=new Date();
    var starting_month=date.getMonth();
        // timeline_selected_value=get_selected_month(starting_month);
        timeline_selected_value=get_day_month_year(date,"","day");
        gantt.locale.labels.column_capacity="Capacity" + "("+ timeline_selected_value+ ")";
      }
    }

    function get_day_month_year(start_date,end_date,$flag){
      var objStartDate = start_date,
      weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      dayOfWeek = weekday[objStartDate.getDay()],
      domEnder = function() { var a = objStartDate; if (/1/.test(parseInt((a + "").charAt(0)))) return "th"; a = parseInt((a + "").charAt(1)); return 1 == a ? "st" : 2 == a ? "nd" : 3 == a ? "rd" : "th" }(),
      dayOfMonth = result + ( objStartDate.getDate() < 10) ? '0' + objStartDate.getDate() + domEnder : objStartDate.getDate(),
      months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
      curMonth = months[objStartDate.getMonth()],
      curYear = objStartDate.getFullYear(),
      curHour = objStartDate.getHours() > 12 ? objStartDate.getHours() - 12 : (objStartDate.getHours() < 10 ? "0" + objStartDate.getHours() : objStartDate.getHours()),
      curMinute = objStartDate.getMinutes() < 10 ? "0" + objStartDate.getMinutes() : objStartDate.getMinutes(),
      curSeconds = objStartDate.getSeconds() < 10 ? "0" + objStartDate.getSeconds() : objStartDate.getSeconds(),
      curMeridiem = objStartDate.getHours() > 12 ? "PM" : "AM";

   //var today = curHour + ":" + curMinute + "." + curSeconds + curMeridiem + " " + dayOfWeek + " " + dayOfMonth + " of " + curMonth + ", " + curYear;
   var result;
   if($flag=="month"){
    result=curMonth;
  }
  else if($flag=="day"){
    result=curMonth +' '+ dayOfMonth;
  }
  else if($flag=="week"){
    var objEndDate=end_date;
    var objEndWeek=result + ( objEndDate.getDate() < 10) ? '0' + objEndDate.getDate() + domEnder : objEndDate.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];    
    var objStartMonth=monthNames[objStartDate.getMonth()];
    var objEndMonth=monthNames[objEndDate.getMonth()];
    result=dayOfMonth + " "+ objStartMonth+ "-" + objEndWeek + " " +objEndMonth;

  }
  else if($flag=="year"){
    result="Year"+" "+curYear;
  }
  return result;
}


//===============
// Interact with Cookie functions
//=============== 

function set_cookie(name, value) {
  Cookies.set(name, value, { expires: cookie_expiry_days, path: '/' });
}

function get_cookie(name) {
  var cookie_value = "";
  if (name != "") {
    cookie_value = Cookies.get(name);
  } else {
    cookie_value = Cookies.get();
  }

  return cookie_value;
}

function remove_cookie(name) {
  Cookies.remove(name, { path: '/' }); // removed!
}

function clear_all_cookies() {
  var temp = get_cookie();
  for (key in temp) {
    remove_cookie(key);
  }
}


//===============
// Server Calling Functions
//=============== 

function basic_request_call(file_or_link, callback) {

  // log_data(request_data);
  $.ajax({
    url: file_or_link,
    type: 'GET',
    dataType: 'JSON',
    async: false,
    cache: false,
    success: function (res) {
      return callback(res);
    },
    error: function (res) {
      hide_loading_toast();
      show_toast("error", global_error_msg);
      $(".loading_div").hide();
    },
  });
}

function service_call(action_name, diplay_type, work_center, callback) {
  var request_data = {
    action: action_name,
    display_type: diplay_type,
    default_work_center: work_center,
    from_date: (current_plan_details != undefined) ? current_plan_details['from_date'] : "",
    to_date: (current_plan_details != undefined) ? current_plan_details['to_date'] : "",
    reference_id: (current_plan_details != undefined) ? current_plan_details['ref_id'] : "",
    company: current_company
  };
  $.ajax({
    url: service_url,
    type: 'GET',
    dataType: 'JSON',
    async: false,
    cache: false,
    data: request_data,
    success: function (res) {
      // log_data("service_call");
      return callback(res);
    },
    error: function (res) {
      hide_loading_toast();
      show_toast("error", global_error_msg);
      $(".loading_div").hide();
    },
  });
}

function ajax_form_submit(action_name, serialized_data, callback, is_external_call) {
  var url_to_pass;

  if (is_external_call == 1) {
    url_to_pass = action_name;
  }
  else {
    url_to_pass = service_url + "?action=" + action_name + '&company=' + current_company;
  }
  $.ajax({
    url: url_to_pass,
    type: 'POST',
    dataType: 'JSON',
    data: serialized_data,
    async: false,
    cache: false,
    success: function (res) {
      return callback(res);
    },
    error: function (res) {
      show_toast("error", global_error_msg);
    },
  });
}

function save_all_tasks(task_details, particular_task, service_name) {
  var tasks = [];
  var links = [];
  var task_action = "";
  if (service_name !== undefined) {
    task_action = "?action=" + service_name;
  } else {
    task_action = "?action=save_update";
  }

  if (particular_task == 1) {
    tasks.push(task_details);
  } else {
    tasks = gantt.getTaskByTime();
    links = gantt.getLinks();
  }

  var save_details_data = {
    task_data: tasks,
    links: links,
    from_date: (current_plan_details != undefined) ? current_plan_details['from_date'] : "",
    to_date: (current_plan_details != undefined) ? current_plan_details['to_date'] : "",
    reference_id: (current_plan_details != undefined) ? current_plan_details['ref_id'] : "",
    company: current_company,
  };

  loading_toast($_LANG['saving']);
  setTimeout(function () {
    $.ajax({
      url: service_url + task_action,
      type: 'POST',
      dataType: 'JSON',
      data: save_details_data,
      async: false,
      cache: false,
      success: function (res) {
        log_data(res);
        if (res.success == true) {

          hide_loading_toast();
          if (res.data != "") {
            if (Object.keys(res.data).length > 0) {
              for (current_id in res.data) {
                var saved_task = res.data[current_id];
                var new_task_id = parseInt(saved_task.new_id);
                gantt.changeTaskId(saved_task.current_id, new_task_id);
                var task = gantt.getTask(new_task_id);
                task.is_saved = 1;
                gantt.updateTask(new_task_id);

              }
            }
          }
          un_select_task();
          change_task_data_array(gantt.getTaskByTime());
          detail_layout_call();

          if (res.links != "") {
            if (Object.keys(res.links).length > 0) {
              for (var i = 0; i < res.links.length; i++) {
                var saved_link = res.links[i];
                var generated_link_id = "link-" + saved_link.new_id;
                gantt.changeLinkId(saved_link.current_id, generated_link_id);
                var task_link = gantt.getLink(generated_link_id);
                task_link.is_saved = 1;
                task_link.link_id = saved_link.new_id;

                gantt.updateLink(generated_link_id);

              }
            }
          }
          if (res.new_source_target != "") {
            if (Object.keys(res.new_source_target).length) {
              for (t_link in res.new_source_target) {
                gantt.getLink(t_link).source = res.new_source_target[t_link]['source'];
                gantt.getLink(t_link).target = res.new_source_target[t_link]['target'];
                gantt.updateLink(t_link);
              }
            }
          }

          show_toast("custom_success", $_LANG['saved'])
          gantt.render();
        } else if (res.success == false) {
          show_toast("error", global_error_msg);
        }
      },
      error: function (res) {
        if(res.status==200){
          hide_loading_toast();
        }
        else{
          show_toast("error", global_error_msg);
        }
      }
    });
  }, default_pause_short);
}

function push_to_production() {
  gantt.confirm({
    text: push_to_production_msg,
    ok: $_LANG['submit'],
    cancel: $_LANG['cancel'],
    callback: function (result) {
      if (result == true) {
        save_all_tasks("", "", "push_to_production");
      }
    }
  });
}

//===============
// Other Functions
//=============== 

function enable_disable_project_drag($flag) {
  gantt.config.drag_project = $flag;
  gantt.config.auto_scheduling_move_projects = false;
  gantt.config.auto_scheduling_strict = $flag;
  gantt.config.fit_tasks = $flag;
}

function custom_lightbox_fill_data(task, task_id) {
  $("[name='oper_code']").val(task.text).focus();

  var opr_desc = (task.description !== undefined) ? task.description : "";
  $("[name='operation_description']").val(opr_desc);

  var work_center_select_option = generate_options(modify_wc_serverlist(gantt.serverList('work_center')), 'key', 'label');
  $("#task_wc_code").html(work_center_select_option).val(task.work_center);

  var lightbox_work_center_obj = $("#task_wc_code");
  lightbox_work_center_res_list(lightbox_work_center_obj.attr('id'), lightbox_work_center_obj.val(), task);

  var task_type_option_list = generate_options(gantt.serverList("task_type"), 'unique_name', 'label');
  $("#task_type_select").html(task_type_option_list).val(task.task_type);

  var priority_option_list = generate_options(gantt.serverList("priority"), 'key', 'label');
  $("#priority_select").html(priority_option_list).val(get_priority_from_range(task.priority).key);

  var start_date_popup = new Date(gantt.getTask(task_id).start_date);
  $("#popup_start_hours").val(start_date_popup.toLocaleTimeString('it-IT'));
  $("#popup_start_date").val(start_date_popup.getDate() + '-' + (start_date_popup.getMonth() + 1) + '-' + start_date_popup.getFullYear())
  //$("#popup_start_hours").html(hour_list('html', start_date_popup.getHours() * 60));
  //$("#popup_start_minutes").html(minute_list('html', start_date_popup.getMinutes()));

  var end_date_popup = new Date(gantt.getTask(task_id).end_date);
  $("#popup_end_hours").val(end_date_popup.toLocaleTimeString('it-IT'));
  $("#popup_end_date").val(end_date_popup.getDate() + '-' + (end_date_popup.getMonth() + 1) + '-' + end_date_popup.getFullYear())
 // $("#popup_end_hours").html(hour_list('html', end_date_popup.getHours() * 60))
 // $("#popup_end_minutes").html(minute_list('html', end_date_popup.getMinutes()));
}

function duplicate_selected_task() {
  debugger;
  if (selected_task_id == null) {
    show_toast("warning_gantt", no_task_select);
    return false;
  }

  var new_task_id = selected_task_id;
  var duplicate_task_details = gantt.getTask(new_task_id);
  if (duplicate_task_details.type == "project" || duplicate_task_details.type == "work_order") {
    show_toast("warning_gantt", $_LANG['cannot_duplicate_prodordr']);
    return false;
  }
  $(".gantt_grid_head_add").trigger('click');

  custom_lightbox_fill_data(duplicate_task_details, new_task_id)

}

function delete_selected_task() {
  if (selected_task_id == null) {
    show_toast("warning_gantt", no_task_select);
  } else {
    if (gantt.getTask(selected_task_id).is_local_task == 0 || gantt.getTask(selected_task_id).split_task_grp_id != 0) {
      show_toast("warning_gantt", delete_prod_opr);
      return false;
    }
    var current_delete_id = selected_task_id;
    delete_confirm(current_delete_id, 0);
  }
}

function delete_confirm(current_task_id, hide_lightbox) {
  gantt.confirm({
    text: confirm_delete_msg,
    ok: "Delete",
    cancel: "No",
    callback: function (result) {
      if (result == true) {
        delete_saved_task(current_task_id, '1', function (res) {
          if (res.success == 'custom_success') {
            gantt.deleteTask(current_task_id);
            if (hide_lightbox == 1) {
              gantt.hideLightbox();
            }
          }
        });
      }
    }
  });
}

function complete_selected_task() {

  if (selected_task_id == null) {
    show_toast("warning_gantt", no_task_select);
  } else {
    complete_confirm(selected_task_id, 0);
  }
}

function complete_confirm(task_id, hide_lightbox) {

  gantt.confirm({
    text: task_complete_confirm,
    ok: "Complete",
    cancel: "No",
    callback: function (result) {

      if (result == true) {
        complete_select_task(task_id);
        if (hide_lightbox == 1) {
          gantt.hideLightbox();
        }
      }
    }
  });

}

function lock_selected_task() {

  if (selected_task_id == null) {
    show_toast("warning_gantt", no_task_select);
  } else {
    var t_task = gantt.getTask(selected_task_id);
    if (t_task.readonly == true) {
      t_task.readonly = false;
    } else {
      t_task.readonly = true;
    }
    change_lock_unlock_icon();
    save_all_tasks(t_task, 1);
    // un_select_task();
  }

}

function complete_select_task(id) {
  var reference_id = (current_plan_details != undefined) ? current_plan_details['ref_id'] : "";
  loading_toast($_LANG['plz_wait']);
  setTimeout(function () {
    $.getJSON(service_url + "?action=complete_selected_task&task_id=" + id + "&reference_id=" + reference_id + "&company=" + current_company,
      function (response) {
        hide_loading_toast();
        show_toast(response.success, string_replacer($_LANG[response.message], "{__TASK_ID__}", response.task_id));
        gantt.getTask(id).progress = 1;
        gantt.updateTask(id);
        detail_layout_call();
      }).error(function () {
        hide_loading_toast();
        show_toast("error", global_error_msg);
      });
    }, default_pause_short);
}

function delete_saved_task(id, delete_link_flag, callback) {
  if (id != "" && id !== undefined) {
    var reference_id = (current_plan_details != undefined) ? current_plan_details['ref_id'] : "";
    loading_toast($_LANG["deleting"]);
    setTimeout(function () {
      $.getJSON(service_url + "?action=delete_saved_task&task_id=" + id + "&delete_link=" + delete_link_flag + "&reference_id=" + reference_id + "&company=" + current_company,
        function (response) {
          hide_loading_toast();
          if (delete_link_flag == 1) {
            var msg_key = response.message;
            show_toast(response.success, string_replacer($_LANG[msg_key], "{__TASK_ID__}", response.task_id)); // no msg for split task case, previous task is removed but msg not needed
          }
          un_select_task();
          detail_layout_call();
          callback(response);
        }).error(function () {
          hide_loading_toast();
          callback('error');
          show_toast("error", global_error_msg);
        });
      }, default_pause_short);
  }
}

function delete_task_link(id) {
  var reference_id = (current_plan_details != undefined) ? current_plan_details['ref_id'] : "";
  loading_toast($_LANG["deleting"]);
  setTimeout(function () {
    $.getJSON(service_url + "?action=delete_task_link&link_id=" + id + "&reference_id=" + reference_id + "&company=" + current_company,
      function (response) {
        hide_loading_toast();
        show_toast(response.success, string_replacer($_LANG[response.message], "{__LINK_ID__}", response.link_id));
      }).error(function () {
        hide_loading_toast();
        show_toast("error", global_error_msg);
      });
    }, default_pause_short);
}


//===============
// Menu Functions
//=============== 
function right_click_menu_init() {
  //debugger;
  right_click_menu = new dhtmlXMenuObject();
  right_click_menu.renderAsContextMenu();
  right_click_menu.setSkin("material");
  right_click_menu.setIconset("awesome");

  var parent_id = right_click_menu.topId;
  // context menu items 
  right_click_menu.addNewChild(parent_id, 1, "split_task", $_LANG['split_task'], false, 'fa fa-arrows-h');
  right_click_menu.addNewSeparator("split_task");
  right_click_menu.addNewChild(parent_id, 2, "highlight_task", $_LANG['highlight_task'], true, 'fa fa-plus-square', 'fa fa-plus-square');
  right_click_menu.addNewChild(parent_id, 3, "remove_highlight", $_LANG['remove_hightlight'], false, 'fa fa-minus-square', 'fa fa-minus-square');

  right_click_menu.addNewChild('split_task', 3, "split_task_only", $_LANG['split_task_only'], false);
  right_click_menu.addNewSeparator("split_task_only");
  right_click_menu.addNewChild('split_task', 3, "split_task_insert", $_LANG['split_add_new_task'], false);

  right_click_menu.hideItem('remove_highlight');

}

function header_menu_init() {

  main_header_menu = new dhtmlXMenuObject("gantt_menu_here");
  // main_header_menu.setIconsPath(assets_path+"dhtmlx_menu/imgs/common/");
  main_header_menu.setSkin("material");
  main_header_menu.setIconset("awesome");

  main_header_menu.addNewSibling(null, "file", $_LANG['file'], false);
  main_header_menu.addNewChild("file", 1, "new_task", $_LANG['new_task'], false, "fa fa-plus");
  main_header_menu.addNewSeparator("new_task");
  main_header_menu.addNewChild("file", 2, "save", $_LANG['save_draft'], false, "fa fa-save");
  main_header_menu.addNewChild("file", 3, "save_as", $_LANG['save_prod'], false, 'fa fa-upload', "fa fa-upload");
  main_header_menu.addNewSeparator("save_as");

  main_header_menu.addNewChild("file", 5, "refresh_data", $_LANG["resync"], false, "fa fa-sync");
  main_header_menu.addNewChild("refresh_data", 1, "refresh_status_data", $_LANG['resyn_status'], false, 'fa fa-spinner');
  main_header_menu.addNewChild("refresh_data", 2, "refresh_fresh_data", $_LANG['resync_data'], false, 'fa fa-sync');
  main_header_menu.addNewSeparator("refresh_data");

  main_header_menu.addNewChild("file", 7, "export_data", $_LANG['export_data'], false, "fa fa-download");
  main_header_menu.addNewChild("export_data", 1, "print_as_pdf", $_LANG['export_pdf'], false, 'fa fa-file-pdf');
  main_header_menu.addNewChild("export_data", 2, "print_as_png", $_LANG['export_png'], false, 'fa fa-file-image');
  main_header_menu.addNewSeparator("print_as_png");
  main_header_menu.addNewChild("export_data", 3, "print_as_ms_project", $_LANG['export_ms_project'], false, 'fa fa-file');
  main_header_menu.addNewChild("export_data", 4, "print_as_excel", $_LANG['export_excel'], false, 'fa fa-file-excel');

  main_header_menu.addNewChild("file", 8, "plan_change_schedule", $_LANG["change_schedule"], false, "fa fa-sign-out-alt");
  main_header_menu.addNewChild("file", 9, "sign_out", $_LANG["signout"], false, "fa fa-power-off");
  main_header_menu.addNewChild("file", 10, "close", $_LANG["close"], false, "fa fa-times");

  main_header_menu.addNewSibling("file", "edit", $_LANG['edit'], false);
  main_header_menu.addNewChild("edit", 1, "edit_undo", $_LANG['undo'], false, "fa fa-undo-alt");
  main_header_menu.addNewSibling("edit_undo", "edit_redo", $_LANG['redo'], false, "fa fa-redo-alt");
  main_header_menu.addNewSeparator("edit_redo");
  main_header_menu.addNewChild("edit", 3, "duplicate_task", $_LANG['duplicate_task'], false, "fa fa-copy");
  main_header_menu.addNewChild("edit", 4, "delete_task", $_LANG['delete_task'], false, "fa fa-trash");
  main_header_menu.addNewChild("edit", 5, "complete_task", $_LANG['complete_task'], false, "fa fa-check-square");
  main_header_menu.addNewChild("edit", 6, "lock_task", $_LANG['lock_task'], false, "fa fa-lock"); // fa fa-unlock

  main_header_menu.addNewSibling("edit", "view", $_LANG['view'], false);
  main_header_menu.addNewChild("view", 1, "collapse_expand", $_LANG['collapse_all_task'], false, "fa fa-compress"); // fa fa-expand
  //main_header_menu.addNewChild("view", 2, "hide_show_left_grid", "Hide Left Grid", false, "fa fa-eye-slash");
  main_header_menu.addNewChild("view", 3, "fullscreen", $_LANG['fullscreen'], false, "fa fa-arrows-alt");
  main_header_menu.addNewChild("view", 4, "presentation_mode", $_LANG['enter_presentation_mode'], false, "fa fa-desktop");
  main_header_menu.addNewSeparator("fullscreen");
  main_header_menu.addNewChild("view", 5, "group_by", $_LANG['group'], false, "fa fa-users");
  main_header_menu.addNewChild("group_by", 2, "group_by_priority", $_LANG['group_priority'], false, "fa fa-exclamation-triangle");
  main_header_menu.addNewChild("group_by", 3, "group_by_resource", $_LANG['group_priority'], false, "fa fa-user");
  main_header_menu.addNewSeparator("group_by_resource");

  main_header_menu.addNewChild("group_by", 5, "remove_grouping", $_LANG['remove_grouping'], false, "fa fa-times");
  main_header_menu.addNewSeparator("group_by");
  main_header_menu.addNewChild("view", 9, "preferences", $_LANG['preferences'], false, "fa fa-cogs");

  main_header_menu.addNewSibling("view", "help", $_LANG['help'], false);
  //  main_header_menu.addNewChild("help", 0, "aps_schedule_name", $_LANG['schedule_detail'], false, "fa fa-info-circle");
  main_header_menu.addNewChild("help", 0, "about", $_LANG['about_swb'], false, "fa fa-info");
  main_header_menu.addNewChild("help", 1, "aps_help", $_LANG['help'], false, "fa fa-question");


}

//===============
// Local Interaction Functions
//=============== 

function about_us_toggle() {
  var about_us_title = $_LANG['about'];
  var about_html_content = app_title + `<hr />
  <p class="text-left" >
  `+ $_LANG['version'] + ` v` + system_version + ` <br>
  `+ app_title + `<br>` + copyright_content + `
  </p> `;

  gantt.modalbox({
    title: about_us_title,
    text: about_html_content,
    buttons: ["Close"],
    callback: function (result) {
    }
  });
}

function open_help_manual_popup() {
  $("#help_model").modal('show');
}


function schedule_details_popup() {
  var schedule_detail_title = $_LANG['current_sch_details'];

  service_call("get_current_schedule_detail", "", "", function (res) {
    if (res.success == "error") {
      show_toast("error", global_error_msg);
    } else {
      var res_schedule_details = res.data;
      var status_block = '';
      if (res_schedule_details.current_status == "Draft") {
        status_block = `<span class="text-danger"><b>` + res_schedule_details.current_status + `</b></span>`
      } else {
        status_block = `<span class="text-success"><b>` + res_schedule_details.current_status + `</b></span>`
      }
      var sch_html_content = `
      <div class="row sch_detail_block">
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['current_company'] + `</b></div>
      <div class="col-md-5">`+ current_company + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['current_status'] + `</b></div>
      <div class="col-md-5">`+ status_block + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['sch_no'] + `</b></div>
      <div class="col-md-5">`+ res_schedule_details.sch_id + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['schedule_name'] + `</b></div>
      <div class="col-md-5">`+ res_schedule_details.sch_name + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['from_date'] + `</b></div>
      <div class="col-md-5">`+ res_schedule_details.from_date + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>` + $_LANG['to_date'] + `</b></div>
      <div class="col-md-5">`+ res_schedule_details.to_date + `</div>
      </div>
      <div class="col-md-12 inner_sections">
      <div class="col-md-7"><b>`+ $_LANG['current_wc'] + `</b></div>
      <div class="col-md-5">`+ current_plan_details['working_wc'] + `</div>
      </div>
      </div>
      `;

      gantt.modalbox({
        title: schedule_detail_title,
        text: sch_html_content,
        buttons: ["Close"],
        callback: function (result) {
        }
      });
    }
  });
}

function range_value_show(obj) {
  var name = $(obj).attr("name");
  $(".range_input_value[data-linked_field='" + name + "']").html(obj.value);
}


function undo_redo_priority_change() {
  var temp_task_details = gantt.getTaskByTime();
  for (var i = 0; i < temp_task_details.length; i++) {
    var tt_task = temp_task_details[i];
    if (tt_task.type == "project") {
      change_priority_of_target(tt_task.id, tt_task.priority);
    }
  }
}

function fullscreen_toggle() {
  if (is_presentation_mode_on == 1) {
    presentation_mode_toggle();
  }

  if (!document.fullscreenElement &&    // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
    is_full_screen_enabled = 1;
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
} else {
  is_full_screen_enabled = 0;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
}

function presentation_mode_toggle() {
  if (is_full_screen_enabled) {
    fullscreen_toggle();
  }

  setTimeout(function () {
    if (is_presentation_mode_on == 0) {
      gantt.expand();
      is_presentation_mode_on = 1;
    }
    else {
      gantt.collapse();
      is_presentation_mode_on = 0;
    }
  }, default_pause_medium);
  $(".load_table_box").hide();
  detail_layout_call();
}

function exit_handler() {
  is_full_screen_enabled = 0;
  is_presentation_mode_on = 0;

  $(".load_table_box").show();

}

function modify_wc_serverlist(server_list) {
  var temp_wc_serverlist = [];
  for (var i = 0; i < server_list.length; i++) {
    var t_wc_list = (server_list[i]);
    temp_wc_serverlist.push({ "key": t_wc_list.key, "label": t_wc_list.key + " (" + t_wc_list.label + ")" });
  }
  return temp_wc_serverlist;
}

function generate_options(data_list, key, value) {
  var html_options = '';
  for (var i = 0; i < data_list.length; i++) {
    var list_values = (data_list[i]);
    html_options += "\
    <option value='"+ list_values[key] + "'> " + list_values[value] + "</option>\
    ";
  }
  return html_options;
}

function get_task_class(task_id) {
  return $("div.gantt_task_line[task_id='" + task_id + "']").attr("class");
}

function set_task_class(task_id, classes) {
  $("div.gantt_task_line[task_id='" + task_id + "']").attr("class", classes)
}

function check_highlight(task_id) {
  return $("div.gantt_task_line[task_id='" + task_id + "']").hasClass(grey_class);
}

function remove_highlight(disable_button) {
  $('div.' + grey_class).removeClass(grey_class);
  $('div.' + grey_line_inc_index).removeClass(grey_line_inc_index);
  $('div.' + grey_link_arrow_class).removeClass(grey_link_arrow_class);
  right_click_menu.hideItem('remove_highlight');
  right_click_menu.showItem('highlight_task');
  if (disable_button == 1) {
    right_click_menu.setItemDisabled('highlight_task');
  }

  highlighted_task = "";
  highlighted_task_list.length = 0;
  remove_link_highlight();
}

function set_highlight(task_id) {
  $("div.gantt_task_line[task_id='" + task_id + "']").addClass(grey_class);
}

function set_unset_higlight(sources_targets, grey_out) {

  $.each(sources_targets, function (index, val) {
    var task_link = $("div.gantt_task_link[link_id='" + val + "']")
    var task_link_wrapper = task_link.find(".gantt_line_wrapper");
    var task_link_arrow = task_link.find(".gantt_link_arrow ");
    if (grey_out == 1) {
      task_link_wrapper.addClass(grey_link_class);
      task_link_arrow.addClass(grey_link_arrow_class);
    } else {
      task_link_wrapper.removeClass(grey_link_class);
      task_link_arrow.removeClass(grey_link_arrow_class);
      task_link.addClass(grey_line_inc_index);
    }
  });
}

function remove_link_highlight() {
  $('div.' + grey_link_class).removeClass(grey_link_class);
}

function plan_change() {
  show_toast('custom_success', $_LANG['please_wait_close_plan']);
  remove_cookie('ref_id');
  remove_cookie('ref_name');
  remove_cookie('from_date');
  remove_cookie('to_date');
  setTimeout(function () {
    window.location = scheduling_criteria_page_link;
  }, default_pause);

}


function confirm_plan_change() {
  gantt.confirm({
    text: $_LANG['current_plan_close_confirm'],
    ok: '<i class="fa fa-check"></i> ' + $_LANG['yes'],
    cancel: '<i class="fa fa-times"></i> ' + $_LANG['no'],
    callback: function (result) {
      if (result == true) {
        plan_change();
      }
    }
  });
}

function signout_system() {
  gantt.confirm({
    text: $_LANG['signout_confirm'],
    ok: '<i class="fa fa-check"></i> ' + $_LANG['sign_out'],
    cancel: '<i class="fa fa-times"></i> ' + $_LANG['no'],
    callback: function (result) {
      if (result == true) {
        show_toast('custom_success', $_LANG['wait_logout']);
        clear_all_cookies();
        setTimeout(function () {
          window.location = login_page_link;
        }, default_pause);
      }
    }
  });

}

function get_priority_from_range(task_priority) {
  if (task_priority != "") {
    var priority_list = gantt.serverList("priority");
    for (var i = 0; i < priority_list.length; i++) {
      var temp_priority_key_value = (priority_list[i]);

      if (task_priority >= temp_priority_key_value['min_value'] && task_priority <= temp_priority_key_value['max_value']) {
        return temp_priority_key_value || "";
      }
    }
  }
  return "";
}

function get_resource_detail(resource_id, resource_wc) {

  var resource_list = gantt.serverList("resource");
  for (var i = 0; i < resource_list.length; i++) {
    var temp_resource_key_value = (resource_list[i]);
    if (temp_resource_key_value != "") {
      if (temp_resource_key_value.key == resource_id && temp_resource_key_value.work_center_id == resource_wc) {
        return temp_resource_key_value;
      }
    }
  }
  return "";
}

function detail_layout_call() {
  //debugger;
  if (system_settings['default_resource_load_layout'] == "detail") {
    setTimeout(function () {
      //debugger;
      generate_resource_load_report();
    }, default_pause_short);
  }
}

function left_matrix_editor_configuration(){
  left_matrix_custom_editor();
  left_matrix_editor = {
    text: {type: "text", map_to: "text"},
    start_date: {type: "custom_editor", map_to: "start_date"},
    end_date: {type: "date", map_to: "end_date"},
    duration: {type: "duration", map_to: "duration",min:0, max: 100}
  };
}
// formatting the duration
var formatter = gantt.ext.formatters.durationFormatter({
  enter: "minute",
  store: "minute", // duration_unit
  format: "hour",
});

function left_matrix_configuration(hide_element) {
  left_matrix_editor_configuration();
  
  var left_matrix_config = "";
  
  left_matrix_config = [
  {
    hide: false, "resize": true, name: "work_center", label: $_LANG['work_center'], align: "center", width: "*",
    template: function (item) {
        return get_list_value_by_id(gantt.serverList('work_center'), item.work_center).key || "";  // previously - item.work_center).code  
      }
    },
    {
      hide: true, "resize": true, name: "work_order", label: $_LANG['work_order'], align: "center", width: "*",
      template: function (item) {
        return get_list_value_by_id(gantt.serverList('work_order'), item.work_order).label || "";
      }
    },
    {
      hide: false, "resize": true, name: "text", label: $_LANG['task'], align: "center", width: "*", tree: true,editor:left_matrix_editor.text
    },
    {
      hide: false, "resize": true, name: "resource", label: $_LANG['res'], align: "center", width: "*",
      template: function (item) {
        return temp_res_r = get_resource_detail(item.resource, item.work_center).resource_name || "";
      }
    },
    {
      hide: false, "resize": true, name: "total_assigned_resources", label: $_LANG['assign_res'], align: "center", width: "55",
      template: function (item) {
        return (item.required_resource) ? item.required_resource : ""; // 1; 
      }
    },
    {
      hide: false, "resize": true, name: "priority", label: $_LANG['priority'], align: "center", width: "55",
      template: function (item) {
        return get_priority_from_range(item.priority).label || "";
      }
    },
    {
      hide: false, "resize": true, name: "start_date", label: $_LANG['start_time'], align: "center", width: "55",editor:left_matrix_editor.start_date,
      template: function (item) {
        return start_time_task = get_time_from_date(item.start_date, 1);
      }
    },
    {
      hide: false, "resize": true, name: "required_task_time", label: $_LANG['req_hrs'], align: "center", width: "55",
      template: function (item) {
        if (item.type == "project") {
          return "";
        } else {
          return (item.min_duration !== undefined) ? item.min_duration : 1;
        }
      }
    },
    {
      hide: false, "resize": true, name: "duration", label: $_LANG['hours'], align: "center", width: "55",
      template: function (item) {
        if (item.type == "project") {
          return "";
        } else {
          var msec = Math.abs(item.start_date - item.end_date);
          var mins = Math.floor(msec / 60000);
          return (item.duration !== undefined && item.duration !== 0) ? formatter.format(mins) : formatter.format(mins);
          // return (item.duration !== undefined && item.duration !== 0) ? formatter.format(item.duration * 60) : formatter.format(item.min_duration * 60);
          // return (item.duration !== undefined && item.duration !== 0) ? item.duration : item.min_duration;
        }
      }
    },
    {
      hide: false, "resize": true, name: "add", label: "", align: "center", width: "30"
    },
    ];

    if (hide_element == null) {
      hide_element = "work_order";
    }
    left_matrix_config = left_matrix_config.filter(function () { return true; });

    return left_matrix_config;
  }

  function left_matrix_custom_editor(){
    gantt.config.editor_types.custom_editor = {
      show: function (id, column, config, placeholder) {
        var html = "<div style='width:200px;'><input type='datetime-local' name='" + column.name + "'></div>";
        placeholder.innerHTML = html;
      },
      hide: function () {
        gantt.render();
      },

      set_value: function (value, id, column, node) {
        var date_local_value = gantt.date.date_to_str("%Y-%m-%d")(value)+"T"+gantt.date.date_to_str("%H:%i")(value)
        node.firstChild.firstChild.value = date_local_value;
      },

      get_value: function (id, column, node) {
        var task = gantt.getTask(id);
        var node_value = node.firstChild.firstChild.value;
        node_value = node_value.replace('T', ' ')
        var new_value = gantt.date.str_to_date("%Y-%m-%d %H:%i")(node_value)
        task.start_date = new_value;

        return task.start_date
      },

      is_changed: function (value, id, column, node) {
        return true;
      },

      is_valid: function (value, id, column, node) {
        return true;
      },

      save: function (id, column, node) {
      },
      focus: function (node) {
      }
    }
  }

  function change_lock_unlock_icon() {
  //lock_icon
  var dom_lock_element_icon = $(".lock_icon");
  var dom_lock_unlock_task = $(".lock_unlock_task");

  if (selected_task_id != null) {

    if (gantt.getTask(selected_task_id).readonly == true) {
      dom_lock_element_icon.removeClass("fa-lock").addClass('fa-unlock');
      dom_lock_unlock_task.attr('title', un_lock_string);
    } else {
      dom_lock_element_icon.removeClass("fa-unlock").addClass('fa-lock');
      dom_lock_unlock_task.attr('title', lock_string);
    }
  } else {
    dom_lock_element_icon.removeClass("fa-unlock").addClass('fa-lock');
    dom_lock_unlock_task.attr('title', lock_string);
  }
}



function change_task_data_array(data_array) {
  global_task_data = [];
  for (var i = 0; i < data_array.length; i++) {
    if (data_array[i] !== undefined && data_array[i] !== "undefined" && data_array[i] !== 0 && data_array[i] !== "") {
      global_task_data[data_array[i].id] = data_array[i];
    }
  }
}

function un_select_task() {
  selected_task_id = null;
  gantt.unselectTask();
  change_lock_unlock_icon();
}


function show_button_loading(button_id, text) {
  $("#" + button_id).attr("disabled", true);
  $("#" + button_id).html('<i class="' + loader_btn_icon + '"></i> ' + text)
}

function hide_button_loading(button_id, text) {

  $("#" + button_id).attr("disabled", false);
  $("#" + button_id).html(text)
}

function showGroups(listname) {
  if (listname) {

    var temp_arr = [];
    $.each(gantt.serverList(listname), function (index, val) {
      var temp_val = '';
      if (listname == 'resource') {
        temp_val = val['resource_name'];
      } else {
        temp_val = val['label'];
      }
      temp_arr.push({ "key": val['key'], "label": temp_val });
    });
    var group_config = {
      groups: temp_arr,
      relation_property: listname,
      group_id: "key",
      group_text: "label"
    };
    gantt.groupBy(group_config);
    gantt.getGridColumn('work_order').hide = false;
    gantt.getGridColumn('resource').hide = false;
    gantt.getGridColumn('priority').hide = false;
    gantt.getGridColumn(listname).hide = true;

    right_click_menu.setItemEnabled('highlight_task');
  } else {
    gantt.groupBy(false);
    gantt.getGridColumn('work_order').hide = true;
    gantt.getGridColumn('resource').hide = false;
    gantt.getGridColumn('priority').hide = false;
    right_click_menu.setItemDisabled('highlight_task');
    remove_highlight(1);
  }

  right_click_menu.hideItem('remove_highlight');
  right_click_menu.showItem('highlight_task');

  if ($(".expand_collapse_task").attr("data-hide") == 0) {
    $(".expand_collapse_task").attr("data-hide", '1');
    $(".expand_collapse_task").find("i").removeClass("fa-expand").addClass('fa-compress');
    gantt.eachTask(function (task) {
      task.$open = true;
    });
  }
  // gantt.render();
  gantt.parse(data_source);

  //  temp_arr = [];
}

function disable_hideshow_custom_lightbox(section_name, type) {
  var section_obj = $('[data-section="' + section_name + '"]');
  if (type == 1) { // enable and show section 
    section_obj.find("input, select").attr('disabled', false);
    section_obj.show();
  } else if (type == 0) { // disable and hide sections 
    section_obj.find("input, select").attr('disabled', true);
    section_obj.hide();
  }
}

function disable_visible_custom_lightbox(section_name, type) {
  var section_obj = $('[data-section="' + section_name + '"]');
  if (type == 1) { // enable section
    section_obj.find("input, select").attr('disabled', false);
  } else if (type == 0) { // disable section
    section_obj.find("input, select").attr('disabled', true);
  }
}

function set_priority_lightbox_by_range(task) {

  var current_priority_select_id = gantt.getLightboxSection("priority").control.id;
  var current_priority_obj = get_priority_from_range(task.priority);
  $("select#" + current_priority_select_id).val(current_priority_obj.key);
}


function set_resource_lightbox(task) {
  var current_resouce_select_id = gantt.getLightboxSection("resource").control.id;
  var current_res_obj = get_resource_detail(task.resource, task.work_center);
}


function lightbox_work_center_res_list(current_lightbox_wc_select_id, value, task) {
  //debugger;
  var child_select = $(".resource_popup_select[data-parent_wc_id='" + current_lightbox_wc_select_id + "']");

  var t_res_server_list = gantt.serverList("resource");
  var new_res_serverlist = '';
  for (var i = 0; i < t_res_server_list.length; i++) {
    var t_wc_list = (t_res_server_list[i]);
    if (t_wc_list.work_center_id == value) {
      var selected_option = '';
      if (task !== undefined && task.resource !== undefined) {
        //var task_resource = task.resource_id.split(",");
        if (task.resource == t_wc_list.key) {
          selected_option = 'selected';
        }
      }
      new_res_serverlist += '<option value="' + t_wc_list.key + '" ' + selected_option + '>' + t_wc_list.label + '</option>';
    }
  }
  child_select.html(new_res_serverlist);

}


function set_wc_res_classes() {
  var work_centerid = gantt.getLightboxSection("work_center").control.id;
  $("select#" + work_centerid).addClass("work_center_popup_select_change");

  var resourceid = gantt.getLightboxSection("resource").control.id;
  $("select#" + resourceid).addClass("resource_popup_select").attr("data-parent_wc_id", work_centerid);

}


function change_priority_of_target($parent_task, task_priority) {
  var pritaskObj = gantt.getTask($parent_task);

  var task_link = "";
  var target_task = "";
  var child_task = "";
  var link_details = "";
  var current_link_id = "";

  task_link = pritaskObj.$source;

  if (task_link !== "" || task_link !== undefined || task_link !== []) {

    for (var i = 0; i < task_link.length; i++) {
      current_link_id = task_link[i];
      link_details = gantt.getLink(current_link_id);
      target_task = link_details.target;
      //  log_data("target_task - " + target_task);
      child_task = gantt.getTask(target_task);
      if (child_task !== undefined && child_task !== "undefined") {
        child_task.priority = task_priority;
        gantt.updateTask(link_details.target);
      }
    }
    if (target_task != "") {
      change_priority_of_target(target_task, task_priority);
    }
  }
}

function set_settings_in_popup(system_settings) {
  for (setting in system_settings) {
    var $el = "[name=" + setting + "]";
    var $el_selector = $($el);
    var $el_value = system_settings[setting];
    if ($el_selector.is("select")) {
      $el_selector.find("option[value='" + $el_value + "']").prop("selected", true);
      $el_selector.trigger('change');
    } else if ($el_selector.is("input") && ($el_selector.attr("type") == "text" || $el_selector.attr("type") == "number" || $el_selector.attr("type") == "hidden" || $el_selector.attr("type") == "range")) {
      $el_selector.val($el_value);
      if ($(".range_input_value[data-linked_field='" + setting + "']").length > 0) {
        $(".range_input_value[data-linked_field='" + setting + "']").html($el_value);
      }
    } else if ($el_selector.is("input") && $el_selector.attr("type") == "radio") {
      $("input" + $el + "[value='" + $el_value + "']").prop("checked", true);
      $("input" + $el + "[value='" + $el_value + "']").trigger('change');
    }

    if ($("[data-setting='" + setting + "']").length > 0) {
      if ($el_value == 1) {
        $("[data-setting='" + setting + "']").prop("checked", true);
      } else {
        $("[data-setting='" + setting + "']").prop("checked", false);
      }
      $("[data-setting='" + setting + "']").trigger('change');
    }
  }
}


function changeSkin(name) {
  var new_style = "assets/gantt/skins/dhtmlxgantt_" + name + ".css";
  $('#gantt_skin').attr('href', new_style);
}


function generate_color_code_style(server_list, style_label_key, color_set_settings) {
  var color_code_style = "";
  for (var i = 0; i < server_list.length; i++) {
    var key_value_color_set = server_list[i];

    var style_label = key_value_color_set[style_label_key].toLowerCase();

    var background_color = (color_set_settings[key_value_color_set['key']] !== undefined) ? color_set_settings[key_value_color_set['key']]['tc'] : "#000000";

    var progress_color = (color_set_settings[key_value_color_set['key']] !== undefined) ? color_set_settings[key_value_color_set['key']]['pc'] : "#000000";

    color_code_style += '\
    .'+ style_label + '{\n\
      border:2px solid ' + background_color + ';\n\
      color: ' + background_color + ';\n\
      background: ' + background_color + ';\n\
    }\n\
    .'+ style_label + ' .gantt_task_progress{\n\
      background: '+ progress_color + ';\n \
    }\n';
  }
  return color_code_style;
}

//===============
//Date Functions and Chanage Dashboard Date Week View 
//=============== 

function day_list(list_type, selected_option) {
  debugger;
  var temp_array = [];
  var temp_html = '';
  var selected_value;
  for (var i = 1; i <= 31; i++) {
    if (list_type == 'json') {
      temp_array.push({ "key": i, "label": i });
    } else if (list_type == 'html') {
      selected_value = '';
      if (selected_option == i) {
        selected_value = 'selected';
      }
      temp_html += '<option value="' + i + '" ' + selected_value + '>' + i + '</option>';
    }
  }
  return (temp_html != "") ? temp_html : temp_array;
}

function month_list(list_type, selected_option) {
  var month_array = [
  { "key": "0", "label": $_LANG['january'] },
  { "key": "1", "label": $_LANG['february'] },
  { "key": "2", "label": $_LANG['march'] },
  { "key": "3", "label": $_LANG['april'] },
  { "key": "4", "label": $_LANG['may'] },
  { "key": "5", "label": $_LANG['june'] },
  { "key": "6", "label": $_LANG['july'] },
  { "key": "7", "label": $_LANG['august'] },
  { "key": "8", "label": $_LANG['september'] },
  { "key": "9", "label": $_LANG['october'] },
  { "key": "10", "label": $_LANG['november'] },
  { "key": "11", "label": $_LANG['december'] }
  ];
  var temp_html = '';
  var selected_value;
  for (key in month_array) {
    if (list_type == 'html') {
      selected_value = '';
      if (selected_option == month_array[key]['key']) {
        selected_value = 'selected';
      }
      temp_html += '<option value="' + month_array[key]['key'] + '" ' + selected_value + '>' + month_array[key]['label'] + '</option>';
    }
  }
  return (temp_html != "") ? temp_html : month_array;
}

function year_list(list_type, range, selected_option) {
  var temp_array = [];
  var temp_html = '';
  var selected_value;
  var current_yr = (new Date()).getFullYear();
  for (var i = 1; i <= range; i++) {
    if (list_type == 'json') {
      temp_array.push({ "key": current_yr, "label": current_yr });
    } else if (list_type == 'html') {
      selected_value = '';
      if (selected_option == current_yr) {
        selected_value = 'selected';
      }
      temp_html += '<option value="' + current_yr + '" ' + selected_value + '>' + current_yr + '</option>';
    }
    current_yr = (new Date()).getFullYear() + i;
  }

  return (temp_html != "") ? temp_html : temp_array;
}

function hour_list(list_type, selected_option) {
  var temp_array = [];
  var temp_html = '';
  var selected_value;
  var hour_value = 0; var label = '';
  for (var i = 0; i <= 23; i++) {
    label = (i < 10) ? '0' + i + ':00' : i + ':00';
    if (list_type == 'json') {
      temp_array.push({ "key": hour_value, "label": label });
    } else if (list_type == 'html') {
      selected_value = '';
      if (selected_option == hour_value) {
        selected_value = 'selected';
      }
      temp_html += '<option value="' + hour_value + '" ' + selected_value + '>' + label + '</option>';
    }
    hour_value = hour_value + 60;
  }
  return (temp_html != "") ? temp_html : temp_array;

}

function minute_list(list_type, selected_option) {
  var temp_array = [];
  var temp_html = '';
  var selected_value;
  var label = '';
  for (var i = 0; i <= 59; i++) {
    label = (i < 10) ? '00:0' + i : '00:' + i;
    if (list_type == 'json') {
      temp_array.push({ "key": i, "label": label });
    } else if (list_type == 'html') {
      selected_value = '';
      if (selected_option == i) {
        selected_value = 'selected';
      }
      temp_html += '<option value="' + i + '" ' + selected_value + '>' + label + '</option>';
    }
  }
  return (temp_html != "") ? temp_html : temp_array;

}

function get_date_diff_hours(start_date, end_date) {
  var date1 = start_date;
  var date2 = end_date;
  var hours = Math.abs(date1 - date2) / 36e5;
  return hours;
}

function get_time_from_date(date, with_delimiter) {
  date = new Date(date);
  var hrs = date.getHours();
  if (hrs <= 9) {
    hrs = "0" + hrs;
  }
  var min = date.getMinutes();
  if (min <= 9) {
    min = "0" + min;
  }

  if (with_delimiter == 1) {
    return hrs + ":" + min;
  } else {
    return hrs + "" + min;
  }
}

function get_int_hour(date) {
  date = new Date(date);
  return parseInt(date.getHours());
}

function check_date_in_range(task_start_date, task_end_date) {

  var csd = (gantt.config.start_date);
  var ced = (gantt.config.end_date);
  var tsd = new Date(task_start_date);
  var ted = new Date(task_end_date);

  var from = new Date(csd.getFullYear(), (parseInt(csd.getMonth())), csd.getDate());
  var to = new Date(ced.getFullYear(), (parseInt(ced.getMonth())), ced.getDate());
  var check_sd = new Date(tsd.getFullYear(), (parseInt(tsd.getMonth())), tsd.getDate());
  var check_ed = new Date(ted.getFullYear(), (parseInt(ted.getMonth())), ted.getDate());
  var result = ((check_sd >= from && check_sd <= to) || (check_ed >= from && check_ed <= to));
  return result;
}

function get_start_of_week(date) {

  date = date ? new Date(+date) : new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1 - date.getDay());
  return date;
}

function get_end_of_week(date) {
  date = get_start_of_week(date);
  date.setDate(date.getDate() + 6);
  return date;
}


function timeline_navigation(type) {
  var menu_action_id = $(".menu_actions").find("li.active > a").attr("id");
  if (menu_action_id == "minute") {
    change_date(type);
  } else if (menu_action_id == "day") {
    change_date(type);
  } else if (menu_action_id == "week") {
    change_week(type);
  } else if (menu_action_id == "month") {
    change_month(type);
  } else if (menu_action_id == "year") {
    change_year(type);
  }
}

function change_date($type) {
  var current = gantt.config.start_date;

  var current_value = 0;

  if ($type == "next_timeline") {
    current_value = new Date(current.getTime() + one_day_in_ms);
  } else if ($type == "previous_timeline") {
    current_value = new Date(current.getTime() - one_day_in_ms);
  } else if ($type == "current") {
    current_value = new Date();
  }

  var tomorrow_start = new Date(current_value);
  var tomorrow_end = new Date(current_value);
  tomorrow_start.setHours(00, 00, 00, 000);
  tomorrow_end.setHours(23, 59, 00, 000);

  gantt.config.start_date = gantt.date.day_start(tomorrow_start);
  gantt.config.end_date = tomorrow_end; // new Date(2017, 9, 31, 24, 00);
  timeline_selected_value=get_day_month_year(tomorrow_start,"","day");
  default_label();
  gantt.render();
}

function change_week($type) {
  var current = gantt.config.end_date;
  var $start_week;
  var $end_week;
  if ($type == "next_timeline") {

    $start_week = get_start_of_week(gantt.config.end_date);
    $end_week = get_end_of_week($start_week);
    $start_week.setHours(00, 00, 00, 000);
    $end_week.setHours(23, 59, 00, 000);
  } else if ($type == "previous_timeline") {

    var temp = new Date(gantt.config.start_date);
    temp.setDate(temp.getDate() - 7);
    $start_week = get_start_of_week(temp);
    $end_week = get_end_of_week($start_week);
    $start_week.setHours(00, 00, 00, 000);
    $end_week.setHours(23, 59, 00, 000);
  } else if ($type == "current") {
    var today = new Date();
    $start_week = get_start_of_week(today);
    $end_week = get_end_of_week($start_week);
    $start_week.setHours(00, 00, 00, 000);
    $end_week.setHours(23, 59, 00, 000);
  }

  gantt.config.start_date = gantt.date.day_start($start_week);
  gantt.config.end_date = $end_week; // new Date(2017, 9, 31, 24, 00);
  timeline_selected_value=get_day_month_year($start_week,$end_week,"week");
  default_label();
  gantt.render();
}

function change_month($type) {
  var current_month = gantt.config.start_date;
  var new_month_value;
  if ($type == "next_timeline") {
    new_month_value = current_month.getMonth() + 1;
  } else if ($type == "previous_timeline") {
    new_month_value = current_month.getMonth() - 1;
  } else if ($type == 'current') {

    var temp = new Date();
    current_month = temp;
    new_month_value = temp.getMonth();
  }

  var $start_month = new Date(current_month.getFullYear(), new_month_value, 1);
  var $end_month = new Date(current_month.getFullYear(), new_month_value + 1);
  timeline_selected_value=get_day_month_year($start_month,"","month");
  //task_old_start_date=$start_month.getMonth();
  gantt.config.start_date = gantt.date.day_start($start_month);
  gantt.config.end_date = $end_month; // new Date(2017, 9, 31, 24, 00);
  default_label();
  gantt.render();

}

function calculate_resource_duration(array){
  var result=[];
  for (var i = 0; i < array.length; i++) {
    if(array[i].start_date.getMonth()==task_old_start_date){
     gantt.eachTask(function(task){
       if( (task.resource == array[i].resource) && (task.work_center == array[i].work_center) && (task.start_date == array[i].start_date) && (task.end_date == array[i].end_date) &&  (task.type != gantt.config.types.project) ) {
        result.push(task);
      }
    });  
   }
 }
 return result;
}

function change_year($type) {
  var current_year = gantt.config.start_date;
  var new_year_value;
  if ($type == "next_timeline") {

    new_year_value = new Date(new Date().setFullYear(current_year.getFullYear() + 1)).getFullYear();
  } else if ($type == "previous_timeline") {
    new_year_value = new Date(new Date().setFullYear(current_year.getFullYear() - 1)).getFullYear();
  } else if ($type == 'current') {
    new_year_value = current_year.getFullYear();
  }

  var $start = new Date(new_year_value, 0, 1);
  var $end = new Date(new_year_value, 11, 31);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; // new Date(2017, 9, 31, 24, 00);
  timeline_selected_value=get_day_month_year($start,"","year");
  default_label();
  gantt.render();
}

function get_start_date(mode_type) {
  var $start;
  if (mode_type = "day") {
    if (current_plan_details != "") {
      $start = new Date(current_plan_details['from_date'])
    } else {
      $start = new Date();
    }
  } else if (mode_type = "week") {
    if (current_plan_details != "") {
      $start = get_start_of_week(new Date(current_plan_details['from_date']));
    } else {
      $start = get_start_of_week(new Date());
    }
  } else if (mode_type = "month") {
    if (current_plan_details != "") {
      $start = new Date(current_plan_details['from_date'])
    } else {
      $start = new Date();
    }
  }
  return $start;
}

function minute_view_configuration() {
  //var $start = get_start_date('day');
  var $start = new Date();
  $start.setHours(00, 00, 00, 000);

  //var $end = new Date($start);
  var $end = new Date();
  $end.setHours(23, 59, 00, 000);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; // new Date(2017, 9, 31, 24, 00);

  gantt.config.scale_unit = "minute";
  gantt.config.step = 15;
  gantt.config.date_scale = "%i";
  gantt.config.min_column_width = 24;
  gantt.config.duration_unit = "hour";
  gantt.config.duration_step = 60;
  // gantt.config.scale_height = 75;

  var hourScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%g %a");
    return dateToStr(gantt.config.start_date);
  };

  gantt.config.subscales = [
  { unit: "hour", step: 1, template: hourScaleTemplate },
  { unit: "day", step: 1, date: "%j %F, %l" }
  ];
}

function date_view_configuration() {
  //var $start = get_start_date('day');
  timeline_selected_value='';
  var $start = new Date();
  $start.setHours(00, 00, 00, 000);

  //var $end = new Date($start);
  var $end = new Date();
  $end.setHours(23, 59, 00, 000);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; // new Date(2017, 9, 31, 24, 00);

  //  gantt.config.date_grid = "%F %d";
  gantt.config.scale_unit = "hour";
  gantt.config.date_scale = "%H:%i";
  gantt.config.step = 1;

  var dateScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%F %d");
    return dateToStr(gantt.config.start_date);
  };

  gantt.config.duration_unit = "hour";
  gantt.config.subscales = [{ unit: "day", step: 1, template: dateScaleTemplate }];
  timeline_selected_value=get_day_month_year($start,"","day");
  default_label();
  enable_disable_project_drag(true);
}

function week_view_configuration() {
  /*var $start = get_start_of_week(new Date());
  var $end = get_end_of_week($start);

  $start.setHours(00, 00, 00, 000);
  $end.setHours(23, 59, 00, 000);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; 

  gantt.config.scale_unit = "day";
  gantt.config.date_scale = "%l";
  gantt.config.step = 1;

  var weekScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%d %M");
    return dateToStr(gantt.config.start_date) + " - " + dateToStr(gantt.config.end_date);*/
    /*var dateToStr = gantt.date.date_to_str("%d %M");
		var endDate = gantt.date.add(date, -6, "day");
		var weekNum = gantt.date.date_to_str("%W")(date);
		return "#" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);*/
  /*};
  gantt.config.duration_unit = "day";
  gantt.config.subscales = [{ unit: "week", step: 1, template: weekScaleTemplate }];
  enable_disable_project_drag(true);*/
  timeline_selected_value='';
  var date = new Date();

  var $start = new Date(date.getFullYear(), date.getMonth(), 1);
  var $end = new Date(date.getFullYear(), date.getMonth() + 1);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; 

  gantt.config.scale_unit = "day";
  gantt.config.date_scale = "%d %M";
  gantt.config.step = 1;

  var monthScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%F, %Y");
    return dateToStr(gantt.config.start_date);
  };

  var weekScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%d %M");
    var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
    var weekNum = gantt.date.date_to_str("%W")(date);
    return "Week #" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);
  };
  
  var daysStyle = function(date){
    var dateToStr = gantt.date.date_to_str("%D");
    if (dateToStr(date) == "Sun"||dateToStr(date) == "Sat")  return "weekend";
    return "";
  };

  gantt.config.duration_unit = "day";
  //gantt.config.subscales = [{ unit: "month", step: 1, template: monthScaleTemplate }];
  gantt.config.subscales = [{unit: "month", step: 1, format: "%F, %Y"},
  {unit: "week", step: 1, format: weekScaleTemplate},
  {unit: "day", step:1, format: "%D", css:daysStyle }];
  timeline_selected_value=get_day_month_year($start,"","month");
  default_label();
  enable_disable_project_drag(true);
  
}

function month_view_configuration() {

  // var date = get_start_date('month'); 
  timeline_selected_value='';
  var date = new Date();

  var $start = new Date(date.getFullYear(), date.getMonth(), 1);
  var $end = new Date(date.getFullYear(), date.getMonth() + 1);

  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; // new Date(2017, 9, 31, 24, 00);

  gantt.config.scale_unit = "day";
  gantt.config.date_scale = "%d %M";
  gantt.config.step = 1; 
  /*gantt.config.min_column_width = 50;*/

  var monthScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%F, %Y");
    return dateToStr(gantt.config.start_date);
  };
  
  gantt.config.duration_unit = "day";
  gantt.config.subscales = [{ unit: "month", step: 1, template: monthScaleTemplate }];
  timeline_selected_value=get_day_month_year($start,"","month");
  default_label();
  enable_disable_project_drag(true);
}

function year_view_configuration() {
  var date = new Date();

  var $start = new Date(date.getFullYear(), 0, 1);
  var $end = new Date(date.getFullYear(), 11, 31);

  
  gantt.config.start_date = gantt.date.day_start($start);
  gantt.config.end_date = $end; // new Date(2017, 9, 31, 24, 00);

  gantt.config.scale_unit = "month";
  gantt.config.date_scale = "%M";
  gantt.config.step = 1;

  var yearScaleTemplate = function (date) {
    var dateToStr = gantt.date.date_to_str("%Y");
    return dateToStr(gantt.config.start_date);
  };

  gantt.config.duration_unit = "month";
  gantt.config.subscales = [{ unit: "year", step: 1, template: yearScaleTemplate }];

  /*gantt.config.min_column_width = 50;

  gantt.config.scale_height = 90;*/
  //   gantt.templates.date_scale = null;
  timeline_selected_value=get_day_month_year($start,"","year");
  default_label();
  enable_disable_project_drag(true);
}


//===============
// Refresh Functions  
//=============== 

function refresh_status() {

  loading_toast($_LANG['resync_progress']);
  setTimeout(function () {
    service_call("get_refresh_status", "", system_settings['default_work_center'], function (res) {

      if (res.data != 'none') {
        hide_loading_toast();
        for (var i = 0; i < res.data.length; i++) {
          var task_bar = res.data[i];
          if (task_bar.oper_id != '' && task_bar.oper_id != null) {
            var task = gantt.getTask(task_bar.oper_id);
            task.progress = task_bar.progress;
            task.priority = task_bar.priority;
            gantt.updateTask(task_bar.oper_id);
          }
        }
        detail_layout_call();
        show_toast("custom_success", success_msg_short);
      }
    });
  }, default_pause_short);

}

function refresh_data() {

  loading_toast($_LANG['resyncing']);
  setTimeout(function () {
    service_call("get_refresh_data", "", system_settings['default_work_center'], function (res) {
      if (res.data != 'none') {
        hide_loading_toast();
        show_toast("custom_success", success_msg_short);
        setTimeout(function () {
          window.location.reload();
        }, default_pause);

      } else {
        hide_loading_toast();
        show_toast("warning_gantt", $_LANG['no_wo_duration']);
      }
    });
  }, default_pause_short);

}

//===============
// Personalization and Customisation Functions  
//=============== 

// generate list of task type for color table
function generate_task_type_color_table(task_type_server_list) {
  var task_type_table = '<table class="table table-bordered table-responsive">\
  <thead>\
  <tr>\
  <th>'+ $_LANG['task_type'] + '</th>\
  <th>'+ $_LANG['name'] + '</th>\
  <th >'+ $_LANG['task_color'] + '</th>\
  <th >'+ $_LANG['progress_color'] + '</th>\
  </tr>\
  </thead>\
  <tbody>';
  for (var i = 0; i < task_type_server_list.length; i++) {
    var task_type_key_value = task_type_server_list[i];

    task_type_option_list += '<option value="' + task_type_key_value['unique_name'] + '">' + task_type_key_value['label'] + '</option>';

    var t_task_color_value = (task_type_color_set[task_type_key_value['key']] !== undefined) ? task_type_color_set[task_type_key_value['key']]['tc'] : "#000000";

    var t_progress_color_value = (task_type_color_set[task_type_key_value['key']] !== undefined) ? task_type_color_set[task_type_key_value['key']]['pc'] : "#000000";

    task_type_table += '<tr>\
    <td>'+ task_type_key_value['key'] + '</td>\
    <td>'+ task_type_key_value['label'] + '</td>\
    <td><div id="cp3" class="input-group colorpicker-component">\
    <input type="text" readonly name="task_type_color_set['+ task_type_key_value['key'] + '][tc]" value="' + t_task_color_value + '" class="form-control"/>\
    <span class="input-group-addon"><i></i></span>\
    </div></td>\
    <td><div id="cp3" class="input-group colorpicker-component">\
    <input type="text" readonly name="task_type_color_set['+ task_type_key_value['key'] + '][pc]" value="' + t_progress_color_value + '" class="form-control"/>\
    <span class="input-group-addon"><i></i></span>\
    </div></td>\
    </tr>';
    /* <td></td>\*/
  }
  task_type_table += '\
  </tbody>\
  </table>\
  <hr class="small_m">';
  $(".task_type_box").html(task_type_table);
}


// generate list of priority for color table
function priority_color_table(priority_server_list) {

  var priority_table = '<table class="table table-bordered table-responsive">\
  <thead>\
  <tr>\
  <th>'+ $_LANG['priority'] + '</th>\
  <th>'+ $_LANG['name'] + '</th>\
  <th >'+ $_LANG['task_color'] + '</th>\
  <th >'+ $_LANG['progress_color'] + '</th>\
  </tr>\
  </thead>\
  <tbody>';
  for (var i = 0; i < priority_server_list.length; i++) {
    var priority_data_key_value = priority_server_list[i];

    var p_task_color_value = (priority_color_set[priority_data_key_value['key']] !== undefined) ? priority_color_set[priority_data_key_value['key']]['tc'] : "#000000";

    var p_progress_color_value = (priority_color_set[priority_data_key_value['key']] !== undefined) ? priority_color_set[priority_data_key_value['key']]['pc'] : "#000000";

    priority_table += '<tr>\
    <td>'+ priority_data_key_value['key'] + '</td>\
    <td>'+ priority_data_key_value['label'] + '</td>\
    <td><div id="cp2" class="input-group colorpicker-component">\
    <input type="text" readonly name="priority_color_set['+ priority_data_key_value['key'] + '][tc]" value="' + p_task_color_value + '" class="form-control"/>\
    <span class="input-group-addon"><i></i></span>\
    </div></td>\
    <td><div id="cp2" class="input-group colorpicker-component">\
    <input type="text" readonly name="priority_color_set['+ priority_data_key_value['key'] + '][pc]" value="' + p_progress_color_value + '" class="form-control"/>\
    <span class="input-group-addon"><i></i></span>\
    </div></td>\
    </tr>';

  }
  priority_table += '\
  </tbody>\
  </table>\
  <hr class="small_m">';
  $(".priority_box").html(priority_table);
}


//===============
// Custom Lightbox Methods 
//===============

function custom_lightbox_form(lightbox_el_id) {
  return document.getElementById(lightbox_el_id);
}

function show_custom_lightbox(lightbox_el_id) {
  // $("#"+lightbox_el_id).show(); 
  $("body").append('<div class="modal-backdrop fade in"></div>');
}

function hide_custom_lightbox(lightbox_el_id) {
  // $("#"+lightbox_el_id).hide();
  $('div.modal-backdrop').remove();
}

function close_custom_lightbox() {
  if (close_task_popup_alert == 1) {
    gantt.confirm({
      text: $_LANG['unsaved_changes_lost_alert'],
      ok: '<i class="fa fa-check"></i> ' + $_LANG['yes'],
      cancel: '<i class="fa fa-times"></i> ' + $_LANG['no'],
      callback: function (result) {
        if (result == true) {
          $("#lightbox_modal").modal('hide');
          close_task_popup_alert = 0;

          var task = gantt.getTask(current_popup_task_id);
          if (task.$new)
            gantt.deleteTask(task.id);
          gantt.hideLightbox();
          $('#popup_start_date_picker').datepicker('update', '')
          $('#popup_end_date_picker').datepicker('update', '')
        }
      }
    });
  } else if (close_task_popup_alert == 0) {
    $("#lightbox_modal").modal('hide');
    close_task_popup_alert = 0;

    var task = gantt.getTask(current_popup_task_id);
    if (task.$new)
      gantt.deleteTask(task.id);
    gantt.hideLightbox();
    $('#popup_start_date_picker').datepicker('update', '')
    $('#popup_end_date_picker').datepicker('update', '')
  }


}

//===============
// Custom jQuery Events
//===============

$(document).ready(function (event) {

  $(document).on("change", ".master_check", function () {
    var c_obj = $(this);
    if (c_obj.is(":checked")) {
      c_obj.parents(".table_box").find(".child_check").prop("checked", true);
      c_obj.parents(".table_box").find('.body_row').each(function () {
        $(this).addClass('row_selected');
      });
    } else {
      c_obj.parents(".table_box").find(".child_check").prop("checked", false);
      c_obj.parents(".table_box").find('.body_row').each(function () {
        $(this).removeClass('row_selected');
      });
    }
  });

  $(document).on("change", ".child_check", function () {
    var c_obj = $(this);
    if (c_obj.is(":checked")) {
      c_obj.parents('.body_row').addClass('row_selected');
    } else {
      c_obj.parents('.body_row').removeClass('row_selected');
    }
    if ($(".child_check").length == $(".child_check:checked").length) {
      c_obj.parents(".table_box").find(".master_check").prop("checked", true);
    } else {
      c_obj.parents(".table_box").find(".master_check").prop("checked", false);
    }
  });

  $(document).on("click", ".select_unselect_row", function () {
    var c_obj = $(this);
    if (c_obj.parents('.body_row').hasClass('row_selected')) {
      c_obj.parents('.body_row').find("input[type='checkbox']").prop("checked", false);
      c_obj.parents('.body_row').removeClass('row_selected');
    } else {
      c_obj.parents('.body_row').find("input[type='checkbox']").prop("checked", true);
      c_obj.parents('.body_row').addClass('row_selected');
    }
  });



}); // ready end

//===============
//Resource Grid Functions 
//=============== 
function updateSelect(options, resource_select) {

  var select = resource_select;
  var html = [];
  html.push("<option value=''>All</option>");
  options.forEach(function (option) {
    html.push("<option value='" + option.id + "'>" + option.text + "</option>");
  });
  select.innerHTML = html.join("");
}


function selectResource() {
  var node = this;
  filterValue = node.value;
  resourcesStore.refresh();
}

function get_resource(resource_select) {
  var select = resource_select;
  select.onchange = selectResource;

}