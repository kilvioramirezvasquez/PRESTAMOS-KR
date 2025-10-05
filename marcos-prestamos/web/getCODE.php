<?php
header("Content-type:application/json");



$CODE["efictec"]['SERV']  = "http://efictec.inmofy.com/WS/";
$CODE["efictec"]['EMPR']  = "Efictec";
$CODE["efictec"]['OTHER'] = "";


$CODE["marcos"]['SERV']  = "https://invmarcos.ddns.net/WS/";
$CODE["marcos"]['EMPR']  = "Inversiones Marcos";
$CODE["marcos"]['OTHER'] = "";


$CODE["joseluis"]['SERV']  = "https://invjoseluis.ddns.net/WS/";
$CODE["joseluis"]['EMPR']  = "INVERSIONES JL";
$CODE["joseluis"]['OTHER'] = "";

$CODE["invjunior"]['SERV']  = "https://invjunior.ddns.net/WS/";
$CODE["invjunior"]['EMPR']  = "INVERSIONES JUNIOR";
$CODE["invjunior"]['OTHER'] = "";

if($CODE[$_GET['v']]['SERV']!="")
{
	$res = $CODE[$_GET['v']];
	$res['c'] = "1";
}
else
{
	$res['c'] = "0";
}
echo json_encode($res);

?>