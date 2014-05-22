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
?>
<div class="infobox" id="infobox">
<p>Bonjour <?php echo $user["prenom"]." ".$user["nom"]; 
if ($user['su']) { echo '<p style="color:red;font-weight:bold;">Attention vous etes administrateur.'; } ?>
</p>
<p>En cas de problème d'affichage : recharger la page.</p>

<p align="justify">Vous utilisez actuellement pain <a href="https://www-lipn.univ-paris13.fr/projects/licences/milestone/Doré" title="développement de Doré">doré</a>.  Merci de <b>signaler les erreurs</b> ou faire vos demandes d'amélioration, en émettant un ticket : vérifier que le bug n'est pas <a href="https://www-lipn.univ-paris13.fr/projects/licences/query?group=status&amp;milestone=Doré" title="liste de tous les tickets pour Doré">déjà signalé dans un ticket</a> avant de <a href="https://www-lipn.univ-paris13.fr/projects/licences/newticket?milestone=Doré" title="Créer un ticket pour le jalon Doré">créer un nouveau ticket</a>.</p>
<!--
<p>La  <a href="https://www-lipn.univ-paris13.fr/projects/licences/wiki/AccueilPain" title="Accueil pain">page web de pain</a> contient des informations complémentaires.</p>
-->
<table class="tableinfobox"><tbody><tr>
<td class="tableinfobox">Cliquez sur les chariots pour indiquez vos souhaits:</td>
<td class="tableinfobox"><span class="ui-button-text ui-icon ui-icon-cart"></span></td>
</tr></tbody></table>
<p>Aide en ligne : <button id="basculeAide" class="aideOff">aide</button>

&nbsp;<A href="http://www-info.iutv.univ-paris13.fr/~butelle/PPN2013_6.8.pdf">PPN 2013 Ver. 6.8</A>
</p>
</div>
