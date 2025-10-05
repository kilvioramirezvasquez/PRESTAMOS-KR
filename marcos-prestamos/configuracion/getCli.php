<?php
$serv = $_SERVER['SERVER_NAME'];
if(substr_count($serv,"invmarcos.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_invmarcos";
    $dbPass	= "invmarcos*9#10H75_10$6;52";
    $db="prestamos_invmarcos";
    $dir="invmarcos";
    $EMP = "marcos";
}

if(substr_count($serv,"invjoseluis.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_invjoseluis";
    $dbPass	= "invjoseluis*5#9H86_5$3;15";
    $db="prestamos_invjoseluis";
    $dir="invjoseluis";
    $EMP = "joseluis";
}

if(substr_count($serv,"invjunior.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_invjunior";
    $dbPass	= "invjunior*7#3H18_2$9;88";
    $db="prestamos_invjunior";
    $dir="invjunior";
    $EMP = "invjunior";
}

if(substr_count($serv,"negociossk.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_reymond";
    $dbPass	= "reymond*8#9H32_2$4;91";
    $db="prestamos_reymond";
    $dir="reymond";
    $EMP = "reymond";
}

if(substr_count($serv,"invefictec.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_efictec";
    $dbPass	= "efictec*2#9H410_7$5;64";
    $db="prestamos_efictec";
    $dir="efictec";
    $EMP = "efictec";
}

if(substr_count($serv,"invtomy.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_invtomy";
    $dbPass	= "invtomy*10#2H57_10$3;99";
    $db="prestamos_invtomy";
    $dir="invtomy";
    $EMP = "tomy";
}

if(substr_count($serv,"invyoamthy.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_invyoamthy";
    $dbPass	= "invyoamthy*5#10H84_10$3;88";
    $db="prestamos_invyoamthy";
    $dir="invyoamthy";
    $EMP = "yoamthy";
}

if(substr_count($serv,"pruebaprueba.ddns.net")>0  )
{
    $dbHost = "localhost";
    $dbUser	= "p_prueba";
    $dbPass	= "prueba*9#9H110_7$7;41";
    $db="prestamos_prueba";
    $dir="prueba";
    $EMP = "prueba";
}
