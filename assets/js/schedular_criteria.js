var choose_opr;
var $choose_schedule;
var $schedule_name;
var $start_date;
var $end_date;
var $proceed_button;
var $proceed_button_text;

function start_schedule(form_obj){
  // log_data(form_obj.serialize()); return;
  ajax_form_submit("start_scheduling", form_obj.serialize(), function(response){
    log_data(response);
    show_toast(response.success, $_LANG[response.message]);
    if(response.success == 'error'){
      setTimeout(function(){
        hide_button_loading("btn_start_scdule", $proceed_button_text);
      }, default_pause);
    } else {
      for (prop in response.data) {
        set_cookie(prop, response.data[prop]);
      }

      setTimeout(function(){
        hide_button_loading("btn_start_scdule", $proceed_button_text);
        window.location = gant_chart_page_link;
      }, default_pause);
    }
  });
}


$(document).ready(function() {
  set_title($_LANG['schedue_selector']);

  // check swb is installed or not if not installed redirect to setup
  check_installation();

  check_is_login();

  if(get_cookie('ref_id') != undefined && get_cookie('from_date') != undefined && get_cookie('to_date') != undefined){
    window.location=gant_chart_page_link;
  }

  current_plan_details = get_cookie();
  current_company = current_plan_details['company'];

  choose_opr = $("#choose_operation");
  $choose_schedule =  $("#choose_schedule");
  $schedule_name = $("#schedule_name");
  $start_date = $("#start_date");
  $end_date = $("#end_date");
  $proceed_button = $(".proceed_button");
  $proceed_button_text = $proceed_button.html();
  $reopen_txt = $("#reopen_plan").html();

  service_call("get_all_schedule", "",  "", function(res){
    log_data(res);
    if(res.data != "none"){

    // generate list of all work center for select box 
    var existing_scheduling_select_options = '<option value="">'+$_LANG['choose_schedule']+'</option>';
    for (var i = 0; i < res.data.length; i++) {
     var ref_data = (res.data[i]);
     var option_string = ref_data['plan_name'] + " (" + ref_data['from_date'] +" to " + ref_data['to_date'] + ") "
     existing_scheduling_select_options += "\
     <option value='"+ ref_data['ref_id']  +"' data-status='"+ ref_data['status'] +"'> " +  option_string + "</option>\
     ";
   }
   $choose_schedule.html(existing_scheduling_select_options);
 }
});

  service_call("get_work_centers", "",  "", function(res){
    log_data(res);
    if(res.data != "none"){
      var work_center_select_option = '<option value="all">'+$_LANG['all']+'</option>';
      work_center_select_option += generate_options(modify_wc_serverlist(res.data), 'key', 'label');
      $("#work_center").html(work_center_select_option);
    }
  });

  var checkin =  $('#start_date_picker').datepicker({
    autoclose : true,
    format : "dd-mm-yyyy",
    keyboardNavigation : true,
    todayHighlight : true
  }).on('changeDate', function(ev) {

    var newDate = new Date(ev.date);
    newDate.setDate(newDate.getDate() + 1);
    $('#end_date_picker').datepicker('update', newDate);
    $('#end_date_picker').datepicker('setStartDate', newDate);

    checkin.hide();
    $start_date.removeAttr('style');
    $('.to_date_picker')[0].focus();
  }).data('datepicker')

  var checkout =  $('#end_date_picker').datepicker({
    autoclose : true,
    format : "dd-mm-yyyy",
    keyboardNavigation : true,
    todayHighlight : true
  }).on('changeDate', function(ev) {
    checkout.hide();
    $end_date.removeAttr('style');
  }).data('datepicker');

  

  $(".date_div").html(new Date().getFullYear());
  choose_opr.on("change", function(){
    $(".scheduling_sections").addClass('hide');

    var cObj = $(this);
    $("."+cObj.val()+ "_box").removeClass("hide");
    if(cObj.val() != ""){
      $proceed_button.removeClass('hide');
    }
  });

  $choose_schedule.on("change", function(){
   if($(this).val()!=""){
    $(this).removeAttr('style');
  }
});

  $schedule_name.on("keyup", function(){
   if($(this).val()!=""){
    $(this).removeAttr('style');
  } else {
    $(this).attr("style", 'border-color:red');
  }
});

  $(document).on("submit", "#scheduling_filter", function(event){
    var allow_submit = true;


    show_button_loading("btn_start_scdule", $_LANG['loading']);

    if(choose_opr.val() == ""){
      allow_submit = false;
    } else {
      if(choose_opr.val() == "create_new"){
        if($schedule_name.val() == ""){
          $schedule_name.attr("style", 'border-color:red');
          allow_submit = false;
        }
        if($start_date.val() == ""){
          $start_date.attr("style", 'border-color:red');
          allow_submit = false;
        }
        if($end_date.val() == ""){
          $end_date.attr("style", 'border-color:red');
          allow_submit = false;
        }
      } else if(choose_opr.val() == "modify_existing"){
        log_data($choose_schedule.find("option:selected").data("status"));
        if($choose_schedule.val() == ""){
          $choose_schedule.attr('style', 'border-color:red');
          allow_submit = false;
        } else {
         if($choose_schedule.find("option:selected").data("status") == 'pushed'){
          allow_submit = false;
          $("#myModal").modal('show');
          return false;
        }
      }
    }
  }

  if(allow_submit){
    start_schedule($(this));
  } else {
   setTimeout(function(){
    hide_button_loading("btn_start_scdule", $proceed_button_text);
  }, default_pause);
 }
});

  $("#reopen_plan").on("click", function(){
    show_button_loading("btn_start_scdule", $_LANG['loading']);
    show_button_loading("reopen_plan", $_LANG['loading']);
    start_schedule($("#scheduling_filter"));
  }); 

  $("#cancel_plan").on("click", function(){
    hide_button_loading("btn_start_scdule", $proceed_button_text);
    hide_button_loading("reopen_plan", $reopen_txt);
  }); 

});
