 var $modes_fail;
 var $modes_pass;
 var $modes_check; 
 var allow_submit = 1; 
 var db_install_dtls;
 var app_url;
 var prevent_installation = 0;

 var allow_connection_next = '';
 function extension_check(callback){
  $(".recheck_extensions").html("<i class='fa fa-spinner fa-spin'></i> " + $_LANG['checking']);
  $.ajax({
    url: app_url + "/setup/services/setup.php?action=extension_check",
    type: 'POST',
    dataType: 'JSON',
    async : false,
    cache : false,
    success : function(res){
      setTimeout(function(){
        var pass = 0;  var fail = 0;
        for (key in res) {  
          if($(".prerequesties_block[data-ext='"+key+"']").length > 0){
            if(res[key] == 1){
              $(".prerequesties_block[data-ext='"+key+"']").find(".ext_status").html($modes_pass);
              pass++; 
            } else {
              $(".prerequesties_block[data-ext='"+key+"']").find(".ext_status").html($modes_fail);
              fail++;
            }
          } else {
            $(".prerequesties_block[data-ext='"+key+"']").find(".ext_status").html($modes_fail);
            fail++;
          }
        }

        if(fail ==  0){
          $(".connection_next").attr("disabled", false);
        } else {
          $(".connection_next").attr("disabled", true);
        }

        if(callback!== undefined){
          callback(res);
        }
        $(".recheck_extensions").attr("disabled", false);
        $(".recheck_extensions").html("<i class='fa fa-sync'></i> " + $_LANG['recheck']);
      }, default_pause);

    },  error: function(){
      show_toast("error", global_error_msg); 
      $(".recheck_extensions").attr("disabled", false);
      $(".connection_next").attr("disabled", true);
      $(".recheck_extensions").html("<i class='fa fa-sync'></i> " + $_LANG['recheck']);
      
    }
  });

} 

function recomended_settings(){
 var jsonObj =  {
  "default_work_center":"all",
  "task_column_width":50,
  "chart_table_row_height":25,
  "left_panel_width":580,
  "left_panel_resize":1,
  "enable_keyboard_shortcut":1,
  "chart_header_scale_height":50,
  "default_timeline_view":"day",
  "default_task_color_code":"priority",
  "drag_lightbox":1,
  "lightbox_additional_height":120,
  "default_theme":"material",
  "task_type_color_set":
  {
    "1": {
      "tc":"#000000",
      "pc":"#000000"
    },
    "2": {
      "tc":"#000000",
      "pc":"#000000"
    },
    "3": {
      "tc":"#9f55ba",
      "pc":"#9113e5"
    },
    "4": {
      "tc":"#d75252",
      "pc":"#f60f0f"
    },
    "5": {
      "tc":"#000000",
      "pc":"#000000"
    },
    "6": {
      "tc":"#cbdc3b",
      "pc":"#a4c006"
    },
    "7": {
      "tc":"#000000",
      "pc":"#000000"
    },
    "8": {
      "tc":"#000000",
      "pc":"#000000"
    },
    "9": {
      "tc":"#000000",
      "pc":"#000000"
    }
  },
  "priority_color_set":
  {
    "1":{
      "tc":"#d96c49",
      "pc":"#d8572e"
    },
    "11":{
      "tc":"#42b849",
      "pc":"#068525"
    },
    "31":{
      "tc":"#56a1ec",
      "pc":"#0747ae"
    }
  },
  "left_right_panel_font_size":12,
  "unhighlight_color":"#e4e4e4",
  "default_resource_load_layout":"detail",
  "resource_balanced_color":"#42b849",
  "resource_overload_color":"#d96c49"
};
return jsonObj;
}


function set_active_block(){
  $(".one_step_block").hide();
  var active_div = $("div.f1-step.active").attr("id");
  $("fieldset[data-block_id='"+active_div+"']").show();
}

function go_to_previous(previous_block){
  $("div.f1-step.active").removeClass("active");
  $("#"+previous_block).addClass("active");
  set_active_block(); 
}

function go_to_next(next_block){
  $("div.f1-step.active").removeClass("active");
  $("#"+next_block).addClass("active");
  set_active_block(); 
}

function calculate_progress(progress_block){
  var block_num = $("#"+progress_block).data("step");
  var new_width = ($("#"+progress_block).offset().left) - ( $("div.f1-progress").offset().left) + 50;
  $("div.f1-progress-line").attr("style","width: "+new_width+"px")
}

function generate_db_table(db_list, key, value){
  var html_content = "";
  for (var i = 0; i < db_list.length; i++) {
   var list_values = (db_list[i]);

   html_content +=   '<div class="row body_row">\
   <div class="col-md-12 col-sm-12">\
   <div class="col-md-1 col-sm-1 align_middle"><div class=""><label class="checkbox-inline"><input type="checkbox" name="selected_db[]" class="child_check is_checked" value="'+list_values[key] +'"></label></div></div>\
   <div class="col-md-5 col-sm-5 align_middle select_unselect_row is_checked">'+list_values[key] +' </div>\
   <div class="col-md-6 col-sm-6 align_middle select_unselect_row is_checked">'+list_values[value] +' </div>\
   </div>\
   </div>';
 }
 return html_content;
}

$(document).ready(function() {
  $modes_fail  = '<div class="text-danger"><i class="fa fa-times"></i> '+$_LANG['fail']+'</div>';
  $modes_pass  = '<div class="text-success"> <i class="fa fa-check"></i> '+$_LANG['pass']+'</div>';
  $modes_check  = '<div class="text-primary"> <i class="fa fa-spinner fa-spin"></i> '+$_LANG['checking']+'</div>';


  //Putting the URL into a global variable
  app_url = window.location.href;
  var index_char =app_url.lastIndexOf("/");
  app_url  = app_url.slice(0,index_char) + '/';

    //set the version text
    $("#version_text").html('<b>'+$_CONFIG['system_version']+'</b>');
    // initial default setup
    set_title($_LANG['installation']);
    $(".ext_status").html($modes_check);
    
    var org_button_text = $(".test_connection").html();
    //===============
    // Service call and data loading
    //===============

    if($_CONFIG['installed'] == "1"){
      show_toast("warning_gantt", string_replacer($_LANG['app_already_installed'], '{__APP_TITLE__}', $_CONFIG['app_title']));
      setTimeout(function(){
        window.location = login_page_link;
      }, default_pause_medium);
    }


    system_settings = recomended_settings();

    priority_color_set = system_settings['priority_color_set'];
    task_type_color_set = system_settings['task_type_color_set'];
    

    basic_request_call("priority.json", function(res){

      for(key in res.priority){
        res.priority[key]['key'] =  res.priority[key]['code'];
        res.priority[key]['label'] =  res.priority[key]['description'];
      }
      priority_color_table(res.priority);
    });

    basic_request_call("task_type.json", function(res){
     for(key in res.priority){

      res.priority[key]["key"] = res.priority[key]['code'];
      res.priority[key]["label"] = res.priority[key]['description'];
      res.priority[key]["unique_name"] = res.priority[key]['key'];
    }
    generate_task_type_color_table(res.task_type);
  });


    $("."+system_settings['default_task_color_code']+"_box").show();

    set_settings_in_popup(system_settings);

    $(document).on("change", "#default_task_color_code", function(){
      $(".color_scheme").hide();
      color_scheme_div = "."+$(this).val()+"_box";
      $(color_scheme_div).show();
    });


    setTimeout(function(){
      set_active_block(); 
    });

    $(".btn-next").on("click", function(){
      var n_obj = $(this);
      var next_block = n_obj.data("next-block");
      calculate_progress(next_block);
      go_to_next(next_block);
    });

    //To enable the Next button on the database selection, this event will work
    $(document).on("change, click", ".is_checked", function(){
      var c_obj = $(this);
      setTimeout(function(){
        if( $(".child_check:checked").length > 0){
          $(".database_test").attr("disabled", false);
        } else {
          $(".database_test").attr("disabled", true);
        }
      }, 20);
      
    });

    $(".btn-previous").on("click", function(){
      var p_obj = $(this);
      var previous_block = p_obj.data("previous-block");
      calculate_progress(previous_block);
      go_to_previous(previous_block);

    });

    $("#choose_db").on("change", function(){
     var c_obj = $(this);
     $(".db_sections").addClass('hide');
     $("."+c_obj.val()+"_block").removeClass('hide');      
   });

    $(".prerequisites_next").on("click", function(){
      $(".installing_desti").val(app_url);
      $(".app_url").val(app_url);
      $(".recheck_extensions").attr("disabled", true);
      extension_check();
    });

    $(".recheck_extensions").on("click", function(){
      $(".ext_status").html($modes_check);
      $(".connection_next").attr("disabled", true);
      $(".recheck_extensions").attr("disabled", true);
      extension_check();
    });

    $(".choose_db").on("change", function(){
      $(".error_box").html("");
      $("#database-table").hide();
      $("#db_tables").html('');
      if($(this).val() == ""){
        $(".test_connection").attr("disabled", true);
        $(".database_test").attr("disabled", true);
      } else {
        $(".test_connection").attr("disabled", false);
      }
    });

    //For enabling Next bttn on radio selection change
    $(".is_selected").on("change", function(){ 
      if(prevent_installation == 0){
        var filtered_db = [];
        var op_to_perform = "";
        $(".install_upgrade_next").attr("disabled", false);
        var installed_status = "";
        $(".db_utility_block").find(".db_name_row").removeClass("grey_out");
        if($('input[name=install_option]:checked').val() == "install_only"){
          $(".final_heading").html($_LANG['start_installation']);
          installed_status = 'Yes';
          $(".db_utility_block").find(".db_name_row[data-installed='"+installed_status+"']").addClass("grey_out");
          $(".db_utility_block").find(".db_name_row[data-installed='<b>X</b>']").addClass("grey_out");
          op_to_perform = "install_only";

        for(key in db_install_dtls){   //Filter those DB in which we are installing the app. from scrap
          if(db_install_dtls[key].db_name !== undefined && db_install_dtls[key] !== 'undefined'){
            if(db_install_dtls[key].is_installed == 'No' ){
              filtered_db.push({"db_name" : db_install_dtls[key].db_name, "version":"", "is_installed": ""});
            }
          }
        }
        $(".filtered_db").val(JSON.stringify(filtered_db));
      }else if($('input[name=install_option]:checked').val() == "upgrade_only"){ 
        $(".final_heading").html($_LANG['start_upgrade']);
        installed_status = 'No';
        $(".db_utility_block").find(".db_name_row[data-installed='"+installed_status+"']").addClass("grey_out");
        $(".db_utility_block").find(".db_name_row[data-installed='<b>X</b>']").addClass("grey_out");
        op_to_perform = "upgrade_only";
        
        for(key in db_install_dtls){ //Filter those DB in which we are upgrading the app. from any version
          if(db_install_dtls[key].db_name !== undefined && db_install_dtls[key] !== 'undefined'){
            if(db_install_dtls[key].is_installed == 'Yes' ){
              filtered_db.push({"db_name" : db_install_dtls[key].db_name, "version":db_install_dtls[key].ver, "is_installed": db_install_dtls[key].is_installed});
            }
          }
        }
        $(".filtered_db").val(JSON.stringify(filtered_db));
      }else if($('input[name=install_option]:checked').val() == "uninstall_install"){
        $(".final_heading").html($_LANG['start_unistall_install']);
        op_to_perform = "install_upgrade";
        //Filter those DB in which we are installing the app. from scrap
        for(key in db_install_dtls){
          if(db_install_dtls[key].db_name !== undefined && db_install_dtls[key] !== 'undefined'){
            //ignore Databases which have OptiPro not installed
            if(db_install_dtls[key].is_installed != "<b>X</b>"){
              filtered_db.push({"db_name" : db_install_dtls[key].db_name,  "version":db_install_dtls[key].ver, "is_installed": db_install_dtls[key].is_installed});
            }
          }
        }
        $(".filtered_db").val(JSON.stringify(filtered_db));
        $(".db_utility_block").find(".db_name_row").removeClass("grey_out");
        $(".db_utility_block").find(".db_name_row[data-installed='<b>X</b>']").addClass("grey_out");
      }else{
        show_toast("error", $_LANG['invalid_radio']); 
      }
    }
  });

    $(".test_connection").on("click", function(){
      $(".database_test").attr("disabled", true);
      var selected_section = $(".choose_db").val();
      var section_obj = $("."+selected_section+"_block");
      allow_submit = 1;
      $(section_obj).find("input").each(function(){
        var inp_obj = $(this);
        if (inp_obj.val() == "") {
          allow_submit = 0;
          inp_obj.parent("div").find(".error_box").html(required_msg);
        } else {
          inp_obj.parent("div").find(".error_box").html("");
        }
      });
      
      if(allow_submit == 1){
        $(".test_connection").html('<i class="fa fa-spinner fa-spin"></i> ' + $_LANG['testing']).attr("disabled", true);
        
        setTimeout(function(){
         $.ajax({
          url: app_url + "/setup/services/setup.php?action=try_connection",
          type: 'POST',
          dataType: 'JSON',
          async : false,
          cache : false,
          data : {
            choose_db : $("#choose_db").val(),
            sql_server_name : $("#sql_server_name").val(),
            sql_server_username : $("#sql_server_username").val(),
            sql_server_password : $("#sql_server_password").val(),
            sql_server_db : $("#sql_server_db").val(),
            hana_driver : $("#hana_driver").val(),
            hana_server_name : $("#hana_server_name").val(),
            hana_server_port : $("#hana_server_port").val(),
            hana_username : $("#hana_username").val(),
            hana_password : $("#hana_password").val(),
            hana_db : $("#hana_db").val(),
          },
          success : function(res){

            show_toast(res.success, res.message);
            if(res.success != "error"){
             $(".final_submit").attr("disabled", false);
             var table_element = generate_db_table(res.data,'dbName','cmpName');
             $('#db_tables').html(table_element);
             $('#database-table').css('display','block');
           } else {
             $('#db_tables').html('');
             $('#database-table').css('display','none');

           }

         },  error: function(){
          show_toast("error", global_error_msg); 
          $('#database-table').css('display','none');
          $('#db_tables').html('');
          $('#database-table').css('display','none');

        }, complete: function(){
          $(".test_connection").html(org_button_text).attr("disabled", false);

        }
      });
       }, default_pause_medium);
      }
    });

    $(".database_test").on("click", function(){
      $(".is_selected").prop("checked", false);
    });

    
      //Event for Show Details button
      $(".install_upgrade").on("click", function(){
        $("#show_details_block").css("display","block");
        //First get the value of the selected checkbox
        var checked_db = new Array();
        $('input[name="selected_db[]"]:checked').each(function() {
          checked_db.push(this.value);
        });
        
        //Call the service which will get the installation details
        prevent_installation = 0;
        $.ajax({
          url: app_url + "/setup/services/setup.php?action=get_db_inst_details",
          type: 'POST',
          dataType: 'JSON',
          async : false,
          cache : false,
          data : {
            choose_db : $("#choose_db").val(),
            sql_server_name : $("#sql_server_name").val(),
            sql_server_username : $("#sql_server_username").val(),
            sql_server_password : $("#sql_server_password").val(),
            sql_server_db : $("#sql_server_db").val(),
            hana_driver : $("#hana_driver").val(),
            hana_server_name : $("#hana_server_name").val(),
            hana_server_port : $("#hana_server_port").val(),
            hana_username : $("#hana_username").val(),
            hana_password : $("#hana_password").val(),
            hana_db : $("#hana_db").val(),
            checked_db : checked_db
          },
          success : function(res){

            //if the response is not error
            if(res.success != "error"){
              db_install_dtls = res.data;
              
              var color;
              var html_content = "";
              html_content +='<div class="well well-lg db_utility_block">\
              <div class="row db_name_header">\
              <div class="col-sm-4" style="font-weight: bold;">'+$_LANG['databases']+'</div>\
              <div class="col-sm-4" style="font-weight: bold;">'+$_LANG['installation_status']+'</div>\
              <div class="col-sm-4" style="font-weight: bold;">'+$_LANG['version']+' </div>\
              </div>';

              for (var i = 0; i < res.data.length; i++) {
               if(res.data[i].is_optipro_installed == "No"){
                 prevent_installation = 1;
                 show_toast("error", first_install_optipro+res.data[i].db_name,10000); 
               }
               color = res.data[i].font_color;
               html_content +=
               '<div class="row clearfix db_name_row" data-installed="'+res.data[i].is_installed+'">\
               <div class="col-sm-4">'+res.data[i].db_name+'</div>\
               <div class="col-sm-4"><font color = "'+color+'">'+res.data[i].is_installed+'</font></div>\
               <div class="col-sm-4">'+res.data[i].ver+'</div>\
               </div>';
             }
             html_content += '</div>'
             $('#show_details_block').html(html_content);
           }
         },  error: function(){
          show_toast("error", global_error_msg); 
        }, complete: function(){

        }
      });      

      });

      $(".db_inputs").on("keyup", function(){
        var inp_obj = $(this);

        if(inp_obj.val().length > 0){
          inp_obj.parent("div").find(".error_box").html("");
        } else {
          allow_submit = 0;
          inp_obj.parent("div").find(".error_box").html(required_msg);
        }
      })

      $(".installation_form").on("submit", function(event){
        event.preventDefault();
        $(".install_start_loader").show();
        $("#start_install_msg").hide();
        var form_obj = $(this);
        setTimeout(function(){
         $.ajax({
          url: app_url + "/setup/services/setup.php?action=start_installation",
          type: 'POST',
          dataType: 'JSON',
          async : false,
          cache : false,
          data : form_obj.serialize(),
          success : function(res){

            show_toast(res.success, res.message);
            if(res.success != "error"){
              setTimeout(function(){
                $(".database_test").attr("disabled", false);
              //$(".final_submit").attr("disabled", true);

              $(".install_start_loader").html("<h4 class='text-success'><b>"+$_LANG['redirect_to_swb']+"</b></h4>");
              window.location = login_page_link; 
            }, default_pause);
            } 
          },  error: function(){
            show_toast("error", global_error_msg); 
          }, complete: function(){
            $(".test_connection").html(org_button_text).attr("disabled", false);

          }
        });
       }, default_pause_medium);

      });


   //===============
    // Additional Libray Initialize and Configure 
    //===============

    setTimeout(function(){
     $('.colorpicker-component').colorpicker({
      format : "hex",
      inline: false,
      container: true,  
    });
   }, default_pause);

  });
