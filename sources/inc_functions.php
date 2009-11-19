<?php /* -*- coding: utf-8 -*- */
/* Pain - outil de gestion des services d'enseignement        
 *
 * Copyright 2009 Pierre Boudes, département d'informatique de l'institut Galilée.
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

require_once("utils.php");
require_once("inc_actions.php");
require_once("inc_droits.php");


function ig_typeconversion($type)
{
    switch ($type) {
    case 0:
	echo "auto";
	break;
    case 1:
	echo "manuel";
	break;
    default:
	echo "inconnu"; /* jamais atteint */
    }
}

function ig_responsable($id)
{
    if ($id < 0) {
	echo "Libre"; /* jamais atteint */
    }
    if ($id == 0) {
	echo "Autre"; /* jamais atteint */
    }
    if ($id > 0) {
	$qresponsable = "SELECT * FROM pain_enseignant WHERE `id_enseignant` = $id";
	$rresponsable = mysql_query($qresponsable) 
	    or die("Échec de la requête sur la table enseignant");
	$responsable = mysql_fetch_array($rresponsable);
	echo $responsable["prenom"]." ";
	echo $responsable["nom"];
    }
}

function ig_formselectenseignants($id_enseignant)
{
    static $rens = 0;
    echo '<option value="3"><i>libre</i></option>';
    echo '<option value="2"><i>mutualisé</i></option>';
    echo '<option value="1"><i>annulé</i></option>';
    if (!$rens) {
	$qens = "SELECT `id_enseignant`, `prenom`, `nom` 
                 FROM pain_enseignant WHERE `id_enseignant` > 9 ORDER BY `nom`,`prenom` ASC";
	$rens = mysql_query($qens) 
	    or die("Échec de la requête sur la table enseignant");
    }
    while ($ens = mysql_fetch_array($rens)) {
	echo '<option ';
	if ($ens["id_enseignant"] == $id_enseignant) echo 'selected ';
	echo  'value="'.$ens["id_enseignant"].'">';
	echo $ens["prenom"]." ";
	echo $ens["nom"];
	echo '</option>';
    }
    echo '<option value="9"><i>autre</i></option>';
}


function list_formations()
{
    $qformation = "SELECT * FROM pain_formation 
                   WHERE `annee_universitaire` = 2009
                   ORDER BY numero ASC";    

    $rformation = mysql_query($qformation) 
	or die("Échec de la requête sur la table formation");

    return $rformation;
}

function list_cours($id)
{
      $qcours = "SELECT * FROM pain_cours WHERE `id_formation` = $id
                 ORDER BY semestre ASC";

    $rcours = mysql_query($qcours) or 
	die("Échec de la requête sur la table cours");

    return $rcours;
}


function selectionner_cours($id)
{
    $qcours = "SELECT * FROM pain_cours WHERE `id_cours` = $id";
    $cours = NULL;
    if ($rcours = mysql_query($qcours)) {
	$cours = mysql_fetch_array($rcours);
    } else {
	echo "Échec de la requête sur la table cours.";
    }
    return $cours;
}

function supprimer_cours($id)
{    
    if (peuteditercours($id)) {
	$qcours = "DELETE FROM pain_cours WHERE `id_cours` = $id LIMIT 1";
	pain_log("supprimer_cours($id)");

        if (mysql_query($qcours)) {
	    /* on efface les tranches associées */
	    $qtranches = "DELETE FROM pain_tranche WHERE `id_cours` = $id";	    
	    if (mysql_query($qtranches)) {
		echo "OK";
	    } else {
		echo "Échec de la requête sur la table tranches.";
	    }
	} else {
	    echo "Échec de la requête sur la table cours.";
	}
    } else {
	echo "Droits insuffisants.";
    }
}


function ig_cours($cours,$tag="")
{
    $id = $cours["id_cours"];
    
    echo '<td class="nom_cours">';
    echo $cours["nom_cours"];
    echo '</td>';
    
    echo '<td class="semestre">';
    action_basculercours($id);
    echo $cours["semestre"];
    echo '</td>';
    
    echo '<td class="credits">';
    echo $cours["credits"];
    echo '</td>';
    
    echo '<td class="responsable">';
    ig_responsable($cours["id_enseignant"]); 
    echo '</td>';
    
    echo '<td class="CM">';
    echo $cours["cm"];
    echo '</td>';
    
    echo '<td class="TD">';
    echo $cours["td"];
    echo '</td>';

    echo '<td class="TP">';
    echo $cours["tp"];
    echo '</td>';
    
    echo '<td class="alt">';
    echo $cours["alt"];
    echo '</td>';

    echo '<td class="descriptif">';
    echo $cours["descriptif"];
    echo '</td>';
    
    echo '<td class="code_geisha">';
    echo $cours["code_geisha"];
    echo '</td>';
   
    echo '<td class="action" id="cours'.$tag.$id.'">';
    action_supprimercours($id);
    echo '<br/>';
    action_modifiercours($id);
    echo '</td>';
}

function ig_formcours($id_formation, $id_cours="", $nom_cours="", $semestre=0, $id_enseignant = NULL, $credits = "", $cm = "", $td="", $tp="", $alt="", $descriptif="", $code_geisha = "")
{
    $id = $id_cours;    
    echo '<table class="formcours"><tr>';
    echo '<td class="nom_cours">';
    echo '<input type="text" name="nom_cours" value="'.$nom_cours.'"/></td>';
    echo '<td class="semestre">';
    echo '<input value="1" '; 
    if (1 == $semestre) echo 'checked ';
    echo 'type="radio" class="semestre" name="semestre"/>1<br/>';
    echo '<input value="2" ';
    if (2 == $semestre) echo 'checked ';
    echo 'type="radio" class="semestre" name="semestre"/>2</td>';
    echo '<td class="credits"><input type="text" name="credits" value="'.$credits.'" /></td>';
    echo '<td class="responsable">';
    echo '<select name="responsable_cours" class="autocomplete">';
    ig_formselectenseignants($id_enseignant);
    echo '</select>';
    echo '</td>';
    echo '<td class="CM"><input type="text" name="cm" value="'.$cm.'" /></td>';
    echo '<td class="TD"><input type="text" name="td" value="'.$td.'" /></td>';
    echo '<td class="TP"><input type="text" name="tp"  value="'.$tp.'" /></td>';
    echo '<td class="alt"><input type="text" name="alt" value="'.$alt.'" /></td>';
    echo '<td class="descriptif">';
    echo '<input type="hidden" name="id_formation" value="'.$id_formation.'"/>';
echo '<input type="hidden" name="id_cours" value="'.$id_cours.'"/>';
    echo '<textarea name="descriptif" rows="4" >'.$descriptif.'</textarea></td>';
    echo '<td class="code_geisha"><input type="text" name="code_geisha" value="'.$code_geisha.'" /></td>';
    if ($id) {/* modification de cours */
	echo '<td class="action" id="formmodifcours'.$id.'">';
        echo '<input type="submit" value="OK"/><br/>';
	action_annulermodifiercours($id);
    } else {
	echo '<td class="action"><input type="submit" value="OK"/><br/>';
	action_annulerajoutercours($id_formation);
    }
    echo '</td></tr></table>'."\n";    
}

function ig_legendecours($id_formation) {
    echo '<tr class="legende"><th class="nom_cours">intitulé</th><th class="semestre">semestre</th><th class="credits">crédits</th><th class="responsable">responsable</th><th class="CM">CM</th><th class="TD">TD</th><th class="TP">TP</th><th class="alt">alt.</th><th class="descriptif">remarque</th><th class="code_geisha">code</th>';
    echo '<th class="action">';
    action_nouveaucours($id_formation);
    echo '</th></tr>'."\n";

}


function ig_legendetranches($id) {
    echo '<th class="groupe">Groupe</th>';
    echo '<th class="enseignant">Enseignant</th>';
    echo '<th class="CM">CM</th>';
    echo '<th class="TD">TD</th>';
    echo '<th class="TP">TP</th>';
    echo '<th class="alt">alt.</th>';
    echo '<th class="type_conversion">conversion</th>';
    echo '<th class="HTD">htd</th>';
    echo '<th class="remarque">Remarque</th>';
    echo '<th class="action">';
    echo '</th>';
}

function tranchesdecours($id) {
    $qtranches = "SELECT * FROM pain_tranche WHERE `id_cours`=".$id." ORDER BY groupe ASC";

    $rtranches = mysql_query($qtranches) or 
	die(mysql_error());

    return $rtranches;
}

function selectionner_tranche($id)
{
    $qtranche = "SELECT * FROM pain_tranche WHERE `id_tranche` = $id";
    $tranche = NULL;
    if ($rtranche = mysql_query($qtranche)) {
	$tranche = mysql_fetch_array($rtranche);
    } else {
	echo "Échec de la requête sur la table tranche.";
    }
    return $tranche;
}


function ig_tranche($t,$tag="") {
    $id = $t["id_tranche"];
    echo '<tr class="tranche"';
    action_dblcmodifiertranche($id);
    echo '>';
    echo '<td class="groupe">'.$t["groupe"].'</td>';
    echo '<td class="enseignant">';
    echo ig_responsable($t["id_enseignant"]);
    echo '</td>';
    echo '<td class="CM">'.$t["cm"].'</td>';
    echo '<td class="TD">'.$t["td"].'</td>';
    echo '<td class="TP">'.$t["tp"].'</td>';
    echo '<td class="alt">'.$t["alt"].'</td>';
    echo '<td class="type_conversion">';
    ig_typeconversion($t["type_conversion"]);
    echo '</td>';
    echo '<td class="HTD">'.$t["htd"].'</td>';
    echo '<td class="remarque">'.$t["remarque"].'</td>';
    echo '<td class="action" id="tranche'.$tag.$id.'">';
    action_supprimertranche($id);
    echo '<br/>';
    action_modifiertranche($id);
    echo '</td>';
    echo '</tr>';
    echo "\n";
}

function ig_listtranches($tranches) {

    while ($tranche = mysql_fetch_array($tranches))
    {
	ig_tranche($tranche);
    }
}


function ig_formtranche($id_cours, $id_tranche = NULL, $cm = 0, $td= 0, $tp= 0, $alt= 0, $id_enseignant = -1, $groupe = 0, $type_conversion = 0, $remarque = "", $htd = 0)
{    
    echo '<tr class="formtranche">';
    echo '<td class="groupe">';
    echo '<input type="text" name="groupe" value="'.$groupe.'" />';
    echo '</td>';
    echo '<td class="enseignant">';
    echo '<select name="id_enseignant" class="autocomplete">';
    ig_formselectenseignants($id_enseignant);
    echo '</select>';
    echo '</td>';
    echo '<td class="CM">';
    echo '<input type="text" name="cm" value="'.$cm.'" />';
    echo '</td>';
    echo '<td class="TD">'; 
    echo '<input type="text" name="td" value="'.$td.'" />';
    echo '</td>';
    echo '<td class="TP">'; 
    echo '<input type="text" name="tp" value="'.$tp.'" />';
    echo '</td>';
    echo '<td class="alt">';
    echo '<input type="text" name="alt" value="'.$alt.'" />';
    echo '</td>';
    echo '<td class="type_conversion">'; 
    echo '<input value="0" '; 
    if (0 == $type_conversion) echo 'checked ';
    echo 'type="radio" class ="type_conversion" name="type_conversion" />auto<br/>';
    echo '<input value="1" ';
    if (1 == $type_conversion) echo 'checked ';
    echo 'type="radio" class ="type_conversion" name="type_conversion"/>manuel</td>';
    echo '</td>';
    echo '<td class="HTD">';
    echo '<input type="text" name="htd" value="'.$htd.'" />';
    echo '</td>';
    echo '<td class="remarque">';
    echo '<input type="hidden" name="id_cours" value="'.$id_cours.'"/>';
    if ($id_tranche != NULL) {
	echo '<input type="hidden" name="id_tranche" value="'.$id_tranche.'"/>';
    }
    echo '<textarea name="remarque" rows="2" >';
    echo $remarque;
    echo '</textarea></td>';
    echo '<td class="action">';
    action_envoyertrancheducours($id_cours, $id_tranche);
    if ($id_tranche != NULL) {
	action_annulermodifiertranche($id_tranche);
    }
    echo '<br/>';
    echo '</td>';
    echo '</tr>';
}


function supprimer_tranche($id)
{
    if (peuteditertranche($id)) {
	$qtranche = "DELETE FROM pain_tranche WHERE `id_tranche` = $id
                 LIMIT 1";
	pain_log("supprimer_tranche($id)");

	
	if (mysql_query($qtranche)) {
	    echo "OK";
	} else {
	    echo "Échec de la requête sur la table cours.";
	}
    } else {
	echo "Droits insuffisants.";
    }
}


function ig_legendeenseignant() {
    echo '<tr>';
    echo '<th class="prenom">Prénom</th>';
    echo '<th class="nom">Nom</th>';
    echo '<th class="statut">statut</th>';
    echo '<th class="email">email</th>';
    echo '<th class="tel">tel</th>';
    echo '<th class="bureau">bureau</th>';
    echo '<th class="service">service plein statutaire</th>';
    echo '<th></th>';
    echo '</tr>';
    echo "\n";
}

function ig_enseignant($t) {
    $id = $t["id_enseignant"];
    echo '<tr class="enseignant">';
    echo '<td class="prenom">'.$t["prenom"].'</td>';
    echo '<td class="nom">'.$t["nom"].'</td>';
    echo '<td class="statut">'.$t["statut"].'</td>';
    echo '<td class="email">'.$t["email"].'</td>';
    echo '<td class="tel">'.$t["telephone"].'</td>';
    echo '<td class="bureau">'.$t["bureau"].'</td>';
    echo '<td class="service">'.$t["service"].'</td>';
    echo '<td class="action" id="enseignant'.$t["id_enseignant"].'"></td>';
    echo '</tr>';
    echo "\n";
}

function ig_listenseignants() {
    $q = "SELECT * from pain_enseignant WHERE id_enseignant > 9 ORDER by nom,prenom ASC";
    ($r = mysql_query($q)) or die("Échec de la connexion à la base enseignant");
    while ($t = mysql_fetch_array($r))
    {
	ig_enseignant($t);
    }
}

function ig_formenseignant()
{
    echo '<tr class="enseignant">';
    echo '<td class="prenom"><input type="text" name="prenom" value="" /></td>';
    echo '<td class="nom"><input type="text" name="nom" value="" /></td>';
    echo '<td class="statut"><input type="text" name="statut" value="" /></td>';
    echo '<td class="email"><input type="text" name="email" value="" /></td>';
    echo '<td class="tel"><input type="text" name="telephone" value="" /></td>';
    echo '<td class="bureau"><input type="text" name="bureau" value="" /></td>';
    echo '<td class="service"><input type="text" name="service" value="1" /></td>';
    echo '<td>';
    echo '<input type="submit" value="Ajouter"/>';
    echo '</td>';
    echo '</tr>';
    echo "\n";
}


function htdtotaux($annee = "2009") {    
    $qservi ='SELECT SUM(htd) FROM pain_formation, pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND pain_formation.id_formation = pain_cours.id_formation AND annee_universitaire = '.$annee.' AND pain_tranche.id_enseignant > 8 AND pain_cours.id_enseignant <> 1';

    $rservi = mysql_query($qservi) 
	or die("erreur d'acces aux tables : $qservi erreur:".mysql_error());

    $servi = mysql_fetch_assoc($rservi);
    $servi = $servi["SUM(htd)"];
    if ($servi == "") {
	$servi = 0;
    } 

    $qmutualise ='SELECT SUM(htd) FROM pain_formation, pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND pain_formation.id_formation = pain_cours.id_formation AND annee_universitaire = '.$annee.' AND pain_tranche.id_enseignant = 2 AND pain_cours.id_enseignant <> 1';

    $rmutualise = mysql_query($qmutualise) 
	or die("erreur d'acces aux tables : $qmutualise erreur:".mysql_error());

    $mutualise = mysql_fetch_assoc($rmutualise);
    $mutualise = $mutualise["SUM(htd)"];
    if ($mutualise == "") {
	$mutualise = 0;
    }

    $qlibre ='SELECT SUM(htd) FROM pain_formation, pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND pain_formation.id_formation = pain_cours.id_formation AND annee_universitaire = '.$annee.' AND pain_tranche.id_enseignant = 3 AND pain_cours.id_enseignant <> 1';

    $rlibre = mysql_query($qlibre) 
	or die("erreur d'acces aux tables : $qlibre erreur:".mysql_error());

    $libre = mysql_fetch_assoc($rlibre);
    $libre = $libre["SUM(htd)"];
    if ($libre == "") {
	$libre = 0;
    } 

    $qannule ='SELECT SUM(htd) FROM pain_formation, pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND pain_formation.id_formation = pain_cours.id_formation AND annee_universitaire = '.$annee.' AND (pain_tranche.id_enseignant = 1 OR pain_cours.id_enseignant = 1)';
    $rannule = mysql_query($qannule) 
	or die("erreur d'acces aux tables : $qannule erreur:".mysql_error());

    $annule = mysql_fetch_assoc($rannule);
    $annule = $annule["SUM(htd)"];
    if ($annule == "") {
	$annule = 0;
    } 

    $qtp ='SELECT SUM(pain_tranche.tp) AS tp FROM pain_formation, pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND pain_formation.id_formation = pain_cours.id_formation AND annee_universitaire = '.$annee;
    $rtp = mysql_query($qtp) 
	or die("erreur d'acces aux tables : $qtp erreur:".mysql_error());

    $tp = mysql_fetch_assoc($rtp);
    $tp = $tp["tp"];
    if ($tp == "") {
	$tp = 0;
    } 

    return array("servi"=>$servi, 
		 "libre"=>$libre,
		 "mutualise"=>$mutualise,
		 "annule"=>$annule,
		 "tp"=>$tp);
}


function htdformation($id) {

    $qservi = 'SELECT SUM(htd) FROM pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND id_formation = '.$id.' AND pain_tranche.id_enseignant > 8 AND pain_cours.id_enseignant <> 1';
    $rservi = mysql_query($qservi) 
	or die("erreur d'acces aux tables : $qservi erreur:".mysql_error());

    $servi = mysql_fetch_assoc($rservi);
    $servi = $servi["SUM(htd)"];
    if ($servi == "") {
	$servi = 0;
    } 

   $qmutualise = 'SELECT SUM(htd) FROM pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND id_formation = '.$id.' AND pain_tranche.id_enseignant = 2 AND pain_cours.id_enseignant <> 1';
    $rmutualise = mysql_query($qmutualise) 
	or die("erreur d'acces aux tables : $qmutualise erreur:".mysql_error());

    $mutualise = mysql_fetch_assoc($rmutualise);
    $mutualise = $mutualise["SUM(htd)"];
    if ($mutualise == "") {
	$mutualise = 0;
    } 
    
    $qlibre = 'SELECT SUM(htd) FROM pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND id_formation = '.$id.' AND pain_tranche.id_enseignant = 3 AND pain_cours.id_enseignant <> 1';
    $rlibre = mysql_query($qlibre) 
	or die("erreur d'acces a la table tranche : $qlibre erreur:".mysql_error());
    
    $libre = mysql_fetch_assoc($rlibre);
    $libre = $libre["SUM(htd)"];
    if ($libre == "") {
	$libre = 0;
    }
    
    $qannule = 'SELECT SUM(htd) FROM pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND id_formation = '.$id.' AND (pain_tranche.id_enseignant = 1 OR pain_cours.id_enseignant = 1)';
    $rannule = mysql_query($qannule) 
	or die("erreur d'acces a la table tranche : $qannule erreur:".mysql_error());

    $annule = mysql_fetch_assoc($rannule);
    $annule = $annule["SUM(htd)"];
    if ($annule == "") {
	$annule = 0;
    }

 $qtp = 'SELECT SUM(pain_tranche.tp) AS tp FROM pain_cours, pain_tranche WHERE pain_tranche.id_cours = pain_cours.id_cours AND id_formation = '.$id;
    $rtp = mysql_query($qtp) 
	or die("erreur d'acces a la table tranche : $qtp erreur:".mysql_error());

    $tp = mysql_fetch_assoc($rtp);
    $tp = $tp["tp"];
    if ($tp == "") {
	$tp = 0;
    }

    return array("servi"=>$servi, 
		 "libre"=>$libre, 
		 "mutualise"=>$mutualise,
		 "annule"=>$annule, 
		 "tp"=>$tp);
}


function responsableducours($id) {
    $qresponsable = 'SELECT id_enseignant FROM pain_cours WHERE id_cours = '.$id;
    $rresponsable = mysql_query($qresponsable)
	or die("erreur d'acces a la table cours : $qresponsable erreur:".mysql_error());
    $responsable = mysql_fetch_assoc($rresponsable);
    return $responsable["id_enseignant"];    
}

function htdcours($id) {

    $qservi = 'SELECT SUM(htd) FROM pain_tranche WHERE id_cours = '.$id.' AND id_enseignant > 8';
    $rservi = mysql_query($qservi) 
	or die("erreur d'acces a la table tranche : $qservi erreur:".mysql_error());

    $servi = mysql_fetch_assoc($rservi);
    $servi = $servi["SUM(htd)"];
    if ($servi == "") {
	$servi = 0;
    } 

    $qmutualise = 'SELECT SUM(htd) FROM pain_tranche WHERE id_cours = '.$id.' AND id_enseignant = 2';
    $rmutualise = mysql_query($qmutualise) 
	or die("erreur d'acces a la table tranche : $qmutualise erreur:".mysql_error());
    
    $mutualise = mysql_fetch_assoc($rmutualise);
    $mutualise = $mutualise["SUM(htd)"];
    if ($mutualise == "") {
	$mutualise = 0;
    }

    $qlibre = 'SELECT SUM(htd) FROM pain_tranche WHERE id_cours = '.$id.' AND id_enseignant = 3';
    $rlibre = mysql_query($qlibre) 
	or die("erreur d'acces a la table tranche : $qlibre erreur:".mysql_error());

    $libre = mysql_fetch_assoc($rlibre);
    $libre = $libre["SUM(htd)"];
    if ($libre == "") {
	$libre = 0;
    }

    $qannule = 'SELECT SUM(htd) FROM pain_tranche WHERE id_cours = '.$id.' AND id_enseignant = 1';
    $rannule = mysql_query($qannule) 
	or die("erreur d'acces a la table tranche : $qannule erreur:".mysql_error());
    
    $annule = mysql_fetch_assoc($rannule);
    $annule = $annule["SUM(htd)"];
    if ($annule == "") {
	$annule = 0;
    }

    $qtp = 'SELECT SUM(tp) FROM pain_tranche WHERE id_cours = '.$id;
    $rtp = mysql_query($qtp) 
	or die("erreur d'acces a la table tranche : $qtp erreur:".mysql_error());
    
    $tp = mysql_fetch_assoc($rtp);
    $tp = $tp["SUM(tp)"];
    if ($tp == "") {
	$tp = 0;
    }

    if (responsableducours($id) == 1) {/* cours annulé */
	$annule += $servi + $libre + $mutualise;
	$servi = $libre = $mutualise = 0;
    }

    return array("servi"=>$servi, 
		 "libre"=>$libre, 
		 "annule"=>$annule, 
		 "mutualise"=>$mutualise,
		 "tp"=>$tp);
}

function ig_htd($totaux) {
echo $totaux["servi"].'H servies, '.$totaux["mutualise"].'H mutualisées, '.$totaux["libre"].'H à pourvoir, '.$totaux["annule"].'H annulées ('.$totaux["tp"].'H TP)'."\n";
}


function listeinterventions($id_enseignant) {
    $query = "SELECT 
pain_tranche.id_tranche,
pain_formation.nom,
pain_formation.annee_etude,
pain_formation.parfum,
pain_cours.semestre,
pain_cours.nom_cours,
pain_tranche.groupe,
pain_tranche.cm,
pain_tranche.td,
pain_tranche.tp,
pain_tranche.alt,
pain_tranche.htd,
pain_tranche.remarque
FROM pain_tranche, pain_cours, pain_formation
WHERE ".(($id_enseignant == 1)?
	 "(pain_tranche.id_enseignant = 1 OR pain_cours.id_enseignant = 1)"
	 :"pain_tranche.id_enseignant =".$id_enseignant." AND pain_cours.id_enseignant <> 1")."
AND pain_tranche.id_cours = pain_cours.id_cours
AND pain_cours.id_formation = pain_formation.id_formation
AND pain_formation.annee_universitaire = '2009'
ORDER by pain_formation.numero ASC, pain_cours.semestre ASC";


/* avec une jointure
SELECT *
FROM pain_tranche, pain_cours
WHERE pain_tranche.id_cours = pain_cours.id_cours
AND pain_tranche.id_enseignant =10
LIMIT 0 , 30
*/

/* jointure sur 3 tables ?
SELECT *
FROM pain_tranche, pain_cours, pain_formation
WHERE pain_tranche.id_enseignant =10
AND pain_tranche.id_cours = pain_cours.id_cours
AND pain_cours.id_formation = pain_formation.id_formation
ORDER by pain_formation.numero ASC, pain_cours.semestre ASC
*/

/* avec des sous requêtes 
SELECT *, (SELECT nom_cours FROM pain_cours where pain_cours.id_cours = pain_tranche.id_cours) AS nom_cours FROM pain_tranche WHERE id_enseignant = 10}
*/

    ($result = mysql_query($query)) or die("Échec de la connexion à la base enseignant");
    return $result;
}

function ig_legendeintervention() {
    echo '<th class="formation">formation</th>';
    echo '<th class="nom_cours">intitulé</th>';
    echo '<th class="semestre">semestre</th>';
    echo '<th class="groupe">Groupe</th>';
    echo '<th class="CM">CM</th>';
    echo '<th class="TD">TD</th>';
    echo '<th class="TP">TP</th>';
    echo '<th class="alt">alt.</th>';
/*     echo '<th class="type_conversion">conversion</th>'; */
    echo '<th class="HTD">htd</th>';
    echo '<th class="remarque">Remarque</th>';
}

function ig_intervention($i) {
    $id = $i["id_tranche"];
    echo '<td class="formation">';
    echo $i["nom"]." ".$i["annee_etude"]." ";
    echo $i["parfum"];
    echo '</td>';
    echo '<td class="nom_cours">';
    echo $i["nom_cours"];
    echo '</td>';    
    echo '<td class="semestre">';
    echo $i["semestre"];
    echo '</td>';
    echo '<td class="groupe">'.$i["groupe"].'</td>';
/*    echo '<td class="enseignant">';
    echo ig_responsable($i["pain_tranche.id_enseignant"]);
    echo '</td>'; */
    echo '<td class="CM">'.$i["cm"].'</td>';
    echo '<td class="TD">'.$i["td"].'</td>';
    echo '<td class="TP">'.$i["tp"].'</td>';
    echo '<td class="alt">'.$i["alt"].'</td>';
/*    echo '<td class="type_conversion">';
    ig_typeconversion($i["pain_tranche.type_conversion"]);
    echo '</td>'; */
    echo '<td class="HTD">'.$i["htd"].'</td>';
    echo '<td class="remarque">'.$i["remarque"].'</td>';
}


function ig_totauxinterventions($id_enseignant) {
    $query = "SELECT 
SUM(pain_tranche.cm) AS cm,
SUM(pain_tranche.td) AS td,
SUM(pain_tranche.tp) AS tp,
SUM(pain_tranche.alt) AS alt,
SUM(pain_tranche.htd) AS htd
FROM pain_tranche, pain_cours, pain_formation
WHERE ".(($id_enseignant == 1)?
	 "(pain_tranche.id_enseignant = 1 OR pain_cours.id_enseignant = 1)"
	 :"pain_tranche.id_enseignant =".$id_enseignant." AND pain_cours.id_enseignant <> 1")."
AND pain_tranche.id_cours = pain_cours.id_cours
AND pain_cours.id_formation = pain_formation.id_formation
AND pain_formation.annee_universitaire = '2009'
ORDER by pain_formation.numero ASC, pain_cours.semestre ASC";

    ($result = mysql_query($query)) or die("Échec de la connexion à la base enseignant");

    if ($totaux = mysql_fetch_array($result)) {
	echo '<th style="text-align:right;" colspan= 4>';
	echo 'totaux';
	echo '</th>';
	echo '<td class="CM">'.$totaux["cm"].'</td>';
	echo '<td class="TD">'.$totaux["td"].'</td>';
	echo '<td class="TP">'.$totaux["tp"].'</td>';
	echo '<td class="alt">'.$totaux["alt"].'</td>';
	echo '<td class="HTD">'.$totaux["htd"].'</td>';
	echo '<th></th>';
    }
}


function stats($valeur,$ou) {
 $qstat = 'SELECT '.$valeur.' FROM '.$ou;
    $rstat = mysql_query($qstat) 
	or die("erreur d'acces a la table : $qstat erreur:".mysql_error());
    
    $stat = mysql_fetch_assoc($rstat);
    $stat = $stat["$valeur"];
    if ($stat == "") {
	$stat = 0;
    }
    return $stat;
}

?>