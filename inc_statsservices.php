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
authrequired();
require_once("inc_connect.php");
require_once("inc_functions.php");

function ig_depassementparcategorie($categorie) {
    $r = liste_enseignantscategorie($categorie);
    $negtot = $postot = $pottot = 0;
    echo '<div style="margin-top: 10px;">';
    while ($e = $r->fetch_assoc()) {
	echo "<div style='border-right: 1px black solid; border-bottom: 1px black dotted; border-top: 0px; border-left: 0px; width: 400px; height: 18px; padding-top:2px; clear: both;'>";
	echo '<a href="service.php?id_enseignant='.$e["id_enseignant"].'">';
	echo $e["prenom"]." ".$e["nom"];
	echo "</a> (".$e["service"].")";
	$d = $e["service_reel"] - $e["service"];
	if ($d < 0) {/* negatif */
	    $largeur = round(-$d);
	    echo "<div style='background-color: #FF0000; width: ".$largeur."px; height: 16px; float: right;'></div>";
	    $negtot += $d;
	$dd = $e["service_potentiel"] - $e["service_reel"];
	$largeur = round($dd - 2);
	echo "<div class='graphdepassementpotentiel' style='width: ".$largeur."px; margin-right: -".($largeur + 2)."px;'></div>";
	$pottot += $dd;
	} else {/* positif */
	$dd = $e["service_potentiel"] - $e["service"];
	$largeur = round($dd - 2);
	echo "<div class='graphdepassementpotentiel' style='width: ".$largeur."px; margin-right: -".($largeur + 2)."px;'></div>";
	$pottot += $dd;
	    $largeur = round($d);
	    echo "<div style='background-color: #00FF00; width: ".$largeur."px; height: 16px; margin-right: -".($largeur + 1)."px; float: right;'></div>";
	    $postot += $d;
	}
	echo "<div style='float:right;'>".$d."</div>";
	echo "</div>";
    }
    echo "<div style='text-align: right; border-right: 1px black solid; width: 350px; clear: both;'>";
    echo "Totaux : ".$negtot;
    echo "<div style='text-align: left; width: 100px; height: 16px; margin-right: -101px; float: right;'>".$postot."</div>";
    echo '</div>';
    echo '</div>';
}

/* permanents */

echo "<h3>Dépassements de service des permanents</h3>";
ig_depassementparcategorie(2);

/* Non permanents */
echo "<h3>Dépassements de service des non-permanents</h3>";
ig_depassementparcategorie(3);

/* Autres categories */
for ($categorie = 4; $categorie < 7; $categorie += 1) {
    $nom = selectionner_categorie($categorie)["nom_long"];
    echo "<h3>Dépassements de service dans la catégorie $nom</h3>";
    ig_depassementparcategorie($categorie);
}
?>