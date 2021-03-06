<?php /* -*- coding: utf-8 -*-*/
/* Pain - outil de gestion des services d'enseignement        
 *
 * Copyright 2009-2012 Pierre Boudes,
 * département d'informatique de l'institut Galilée.
 *
 * This file is part of Pain.
 *
 * Pain is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pain is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public
 * License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Pain.  If not, see <http://www.gnu.org/licenses/>.
 */
require_once('authentication.php'); 
$user = authentication();

require_once("inc_connect.php");
// require_once("inc_functions.php");

function lister_sections()
{
    global $link;
    $qcat = "SELECT id_section,".
                   "id_section AS `id`, ".
                   "CONCAT(id_section, ' ',TRIM(intitule_section)) AS `label`, ".
	           "intitule_section ".
	"FROM sectionscnu ".
	"ORDER BY id_section ASC";
    $rcat = $link->query($qcat) 
	or die("Échec de la requête sur la table sectionscnu: $qens mysql a repondu: ".$link->error);
    return $rcat;
}


/**
 */
function json_sections_php() {
    $rens = lister_sections();
    $arr = array();
    while ($ens = $rens->fetch_object()) {
	$arr[] = $ens;
    }
    return $arr;
}


if (isset($_GET["term"])) {
    $arr = json_sections_php();
    print json_encode($arr);
}
?>