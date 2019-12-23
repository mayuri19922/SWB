<?php

$time_format = 'H:i';
$date_formt = "d-m-Y $time_format";
$date_formt_notime = "d-m-Y";
$db_date_only_format = "Y-m-d"; 
$db_date_format = $db_date_only_format." ".$time_format;
$int_time_format  = "Gi";
$log_path = "logs/";


function log_data($action, $data){
    global $log_path;
    global $date_formt_notime;
    global $date_formt;
    $log_data = array(
        "date" => date($date_formt),
        "action"=>$action,
        "query"=> $data,
    );

    $file_name = $log_path.''.date($date_formt_notime).'.log';

    file_put_contents( $file_name,json_encode($log_data). "\n\n",FILE_APPEND);
}

function utf8_string_array_encode(&$array){
    $func = function(&$value,&$key){  
        if(is_string($value)){
            $value = utf8_encode($value);
        } 
        if(is_string($key)){
            $key = utf8_encode($key);
        }
        if(is_array($value)){
            utf8_string_array_encode($value);
        }
    };
    array_walk($array,$func);
    return $array;
}

// utf8_string_array_encode(&$array);
$string = "Preparación pasta";
print_r(array("data" => array(
array("key" => "HORNO",  "label" => "Horno"),
array("key" => "PRENSADO",  "label" => "Prensado"),
array("key" => "TORNEADO",  "label" => "Torneado"),
array("key" => "ENSAMBLE",  "label" => "Ensamble"),
array("key" => "CALIDAD",  "label" => "Calidad"),
array("key" => "TM-CORTE", "label"=>  "TM-Corte"),
array("key" => "TM-CORTE", "label" => "TM-Corte"),
array("key" => "TM-TAPAS", "label"=>  "TM-Tapas"),
array("key" => "TM-CUERPO", "label"=>  "TM-Cuerpo"),
array("key" => "TM-ARMADO", "label"=>  "TM-Armado"),
array("key" => "TM-CALIDAD",  "label" => "TM_Calidad"),
array("key" => "TM-PRUEBA HIDRO", "label" => "TM-Prueba Hidro"),
array("key" => "BB-0001", "label"=>  "BB-0001"),
array("key" => "OX-ROL1", "label" => "ROLADO Y CONFORMADO"),
array("key" => "OX-CORDES", "label" => "CORTE A DESAROLLOA"),
array("key" => "OX-ABOCIN",  "label" => "ABOCINADO"),
array("key" => "OX-DOBPUN", "label" => "Dobladora de puntas"),
array("key" => "OX-CORHUE", "label"=>  "CORTE HUELLA"),
array("key" => "OX-SOLINS", "label"=>  "SOLDADURA INSERTO"),
array("key" => "OX-LIJBAN", "label" => "LIJADO DE BANDA"),
array("key" => "OX-FLAPEA",  "label" => "FLAPEADO"),
array("key" => "OX-MACHU",  "label" => "MAQUINADO"),
array("key" => "OX-CARDEA",  "label" => "CARDEADO"),
array("key" => "ACP-MOLIENDA",  "label" => "Molienda"),
array("key" => "R/ENSEST", "label"=>  "Ensamble estructural"),
array("key" => "R/ENSELE", "label"=>  "Ensamble Eléctrico"),
array("key" => "R/CABLEA",  "label" => "CABLEADO"),
array("key" => "R/ENSFIN", "label"=>  "Ensamble final"),
array("key" => "R/DETPRE", "label" => "Detallado ,  preparación de envió"),
array("key" => "ACP-PREPAS", "label"=>  "Preparación pasta"),
array("key" => "ACP-CABMAQ", "label" => "Cabeza de maquina"),
array("key" => "ACP-MESFOR", "label" => "Mesa de Formación"),
array("key" => "ACP-PRENSA",  "label" => "Prensado"),
array("key" => "ACP-SECADO",  "label" => "Secado"),
array("key" => "ACP-BOBINA",  "label" => "Bobinado"),
array("key" => "ACP-REBOBIN",  "label" => "Rebobinado"),
array("key" => "AC-COLMAT", "label"=>  "Colocación Matriz"),
array("key" => "AC-COLADO",  "label" => "COLADO"),
array("key" => "AC-ROLADORA",  "label" => "Roladora"),
array("key" => "AC-CORTADORA",  "label" => "Cortadora"),
array("key" => "AC-HORNO",  "label" => "Horno")
)));





// log_data("uninstall_SWB", "SELECT * FROM test table");

/*$res = array
(
    'success' => 1,
    'data' => array
    (
        0 =>array
        (
            'current_id' => 1518588494717,
            'new_id' => 77
        ),

        1 =>array
        (
            'current_id' => 1518588494718,
            'new_id' => 78
        )

    ),

    'links' => array
    (
        '0' =>array
        (
            'current_id' => 1518588494719,
            'new_id' => 51
            ,
        ),

        'new_source_target' => array
        (
            '51'=> array
            (
                'source' => 1518588494717,
                'target' => 78
            ),

        ),
    )
);


$res = array(
    'success' => 1,
    'data' => array(
            52 => array(
                    'current_id' => 1518592204280,
                    'new_id' => 52,
                ),

            53 => array(
                    'current_id' => 1518592204281,
                    'new_id' => 53,
                ),

        ),

    'links' => array(
            '0' => array(
                    'current_id' => 1518592204282,
                    'new_id' => 32,
                ),

        ),
    'new_source_target' => array(
            '32' => array(
                    'source' => 1518592204280,
                    'target' => 12345678,
                ),

        )

);  


$ext = get_loaded_extensions();
asort($ext);
foreach ($ext as $ref) {
    echo $ref . "<br>";
}*/



/*print_r($res['data']);

$source_key = array_search(1518592204281 , array_column($res['data'], 'current_id'));
echo  'source key - '. $source_key;
echo '<br>';
            if(!empty($source_key) ){
               echo 'in here '.  $res['data'][$source_key]['new_id'];
            }*/



/*$all_version_list = array('0.0.1', '0.0.2', '0.0.3');
$db_version = '0.0.3'; 
$filered_versions= array_filter($all_version_list, function($ver ) use($db_version) { 
return ($ver > $db_version);
});
print_r($filered_versions);*/
?>
