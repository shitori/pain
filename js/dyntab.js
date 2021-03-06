/* -*- coding: utf-8 -*-*/
/* Pain - outil de gestion des services d'enseignement
 *
 * Copyright 2009-2015 Pierre Boudes, département d'informatique de l'institut Galilée.
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

"use strict"; /* From now on, lets pretend we are strict */

var config_choisir_tout_cours = false; /* faire un vrai systeme de configuration ! */
var hasTouch = false;
var clickeditmode = false;
var extendedcommand = false;

$(document).ready(function(){
	var agent = navigator.userAgent.toLowerCase();
	if(agent.indexOf('iphone') >= 0
	   || agent.indexOf('ipad') >= 0
	   || agent.indexOf('android') >= 0){
	    hasTouch = true;
	}
  (function () {/* espace de nom privé */
    var timerid;
    var timerextend;

    $(document).keypress(function (e) {
      if (e.which == (97 + 23) ) { /* a = 97, ajouter 23 donne x */
        window.clearTimeout(timerextend);
        timerextend = window.setTimeout(function () {
          extendedcommand = false;
          console.log('extended command off')
        }, 2000); /* 2s après */
        extendedcommand = true;
        console.log('extended command on !')
        return true;
      }
      return true;
    }
                        );


	    function clickedit () {
		var bouton = $('#bouton-clickedit');
		bouton.button('option','text',true); /* voir le texte... */
		/* ...mais on doit le forcer en dur est-ce un bug jquery ui ? */
		bouton.removeClass('ui-button-icon-only').addClass('ui-button-text-icon');
		if (!clickeditmode) {
		    bouton.button('option', 'label','édition activée');
		    bouton.button('option','icons', {primary: 'ui-icon-unlocked'});
		    bouton.button('refresh');
		    clickeditmode = true;
		} else {
		    bouton.button('option', 'label','édition désactivée');
		    bouton.button('option','icons', {primary: 'ui-icon-locked'});
		    bouton.button('refresh');
		    clickeditmode = false;
		}
		window.clearTimeout(timerid);
		timerid = window.setTimeout(function () {
			bouton.button('option','text',false);
		    }, 3000); /* 10s après */
	    }

	    if (hasTouch) {
		$('#menu')
		    .before('<button id="bouton-clickedit" class="bouton-clickedit">édition</button>');
		$('#bouton-clickedit').button(
		    {text: true,
			    icons: {
			primary: "ui-icon-locked"
				}
		    });
		$('#bouton-clickedit').bind('click', clickedit);
	    };
	})();
    });



/* OBJET LIGNE */

var L;                  /* variable globale pour l'objet générique ligne */

/* BLOC ---- CONSTRUCTION DE L'OBJET LIGNE --------------*/
/*
bd : ligne_bd, tableau associatif (objet js) colonne => val.
html : ligne de tableau contenant des cellules (td)
js : objet cellule de nom la classe du td, qui fait le lien entre la bd et le tableau.
Nom de cellule (td, js) et nom de colonne coincident sauf quelques cas particuliers.
setval(cellule_jquery, ligne_bd) : insere la valeur bd dans le html
edit(cellule_jquery) passe la cellule html en mode edition par l'utilisateur
getval(cellule_jquery, ligne_bd) insere la valeur html dans la ligne bd

-Cas particuliers :
1) cellule: enseignant | colonnes: nom prenom id | choix utilisateur: liste
2) cellule: timestamp <-- non utilisee
3) cellule: intitule | colonnes: nom annee_etude parfum | non modifiable
*/

/* constructeur de cellule */
function cell() {
    this.name ="cell";
    this.mutable = true;
    this.oneclickedit = false;

    /* passer la cellule en mode edition */
    this.edit = function (c) {
	var s = c.text();
	c.html("<textarea>"+s+"</textarea>");
	c.addClass("edit");
	c.find('textarea').focus();
    }

    /* recuperer la valeur de la cellule (en mode edition) */
    this.getval = function (c, o) {
	var s;
	if (c.hasClass("edit")) {
	    s = c.find('textarea').val();
	} else {
	    s = c.text();
	}
	o[this.name] = s;
    }
    /* fixer la valeur de la cellule (fais un retour mode normal) n'ajoute pas 'mutable' */
    this.setval = function (c, o) {
	c.removeClass("edit");
	c.html(o[this.name]);
    }
    /* rajoute mutable */
    this.showmutable = function (c) {
	if(!c.hasClass("mutable")) {
	    c.addClass("mutable");
	}
    }
}


function checkcell() {
    this.name ="checkcell";
    this.mutable = true;
    this.oneclickedit = true;

    /* mode edition direct */
    this.edit = function (c) {
	if (this.mutable) {
	    if (!c.hasClass('edit')) {
		c.addClass('edit');
	    }
	    var yesno = c.find('.yesno');
	    yesno.togglevalue = function () {
		yesno.toggleClass('yes');
		yesno.toggleClass('no');
		if (yesno.hasClass('yes')) {
		    yesno.text('oui');
		}
		else {
		    yesno.text('non');
		}
	    };
	    yesno.togglevalue();
	    yesno.click(yesno.togglevalue);
	    return false;
	}
    }

    /* recuperer la valeur de la cellule (en mode edition) */
    this.getval = function (c, o) {
	var s;
	var res = 0;
	s = c.find('.yesno').text();
	if (s == "oui") {
	    res = 1;
	}
	o[this.name] = res;
    }
    /* fixer la valeur de la cellule et permet son edition directe */
    this.setval = function (c, o) {
	c.removeClass("edit");
	c.html('<div class="yesno"><span>');
	var yesno = c.find('.yesno');
	if (1 == o[this.name]) {
	    yesno.addClass('yes');
	    yesno.text('oui');
	} else {
	    yesno.addClass('no');
	    yesno.text('non');
	}
    }
    /* rajoute mutable */
    this.showmutable = function (c) {
	if(!c.hasClass("mutable")) {
	    c.addClass("mutable");
	}
    }
}


function richcell() {
    this.setval = function (c, o) {
	c.removeClass("edit");
	c.html(o[this.name]);
	addLinks(c);
    }

    this.edit = function (c) {
	var s;
	c.find("span.visibleurl").remove();
        s = c.text();
	c.html("<textarea>"+s+"</textarea>");
	c.addClass("edit");
	c.find('textarea').focus();
    }

}

richcell.prototype = new cell();

function numcell() {
    this.canbenull = false;
    this.edit = function(c) {
	var s = c.text();
	c.html('<input type="text" value="'+s+'"/>');
	c.addClass('edit');
	c.find('input').focus();
    }
    this.getval = function (c, o) {
	var s;
	if (c.hasClass("edit")) {
	    s = c.find('input').val();
	} else {
	    s = c.text();
	}
	if ((this.canbenull) && ("" == s)) {
	    o[this.name] = null;
	} else if  ("" == s) {
	    o[this.name] = "default";
	} else {
	    o[this.name] = s.replace(" ","").replace(",",".");
	}
    }
}
numcell.prototype = new cell();

function datecell() {
    this.setval = function (c, o) {
	var isos = o[this.name];
	c.removeClass("edit");
	if ((isos != null) && (isos.length > 0) && (isos != "1970-01-01")) {
	    var s = $.datepicker
		.formatDate("dd/mm/yy",
			    $.datepicker.parseDate('yy-mm-dd',isos));  // <--conversion
	    c.html(s);
	} else {
	    c.html('');
	}
    }
    this.edit = function(c) {
	var s = c.text();
	c.html('');
	var dp = jQuery('<input type="text"/>');
	c.append(dp);
	dp.datepicker($.datepicker.regional['fr']);
	if ((s != null) && (s.length > 0) && (s != "1970-01-01")) {
	    dp.datepicker("setDate",s);
	}
	c.addClass('edit');
	dp.focus();
    }
    this.getval = function (c, o) {
	var s;
	var isos = "1970-01-01";
	if (c.hasClass("edit")) {
	    var dp = c.children('input');
	    s = dp.datepicker("getDate");
	} else {
	    s = new Date(c.text());
	}
	if (s != null) {
	    isos = $.datepicker.formatDate('yy-mm-dd', s); // <- conversion
	}
	o[this.name] = isos;

    }
}
datecell.prototype = new cell();

/* constructeur de cellule non modifiable */
function immutcell () {
    this.mutable = false;
    this.edit = function (c) {};
    this.showmutable = this.edit;
}
immutcell.prototype = new cell();

/* constructeur de cellule modifiable uniquement par super-user */
function sucell () {
    this.mutable = superuser(); /* valeur calculee au demarrage */
    this.edit = function (c) {if (superuser()) {
	    var s = c.text();
	    c.html("<textarea>"+s+"</textarea>");
	    c.addClass("edit");
	    c.find('textarea').focus();
	}
    };
    this.showmutable = function (c) {
	if (superuser()) {
	    if(!c.hasClass("mutable")) {
		c.addClass("mutable");
	    }
	}
    }
}
sucell.prototype = new cell();

/* constructeur de cellule num modifiable uniquement par super-user */
function sunumcell () {
    this.mutable = superuser(); /* valeur calculee au demarrage */
    this.edit = function (c) {
	if (superuser()){
	    var s = c.text();
	    c.html('<input type="text" value="'+s+'"/>');
	    c.addClass('edit');
	    c.find('input').focus();
	}
    };
    this.showmutable = function (c) {
	if (superuser()) {
	    if(!c.hasClass("mutable")) {
		c.addClass("mutable");
	    }
	}
    }
}
sunumcell.prototype = new numcell();

/* constructeur de cellule num modifiable uniquement par super-user */
function sucheckcell () {
    this.mutable = superuser(); /* valeur calculee au demarrage */
    this.showmutable = function (c) {
	if (superuser()) {
	    if(!c.hasClass("mutable")) {
		c.addClass("mutable");
	    }
	}
    }
}
sucheckcell.prototype = new checkcell();


/* constructeur de cellule non modifiable et sans valeur */
function notcell () {
    this.getval = function (c, o) {};
    this.setval = function (c, o) {};
}
notcell.prototype = new immutcell();

/* constructeur du composite enseignant */
function enseignant () {
    this.name = "enseignant";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var ensid = c.find('.hiddenvalue').text();
	// TODO refaire avec value au lien de span hidden
	c.remove('.hiddenvalue');
	var ensname = $.trim(c.find('a').text());
	/* installer la zone d'input */
	c.html('<input type="text" value="'+ensname+'"/><span class="hiddenvalue">'+ensid+'</span>');
	/* charger une seule fois la liste des enseignants */
	/* mettre en place l'autocomplete */
	var ens = c.find("input");
	var param = {term: ""};
	var annee = getAnnee(c); /* essayons de trouver l'annee */
	if (annee != null) {
	    param.annee = annee;
	}
	getjson("json_enseignants.php",param, function (data) {
		ens.autocomplete({ minLength: 2,
			    source: data,
/* USELESS (FAIL)			    mustMatch: true,
			    selectFirst: true,
			    autoFill: true,
			    change: function (event, ui) {
			    //if the value of the textbox does not match a suggestion, clear its value
			    if ($(".ui-autocomplete li:textEquals('" + $(this).val() + "')").size() == 0) {
				$(this).val('');
			    }
			}
		    }).live('keydown', function (e) {
			    var keyCode = e.keyCode || e.which;
			    //if TAB or RETURN is pressed and the text in the textbox does not match a suggestion, set the value of the textbox to the text of the first suggestion
			    if((keyCode == 9 || keyCode == 13) && ($(".ui-autocomplete li:textEquals('" + $(this).val() + "')").size() == 0)) {
				$(this).val($(".ui-autocomplete li:visible:first").text());
			    }
*/
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				return false;
			    }
			    $(this).focus();
			    ens.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var ensid = c.find('.hiddenvalue').text();
//	var ensid = c.find('input').autocomplete( "widget" ).item.id;
	o["id_enseignant"] = ensid;
    }
  this.setval = function (c,o) {
    var s = "";
    if (o["valide"] != null) {
      if (o["valide"] == 0) {
        s += "<span class='glyphicon glyphicon-warning-sign invalide_glyph'></span><span class='valide_conteneur'><span class='valide_texte'>"+o["commentaire_valide"]+".</span></span> ";
      }
    }
    if (o["valide_desc"] != null) {
      if (o["valide_desc"] == 0) {
        s += "<span class='glyphicon glyphicon-warning-sign invalide_glyph'></span><span class='valide_conteneur'><span class='valide_texte'>descendants: "+o["commentaire_valide_desc"]+".</span></span> ";
      }
    }
    s += '<a class="enseignant" href="service.php?id_enseignant='+o["id_enseignant"]+'">'+o["prenom_enseignant"]+" "+o["nom_enseignant"]+'</a><span class="hiddenvalue">'+o["id_enseignant"]+'</span>';
    c.html(s);
	c.find("a.enseignant").click(function(){window.open(this.href);return false;});
    }
}
enseignant.prototype = new cell();

/* constructeur du composite sformation */
function microsformation () {
    this.name = "microsformation";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var ensid = c.find('.hiddenvalue').text();
	c.remove('.hiddenvalue');
	var ensname = $.trim(c.find('span.nomsformation').text());
	/* installer la zone d'input */
	c.html('<input type="text" value="'+ensname+'"/><span class="hiddenvalue">'+ensid+'</span>');
	/* charger une seule fois la liste des sformations */
	/* mettre en place l'autocomplete */
	var ens = c.find("input");
	getjson("json_get.php",{type: "microsformation", id_parent: getAnnee()}, function (data) {
		ens.autocomplete({ minLength: 2,
			    source: data,
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				c.find('.hiddenvalue').html('null');
				return false;
			    }
			    $(this).focus();
			    ens.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var sformid = c.find('.hiddenvalue').text();
	o["id_sformation"] = sformid;
    }
    this.setval = function (c,o) {
	var nom = o["nom_sformation"];
	if (nom == null) nom = "nom du cycle ?";
	c.html('<span class="nomsformation">'+nom+'</span><span class="hiddenvalue">'+o["id_sformation"]+'</span>');
    }
}
microsformation.prototype = new cell();


/* constructeur du composite intitule de formation */
function intitule() {
    this.name = "intitule";
    this.setval = function (c,o) {
        var s = "";
	s += o["nom"];
	if (o["annee_etude"] != null) s = s+' '+o["annee_etude"];
	if (o["parfum"] != null) s = s+' '+o["parfum"];
	c.text(s);
	if (o["etapes"] != null) {
          c.append('<div class="sub"> '+o["etapes"]+'</div>');
        }
    }
}
intitule.prototype = new immutcell();


function total_complexe(o, nom, prefixe) {
    var s;
    s = "<span class='tot_complexe'>"
	+htdpostes(o[nom])
	+"</span>"
	+"<span class='tot_detail_conteneur'> "
	+"<span class='tot_detail'>=&nbsp;"
	+htdpostes(1.5*o[prefixe+"cm"])
	+'&nbsp;CM +&nbsp;'
	+htdpostes(o[prefixe+"td"])
	+'&nbsp;TD +&nbsp;'
	+htdpostes(o[prefixe+"tp"])
	+'&nbsp;TP +&nbsp;'
	+htdpostes(o[prefixe+"alt"])
        +'&nbsp;alt +&nbsp;'
	+htdpostes(o[prefixe+"prp"])
	+'&nbsp;PRP +&nbsp;'
	+htdpostes(o[prefixe+"referentiel"])
	+'&nbsp;réf.'
	+"</span>"
	+"</span>";
    return s;
}

function load_totaux(c,o) {
    c.removeClass('inactive');
    c.text('attente de données '+o["type"]+o["id"]);
    getjson("json_totaux.php",
	    {id: o["id"], type: o["type"]},
	    function (o) {
		var s = "";
		s += total_complexe(o, "total", "");
		s += ' postes ';
		s += '=&nbsp;';
		s += htdpostes(o["servi"])+'&nbsp;servis +&nbsp;';
		s += total_complexe(o, "mutualise", "mutualise");
		s += ' mutualisés +&nbsp;';
		s += total_complexe(o, "libre", "libre");
		s += ' à pourvoir +&nbsp;';
		s += htdpostes(o["annule"])+'&nbsp;annulés';
		s += '<br/>Département: ';
		s += htdpostes(parseFloat(o["permanents"]) + parseFloat(o["nonpermanents"]) + parseFloat(o["libre"]))+'  = ';
		s += total_complexe(o, "permanents", "perm");
		s += ' permanents +&nbsp;';
		s += total_complexe(o, "nonpermanents", "nperm");
		s += ' non permanents +&nbsp;';
		s += total_complexe(o, "libre", "libre");
		s += ' à pourvoir';
		s += '<br/>Extérieurs: '+htdpostes(parseFloat(o["exterieurs"]) + parseFloat(o["autre"]))+' = ';
		s += total_complexe(o, "exterieurs", "ext");
		s += ' servis +&nbsp;';
		s += total_complexe(o, "autre", "autre");
	        s += ' inconnus';
              if (o["etu"] > 0) {
                s += '<div class="hetu">['+Math.round(o["etu"])+'h étu.]</div>';
              }
              if ((typeof o["effectif"] !== 'undefined') && (o["effectif"] > 0)) {
                s += "<div class=\"effectif\"> [effectif : " + o["effectif"] + "]</div>";
              }
		c.html(s);
		c.find(".tot_detail").bind('click', function (e) {$(this).toggleClass("forceinline");});
	    });
}

/* constructeur du composite totaux */
function totaux() {
   this.autoload = true;
    this.setval = function (c, o) {
	if (this.autoload) {
	    load_totaux(c, o);
	} else {
	    c.addClass('inactive');
	    c.html('voir');
	}
	c.click(function () {
	    c.unbind('click');
	    load_totaux(c, o);
	    c.dblclick(function () {
		load_totaux(c, o);
	    });
	});
    };
    this.mutable = false;
    this.name = "totaux";
}
totaux.prototype = new immutcell();

function totaux_loader() {
    this.autoload = false;
    this.name = "totaux_loader";
};
totaux_loader.prototype = new totaux();

function load_tags(c,o) {
    c.removeClass('inactive');
    c.text('attente de données '+'tags'+o["id"]);
    var id_cours = o["id"];
    getjson("json_get.php",
	    {id_parent: id_cours, type: "tags"},
	    function (o) {
		var n = o.length;
		var i = 0;
		c.html('');
		for (i = n - 1; i >= 0; i--) {
		    var s;
		    s = '<span class="tag">'+o[i].nom_tag+' <button id="tagcours_'+o[i].id_tag+'_'+id_cours+'" class="button-enlever_tag" role="button" aria-disabled="false" title="enlever"><span class="icon">&nbsp;</span></button></span>';
		    c.append(s);
		    $('#tagcours_'+o[i].id_tag+'_'+id_cours).bind('click', {id_tag: o[i].id_tag, id_cours: id_cours}, function (e) {
			    getjson("json_rm.php",
				    {id:e.data.id_tag, id_parent: e.data.id_cours, type: "tagcours"},
				    function () {
					/* si succès: on retire de la vue */
					$('#tagcours_'+e.data.id_tag+'_'+e.data.id_cours).parent().remove();
				    });
			    return false;
			});
		}
		c.append('<span class="tag"><button id="ajoutertagcours_'+id_cours+'"class="button-ajouter_tag" role="button" aria-disabled="false" title="ajouter"><span class="icon">&nbsp;</span></button></span>');
		$('#ajoutertagcours_'+id_cours).bind('click',{id_cours: id_cours}, ajouter_tagcours);
	    });
}

function ajouter_tagcours(e) {
    var id_cours = e.data.id_cours;
    var c = $('#ajoutertagcours_'+id_cours).parent();
    if (existsjQuery(c.find('input.taginput'))) return false;
    /* installer la zone d'input et le bouton d'envoi */
    c.append('<input class="taginput" type="text" value=""/><span class="hiddenvalue"></span>');
    c.append('<button id="envoyertagcours_'+id_cours+'"class="button-envoyer_tag" role="button" aria-disabled="false" title="envoyer"><span class="icon">&nbsp;</span></button>');
    $('#envoyertagcours_'+id_cours).bind('click', {id_cours: id_cours}, envoyer_tagcours);
    /* mettre en place l'autocomplete */
    var inp = c.find("input");
    getjson("json_get.php",{id_parent: id_cours, type: 'unusedtags'},
	    function (data) {
		inp.autocomplete({
		    minLength: 2,
			    source: data,
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				return false;
			    }
			    $(this).focus();
			    inp.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
    inp.focus();
    $('#ajoutertagcours_'+id_cours).remove();
    return false;
}

function envoyer_tagcours(e) {
    var id_cours = e.data.id_cours;
    var id_tag = $('#envoyertagcours_'+id_cours).prev('.hiddenvalue').text();
    if (id_tag.length == 0) return false;
    getjson("json_new.php", {id_cours: id_cours, id_tag: id_tag, type: 'tagscours'},
	    function () {
		var c = $('#cours_'+id_cours+' > td.tags');
		load_tags(c, {id: id_cours});
	});
    return false;
}



/* construction du composite interactif tags */
function tags() {
    this.setval = function (c, o) {
	c.addClass('inactive');
	c.html('voir');
	c.click(function () {
	    c.unbind('click');
	    load_tags(c, o);
	    c.dblclick(function () {
		load_tags(c, o);
		return false;
	    });
	    return false;
	});
    };
    this.edit = function (c) {
	var oid = parseIdString(c.parent('tr').attr('id'));
	load_tags(c, oid);
    };
    this.autoload = false;
    this.name = "tags";
};
tags.prototype = new immutcell();


/* collections */
function load_collections(c,o) {
    c.removeClass('inactive');
    c.text('attente de données '+'collections'+o["id"]);
    var id_cours = o["id"];
    getjson("json_get.php",
	    {id_parent: id_cours, type: "collections"},
	    function (o) {
		var n = o.length;
		var i = 0;
		c.html('');
		for (i = n - 1; i >= 0; i--) {
		    var s;
		    s = '<span class="collection">'+o[i].nom_collection+' <button id="collectioncours_'+o[i].id_collection+'_'+id_cours+'" class="button-enlever_collection" role="button" aria-disabled="false" title="enlever"><span class="icon">&nbsp;</span></button></span>';
		    c.append(s);
		    $('#collectioncours_'+o[i].id_collection+'_'+id_cours).bind('click', {id_collection: o[i].id_collection, id_cours: id_cours}, function (e) {
			    getjson("json_rm.php",
				    {id:e.data.id_collection, id_parent: e.data.id_cours, type: "collectioncours"},
				    function () {
					/* si succès: on retire de la vue */
					$('#collectioncours_'+e.data.id_collection+'_'+e.data.id_cours).parent().remove();
				    });
			    return false;
			});
		}
		c.append('<span class="collection"><button id="ajoutercollectioncours_'+id_cours+'"class="button-ajouter_collection" role="button" aria-disabled="false" title="ajouter"><span class="icon">&nbsp;</span></button></span>');
		$('#ajoutercollectioncours_'+id_cours).bind('click',{id_cours: id_cours}, ajouter_collectioncours);
	    });
}

function ajouter_collectioncours(e) {
    var id_cours = e.data.id_cours;
    var c = $('#ajoutercollectioncours_'+id_cours).parent();
    if (existsjQuery(c.find('input.collectioninput'))) return false;
    /* installer la zone d'input et le bouton d'envoi */
    c.append('<input class="collectioninput" type="text" value=""/><span class="hiddenvalue"></span>');
    c.append('<button id="envoyercollectioncours_'+id_cours+'"class="button-envoyer_collection" role="button" aria-disabled="false" title="envoyer"><span class="icon">&nbsp;</span></button>');
    $('#envoyercollectioncours_'+id_cours).bind('click', {id_cours: id_cours}, envoyer_collectioncours);
    /* mettre en place l'autocomplete */
    var inp = c.find("input");
    getjson("json_get.php",{id_parent: id_cours, type: 'unusedcollections', annee_universitaire: getAnnee()},
	    function (data) {
		inp.autocomplete({
		    minLength: 2,
			    source: data,
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				return false;
			    }
			    $(this).focus();
			    inp.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
    inp.focus();
    $('#ajoutercollectioncours_'+id_cours).remove();
    return false;
}

function envoyer_collectioncours(e) {
    var id_cours = e.data.id_cours;
    var id_collection = $('#envoyercollectioncours_'+id_cours).prev('.hiddenvalue').text();
    if (id_collection.length == 0) return false;
    getjson("json_new.php", {id_cours: id_cours, id_collection: id_collection, type: 'collectionscours'},
	    function () {
		var c = $('#cours_'+id_cours+' > td.collections');
		load_collections(c, {id: id_cours});
	});
    return false;
}

/* construction du composite interactif collections */
function collections() {
    this.setval = function (c, o) {
	c.addClass('inactive');
	c.html('voir');
	c.click(function () {
	    c.unbind('click');
	    load_collections(c, o);
	    c.dblclick(function () {
		load_collections(c, o);
		return false;
	    });
	    return false;
	});
    };
    this.edit = function (c) {
	var oid = parseIdString(c.parent('tr').attr('id'));
	load_collections(c, oid);
    };
    this.autoload = false;
    this.name = "collections";
};
collections.prototype = new immutcell();


/* etapes */
function load_etapes(c,o) {
    c.removeClass('inactive');
    c.text('attente de données '+'etapes'+o["id"]);
    var id_formation = o["id"];
    getjson("json_get.php",
	    {id_parent: id_formation, type: "etapesformation"},
	    function (o) {
		var n = o.length;
		var i = 0;
		c.html('');
		for (i = n - 1; i >= 0; i--) {
		    var s;
		    s = '<span class="etape">'+o[i].code_etape+' <button id="etapeformation_'+o[i].code_etape+'_'+id_formation+'" class="button-enlever_etape" role="button" aria-disabled="false" title="enlever"><span class="icon">&nbsp;</span></button></span>';
		    c.append(s);
		    $('#etapeformation_'+o[i].code_etape+'_'+id_formation).bind('click', {code_etape: o[i].code_etape, id_formation: id_formation}, function (e) {
			    getjson("json_rm.php",
				    {id:e.data.code_etape, id_parent: e.data.id_formation, type: "etapeformation"},
				    function () {
					/* si succès: on retire de la vue */
					$('#etapeformation_'+e.data.code_etape+'_'+e.data.id_formation).parent().remove();
				    });
			    return false;
			});
		}
		c.append('<span class="etape"><button id="ajouteretapeformation_'+id_formation+'"class="button-ajouter_etape" role="button" aria-disabled="false" title="ajouter"><span class="icon">&nbsp;</span></button></span>');
		$('#ajouteretapeformation_'+id_formation).bind('click',{id_formation: id_formation}, ajouter_etapeformation);
	    });
}

function ajouter_etapeformation(e) {
    var id_formation = e.data.id_formation;
    var c = $('#ajouteretapeformation_'+id_formation).parent();
    if (existsjQuery(c.find('input.etapeinput'))) return false;
    /* installer la zone d'input et le bouton d'envoi */
    c.append('<input class="etapeinput" type="text" value=""/><span class="hiddenvalue"></span>');
    c.append('<button id="envoyeretapeformation_'+id_formation+'"class="button-envoyer_etape" role="button" aria-disabled="false" title="envoyer"><span class="icon">&nbsp;</span></button>');
    $('#envoyeretapeformation_'+id_formation).bind('click', {id_formation: id_formation}, envoyer_etapeformation);
    /* mettre en place l'autocomplete */
    var inp = c.find("input");
    getjson("json_get.php",{id_parent: id_formation, type: 'unusedetapesformation', annee_universitaire: getAnnee()},
	    function (data) {
		inp.autocomplete({
		    minLength: 2,
			    source: data,
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				return false;
			    }
			    $(this).focus();
			    inp.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
    inp.focus();
    $('#ajouteretapeformation_'+id_formation).remove();
    return false;
}

function envoyer_etapeformation(e) {
    var id_formation = e.data.id_formation;
    var id_etape = $('#envoyeretapeformation_'+id_formation).prev('.hiddenvalue').text();
    if (id_etape.length == 0) return false;
    getjson("json_new.php", {id_formation: id_formation, code_etape: id_etape, type: 'etapesformations'},
	    function () {
		var c = $('#formation_'+id_formation+' > td.etapes');
		load_etapes(c, {id: id_formation});
	});
    return false;
}

/* construction du composite interactif etapes */
function etapes() {
    this.setval = function (c, o) {
	c.addClass('inactive');
	c.html('voir');
	c.click(function () {
	    c.unbind('click');
	    load_etapes(c, o);
	    c.dblclick(function () {
		load_etapes(c, o);
		return false;
	    });
	    return false;
	});
    };
    this.edit = function (c) {
	var oid = parseIdString(c.parent('tr').attr('id'));
	load_etapes(c, oid);
    };
    this.autoload = false;
    this.name = "etapes";
};
etapes.prototype = new immutcell();

/* constructeur du composite nature de l'intervention */
function nature() {
    this.setval = function (c,o) {
	var s;
	c.html('<table class="nature"><tr><td class="ncm">CM</td><td class="ntd">TD</td><td class="ntp">TP</td></tr><tr><td class="nalt">alt</td><td class="nprp">PRP</td><td class="nreferentiel">réf</td></tr></table>');
	c.find("table.nature td").addClass("inact");
	if (o["cm"] > 0) c.find("td.ncm").removeClass("inact");
        if (o["alt"] > 0) c.find("td.nalt").removeClass("inact");
        if (o["prp"] > 0) c.find("td.nprp").removeClass("inact");
        if (o["referentiel"] > 0) c.find("td.nreferentiel").removeClass("inact");
	if (o["td"] > 0) c.find("td.ntd").removeClass("inact");
	if (o["tp"] > 0) c.find("td.ntp").removeClass("inact");
    }
    this.name = "nature";
}
nature.prototype = new immutcell();

/* constructeur du composite annee */
function annee_universitaire() {
    this.setval = function (c,o) {
	var s;
	c.html(o["annee_universitaire"]+'-'+(parseInt(o["annee_universitaire"]) + 1));
    }
    this.name = "annee_universitaire";
}
annee_universitaire.prototype = new immutcell();



/* constructeur du composite categorie */
function categorie () {
    this.name = "categorie";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var catid = c.find('.hiddenvalue').text();
	// TODO refaire avec value au lien de span hidden
	c.remove('.hiddenvalue');
	var catname = $.trim(c.find('a').text());
	/* installer la zone d'input */
	c.html('<input type="text" value="'+catname+'"/><span class="hiddenvalue">'+catid+'</span>');
	/* charger une seule fois la liste des categories */
	/* mettre en place l'autocomplete */
	var cat = c.find("input");
	getjson("json_categories.php",{term: ""}, function (data) {
		cat.autocomplete({ minLength: 0,
			    source: data,
			    select: function(e, ui) {
			    if (!ui.item) {
				// remove invalid value, as it didn't match anything
				$(this).val("");
				return false;
			    }
			    $(this).focus();
			    cat.val(ui.item.label);
			    c.find('.hiddenvalue').html(ui.item.id);
			}
		    })});
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["categorie"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["nom_court"]+'<span class="hiddenvalue">'+o["categorie"]+'</span>');
	c.find("a.categorie").click(function(){window.open(this.href);return false;});
    }
}
categorie.prototype = new cell();


/* constructeur du composite section (cnu) */
function section () {
    this.name = "section";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var catid = c.find('.hiddenvalue').text();
	// TODO refaire avec value au lien de span hidden
	c.remove('.hiddenvalue');
	/* installer la zone d'input */
	c.html('<input type="text" value="'+catid+'"/><span class="hiddenvalue">'+catid+'</span>');
	/* charger une seule fois la liste des sections TODO */
	/* mettre en place l'autocomplete */
	var cat = c.find("input");
	getjson("json_sections.php",{term: ""}, function (data) {
	    cat.autocomplete({ minLength: 0,
			       source: data,
			       select: function(e, ui) {
				   if (!ui.item) {
				       // remove invalid value, as it didn't match anything
				       $(this).val("");
				       return false;
				   }
				   $(this).focus();
				   cat.val(ui.item.label);
				   c.find('.hiddenvalue').html(ui.item.id);
			       }
			     })});
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["id_section"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["id_section"]+'<span class="hiddenvalue">'+o["id_section"]+'</span>');
    }
}
section.prototype = new cell();



/* constructeur du composite codeue (ex geisha) */
function code_ue () {
    this.name = "code_ue";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var catid = c.find('.hiddenvalue').text();
	// TODO refaire avec value au lien de span hidden
	c.remove('.hiddenvalue');
	/* installer la zone d'input */
	c.html('<input type="text" value="'+catid+'"/><span class="hiddenvalue">'+catid+'</span>');
	/* charger une seule fois la liste des codes TODO */
	/* mettre en place l'autocomplete */
	var cat = c.find("input");
//	c.append("<div id='JustLogLikeThat' style='position: fixed; top: 10px; left 50px;'>Logs</div>");
	cat.autocomplete({ minLength: 3,
			   source: function( request, response ) {
			       $.ajax({
				   url: "/commun/minoterie/json_codesue.php",
				   dataType: "json",
				   data: {
				       term: request.term
				   },
				   success: function( data ) {
				       response(data);
				   }
			       });
			   },
			   select: function(e, ui) {
			       if (!ui.item) {
				   c.find('.hiddenvalue').html($(this).val());
				   return false;
			       }
			       $(this).focus();
			       cat.val(ui.item.label);
			       c.find('.hiddenvalue').html(ui.item.id);
			   },
			   change: function (e, ui) {
//			       $('#JustLogLikeThat').html('inputval: '+$(this).val());
			       if (!ui.item) {
				   c.find('.hiddenvalue').html($(this).val());
			       }
//			       if (ui.item) {$('#JustLogLikeThat').append('<br/>current item id: '+ui.item.id
//									  +'<br/>current item label: '+ui.item.label);}
			   }
			 });
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["code_ue"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["code_ue"]+'<span class="hiddenvalue">'+o["code_ue"]+'</span>');
    }
}
code_ue.prototype = new cell();




/* constructeur du composite code_etape (pour code_etape_cours et code_etape_formation) */
function code_etape () {
    this.name = "code_etape";
    this.mutable = true;
    this.edit = function (c) {
	/* sauvegarder l'id actuel */
	var catid = c.find('.hiddenvalue').text();
	// TODO refaire avec value au lien de span hidden
	c.remove('.hiddenvalue');
	/* installer la zone d'input */
	c.html('<input type="text" value="'+catid+'"/><span class="hiddenvalue">'+catid+'</span>');
	/* charger une seule fois la liste des codes TODO */
	/* mettre en place l'autocomplete */
	var cat = c.find("input");
	cat.autocomplete({ minLength: 3,
			   source: function( request, response ) {
			       $.ajax({
				   url: "/commun/minoterie/json_codesetape.php",
				   dataType: "json",
				   data: {
				       term: request.term
				   },
				   success: function( data ) {
				       response(data);
				   }
			       });
			   },
			   select: function(e, ui) {
			       if (!ui.item) {
				   c.find('.hiddenvalue').html($(this).val());
				   return false;
			       }
			       $(this).focus();
			       cat.val(ui.item.label);
			       c.find('.hiddenvalue').html(ui.item.id);
			   },
			   change: function (e, ui) {
			       if (!ui.item) {
				   c.find('.hiddenvalue').html($(this).val());
			       }
			   }
			 });
	c.addClass("edit");
	c.find('input').focus();
    };
    this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["code_etape"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["code_etape"]+'<span class="hiddenvalue">'+o["code_etape"]+'</span>');
    }
}

code_etape.prototype = new cell();

function code_etape_formation() {
  this.name = "code_etape_formation";
  this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["code_etape_formation"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["code_etape_formation"]+'<span class="hiddenvalue">'+o["code_etape_formation"]+'</span>');
    }
}
code_etape_formation.prototype = new code_etape();


function code_etape_cours() {
  this.name = "code_etape_cours";
  this.getval = function (c,o) {
	var catid = c.find('.hiddenvalue').text();
	o["code_etape_cours"] = catid;
    }
    this.setval = function (c,o) {
	c.html(o["code_etape_cours"]+'<span class="hiddenvalue">'+o["code_etape_cours"]+'</span>');
    }
}
code_etape_cours.prototype = new code_etape();

function service_reel ()
{
    this.name = "service_reel";
    this.setval = function (c,o) {
	var sr = o["service_reel"];
	if (null == sr) {
	    sr = 0;
	}
	c.html('<a class="enseignant" href="service.php?annee='+o["annee_universitaire"]+'&id_enseignant='+o["id_enseignant"]+'">'+sr+'</a>');
	c.find("a.enseignant").click(function(){window.open(this.href);return false;});
    }
}
service_reel.prototype = new immutcell();


/* numero d'ordre : via des boutons */
/* pour empiler des boutons voir: git://gist.github.com/760885.git */
function numero() {
    this.setval= function (c, o) {
	c.html('<div class="groupeboutons"><button class="moveupward"></button><button class="movedownward"></button></div><div class="hiddenvalue">'+o["numero"]+'</div>');
	var up = c.find('button.moveupward').button({
            icons: {
                primary: "ui-icon-triangle-1-n"
            },
            text: false
        });
	var down = c.find('button.movedownward').button({
            icons: {
                primary: "ui-icon-triangle-1-s"
            },
            text: false
        });
	var group = c.find('.groupeboutons').buttonset();
	up.removeClass('ui-corner-left').addClass('ui-corner-top');
	down.removeClass('ui-corner-right').addClass('ui-corner-bottom');
	group.removeClass('ui-corner-left').addClass('ui-corner-top');
	group.removeClass('ui-corner-right').addClass('ui-corner-bottom');
	group.width(up.width());

	up.click(moveup);
	down.click(movedown);
    };
    this.mutable = false;
    this.name = "numero";
    this.edit = function () {};
}
numero.prototype = new immutcell();


function moveup(e) {
    var td = $(e.currentTarget).closest('td');
    var tr = td.parent('tr');
    var trid = parseIdString(tr.attr('id'));
    var trprev = tr.prev();
    var trprevaux = null;
    var traux = null;
    if (!existsjQuery(trprev)) return false;

    var bascule = tr.find('td.laction > div.basculeOn');
    if (existsjQuery(bascule)) {
	bascule.trigger('click'); /* on peut proceder a l'echange pendant la fermeture */
    }

    if (trprev.hasClass("img"+trid["type"])) {/* il y a une seconde ligne auxilliaire (img) qui accompagne nos tr */
	traux = trprev;
	trprev = trprev.prev();
	trprevaux = trprev.prev();
	if ( (!trprev.hasClass(trid["type"]))
	     || (!traux.hasClass("img"+trid["type"]))
	     || (!trprevaux.hasClass("img"+trid["type"]))
	    ) return false;/* quelque chose se passe mal: abandon */
    }

    if (parseIdString(trprev.attr('id')).type != trid.type) {/* on n'a pas trouvé la seconde ligne à echanger: abandon */
	return false;
    }

    bascule = trprev.find('td.laction > div.basculeOn');
    if (existsjQuery(bascule)) {
	bascule.trigger('click');
	/* on ne procede pas a l'echange, il faut laisser le temps de fermer la bascule: abandon */
	return false;
    }


    var previd = parseIdString(trprev.attr('id'));
    /* echange des lignes */
    tr.after(trprev);
    if (traux != null) {
	tr.before(traux);
	trprev.before(trprevaux);
    }

    /* echange des hiddenvalue */
    var num = tr.find("td.numero div.hiddenvalue").text();
    var numprev =  trprev.find("td.numero div.hiddenvalue").text();
    trprev.find("td.numero div.hiddenvalue").text(num);
    tr.find("td.numero div.hiddenvalue").text(numprev);

    trid["numero"] = numprev;
    previd["numero"] = num;

    /* envoie des modifications au serveur (en parallèle) */
    getjson("json_modify.php",trid, replaceLine);
    getjson("json_modify.php",previd, replaceLine);


/*    getjson("json_exchange.php",
	    {"type": id["type"],
		    "idprev": previd["id"],
		    "idnext": nextid["id"]
		    },
	    function () {
		tr.after(trprev);
		}); */
    return false;
}


function movedown(e) {
    var td = $(e.currentTarget).closest('td');
    var tr = td.parent('tr');
    var trid = parseIdString(tr.attr('id'));
    var trnext = tr.next();
    var trnextaux = null;
    var traux = null;
    if (!existsjQuery(trnext)) return false;
    var bascule = tr.find('td.laction > div.basculeOn');
    if (existsjQuery(bascule)) {
	bascule.trigger('click');
	/* on ne procede pas a l'echange, il faut laisser le temps de fermer la bascule: abandon */
	return false;
    }
    if (trnext.hasClass('img'+trid["type"])) {
	trnextaux = trnext;
	trnext = trnext.next();
	traux = tr.prev();
	if ((!trnext.hasClass(trid["type"]) )
	    || (!trnextaux.hasClass("img"+trid["type"]))
	    || (!traux.hasClass("img"+trid["type"]))
	    ) return false; /* quelque chose se passe mal: abandon */
    }

    if (parseIdString(trnext.attr('id')).type != trid.type) {/* on n'a pas trouvé la seconde ligne à echanger: abandon */
	return false;
    }

    bascule = trnext.find('td.laction > div.basculeOn');
    if (existsjQuery(bascule)) {
	bascule.trigger('click'); /* on peut proceder a l'echange pendant la fermeture */
    }

    var nextid = parseIdString(trnext.attr('id'));

    /* echange des lignes */
    tr.before(trnext);
    if (traux != null) {
	tr.before(traux);
	trnext.before(trnextaux);
    }

    /* echange des hiddenvalue */
    var num = tr.find("td.numero div.hiddenvalue").text();
    var numnext =  trnext.find("td.numero div.hiddenvalue").text();
    trnext.find("td.numero div.hiddenvalue").text(num);
    tr.find("td.numero div.hiddenvalue").text(numnext);

    trid["numero"] = numnext;
    nextid["numero"] = num;

    /* envoie des modifications au serveur (en parallèle) */
    getjson("json_modify.php",trid, replaceLine);
    getjson("json_modify.php",nextid, replaceLine);


/*    getjson("json_exchange.php",
	    {"type": id["type"],
		    "idnext": nextid["id"],
		    "idnext": nextid["id"]
		    },
	    function () {
		tr.after(trnext);
		}); */
    return false;
}


/* objet ligne de tableau */
function ligne() {
    /* pain_enseignant
     */

    /* composite : enseignant */
    this.enseignant = new enseignant();
    /* login */
    this.login = new cell();
    this.login.name = "login";
    /* nom */
    this.nom = new cell();
    this.nom.name = "nom";
    /* prenom */
    this.prenom = new cell();
    this.prenom.name = "prenom";
    /* statut */
    this.statut = new cell();
    this.statut.name = "statut";
    /* email */
    this.email = new cell();
    this.email.name = "email";
    /* telephone */
    this.telephone = new cell();
    this.telephone.name = "telephone";
    /* bureau */
    this.bureau = new cell();
    this.bureau.name = "bureau";
    /* service statutaire */
    this.service = new sunumcell();
    this.service.name = "service";
    /* service reel */
    this.service_reel = new service_reel();
    /* composite : categorie */
    this.categorie = new categorie();
    /* composite : section */
    this.section = new section();
    /* responsabilite */
    this.responsabilite = new cell();
    this.responsabilite.name = "responsabilite";
    /* peut stats */
    this.stats = new sucheckcell();
    this.stats.name = "stats";
    /* su: peut tout ;) */
    this.su = new sucheckcell();
    this.su.name = "su";
    /* modification */
    this.modification = new immutcell();
    this.modification.name = "modification";

    /* pain_cours
     */
    /* semestre */
    this.semestre = new numcell();
    this.semestre.name = "semestre";
    /* nom_cours */
    this.nom_cours = new cell();
    this.nom_cours.name = "nom_cours";
    /* credits */
    this.credits = new numcell();
    this.credits.name = "credits";
    /* id_enseignant */
    this.id_enseignant = new cell();
    this.id_enseignant.name = "id_enseignant";
    /* cm */
    this.cm = new numcell();
    this.cm.name = "cm";
    /* td */
    this.td = new numcell();
    this.td.name = "td";
    /* tp */
    this.tp = new numcell();
    this.tp.name = "tp";
    /* alt */
    this.alt = new numcell();
    this.alt.name = "alt";
    /* prp */
    this.prp = new numcell();
    this.prp.name = "prp";
    /* referentiel */
    this.referentiel = new numcell();
    this.referentiel.name = "referentiel";
    /* debut */
    this.debut = new datecell();
    this.debut.name = "debut";
    /* fin */
    this.fin = new datecell();
    this.fin.name = "fin";
    /* mcc */
    this.mcc = new cell();
    this.mcc.name = "mcc";
    /* inscrits */
    this.inscrits = new numcell();
    this.inscrits.name = "inscrits";
    /* presents */
    this.presents = new numcell();
    this.presents.name = "presents";
    /* tirage */
    this.tirage = new numcell();
    this.tirage.name = "tirage";
    /* descriptif */
    this.descriptif = new richcell();
    this.descriptif.name = "descriptif";
    /* code_ue */
    this.code_ue = new code_ue();
    /* code_etape_formation */
    this.code_etape_formation = new code_etape_formation();
    /* code_etape_cours */
    this.code_etape_cours = new code_etape_cours();
    /* action */
    this.action = new notcell();
    this.action.setval = function(c,o) {
	if (0 == c.find('div.palette').length) c.append('<div class="palette"/>');
    }
    this.action.name = "action";
    /* action a gauche */
    this.laction = new notcell();
    this.laction.setval = function(c,o) {
	if (0 == c.find('div.palette').length) c.append('<div class="palette"/>');
    }
    this.laction.name = "laction";
    /* tags */
    this.tags = new tags();
    /* colllections */
    this.collections = new collections();
    /* etapes */
    this.etapes = new etapes();

    /* pain_tranche
     */
    /* nature */
    this.nature = new nature();

    /* id_cours */
    this.id_cours = new cell();
    this.id_cours.name = "id_cours";
    /* groupe */
    this.groupe = new numcell();
    this.groupe.name = "groupe";
    /* type_conversion */
    this.type_conversion = new cell();
    this.type_conversion.name = "type_conversion";
    /* remarque */
    this.remarque = new cell();
    this.remarque.name = "remarque";
    /* declarer */
    this.declarer = new cell();
    this.declarer.name = "declarer";
    /* htd */
    this.htd = new sunumcell();
    this.htd.name = "htd";
    /* pain_choix
     */
    this.choix = new cell();
    this.choix.name = "choix";

    /* pain_enseignant, pain_service
     */
    this.annee_universitaire = new annee_universitaire();
    this.service_annuel = new sunumcell();
    this.service_annuel.name = "service_annuel";
    /* pain_sformation, pain_formation
     */
    /* intitule */
    this.intitule = new intitule();
    /* stats / totaux */
    this.totaux = new totaux();
    this.totaux_loader = new totaux_loader();
    /* numero */
    this.numero = new numero();
    /* annee_etude */
    this.annee_etude = new numcell();
    this.annee_etude.name = "annee_etude";
    this.annee_etude.canbenull = true;
    /* parfum */
    this.parfum = new cell();
    this.parfum.name = "parfum";

    /* potentiel (tranches + choix)
     */
    this.choix_htd = new immutcell();
    this.choix_htd.name = "choix_htd";
    this.tranche_htd = new immutcell();
    this.tranche_htd.name = "tranche_htd";

    /* responsabilite
     */
    this.resp_nom = new immutcell();
    this.resp_nom.name = "resp_nom";

    /* tags
     */
    /* nom_tag */
    this.nom_tag = new cell();
    this.nom_tag.name = "nom_tag";
    /* nb_cours */
    this.nb_cours = new immutcell();
    this.nb_cours.name = "nb_cours";
    /* nb_cours */
    this.nb_tous_cours = new immutcell();
    this.nb_tous_cours.name = "nb_tous_cours";
    /* collections
     */
    /* nom_collection */
    this.nom_collection = new cell();
    this.nom_collection.name = "nom_collection";
    /* microsformation */
    this.microsformation = new microsformation();
    /* nb_cours */
    this.nb_cours = new immutcell();
    this.nb_cours.name = "nb_cours";
}
/*--------  FIN OBJET LIGNE --------------*/

/* BLOC ----- UTILITAIRES ----- */
function existsjQuery(jQ) {
    if ( undefined == jQ.length ) {
	return false; // safari ?
    }
    else if (0 == jQ.length) {
	return false; // firefox
    }
    return true;
}

function superuser() {
    return ($.trim($('#user > .su').text()) == "1");
}

function addLinks (c) {
    c.html(c.html().replace(/(https?:\/\/\S+)/g,"<a class=\"url\" href=\"$1\" title=\"$1\"><span class=\"hiddenurl\">$1</span><span class=\"visibleurl\">$1</span><img src=\"css/img/out.gif\" class=\"urlicon\"></img></a>"));
    c.find('a').click(function(){window.open(this.href);return false;});
    c.find('span.visibleurl').each(function () {
	    var s = $(this).text();
	    var e = /https?:\/\/([\w|-]+)\S+/i;
	    var r = e.exec(s);
	    $(this).text(r[1]+'…');
	});

}

/* custom selector for mustMatch autocomplete */
$.expr[':'].textEquals = function (a, i, m) {
    return $(a).text().match("^" + m[3] + "$");
};

function htdpostes(htd) {
    return Math.round(parseFloat(htd)*100/192)/100;
}

function edit(event) {
    var cell = $(event.currentTarget);
    if (cell.hasClass("mutable")) {
	cell.removeClass("mutable");
	var name = cell.attr('class');
	L[name].edit(cell);
	addOk(cell);
    }
}

/* des id css aux couples type, id et ...*/
function parseIdString(s) {
    var tid = new Object();
    var tab = s.split('_',2);
    tid['type'] = tab[0];
    tid['id'] = tab[1];
    return tid;
}

/* ...reciproquement */
function idString(o) {
    return o['type'] + '_' + o['id'];
}


/* Pour envoyer et recevoir au format json */
function getjson(url,data,callback) {
    $.ajax({ type: "GET",
		url: url,
		data:  data,
		datatype: 'json',
		error: function () {alert('erreur ajax ! [url: '+url+'] [data: '+data+']');},
		success: function(data) {
		var o;
		try {
		    o = jQuery.parseJSON(data);
		    if (o.error != null) {
			// if (confirm()) ...
			alert(o.error);
			return;
		    }
		} catch (e) {
		    alert("Erreur: "+e+" vous avez peut être été déconnecté du CAS, rechargez la page.\n"+data);
		    return;
		}
		callback(o);
	    }
	});
}

/* la meme version debug */
function getjsondb(url,data,callback) {
    $.ajax({ type: "GET",
	     url: url,
	     data:  data,
	     error: function () {alert('erreur ajax !');},
	     success: function(data) {
		var o;
		alert("RECEIVED: " + data);
		o = jQuery.parseJSON(data);
		if (o.error != null) {
		    // if (confirm()) ...
		    alert(o.error);
		} else {
		    callback(o);
		}
	    }
	});
}


/* combien de cases dans la ligne du tableau ? */
function largeurligne(dansligne) {
    var ligne = dansligne.parentsUntil('tbody');
    if (existsjQuery(ligne)) {
	return ligne.children('td, th').length;
    }
    return dansligne.children('td, th').length;
}

/* ----- FIN UTILITAIRES ----- */


/* BLOC ---- BOUTONS ET ACTIONNEURS --------------*/

function basculerAide() {
    var bascule =  $('#basculeAide');
    var aide = $('#aide');
    bascule.toggleClass('aideOff');
    bascule.toggleClass('aideOn');
    if (bascule.hasClass('aideOff')) {
	aide.fadeOut('slow'); // explode ?
    } else {
	if (!existsjQuery(aide)) {
	    $.get("aide.html", null, function(data) {
		    $('#infobox').after(data);
		    $('#aide').accordion({ collapsible: true });
		    $('#aide video').bind('click', function () {
			    $(this).attr('poster','');
			    var myVideo = this; // $(this).get(); // [0]
			    if (myVideo.paused)
				myVideo.play();
			    else
				myVideo.pause();
			});
		    $('#aide button').wrap('<span class="buttonsize"/>');
		    $('#aide button.fauxmult').button(
			{text: false,
				icons: {
			    primary: "ui-icon-copy"
				    }
			});
		    $('#aide button.fauxadd').button(
			{text: false,
				icons: {
			    primary: "ui-icon-plus"
				    }
			});
		    $('#aide button.fauxrm').button(
			{text: false,
				icons: {
			    primary: "ui-icon-trash"
				    }
			});
		    $('#aide button.fauxokl').button(
			{text: false,
				icons: {
			    primary: "ui-icon-check"
				    }
			});
		    $('#aide button.fauxreload').button(
			{text: false,
				icons: {
			    primary: "ui-icon-cancel"
				    }
			});
		    $('#aide button.fauxchoixl').button(
			{text: false,
				icons: {
			    primary: "ui-icon-cart"
				    }
			});
		    $('#aide button.fauxmenu').button(
			{text: false,
				icons: {
			    primary: "ui-icon-triangle-1-s"
				    }
			});
		    $('#aide').fadeIn('slow');
		});
	} else {
	    aide.fadeIn('slow');
	}
    }
    return false;
}

/* bloc --- Les bascules --- */
function basculerAnnee(e) {
    var id;
    if ((e.data != undefined) && (e.data.id != undefined)) {
	id = e.data.id;
    } else {
	id = e;
    }
   var bascule =  $('#basculeannee'+id);
   /* changement d'etat de la bascule (classes On Off)*/
   bascule.toggleClass('basculeOff');
   bascule.toggleClass('basculeOn');
   /* effacement (off) ou affichage (on) de la descendance */
   if (bascule.hasClass('basculeOff')) {/* effacement du tr contenant la descendance */
       $('#trtablesupers'+id).remove();
   } else {
   /* creation d'un tr > td > table qui contiendra la descendance (les super-formations) */
       var colspan = largeurligne(bascule);
       $('#annee_'+id).after('<tr class="conteneur" id="trtablesupers'+id+'"><td class="conteneur" colspan="'+colspan+'"><table class="tablesupers" id="tablesupers_'+id+'"><tbody></tbody></table></td></tr>');
       appendList({type: "sformation", id_parent: id}, /* ajouter quoi ? */
		  $('#tablesupers_'+id+' > tbody'),   /* ou ? */
		  function(){ /* fonction de post-traitement */
		      var legende = $('#legendesformation'+id);
		      addMenuFields(legende);
		      addAdd(legende.find('th.action'));
		      $('#tablesupers_'+id+' tr.sformation').fadeIn("slow");
		  });
   }
   return false;
}

function basculerSuperFormation(e) {
  var id;
  if ((e.data != undefined) && (e.data.id != undefined)) {
    id = e.data.id;
  } else {
    id = e;
  }
  var bascule =  $('#basculesformation_'+id);
  /* changement d'etat de la bascule (classes On Off)*/
  bascule.toggleClass('basculeOff');
  bascule.toggleClass('basculeOn');
  /* basculer */
  basculerIdentiques(bascule, e);
  /* effacement (off) ou affichage (on) de la descendance */
  if (bascule.hasClass('basculeOff')) {/* effacement du tr contenant la descendance */
    $('#trtableformations'+id).remove();
  } else {
    /* creation d'un tr > td > table qui contiendra la descendance (les super-formations) */
    var colspan = largeurligne(bascule);
    $('#sformation_'+id).after('<tr class="conteneur" id="trtableformations'+id+'"><td class="conteneur" colspan="'+colspan+'"><table class="tableformations" id="tableformations_'+id+'"><tbody></tbody></table></td></tr>');
    appendList({type: "formation", id_parent: id}, /* ajouter quoi ? */
	       $('#tableformations_'+id+' > tbody'),   /* ou ? */
	       function(){ /* fonction de post-traitement */
		 var legende = $('#legendeformation'+id);
		 addMenuFields(legende);
		 addAdd(legende.find('th.action'));
		 $('#tableformations_'+id+' tr.formation').fadeIn("slow");
		 /* si la barre image de stats de la super etait
		  * visible, on rend visible aussi les barres de
		  * stats des formations */
		 if ($('#imgsformation_'+id+' img').is(':visible')) {
		   $('#tableformations_'+id+' > tbody div.imgformation').show();
		   $('#tableformations_'+id+' > tbody tr.formation').each(function (i) {
		     var tag = this.id;
		     if (tag != undefined) {
		       var id = tag.replace('formation_','');
		       htdFormation(id);
		     }
		   });
		 }
	       });
  }
  return false;
}

/* En cas de meta-click on fait une bascule identique sur les bascules */
/* de la même section */
function basculerIdentiques(bascule, e) {
  if (e.metaKey || extendedcommand) {
    var onoff = ".basculeOff";
    if (bascule.hasClass('basculeOff')) {
      onoff = ".basculeOn";
    }
    if (extendedcommand) {
      extendedcommand = false;
      console.log('extended command off');
    }
    e.preventDefault();
    var bascules = bascule.closest("tbody").children("tr").children("td.laction").find(onoff).trigger("click");
  }
}

function basculerFormation(e) {
    var id = e.data.id;
    var sid = idString({id: id, type: "formation"});
    var bascule =  $('#basculeformation_'+id);
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    basculerIdentiques(bascule, e); /* meta-click */
    if (bascule.hasClass('basculeOff')) {
	$('#tablecours_'+id+' tr.cours div.basculeOn').trigger("click");
	$('#tablecours_'+id+' tr.cours').remove();
	$('#tablecours_'+id+' tr.imgcours').remove();
	var histo = $('#histoDesCoursFormation'+id);
	if (histo.hasClass('histoOn')) {
	    histo.toggleClass('histoOff');
	    histo.toggleClass('histoOn');
	}
	$('#trtablecours'+id).remove();
  } else {
       var colspan = largeurligne(bascule);
	$('#formation_'+id).after('<tr class="conteneur" id="trtablecours'+id+'"><td class="conteneur" colspan="'+colspan+'"><table class="cours" id="tablecours_'+id+'"><tbody></tbody></table></td></tr>');
	appendList({type: "cours", id_parent: id},$('#tablecours_'+id+' > tbody'), function(){
		var legende = $('#legendecours'+id);
		addMenuFields(legende);
		addAdd(legende.find('th.action'));
		$('#tablecours_'+id+' tr.cours').fadeIn("slow");
	    });
    }
    return false;
}

function basculerCours(e) {
    var id = e.data.id;
    var sid = idString({id: id, type: "cours"});
    var bascule =  $('#basculecours_'+id);
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    basculerIdentiques(bascule, e);
    if (bascule.hasClass('basculeOn')) {
        var colspan = largeurligne(bascule);
	$('#'+sid).after('<tr class="conteneur" id="trtabletranches'+id+'"><td class="conteneur" colspan="'+colspan+'"><table id="tabletranches_'+id+'" class="tranches"><tbody></tbody></table></td></tr>');
	appendList({type: "tranche", id_parent: id},$('#tabletranches_'+id+' tbody'), function () {
	var legende = $('#legendetranche'+id);
	addMenuFields(legende);
	addAdd(legende.find('th.action'));
	    });
        basculerChoix(e);
    } else {
      $('#trtabletranches'+id).remove();
    }
  return false;
}

function basculerChoix(e) {
   var id = e.data.id;
   $("#tabletranches_"+id).before('<div class="choix"><div class="caption">Souhaits</div><table class="choix" id="tablechoix_'+id+'"><tbody></tbody></table></div>');
   appendList({type: "choix", id_parent: id},$('#tablechoix_'+id+'> tbody'));
   var legende = $('#legendechoix'+id);
   addMenuFields(legende);
   addAdd(legende.find('th.action'));
//   $('div.choix').resizable();
   /* positionner les actions */
   return false;
}

function basculerCategorie(e) {
    var id = parseIdString($(this).attr('id')).id;
    var bascule =  $('#basculeCat_'+id);
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    basculerIdentiques(bascule, e);
    if (bascule.hasClass('basculeOn')) {
	$('#'+idString({id: id, type: "tablecat"}))
	    .append('<tr id="trtableens_'+id+'"><td class="nopadding" colspan="3"><table id="tableens_'+id+'" class="enseignants"><tbody></tbody></table>');
	appendList({type: "enseignant", id_parent: id},
		   $('#tableens_'+id+'> tbody'),
		   function () {
		       var legende = $('#legendeenseignant'+id);
		       addMenuFields(legende);
		       addAdd(legende.find('th.action'));
/*                     $('#tableens_'+id+'> tbody').prepend(<thead></thead>);
		       $('#tableens_'+id+'> thead').append(legende);
		       $('#tableens_'+id).tablesorter(); */
		   });
    } else {
	$("#trtableens_"+id).fadeOut(500).remove();
    }
    return false;
}

function basculerEnseignant(e) {
    var id = e.data.id;
    var sid = idString({id: id, type: "enseignant"});
    var bascule = $('#basculeenseignant_'+id);
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    basculerIdentiques(bascule, e);
    if (bascule.hasClass('basculeOn')) {
	var colspan = largeurligne(bascule);
	$('#'+sid).after('<tr id="trtableservices'+id+'" class="trservices"><td class="services" colspan="'+colspan+'"><table id="tableservices_'+id+'" class="services"><tbody></tbody></table></td></tr>');
	appendList({type: "service", id_parent: id},$('#tableservices_'+id+' tbody'), function () {
	var legende = $('#legendeservice'+id);
	addMenuFields(legende);
	addServiceAdd(legende);
//	addAdd(legende.find('th.action'));
	    });
    } else {
	$('#trtableservices'+id).remove();
    }

    return false;
}



function basculerTags() {
    var bascule = $('#basculetags');
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    if (bascule.hasClass('basculeOn')) {
	$("#vuetags > tbody").append('<tr id="trlestags"><td colspan=2><table class="lestags" id="lestags"><tbody></tbody></table></td></tr>');
	var id = 'all';
	appendList({type: "tag", id_parent: id},$('#lestags > tbody'));
	var legende = $('#legendetag'+id);
	addAdd(legende.find('th.action'));
    } else {
	$('#trlestags').remove();
    }
   return false;
}

function basculerCollections() {
    var bascule = $('#basculecollections');
    bascule.toggleClass('basculeOff');
    bascule.toggleClass('basculeOn');
    if (bascule.hasClass('basculeOn')) {
	$("#vuecollections > tbody").append('<tr id="trlescollections"><td colspan=2><table class="lescollections" id="lescollections"><tbody></tbody></table></td></tr>');
	var id = 'all';
	appendList({type: "collection", id_parent: id},$('#lescollections > tbody'));
	var legende = $('#legendecollection'+id);
	addAdd(legende.find('th.action'));
    } else {
	$('#trlescollections').remove();
    }
   return false;
}

/* bloc --- fin des bascules --- */

/* bloc --- Boutons ---*/

/* duplication de ligne */
function addMult(td) {
    if (!existsjQuery(td)) return;
    var tr = td.parent('tr');
    var oid = parseIdString(tr.attr('id'));
    var multl = jQuery('<button class="multl">Dupliquer '+oid["type"]+'</button>');
    multl.button({
	text: false,
		icons: {
	    primary: "ui-icon-copy"
		    }
	});
    multl.bind("click",oid,duplicateLine);
    removeMult(td);
    td.find('div.palette').append(multl);
}
function removeMult(td) {
    td.find('button.multl').remove();
}

/* caddy (choix) */
function addChoisir(td) {
    if (!existsjQuery(td)) return;
    var tr = td.parent('tr');
    var oid = parseIdString(tr.attr('id'));
    var choixl = jQuery('<button class="choixl">Se proposer pour cette intervention</button>');
    choixl.button({
	text: false,
		icons: {
	    primary: "ui-icon-cart"
		    }
	});
    choixl.bind("click",oid,selectLine);
    removeChoisir(td);
    td.find('div.palette').append(choixl);
}
function removeChoisir(td) {
    td.find('button.choixl').remove();
}


/* ajout de ligne */
function addAdd(td) {
    if (!existsjQuery(td)) return;
    var tr = td.closest('tr');
    var type = tr.attr('class');
    var addl = jQuery('<button class="addl">Ajouter '+type+'</button>');
    addl.button({
	text: false,
		icons: {
	    primary: "ui-icon-plus"
		    }
	});
    addl.bind("click",{tr: tr},newLine);
    td.find('div.palette').append(addl);
}
function removeAdd(td) {
    td.find('button.addl').remove();
}

/* effacement de ligne */
function addRm(td) {
    if (!existsjQuery(td)) return;
    var tr = td.parent('tr');
    var type = tr.attr('class');
    var oid = parseIdString(tr.attr('id'));
    var rml = jQuery('<button class="rml">Effacer la ligne</button>');
    var removel = jQuery('<div class="removel"/>');
    rml.button({
	text: false,
		icons: {
	    primary: "ui-icon-trash"
		    }
	});
    rml.bind("click",oid,removeLine);
    removeRm(td);
    td.append(removel.append(rml));
}
function removeRm(td) {
    td.find('div.removel').remove();
}


/* poignee de manipulation (pour glisser/deposer) */
function addHandle(td, type) {
    if (!existsjQuery(td)) return;
    removeHandle(td);
    td.prepend('<div class="handle '+type+'"/>');
    td.children('div.handle').draggable({ /* td.closest('tr').draggable ... */
		helper:  dragLine
	});
}
function removeHandle(td) {
    td.children('div.handle').remove();
}

function dragLine(e) {
    var tr = $(e.target).closest('tr');
    var handle = tr.find('div.handle');
    var id = tr.attr('id');
    var type = parseIdString(id).type;
    var clone = jQuery('<div class="clone" style="width:'+tr.innerWidth()+'px;"><table class="'+type+'"><tbody></tbody></table></div>');
    tr.attr('id', 'drag-'+id);
    clone.find('tbody').append(tr.clone());
    clone.find('td.action, td.laction').html('');
    tr.attr('id', id);
    handle.append(clone);
//    $('body').append(clone.clone());
    return clone;
}

function dropLine(e,ui) {
    var tr = ui.draggable.find('tr');
    var dragoid = parseIdString(tr.attr('id'));
    var drop = $(e.target).closest('tr');
    var dropoid = parseIdString(drop.attr('id'));
    if (dragoid["type"] == "drag-tranche") {/* cours */
	var dragname = "intervention";
	var dropname = drop.children('td.nom_cours').text();
	$("#dialog-drop-tranche").children(".hiddenvalue").html("<span>"+dragoid["id"]+"</span><span>"+dropoid["id"]+"</span>");
	$("#dialog-drop-tranche").dialog("option","title",dragname+" -> "+dropname);
	$("#dialog-drop-tranche").dialog('open');
    };
    if (dragoid["type"] == "drag-cours") {/* cours */
	var dragname = tr.children('td.nom_cours').text();
	var dropname = drop.children('td.intitule').text();
	$("#dialog-drop-cours").children(".hiddenvalue").html("<span>"+dragoid["id"]+"</span><span>"+dropoid["id"]+"</span>");
	$("#dialog-drop-cours").dialog("option","title",dragname+" -> "+dropname);
	$("#dialog-drop-cours").dialog('open');
    };
    if ("drag-sformation" == dragoid["type"]) {
	var dragname = tr.children('td.nom').text();
	var dropname = drop.children('td.annee').text();
	$("#dialog-drop").dialog("option","title","Copie en profondeur "+dragname+" -> "+dropname);
	$("#dialog-drop").children(".hiddenvalue").html("<span>sformation</span><span>"+dragoid["id"]+"</span><span>"+dropoid["id"]+"</span>");
	$("#dialog-drop").dialog('open');
    }
    if ("drag-annee" == dragoid["type"]) {
	var dragname = tr.children('td.annee').text();
	var dropname = drop.children('td.annee').text();
	$("#dialog-drop").dialog("option","title","Copie en profondeur "+dragname+" -> "+dropname);
	$("#dialog-drop").children(".hiddenvalue").html("<span>annee</span><span>"+dragoid["id"]+"</span><span>"+dropoid["id"]+"</span>");
	$("#dialog-drop").dialog('open');
    }

}

/* reload de ligne */
function addReload(td) {
    if (!existsjQuery(td)) return;
    var sid = td.closest('tr').attr('id');
    var oid = parseIdString(sid);
    var reloadl = jQuery('<button class="reloadl">annuler les modifications</button>');
    reloadl.button({
	text: false,
		icons: {
	    primary: "ui-icon-cancel"
		    }
	});
    reloadl.bind("click",oid,refreshLine);
    td.find('div.palette').append(reloadl);
}
function removeReload(td) {
    td.find('button.reloadl').remove();
}

/* bouton d'envoi */
function addOk(jqcell) {
    var ligne = jqcell.parent('tr');
    var td = ligne.find('td.action');
    if (!existsjQuery(td)) return;
    if (ligne.hasClass('edit')) {
	/* il y avait deja au moins une cellule en cours d'edition dans la ligne */
	ligne.find('div.ok').remove();
    } else {
	/* c'est la premiere cellule en cours d'edition dans la ligne.
	   En cas de confirmation on peut envoyer toute la ligne */
	ligne.addClass('edit');
	jqcell.append('<div class="ok"/>');
	jqcell.find('div.ok').click(sendModifiedLine);
	removeReload(td);
	removeRm(td);
	removeMult(td);
	addReload(td); // <-- ajout du reload
	var okl = jQuery('<button class="okl">envoyer les modifications</button>');
	okl.button({
			text: false,
			icons: {
				primary: "ui-icon-check"
			}
	});
	okl.bind("click",sendModifiedLine);
	td.find('div.palette').append(okl);
    }
}

function addMenuFields(tr) {
    var th = tr.find('th.action');
    if (!existsjQuery(th)) return;
    th.find('div.palette').prepend('<button class="menufields">champs...</button>');
    var button = th.find('button.menufields').button({
			text: false,
			icons: {
				primary: "ui-icon-triangle-1-s"
			}
	});
    button.one("click", {th: th, button: button},
	       openMenuFields);
    return false;
}

function removeMenuFields(td) {
    td.find('button.menufields').remove();
}

function addServiceAdd(tr) {
    var th = tr.find('th.action');
    if (!existsjQuery(th)) return;
    th.find('div.palette').append('<button class="menuadd">ajouter...</button>');
    var button = th.find('button.menuadd').button({
			text: false,
			icons: {
				primary: "ui-icon-plus"
			}
	});
    button.one("click", {th: th, button: button},
	       openServiceAdd);
    return false;
}
function removeServiceAdd(td) {
    td.find('button.menuadd').remove();
}

/*---- fin boutons ----*/

/*bloc--------histogrammes ---------*/
function addHistoGlobal(td) {
    if (!existsjQuery(td)) return;
    var oid = parseIdString(td.parent().attr('id'));
    var annee = oid["id"];
    td.find("micropalette").remove();
    td.prepend( '<div class="micropalette"><div id="globalHisto_'+annee+'" class="globalHistoOff"></div></div>');
    $('#globalHisto_'+annee).bind("click",{annee: annee},histoDesFormations);
}

function histoDesFormations(e) {
    var annee = e.data.annee;
    var divan = $('#annee_'+annee);
    var bascule = $('#globalHisto_'+annee);
    bascule.toggleClass('globalHistoOff');
    bascule.toggleClass('globalHistoOn');
    if (bascule.hasClass('globalHistoOn')) {
	divan.find('div.imgformation').show();
	$('#annee_'+annee+' tr.formation').each(function (i) {
		var tag = this.id;
		if (tag != undefined) {
		    var id = tag.replace('formation_','');
		    htdFormation(id);
		}
	    });
	$('#annee_'+annee+' table.super').each(function (i) {
		var tag = this.id;
		if (tag != undefined) {
		    var id = tag.replace('tablesuper_','');
		    htdSuperFormation(id); // ok
		}
	    });
	htdTotaux(annee); // ok
    } else {
	$('#annee_'+annee+' div.imgformation').hide();
    }
    return false;
}


function htdTotaux(annee) {// OK pour le moment
    jQuery.post("act_totaux.php", {annee_universitaire: annee}, function (data) {
	    if (!contientERREUR(data)) {
		data = trim(data);
		$('#imgentete_'+annee).html(data);
		var totaux = $('#imgentete img').attr('title');
		$('#entete_'+annee+' td span.totaux').text(totaux);
	    } else {
		$('#imgentete_'+annee).html('');
	    }
	}, 'html');
    return false;
}


function htdSuperFormation(id) {
    jQuery.post("act_totauxsuper.php", {id_sformation: id}, function (data) {
	    if (!contientERREUR(data)) {
		data = trim(data);
		$('#imgsformation_'+id).html(data);
	    } else {
		$('#imgsformation_'+id).html('');
	    }
	}, 'html');
    return false;
}

/*---------fin histogrammes---------*/

/*---------logs de formation---------*/
function logsFormation(e) {
    var id = e.data.id;
    var bascule = $('#logsFormation'+id);
    bascule.toggleClass('logOff');
    bascule.toggleClass('logOn');
    if (bascule.hasClass('logOn')) {
	var titre = 'Logs '+$('#formation_'+id+'> td.intitule').text();
	// charger une première page de log
	jQuery.post("act_historique.php",
		    {id_formation: id},
		    function (data) {
			if (!contientERREUR(data)) {
			    $('#formation_'+id+' > td.intitule').append('<div class="logsformation" id="logF'+id
                                                                       +'">'+data+'</div>');
			    $('#logF'+id).dialog({autopen: true,
					draggable: true,
					resizable: true,
					width: 700,
					height: 300,
					close: function (event,ui) {logsFormation(e);},
					title: titre
					});
			    if ( existsjQuery($('#logF'+id+'> .historique')) ) { // le log n'est pas vide
                                // on place un bouton de chargement
				$("#logF"+id).append('<button id=morelogF'+id+
                                                      ' class="more">remonter plus loin dans les logs</button>');
				var button = $("#morelogF"+id).button({
				    text: true,
					    icons: {
					primary: "ui-icon-arrowreturnthick-1-e"
						}
				    });
				button.bind('click', function () {
					var offset = button.prev('.hiddenvalue').text();
					if (button.prev().prev().hasClass('hiddenvalue')) {// plus rien à charger dans les logs
					    button.button('disable');
					} else {// charger une autre "page" de logs
					    jQuery.post("act_historique.php",
							{id_formation: id, offset: offset},
							function (data) {
							    if (!contientERREUR(data)) {
								$("#morelogF"+id).before(data);
							    }
							});
					}
				    });
			    }
			    else {
				$('#logF'+id).prepend("logs vide");
			    }
			} else {
			    alert(data);
			}
			return false;
		    }, 'html');
    }  else {
	$('#logF'+id).dialog('destroy');
	$('#logF'+id).remove();
    }
    return false;
}
/*------fin logs de formation---------*/



/* ------- FIN BOUTONS ET ACTIONNEURS --------------*/

/*BLOC-------- MENU CONTEXTUEL DU CHOIX DES CHAMPS ---------*/
/*
addmenufields: positionne et arme le bouton de menu contextuel (bloc precedent)
openmenufields: construit et deroule le menu contextuel
closemenufields: detruit le menu (dont le contenu est dynamique)
togglecolumn: masque ou affiche une colonne puis detruit le menu.
 */
function openMenuFields(e) {
    var th = e.data.th;
    var list = th.siblings('th').not(th);
    var type = th.closest('tr').attr('class');
    var button = e.data.button;
    var menu = jQuery('<ul class="menu"></ul>');
    var offset = button.offset();
    var h = (button.outerHeight) ? button.outerHeight() : button.height();
    menu.css({position: 'absolute',
		'top': offset.top + h - 1,
		'left': offset.left,
		'z-index': 2000
		}).click(function(e) { e.stopPropagation(); }).show(200, function() {
			$(document).one('click', {button: button, menu: menu, th: th},
					closeMenuFields);
		    });
    var n = list.length;
    var i = 0;
    for (i = 0; i < n; i++) {
	var item = list.eq(i);
	var classname = item.attr("class");
        var titre = item.text();
	var visible = (item.css('display') != 'none');
	var blob = jQuery('<li>'+titre+'</li>');
	if (!visible) blob.addClass('inv');
	blob.one('click',
		 {type: type, visible: visible,
			 css: classname,
			 button: button, menu: menu, th: th},
		 toggleColumn);
	menu.append(blob);
    }
    $('body').append(menu);
//    th.find('select').selectmenu();
    return false;
}


function closeMenuFields(e) {
/*
    e.data.menu.removeClass('active').hide(100, function() {
            e.data.button.removeClass('active');
        });
*/
    e.data.menu.fadeOut('slow');
    e.data.menu.remove();
    e.data.button.one('click', {button: e.data.button, th: e.data.th}, openMenuFields);
    return false;
}

function toggleColumn(e) {
    closeMenuFields(e);
    if (e.data.visible) {
	$('tr.'+e.data.type+' > th.'+e.data.css+',tr.'+e.data.type+' >  td.'+e.data.css).fadeOut(0);
    } else {
	$('tr.'+e.data.type+' > th.'+e.data.css+',tr.'+e.data.type+' >  td.'+e.data.css).fadeIn('slow');
    }
    return false;
}
/* ---------- FIN MENU CONTEXTUEL DES CHAMPS ---------*/




/*BLOC-------- MENU AJOUT SERVICE ---------*/
/*
sur le meme modele que le menu contextuel des champs
 */
function openServiceAdd(e) {
    var th = e.data.th;
    var tr = th.closest('tr');
    var tbody = tr.closest('tbody');
    var list = $('#choixannee').find('option');
    var type = th.closest('tr').attr('class');
    var button = e.data.button;
    var menu = jQuery('<ul class="menu"></ul>');
    var offset = button.offset();
    var h = (button.outerHeight) ? button.outerHeight() : button.height();
    menu.css({position: 'absolute',
		'top': offset.top + h - 1,
		'left': offset.left,
		'z-index': 2000
		}).click(function(e) { e.stopPropagation(); }).show(200, function() {
			$(document).one('click', {button: button, menu: menu, th: th},
					closeServiceAdd);
		    });
    var n = list.length;
    var i = 0;
    var menuisempty = true;
    for (i = 0; i < n; i++) {
	var item = list.eq(i);
	var valeur = item.val();
        var titre = item.text();
//	var visible = (item.css('display') != 'none');
//	if (!visible) blob.addClass('inv');
	if (!existsjQuery(tbody.find('tr.service > td.annee_universitaire:contains('+titre+')'))) {
	    var blob = jQuery('<li>'+titre+'</li>');
	    blob.one('click',
		     {type: type,
			     annee: valeur,
			     button: button,
			     menu: menu,
			     th: th,
			     tr: tr},
		     nouveauService);
	    menu.append(blob);
	    menuisempty = false;
	}
    }
    if (menuisempty) {
	menu.append(jQuery('<li><i>ajout impossible</i></li>'));
    }
    $('body').append(menu);
//    th.find('select').selectmenu();
    return false;
}


function closeServiceAdd(e) {
   e.data.menu.fadeOut('slow');
    e.data.menu.remove();
    e.data.button.one('click', {button: e.data.button, th: e.data.th}, openServiceAdd);
    return false;
}

function   nouveauService(e) {
    closeServiceAdd(e);
    newLine(e);
}


/* ---------- FIN MENU AJOUT SERVICE ---------*/

function getAnnee(c) {
    if ((arguments.length > 0) && existsjQuery(c)) {/* trouver l'annee dans la branche du dom */
	var ids = c.closest('table.tablesupers').attr('id');
	/* TODO remplacer tr.annee par quelque chose comme id^=annee_ */
	var oid = parseIdString(ids);
	return oid.id;
    }/* sinon on fait comme si on pouvait trouver ça dans le menu */
    return $('#choixannee option:selected').attr('value');
}

/* ---------- PANIER -------------*/
function togglePanier() {
    var annee = getAnnee();
    var panier = $("#panier");
    var id = $('#user > .id').text();
    if (panier.dialog("isOpen")) {
	panier.dialog("close"); /* fermeture suivie de la re-ouverture, pour forcer l'affichage en emplacement central */
    }
    panier.dialog("open");
    reloadChoix(panier, id, annee);
}

function showChoix() { // utilisee dans service.php
    var choix = $("#choix");
    var id = $('#formuser > .id').text();
    reloadChoix(choix, id, getAnnee());
}
function showPotentiel() { // utilisee dans service.php
    var choix = $("#potentiel");
    var id = $('#formuser > .id').text();
    reloadChoix(choix, id, getAnnee(), "potentiel");
}
function showResponsabilite() { // utilisee dans service.php
    var body = $("#responsabilite");
    var id = $('#formuser > .id').text();
    var type ='responsabilite';
    body.html('');
    body.append('<div class="responsabilite-conteneur"><table id="table'+type+'" class="'+type+'"><tbody></tbody></table></div>');
    appendList({type: type, id_parent: id, annee_universitaire: getAnnee()},
	       $('#table'+type+' > tbody'));
}

function reloadChoix(panier,id, annee, type) {
    if (type === undefined) {
	type = "longchoix";
    }
    panier.html('');
    panier.append('<div class="panier-conteneur"><table id="table'+type+'" class="'+type+'"><tbody></tbody></table></div>');
    appendList({type: type, id_parent: id, annee_universitaire: annee},
	       $('#table'+type+' > tbody'),
	       function (o) {
		   var legende = $('#legende'+type+id);
		   addMenuFields(legende);
		   var line = legende.clone().attr('id','sum'+type);
		   line.children('th').html('');
		   line.children('th.nom_cours').addClass('etiquette').html('total');
		   $('#table'+type+' > tbody').append(line);
		   line = legende.clone().attr('id','s1sum'+type);
		   line.children('th').html('');
		   line.children('th.nom_cours').addClass('etiquette').html('semestre&nbsp;1');
		   $('#table'+type+' > tbody').append(line);
		   line = legende.clone().attr('id','s2sum'+type);
		   line.children('th').html('');
		   line.children('th.nom_cours').addClass('etiquette').html('semestre&nbsp;2');
		   $('#table'+type+' > tbody').append(line);
		   recalculatePanier(type);
		   if (type == "potentiel") {
		       $('#tablepotentiel > tbody > tr > td').removeClass("mutable");
		       $('#tablepotentiel > tbody > tr > td.action').hide();
		   }
	       });
}

function recalculatePanier(type) {
    if (type === undefined) {
	type = "longchoix";
    }
    /* totaux */
    var body = $('#table'+type+' > tbody');
    var htd = 0; var cm = 0; var td = 0; var tp = 0;
    var alt = 0; var prp = 0; var referentiel = 0;
    var htd1 = 0; var cm1 = 0; var td1 = 0; var tp1 = 0;
    var alt1 = 0; var prp1 = 0; var referentiel1 = 0;
    var htd2 = 0; var cm2 = 0; var td2 = 0; var tp2 = 0;
    var alt2 = 0; var prp2 = 0; var referentiel2 = 0;
    body.children("tr[id^='"+type+"_']").each(function(i) {
	    var line = $(this);
	    htd += parseFloat(line.children('td.htd').text());
	    cm += parseFloat(line.children('td.cm').text());
	    td += parseFloat(line.children('td.td').text());
	    tp += parseFloat(line.children('td.tp').text());
            alt += parseFloat(line.children('td.alt').text());
            prp += parseFloat(line.children('td.prp').text());
	    referentiel += parseFloat(line.children('td.referentiel').text());
	    if (line.children('td.semestre').text() == '1') {
		htd1 += parseFloat(line.children('td.htd').text());
		cm1 += parseFloat(line.children('td.cm').text());
		td1 += parseFloat(line.children('td.td').text());
		tp1 += parseFloat(line.children('td.tp').text());
		alt1 += parseFloat(line.children('td.alt').text());
		prp1 += parseFloat(line.children('td.prp').text());
		referentiel1 += parseFloat(line.children('td.referentiel').text());
	    }
	    if (line.children('td.semestre').text() == '2') {
		htd2 += parseFloat(line.children('td.htd').text());
		cm2 += parseFloat(line.children('td.cm').text());
		td2 += parseFloat(line.children('td.td').text());
		tp2 += parseFloat(line.children('td.tp').text());
		alt2 += parseFloat(line.children('td.alt').text());
		prp2 += parseFloat(line.children('td.prp').text());
		referentiel2 += parseFloat(line.children('td.referentiel').text());
	    }
	});
    $('#sum'+type+' > th.htd').html(htd);
    $('#sum'+type+' > th.cm').html(cm);
    $('#sum'+type+' > th.td').html(td);
    $('#sum'+type+' > th.tp').html(tp);
    $('#sum'+type+' > th.alt').html(alt);
    $('#sum'+type+' > th.prp').html(prp);
    $('#sum'+type+' > th.referentiel').html(referentiel);

    $('#s1sum'+type+' > th.htd').html(htd1);
    $('#s1sum'+type+' > th.cm').html(cm1);
    $('#s1sum'+type+' > th.td').html(td1);
    $('#s1sum'+type+' > th.tp').html(tp1);
    $('#s1sum'+type+' > th.alt').html(alt1);
    $('#s1sum'+type+' > th.prp').html(prp1);
    $('#s1sum'+type+' > th.referentiel').html(referentiel1);

    $('#s2sum'+type+' > th.htd').html(htd2);
    $('#s2sum'+type+' > th.cm').html(cm2);
    $('#s2sum'+type+' > th.td').html(td2);
    $('#s2sum'+type+' > th.tp').html(tp2);
    $('#s2sum'+type+' > th.alt').html(alt2);
    $('#s2sum'+type+' > th.prp').html(prp2);
    $('#s2sum'+type+' > th.referentiel').html(referentiel2);

}

/* BLOC ----- PANIER -------------*/


/* BLOC ------- REMPLISSAGE DES TABLEAUX ---------*/
function appendList(data, body, do_it_last) {
    var legende = $("#skel"+data.type);
    var list = legende.children('th');
    legende.clone(true).attr('id','legende'+data.type+data.id_parent).appendTo(body);
    var colspan = list.length;
    var loading = jQuery('<tr><td colspan="'+colspan+'"><img src="css/img/ajax-loader.gif" /></td></tr>');
    body.append(loading);
    legende = $('#legende'+data.type+data.id_parent);
    getjson("json_get.php",data, function (o) {
	    var n = o.length;
	    var i = 0;
	    for (i = n - 1; i >= 0; i--) {
		appendItem(data.type,legende,o[i],list);
	    }
	    if (do_it_last != undefined) {// comment tester si fonction ?
		do_it_last(o);
	    }
	loading.remove();
	});
}


function appendItem(type, prev, o, list) {
    var n = list.length;
    var i = 0;
    var id = idString({id: o["id_"+type], type: type});
    var line = jQuery('<tr id="'+id+'" class="'+type+'"></tr>');
    prev.after(line);
    for (i = 0; i < n; i++) {
	var name = list.eq(i).attr("class");
	var cell = jQuery('<td class="'+name+'"></td>');
	if (L[name] == null) alert('traitement non défini pour la cellule : '+name+'. Rechargez la page.');
	L[name].setval(cell, o);
	L[name].showmutable(cell);
	if (hasTouch) {
	    cell.click(function (event) {
		    if (clickeditmode) {
			edit(event);
		    }
		    return false;
		});
	} else {
	    if(L[name].oneclickedit) {
		cell.click(edit);
	    } else {
		cell.dblclick(edit);
	    }
	}
	line.append(cell);
	if (list.eq(i).css('display') == 'none') {
	    cell.fadeOut(0);
	}
    }
    if (type == "cours") {
	var idc = o["id_cours"];
        var nbbasc = o["nb_tranche"];
        var nbchoix = o["nb_choix"];
	var classzero = "";
        if (0 == nbbasc) classzero = " basculeZero";
        var compte = '<div class="nbbasc">'+nbbasc+'</div>';
        if (superuser()) {
          compte = '<div class="nbbasc">'+nbchoix+'/'+nbbasc+'</div>';
        }
	line.children('td.laction')
	    .prepend('<div class="basculeOff'+classzero+'" id="basculecours_'+idc+'">'+compte+'</div>')
	    .bind('click',{id: idc},basculerCours);
	addHandle(line.children('td.laction'), "cours");
/*      Glisser deposer de tranches pour plus tard
	$('#basculecours_'+idc).droppable({accept:'div.handle.tranche', drop: dropLine, activeClass: 'bascule-highlight',tolerance:'touch'});
*/
	var colspan = largeurligne($("#skelcours"));
	line.before('<tr class="imgcours"><td class="imgcours" colspan="'+colspan+'"><div id="imgcours'+o["id_cours"]
		    +'" class="imgcours"></div></td></tr>');
    }
    if (type == "annee") {
	var idannee = o["id"];
	var nbbasc = o["nb_sformation"];
	var classzero = "";
	if (0 == nbbasc) classzero = " basculeZero";
	/* bascule d'annee */
	line.children('td.laction')
	    .prepend('<div class="basculeOff'+classzero+'" id="basculeannee'+idannee+'"><div class="nbbasc">'+nbbasc+'</div></div>');
	$('#basculeannee'+idannee).bind('click',{id: idannee},basculerAnnee);
	addHandle(line.children('td.laction'), "annee");
	$('#basculeannee'+idannee).droppable({accept:'div.handle', drop: dropLine, activeClass: 'bascule-highlight',tolerance:'touch'});
    }
    if (type == "sformation") {
	var idsf = o["id_sformation"];
	var nbbasc = o["nb_formation"];
	var classzero = "";
	if (0 == nbbasc) classzero = " basculeZero";
	/* bascule de sformation */
	line.children('td.laction')
	    .prepend('<div class="basculeOff'+classzero+'" id="basculesformation_'+idsf+'"><div class="nbbasc">'+nbbasc+'</div></div>');
      $('#basculesformation_'+idsf).bind('click',{id: idsf},basculerSuperFormation);
	addHandle(line.children('td.laction'), "sformation");
	$('#basculesformation_'+idsf).droppable({accept:'div.handle.formation', drop: dropLine, activeClass: 'bascule-highlight',tolerance:'touch'});
    }
    if (type == "formation") {
	var idf = o["id_formation"];
	var nbbasc = o["nb_cours"];
	var classzero = "";
	if (0 == nbbasc) classzero = " basculeZero";
	/* histogrammes et logs */
	line.children('td.laction')
	    .prepend('<div class="micropalette"><div class="histoOff" id="histoDesCoursFormation'+idf+'"></div><div class="logOff" id="logsFormation'+idf+'"></div></div>');
	$('#histoDesCoursFormation'+idf).bind('click',{id: idf},histoDesCours);
	$('#logsFormation'+idf).bind('click',{id: idf},logsFormation);
	/* bascule de formation */
	line.children('td.laction')
	    .prepend('<div class="basculeOff'+classzero+'" id="basculeformation_'+idf+'"><div class="nbbasc">'+nbbasc+'</div></div>');
      $('#basculeformation_'+idf).bind('click',{id: idf},basculerFormation);
	$('#basculeformation_'+idf).droppable({accept:'div.handle.cours', drop: dropLine, activeClass: 'bascule-highlight',tolerance:'touch'});
	/* */
	var colspan = largeurligne($("#skelformation"));
	line.before('<tr class="imgformation"><td class="imgformation" colspan="'+colspan+'"><div id="imgformation'+idf +'" class="imgformation"></div></td></tr>');
    }
    if (type == "tranche") {
	addMult(line.children('td.action'));
	if ( (o["id_enseignant"] == 3) || config_choisir_tout_cours) {
	    addChoisir(line.children('td.laction'));
	} else {
	    removeChoisir(line.children('td.laction'));
	}
/*      Glisser deposer de tranches pour plus tard
	addHandle(line.children('td.laction'), "tranche");
*/
    }
    if (type == "enseignant") {
	var nbbasc = o["nb_service"];
	var classzero = "";
	if (0 == nbbasc) classzero = " basculeZero";
	line.children('td.laction')
	    .prepend('<div class="basculeOff'+classzero+'" id="basculeenseignant_'+o["id_enseignant"]+'"><div class="nbbasc">'+nbbasc+'</div></div>')
	.bind('click',{id: o["id_enseignant"]},basculerEnseignant)
    }
    addRm(line.find('td.action'));
}
/* ------- FIN REMPLISSAGE DES TABLEAUX ---------*/

/* BLOC ----- ENVOI DE MODIFS AU SERVEUR --------*/
function findIdParent(tr,type) {/* ne fonctionnera pas avec le type formation */
    var table = tr.closest("table");
    var sid = table.attr("id");
    var oid = parseIdString(sid);
    return oid.id;
}

/* ajouter une nouvelle ligne sur le serveur et dans la vue */
function newLine(e) {
    var tr;
    if (existsjQuery(e.data.tr)) {
	tr = e.data.tr;
    } else {
	tr = $(this).closest('tr');
    }
    var type = tr.attr('class');
    var list = tr.children('th');
    var n = list.length;
    var i = 0;
    var id_parent = findIdParent(tr,type);
    var data = new Object();
    data.type = type;
    data.id_parent = id_parent;
    if (type == "tranche") {
	data.id_enseignant = 3;
    }
    if (type == "service") {
	data.annee = e.data.annee;
    }
    getjson("json_new.php", data, function (tabo) {
	    appendItem(type,tr,tabo[i],list);
	});

}

/* supprimer une ligne du serveur et de la vue */
function removeLine(o) {
    var oid = o.data;
    var tr = $("#"+idString(oid));

    tr.find('div.basculeOn').trigger('click');
    tr.effect('highlight',{},800,function () {
	    if (confirm("Voulez vous vraiment effacer cette ligne ("+oid.type+") et les données associées ?\n Attention : cette opération est définitive.")) {
		getjson("json_rm.php", oid, function() {
			if (oid.type == 'cours') {
			    tr.prev('tr.imgcours').remove();
			}
			tr.fadeOut('slow');
			if (oid.type == "choix") {
			    tr.remove();
			    oid.type = "longchoix";
			    tr = $("#"+idString(oid));
			}
			if ((oid.type == "longchoix")) {
			    tr.remove();
			    oid.type = "choix";
			    $('#'+idString(oid)).remove();
			    recalculatePanier(); /* <-- ...plus lent, mais mieux. */
			} else {
			    tr.remove();
			}
		    });
	    }
	});
}

/* soumettre les modifications d'une ligne au serveur */
function sendModifiedLine() {
    var ligne = $(this).closest('tr');
    var parent = ligne.closest('table');
    var donnees = new Object();
    var tid = parseIdString(ligne.attr('id'));
    // alert(ligne.attr('id'));
    donnees['type'] = tid['type'];
    donnees['id'] = tid['id'];
    tid =  parseIdString(parent.attr('id'));
    donnees['id_parent'] = tid['id'];
    ligne.children('td.modification').each(function (i,e) {
	    L.modification.getval($(this),donnees);
	});

    ligne.children('td.edit').each(
	function () {
	    $(this).removeClass('edit');
	    var name = $(this).attr('class');
	    $(this).addClass('edit');
	    L[name].getval($(this),donnees);
	});

    getjson("json_modify.php",donnees, replaceLine);
}

/* rafraichir la vue sur une ligne avec les donnees fournie par le serveur */
function replaceLine(tabo) {
    var o = tabo[0];
    var id = idString(o);
    var ligne = $('#'+id);
    ligne.attr('class', o.type);
    ligne.children('td').not('td.action').not('td.laction').each(
	function () {
	    var td = $(this);
	    var nom;
	    td.removeClass('edit');
	    td.removeClass('inactive');
	    td.removeClass('mutable');
	    nom = td.attr('class');
	    if (typeof(L[nom]) == 'undefined') {
		alert (nom+ +' indéfini dans la ligne.');
	    }
	    L[nom].setval(td, o);
//	    if ("editable" in o) {
	    L[nom].showmutable(td);
//	    }
	});
    ligne.find('td.action button.okl').remove();
    removeReload(ligne.children('td.action'));
    addRm(ligne.children('td.action'));
    if (o["type"] == "tranche") {
	addMult(ligne.children('td.action'));
	if (o["id_enseignant"] == 3) {
	    addChoisir(ligne.children('td.laction'));
	} else {
	    removeChoisir(ligne.children('td.laction'));
	}
    }
}


/* Dupliquer une ligne */
function duplicateLine(e) {
    var oid = e.data;
    var sid = idString(oid);
    var original = $('#'+sid);
    /* faut-il demander une confirmation ? */
    getjson("json_duplicate.php",oid,function (tabo) {
	    var o = tabo[0];
	    var legende = $("#skel"+o["type"]);
	    var list = legende.children('th');
	    appendItem(o["type"],original,o,list);
	});
}

/* Faire un choix d'intervention */
function selectLine(e) {
    var oid = e.data;
    var source = $('#'+idString(oid));
    source.effect('highlight',{},800,function () {});
    getjson("json_get.php",oid,function (tabo) {
	    var o = tabo[0];
	    o.type = "choix";
	    delete o.id;
	    delete o.id_tranche;
	    delete o.id_enseignant;
	    o.id_parent = o.id_cours;
	    getjson("json_new.php",o,function (tabo) {
		    var o = tabo[0];
		    var legende = $("#legendechoix"+o["id_cours"]);
		    var list = legende.children('th');
		    appendItem(o["type"],legende.siblings().andSelf().filter('tr:last'),o,list);
		    $('#bouton-panier').trigger('click');
		});
	});
    return false;
}

/* indice de dépliage */
function findLastIndBasc(c) {
    var nbbasc = c.closest('table').closest('tr').prev('tr').children('td.laction').find('div.nbbasc');
    return nbbasc;
}

/* trouve un indice de bascule approprié (qui peut simplement être fournit par le premier argument),
 * lui ajoute le nombre number puis retourne la nouvelle valeur */
function addToIndBasc(any_jq, number) {
    if (!existsjQuery(any_jq)) return -1;
    var nbbasc;
    if (any_jq.hasClass('nbbasc')) { /* on a reçu le div qui contient l'indice */
	nbbasc = any_jq;
    } else { /* on doit chercher l'indice l'étage au dessus */
	nbbasc = findLastIndBasc(any_jq);
    }
    if (!existsjQuery(nbbasc)) return -1;

    var indice = parseFloat(nbbasc.text());
    var new_indice = indice + number;
    /* nouvel indice */
    nbbasc.text(new_indice);
    /* les zéro ont leur propre style (basculeZero) */
    if ( (0 != new_indice) && (0 == indice)) {
	nbbasc.parent(".basculeZero").removeClass("basculeZero");
    }
    else if ((0 == new_indice) && (0 != indice)) {
	nbbasc.parent(".basculeOn, .basculeOff").addClass("basculeZero");
    }
    return new_indice;
}


/* deplacer ou copier un cours */
function dropCopier() {
    var source = $(this).children(".hiddenvalue").children("span:first").text();
    var but = $(this).children(".hiddenvalue").children("span:last").text();
    alert("Copier "+source+" dans "+but+": fonction non disponible");
    $(this).dialog("close");
}

function dropDeplacer() {
    var type = "cours"; /* ATTENTION pour le moment seulement les cours */
    var source = $(this).children(".hiddenvalue").children("span:first").text();
    var but = $(this).children(".hiddenvalue").children("span:last").text();
    var cours = $('#'+idString({type: type, id: source}));
    var imgcours = cours.prev();

    /* fermer la vue dépliée du cours */
    $("#basculecours_"+source+".basculeOn").trigger('click');

    /* montrer qu'il se passe un truc */
    $("#dialog-attendre-deplacer").dialog("open");

    /* envoyer l'ordre de déplacement */
    getjson("json_move.php",
	    {"type": type, "id": source, "id_but": but},
	    function () {
		/* 1) mettre à jour l'ancien indice de dépliage */
		addToIndBasc(cours, -1);

		/* 2) Le cours se déplace dans la vue (perdu de vue si le nouveau parent est plié) */
		if ($("#basculeformation_"+but).hasClass("basculeOn")) {
		    /* on déplace la vue du cours à son nouvel emplacement */
		    $("#legendecours"+but).after(cours);
		    $("#legendecours"+but).after(imgcours);
		    cours.effect('highlight',{},800,function () {});
		    /* 3) mettre à jour le nouvel indice de dépliage */
		    addToIndBasc(cours, 1);
		}
		else {
		    /* on efface la vue du cours de son emplacement actuel */
		    cours.remove();
		    imgcours.remove();
		    /* 3) mettre à jour le nouvel indice de dépliage */
		    addToIndBasc($("#formation_"+but+" > td.laction div.nbbasc"), 1);
		}



		/* fin du truckispasse */
                $("#dialog-attendre-deplacer").dialog("close");

	    });


    /* fermer le dialogue */
    $(this).dialog("close");
}

/* copier une formation, ses cours, ses Interventions */
function copierSformation() {
    copierSuper(1);
}
function copierFormations() {
    copierSuper(2);
}
function copierFormationsCours() {
    copierSuper(3);
}
function copierFormationsCoursInterventions() {
    copierSuper(4);
}
function copierFormationsCoursInterventionsNoms() {
    copierSuper(5);
}

function copierSuper(profondeur) {
    var arg =  $("#dialog-drop div.hiddenvalue span:first");
    var type = arg.text();
    arg = arg.next();
    var source = arg.text();
    arg = arg.next();
    var but = arg.text();
/*    alert("Copier "+source+" ("+type+") dans "+but+": a profondeur "+profondeur+" fonction non disponible"); */

    $("#dialog-drop").dialog("close");
    /* fermer l'annee */
    if ($('#basculeannee'+but).hasClass("basculeOn")) {
	basculerAnnee(but);
    }
    $("#dialog-attendre").dialog("open");
    getjson("json_copy.php",
	    {"type": type, "id": source, "id_cible": but, "profondeur": profondeur},
	    function () {
		    $("#dialog-attendre").dialog("close");
		if ( "annee" == type || "sformation" == type){
		   	basculerAnnee(but);
		}
	    });
}


/*------- FIN ENVOI DE MODIFS AU SERVEUR --------*/

/*  */

function refreshLine(o) {
    var oid = o.data;
    getjson("json_get.php",oid, replaceLine);
}

/* BLOC--- GESTION (AFFICHAGE) DE DROITS --------*/

/* ne fonctionne pas
function responsable_add(td,resp) {
    var oid = parseIdString(td.parent('tr').attr('id'));
    resp[oid["type"]] = td.html();
    resp.s = resp.s + oid["type"] + ": " + td.text() + "\n";
    if (oid["type"] == "tranche") {
	responsable_add(td.closest('tr > td > table').prev().prev().children('td.enseignant'),o);
    } else if (oid["type"] == "cours") {
	responsable_add(td.closest('tr.sousformation').prev().children('td.enseignant'),o);
    } else if  (oid["type"] == "formation") {
        responsable_add(td.closest('table').children('tr.super').children('td.enseignant'),o);
    }
}

function responsables(jq) {
    var resp = new Object();
    var sel;
    resp.s = 'responsables:\n';
    sel = jq.closest('tr').children('td.enseignant');
    responsable_add(sel, resp);
    alert(resp.s);
    return resp;
}
*/


/*------- FIN GESTION DE DROITS --------*/

function keypresscell (event) {
    var target = $(event.target).closest('td');

}



/* ----- DEMARRAGE DU DOCUMENT ---------*/


$(document).ready(function () {
    $.datepicker.setDefaults($.datepicker.regional['fr']);
    L = new ligne(); // <-- var globale


  /* formulaires chargent automatiquement */
  $('#choixannee_select').change(

    function(){
      $('#choixannee').submit();
    /* or:
       $('#formElementId').trigger('submit');
       or:
       $(this).closest('form').trigger('submit');
    */
  });


    /* infobox: liens externes */
    $("div.infobox a").click(function(){window.open(this.href);return false;});

    /* les événements du clavier */
    $(document).on('keydown', '#vuecourante, #vueadmin', function(e) {
	var keyCode = e.keyCode || e.which;
	if (keyCode == 9) { /* [tab] key */
	    e.preventDefault();
	    var cell = $(e.target).closest('td');
	    if (existsjQuery(cell)) {

		var newtarget;
		if (e.shiftKey) {/* en arrière */
		    newtarget = cell.prevAll('td.mutable:visible,td.edit:visible').first();
		} else {
		    newtarget = cell.nextAll('td.mutable:visible,td.edit:visible').first();
		}
		if (existsjQuery(newtarget)) {
		    newtarget.dblclick();
		    newtarget.find('input, textarea').focus();
		}
	    }
	}
	if (keyCode == 13) { /* [enter] key */
	    e.preventDefault();
	    var cell = $(e.target).closest('td');
	    if (existsjQuery(cell)) {
		var button = cell.siblings('td.action').find('button.okl');
		button.click();
	    }
	}
	if (keyCode == 27) { /* [esc] key */
	    e.preventDefault();
	    var cell = $(e.target).closest('td');
	    if (existsjQuery(cell)) {
		var button = cell.siblings('td.action').find('button.reloadl');
		button.click();
	    }
	}
    });

    /* TEST */
    if (false) {/* bascules ... */
	$('#basculesuper7').trigger('click');
	window.setTimeout(function() {$('#basculeformation_17').trigger('click');}, 1000);
	window.setTimeout(function() {$('#basculecours_156').trigger('click');}, 2000);
	//	window.setTimeout(function() {responsables($('#tranche_375'));}, 3000);
    }
});
