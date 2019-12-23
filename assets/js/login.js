var ps_url;
var user_name;
var pass;
var response;
$(document).ready(function() {

	set_title($_LANG["login_join"]);
	check_installation();
	user_redirection("login");


	$(".date_div").html(new Date().getFullYear());
	get_login_service_URL();

	$('#company').on('change', function() {
		if($(this).val() !=""){
			$('#btn-login').css('display', 'block');
			$("#btn-login").attr("disabled", false);
		}
		else{
			$('#btn-login').css('display','none');
			$("#btn-login").attr("disabled", true);
		}
	});

	$(document).ajaxError(function(){
		hide_button_loading("btn-connect", $_LANG["connect"]);
	});

}); // document 



 //This fun will get and keep the url to be hitted, from database
 function get_login_service_URL(){
 	basic_request_call(service_url+"?action=get_login_service_URL", function(res){
		//if res is not empty then will set it into global var
		ps_url = res.data.url;
		//console.log(res);
		if(res != undefined){
			ps_url = res.data.url;
		}
	});
 }

 function connect(){
//taking values
user_name = $('#username').val();
pass = $('#password').val();
//prepare params for authentication
var jObject = { Login: JSON.stringify([{ User: user_name, Password: pass, IsAdmin: "false" }]) };
//if mand. fields are filled then will go ahead
if(user_name != undefined || user_name != '' && pass != undefined || pass != '') {
	
	show_button_loading("btn-connect", $_LANG["connecting"]);
	ajax_form_submit(ps_url+'/api/login/ValidateUserLogin', jObject,function(res){
		if(res.Table.length > 0){
			response = res.Table;
			//Check whether the user is active or not 
			if(res.Table[0].OPTM_ACTIVE == 1){
			//Prepare params for getting company 
			var jObject = { Username: JSON.stringify([{ Username: user_name ,Product: "SWB"}]) };
		//getting company on basis of Username
		setTimeout(function(){
			ajax_form_submit(ps_url+'/api/login/GetCompaniesAndLanguages', jObject,function(res){
		//if data found we will populate the companies in the dropdown
		if(res.Table.length > 0){
			var company_selection = '<option value="">'+$_LANG['select_company']+'</option>';
			company_selection += generate_options(res.Table, 'OPTM_COMPID', 'OPTM_COMPID');
			$("#company").html(company_selection);
				//if pass & uname is wright we will show the dropdown
				$('#company').css('display','block');
				// $('#btn-login').css('display','block');
		//Change button name
		hide_button_loading("btn-connect", '<i class="fa fa-link"></i> ' + $_LANG["connected"]);
	}
	else{
		show_toast("error", is_product_permitted);
		$('#company').css('display','none');
		$('#btn-login').css('display','none');
		//Change button name
		hide_button_loading("btn-connect", '<i class="fa fa-plug"></i> ' + $_LANG["connect"]);
	}
},1);	

		} , default_pause);
	}
	else{
		show_toast("warning_gantt", user_deactivated);
		//Change button name
		hide_button_loading("btn-connect", '<i class="fa fa-plug"></i> ' + $_LANG["connect"]);
		//Again hide the elements
		$('#btn-login').css('display','none');
		$('#company').css('display','none');
	}
}
else{
	$('#company').css('display','none');
	$('#btn-login').css('display','none');
	show_toast("error", invalid_user_credentials);
	setTimeout(function(){
		hide_button_loading("btn-connect", '<i class="fa fa-plug"></i> ' + $_LANG["connect"]);
	}, default_pause);
}

},1);
}
}

function loginPress(){
		//If the Product is nmot assigned to the selected Data Base then we ill prompt an error
		show_button_loading("btn-login", $_LANG['plz_wait']);
		set_cookie('user_name',user_name);	
		set_cookie('is_logged_in',1);	
		set_cookie('company',($('#company :selected').text()).trim());	
		setTimeout(function(){
		//Afterwards navigate to this page
		window.location=scheduling_criteria_page_link;
	}, default_pause);
	}

