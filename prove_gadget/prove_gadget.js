/**
* Prove: Pro-verification tool for Wikidata referrences 
* Developers  : names (emails)
* Inspired by : Recoin: Relative Completeness Indicator (Vevake Balaraman, Simon Razniewski, and Albin Ahmeti), and COOL-WD: COmpleteness toOL for WikiData (Fariz Darari)
*/
function loadentityselector(){
    try {
        $( ".value_input input" ).entityselector( {
                url: 'https://www.wikidata.org/w/api.php',
                language: mw.config.get( 'wgUserLanguage' ),
            } );
    }
    catch(err) {
        setTimeout(loadentityselector, 100);
    }
}

function addstatement(qid, pid, snak) {
var api = new mw.Api();
api.get( { action: 'query', meta: 'tokens'}).then(
    function(aw) {
        token = aw.query.tokens.csrftoken;
        api.post( { 
            action: 'wbcreateclaim',
            entity: qid,
            property: pid,
            snaktype: 'value',
            value: snak,
            summary : "[Edited with Recoin] (Wikidata:Recoin)",
            token: token
            }).then(
                   function(aw){
                           console.log(aw);
                           if(aw.success == 1)
                             location.reload();
                        else
                            alert("Request failed. Please Check again.");
                   });       
            });
}	
function addtosuggestions(result, labelsUL, entityID) {
var add = '';
if (result.data_type=='wikibase-item')
{
    add = '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add add_button"><a href=\"#\"><span class="wb-icon"/></a></span><span id="add" class="value_input" style="display:none"><input/>&nbsp;' + '<a href=\"#\">Publish</a></span>';
}
var $insertElem = $('<tr><td> ' +
        '<label><a href="https://www.wikidata.org/wiki/Property:'+ result.property + '">' + 
        result.property + '</a></td><td>' + result.label + '</td><td>' + result.base_frequency + ' '+ 
        '</label></td><td>' + add +'</td></tr>');
labelsUL.append($insertElem);

$insertElem.find('.add_button a').on('click', function(e) {
    e.stopPropagation();
    e.preventDefault(); 
    $insertElem.find('#add').slideToggle("fast");
    $insertElem.find('.add_button a').hide();
    $insertElem.find('.input').focus();
});
$(document).click(function(e) {
        // e.stopPropagation();
        $insertElem.find('.add_button a').show();
        $insertElem.find("#add").hide();
});
$insertElem.find("#add").click(function(e) {
  e.stopPropagation();
});
$insertElem.find('#add a').on('click', function(e) {
e.stopPropagation();
e.preventDefault();
if (result.data_type=='wikibase-item')
{
    var selection = $(this).prev('input').data('entityselector').selectedEntity();
    var snak = JSON.stringify({ "entity-type": 'item', "numeric-id": selection.id.substring(1) });
    addstatement(entityID, result.property, snak);
}
});
}

function addProveResult(apiResponse, provelabelsUL, entityID) {
    var $insertElem = $('<tr><td> ' +
            '<label><a href="https://www.wikidata.org/wiki/Property:'+ result.property + '">' + 
            result.property + '</a></td><td>' + result.label + '</td><td>' + result.base_frequency + ' '+ 
            '</label></td><td>' + add +'</td></tr>');
    labelsUL.append($insertElem);
    
    $insertElem.find('.add_button a').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault(); 
        $insertElem.find('#add').slideToggle("fast");
        $insertElem.find('.add_button a').hide();
        $insertElem.find('.input').focus();
    });
    $(document).click(function(e) {
            // e.stopPropagation();
            $insertElem.find('.add_button a').show();
            $insertElem.find("#add").hide();
    });
    $insertElem.find("#add").click(function(e) {
      e.stopPropagation();
    });
    $insertElem.find('#add a').on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (result.data_type=='wikibase-item')
    {
        var selection = $(this).prev('input').data('entityselector').selectedEntity();
        var snak = JSON.stringify({ "entity-type": 'item', "numeric-id": selection.id.substring(1) });
        addstatement(entityID, result.property, snak);
    }
    });
}

// Prove Functions
function updateProveHealthIndicator(data) {
    var $indicators = $('div.mw-indicators');
    var $existingLink = $indicators.find('a');
    var healthValue = data.health_value || 'N/A';
    var $newSpan = $('<span>').text(' Health lv.: ' + healthValue).css('margin-left', '10px');
    $existingLink.after($newSpan);

    if (healthValue === 'Not processed yet') {
        const $button = $('<button id="prior-process-btn">Prior</button>');
        $button.click(() => {
            // handle click event, call the prior queue API
            console.log('Processing...');
            alert('Processing...');
        });
        $indicators.append($button);
    }
}

function createProveTables(data, $labelsParent) {
    //Prove DOMs
    // var proveTabelsDOM = $('<div id="prove-property" style="display:none;overflow:auto;max-height:300px"></div>');
    // var proveTabelsUL = $('<table id="porve_props" frame="box" style="margin-left:30px"></table>');
    // var proveTablehead = '<thead align="left"><tr bgcolor="#DCDCDC"><td>Triple</td><td>Result</td><td>Result Sentences</td><td>URL</td></tr></thead>';
    // proveTabelsUL.append(proveTablehead);
    // var proveTabelsText = $('<div class="wikibase-entitytermsview-recoinproperty-toggler ui-toggler ui-toggler-toggle ui-state-default" id = "recoin-title" style="display:inline;"></div>');
    
    const $tablesContainer = $('<div id="reference-tables"></div>');
    
    const categories = ["NOT ENOUGH INFO", "REFUTES", "SUPPORTS"];
    
    categories.forEach(category => {
        if (data[category] && typeof data[category] === 'object') {
            const tableData = transformData(data[category]);
            $tablesContainer.append(createTable(category, tableData));
        } else {
            console.warn(`${category} data is missing or invalid`);
        }
    });

    $labelsParent.prepend($tablesContainer);
}

function transformData(categoryData) {
    const result = [];
    const length = categoryData.qid ? Object.keys(categoryData.qid).length : 0;
    
    for (let i = 0; i < length; i++) {
        result.push({
            qid: categoryData.qid[i] || 'N/A',
            result: categoryData.result[i] || 'N/A',
            result_sentence: categoryData.result_sentence[i] || 'N/A',
            triple: categoryData.triple[i] || 'N/A',
            url: categoryData.url[i] || '#'
        });
    }
    
    return result;
}

function createTable(title, data) {
    const $table = $(`
        <div class="expandable-table">
            <h3>${title}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Results</th>
                        <th>Triple</th>
                        <th>Result Sentences</th>
                        <th>URL</th>
                        <th>Modify</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `);

    const $tbody = $table.find('tbody');
    data.forEach(item => {
        const $row = $(`
            <tr>
                <td>${item.result}</td>
                <td>${item.triple}</td>
                <td>${item.result_sentences}</td>
                <td><a href="${item.url}" target="_blank">Link</a></td>
                <td><button class="modify-btn">Modify</button></td>
            </tr>
        `);
        $row.find('.modify-btn').click(() => handleModify(item));
        $tbody.append($row);
    });

    $table.find('h3').click(() => $table.find('table').slideToggle());

    return $table;
}

function handleModify(item) {

    console.log('Modifying:', item);
}

//Initiate the plugin
( 
function( mw, $ ) {
'use strict';
console.log('prove-plugin loaded');
/**
 * Check if we're viewing an item
 */
var entityID = mw.config.get( 'wbEntityId' );
var lang = mw.config.get( 'wgUserLanguage' );
var pageid = "48139757";
var infoText ='';
var title = "Most relevant properties which are absent";
if ( !entityID ) 
{
    return;
}
/**
 * holds the DOM input element for the label
 */
var labelsParent;

function init() 
{
    // Element into which to add the missing attributes
    labelsParent = $('#wb-item-' + entityID + ' div.wikibase-entitytermsview-heading');
    if (labelsParent.length < 1) 
    {
        return;
    }	
    var labelsDOM = $('<div id="recoin-property" style="display:none;overflow:auto;max-height:300px"></div>');
    var labelsUL = $('<table id="props" frame="box" style="margin-left:30px"></table>');
    var tablehead = '<thead align="left"><tr bgcolor="#DCDCDC"><td>Property ID</td><td>Label</td><td>Relative</td><td>Add Claim</td></tr></thead>';
    labelsUL.append(tablehead);
    var labelsText = $('<div class="wikibase-entitytermsview-recoinproperty-toggler ui-toggler ui-toggler-toggle ui-state-default" id = "recoin-title" style="display:inline;"></div>');
    var translate_help = $('<span class="wikibase-entitytermsview-entitytermsforlanguagelistview-configure" id="translate"><a href="https://www.wikidata.org/wiki/Wikidata:Recoin/translation"> [Help with translations]</a></span>');
    var help = true;

    //Prove DOMs
    // var proveTabelsDOM = $('<div id="prove-property" style="display:none;overflow:auto;max-height:300px"></div>');
    // var proveTabelsUL = $('<table id="porve_props" frame="box" style="margin-left:30px"></table>');
    // var proveTablehead = '<thead align="left"><tr bgcolor="#DCDCDC"><td>Triple</td><td>Result</td><td>Result Sentences</td><td>URL</td></tr></thead>';
    // proveTabelsUL.append(proveTablehead);
    // var proveTabelsText = $('<div class="wikibase-entitytermsview-recoinproperty-toggler ui-toggler ui-toggler-toggle ui-state-default" id = "recoin-title" style="display:inline;"></div>');

    $.getJSON( 'https://www.wikidata.org/w/api.php?action=query&prop=extracts&titles=Wikidata:Recoin/translation&format=json', 
       function ( result )
       {
           var desc = result.query.pages[pageid].extract;
           desc = desc.replace(/<p>/g, "");
           desc = desc.replace(/<\/p>/g, "");
           desc = desc.split("\n");
        var complete = result.completeness_level;
        var $link = $('<a href="https://www.wikidata.org/wiki/Wikidata:Recoin">'),
            $img = $('<img>').css('margin-bottom', 12+'px');
           for (var i=0; i< desc.length; i++)
           {
               var s = desc[i].split(";");
               if (s[0]===lang && s.length>=7)
               {
                infoText = s.slice(2,7).reverse();
                title = 'Recoin: ' +s[1];
                help = false;
                break;
               }
           }
           var toggleSlider = $('<span class = "ui-toggler-icon ui-icon ui-icon-triangle-1-e" id = "status"></span>\
        <span class="ui-toggler-label">'+ mw.html.escape( title ) +'</span>');
        labelsText.append(toggleSlider);
        labelsParent.append(labelsText)
           if (help==1)
           {
               labelsParent.append(translate_help);
           }
        });
    $.getJSON( 'https://recoin.toolforge.org/getmissingattributes.php?callback=?', 'subject=' + entityID + '&lang=' + lang + '&n=20',
           function ( result ) 
           {
            for (var i=0; i< result.missing_properties.length; i++) 
            {
                addtosuggestions(result.missing_properties[i], labelsUL, entityID);
                setTimeout(loadentityselector, 100);
            }
            labelsDOM.append(labelsUL);
            labelsParent.append(labelsDOM);
        $("#recoin-title" ).click(function() {
        $( "#recoin-property" ).slideToggle();
        $("#status").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s ui-toggler-icon3dtrans");
        });
        var complete = result.completeness_level;
        var $link = $( '<a href="https://www.wikidata.org/wiki/Wikidata:Recoin">' ),
            $img = $( '<img>' ).css('margin-bottom',12+'px');
        if (infoText === '')
        {
            switch( complete ){
                case '5':
                    infoText = 'This page provides very detailed information.';
                break;
                case '4':
                    infoText = 'This page provides detailed information.';
                break;
                case '3':
                    infoText = 'This page provides a fair amount of information.';
                break;
                case '2':
                    infoText = 'This page provides basic information.';
                break;
                case '1':
                    infoText = 'This page provides very basic information.';
                break;
            }
        }
        else
        {
            infoText = infoText[parseInt(complete)-1];
        }
        $img.attr( 'src', 'https://recoin.toolforge.org/progressbar/' + complete + '.png' );				
        $img.attr( 'title',  infoText);
        $img.attr( 'alt',  infoText);
        $link.append( $img ).prependTo( 'div.mw-indicators' )
        
        // ProVe part
        fetch(`https://kclwqt.sites.er.kcl.ac.uk/api/items/CompResult?qid=${entityID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('CompResult API Response:', data);
                updateProveHealthIndicator(data);
                createProveTables(data, labelsParent);
            })
            .catch(error => {
                console.error('Error fetching CompResult:', error);
            });
        });
    }
$( function () {
    // init();
    mw.hook( 'wikipage.content' ).add( init );
});

} ( mediaWiki, jQuery) );