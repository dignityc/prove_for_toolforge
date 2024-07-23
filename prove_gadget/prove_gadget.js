/**
* ProVe: Automated Provenance Verification of Knowledge Graphs against Textual Sources
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

// Prove Functions
function updateProveHealthIndicator(data,qid) {
    console.log(data)
    var $indicators = $('div.mw-indicators');
    var $existingLink = $indicators.find('a');
    var healthValue = data.health_value;
    
    if (typeof healthValue === 'number') {
        healthValue = healthValue.toFixed(2);
    } else if (healthValue === undefined || healthValue === null) {
        healthValue = 'N/A';
    }

    var imageUrl = '';
    if (healthValue !== 'N/A' && healthValue !== 'Not processed yet') {
        var numericValue = parseFloat(healthValue);
        var imageNumber = 0;
        if (numericValue >= 0.2 && numericValue < 0.4) imageNumber = 1;
        else if (numericValue >= 0.4 && numericValue < 0.6) imageNumber = 2;
        else if (numericValue >= 0.6 && numericValue < 0.8) imageNumber = 3;
        else if (numericValue >= 0.8 && numericValue <= 1) imageNumber = 4;

        imageUrl = `https://raw.githubusercontent.com/dignityc/prove_for_toolforge/main/${imageNumber}.png`;
    }

    var $healthIndicator = $('<span>').css('margin-left', '10px');
    if (imageUrl) {
        var $imageLink = $('<a>')
            .attr('href', 'https://www.wikidata.org/wiki/Wikidata:ProVe')
            .attr('target', '_blank')
            .attr('title', 'Click to visit Wikidata:ProVe page');
        
        $imageLink.append(
            $('<img>')
                .attr('src', imageUrl)
                .css({
                    'vertical-align': 'middle',
                    'margin-right': '5px',
                    'cursor': 'pointer',
                    'width': '20px',  
                    'height': 'auto'  
                })
        );
        
        $healthIndicator.append($imageLink);
    }
    $healthIndicator.append(' Health lv.: ' + healthValue);
    $existingLink.after($healthIndicator);

    if (healthValue === 'Not processed yet') {
        const $button = $('<button id="prior-process-btn">Prioritise</button>');
        $button.click(() => {
            const apiUrl = `https://kclwqt.sites.er.kcl.ac.uk/api/requests/requestItem?qid=${qid}`;

            $button.prop('disabled', true).text('Processing...');
            
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(responseData => {
                    console.log('API Response:', responseData);
                    alert('This item has been prioritized for processing. Please check back later :)');
                    // updateProveHealthIndicator(responseData);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to prioritise item. Please try again later.');
                })
                .finally(() => {
                    $button.prop('disabled', false).text('Prioritise');
                });
        });
        $indicators.append($button);
    }
}

function createProveTables(data, $labelsParent) {
    const $container = $('<div id="prove-container"></div>');
    const $buttonContainer = $('<div id="prove-buttons"></div>');
    const $toggleButton = $('<button id="prove-toggle">Prove</button>');
    const $tablesContainer = $('<div id="prove-tables" style="display: none;"></div>');

    $buttonContainer.append($toggleButton);

    $container.append($buttonContainer).append($tablesContainer);

    const categories = [
        { name: "SUPPORTS", label: "Supportive", color: "#e6f3e6" },
        { name: "REFUTES", label: "Unsupportive", color: "#f9e6e6" },
        { name: "NOT ENOUGH INFO", label: "Not enough info", color: "#fff9e6" }
    ];

    categories.forEach(category => {
        const $categoryToggle = $(`<button class="prove-category-toggle" data-category="${category.name}" style="display: none;">${category.label}</button>`);
        $categoryToggle.css('background-color', category.color);
        const $table = createTable(category.name, transformData(data[category.name]));
        $table.hide();

        $buttonContainer.append($categoryToggle);
        $tablesContainer.append($table);

        $categoryToggle.click(function() {
            $table.slideToggle();
            $(this).toggleClass('active');
        });
    });

    let isProveActive = false;

    $toggleButton.click(function() {
        isProveActive = !isProveActive;
        $(this).toggleClass('active');

        if (isProveActive) {
            $('.prove-category-toggle').show().addClass('active');
            $tablesContainer.slideDown();
            $tablesContainer.children().show();
        } else {
            $('.prove-category-toggle').hide().removeClass('active');
            $tablesContainer.slideUp(function() {
                $tablesContainer.children().hide();
            });
        }
    });

    $labelsParent.prepend($container);
}

function transformData(categoryData) {
    const result = [];
    const length = categoryData.qid ? Object.keys(categoryData.qid).length : 0;
    const keys = Object.keys(categoryData.qid || {});
    keys.forEach(key => {
        result.push({
            qid: categoryData.qid[key] || 'N/A',
            pid: categoryData.property_id[key] || 'N/A',
            result: categoryData.result[key] || 'N/A',
            result_sentence: categoryData.result_sentence[key] || 'N/A',
            triple: categoryData.triple[key] || 'N/A',
            url: categoryData.url[key] || '#'
        });
    });
    
    console.log('Transformed data:', result);  
    return result;
}

function createTable(title, data) {
    const colorMap = {
        "SUPPORTS": "#e6f3e6",
        "REFUTES": "#f9e6e6",
        "NOT ENOUGH INFO": "#fff9e6"
    };
    const backgroundColor = colorMap[title] || "#f0f0f0";

    const $table = $(`
        <div class="expandable-table">
            <table data-category="${title}">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="result">Results</th>
                        <th class="sortable" data-sort="triple">Triple</th>
                        <th class="sortable" data-sort="result_sentence">Result Sentences</th>
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
    const addRow = (item) => {
        const $row = $(`
            <tr>
                <td>${item.result}</td>
                <td>${item.triple}</td>
                <td>${item.result_sentence}</td>
                <td><a href="${item.url}" target="_blank">Link</a></td>
                <td><button class="modify-btn">edit</button></td>
            </tr>
        `);
        $row.find('.modify-btn').click(() => handleModify(item));
        $tbody.append($row);
    };

    data.forEach(addRow);

    // Add sorting functionality
    $table.find('th.sortable').click(function() {
        const sortBy = $(this).data('sort');
        const sortedData = [...data].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
        $tbody.empty();
        sortedData.forEach(addRow);
    });

    return $table;
}

function handleModify(item) {
    console.log('Modifying:', item.pid);
    //alert('Modify button clicked for ' + item.pid);
    var selector = `a[title="Property:${item.pid}"]`;
    var element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.backgroundColor = 'yellow';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 3000);
    } else {
        console.log(`Element with property ${item.pid} not found`);
        alert(`Property ${item.pid} not found on this page`);
    }
}

function addStyles() {
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            #prove-container { margin-bottom: 20px; }
            #prove-buttons {
                display: flex;
                flex-wrap: nowrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            #prove-toggle, .prove-category-toggle { 
                padding: 5px 10px;
                border: 1px solid #a2a9b1;
                border-radius: 2px;
                cursor: pointer;
                width: 140px;
                text-align: center;
                margin-right: 5px;
            }
            #prove-toggle {
                background-color: #f8f9fa;
            }
            #prove-toggle:hover, .prove-category-toggle:hover {
                opacity: 0.8;
            }
            #prove-toggle.active, .prove-category-toggle.active {
                font-weight: bold;
                box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            }
            .expandable-table {
                border: 1px solid #c8c8c8;
                margin-top: 5px;
                max-height: 300px;
                overflow-y: auto;
            }
            .expandable-table table {
                width: 100%;
                border-collapse: collapse;
            }
            .expandable-table th, .expandable-table td {
                border: 1px solid #c8c8c8;
                padding: 6px;
                text-align: left;
                vertical-align: top;
            }
            .expandable-table table[data-category="SUPPORTS"] th {
                background-color: #e6f3e6;
            }
            .expandable-table table[data-category="REFUTES"] th {
                background-color: #f9e6e6;
            }
            .expandable-table table[data-category="NOT ENOUGH INFO"] th {
                background-color: #fff9e6;
            }
            .expandable-table th.sortable {
                cursor: pointer;
                position: sticky;
                top: 0;
                background-color: #f8f9fa;
            }
            .expandable-table th.sortable:hover {
                opacity: 0.8;
            }
            .expandable-table td {
                word-break: break-word;
            }
        `)
        .appendTo('head');
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
    var $link = $( '<a href="https://www.wikidata.org/wiki/Wikidata:ProVe">' );
    var $img = $( '<img>' ).css('margin-bottom',15+'px');
    $link.append( $img ).prependTo( 'div.mw-indicators' )
   
        addStyles();
        fetch(`https://kclwqt.sites.er.kcl.ac.uk/api/items/CompResult?qid=${entityID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('CompResult API Response:', data);
                updateProveHealthIndicator(data,entityID);
                createProveTables(data, labelsParent);
            })
            .catch(error => {
            	alert('ProVe is currently processing data for this item. Please try again later. Thanks!')
                console.error('Error fetching CompResult:', error);
            });
    }
$( function () {
    // init();
    mw.hook( 'wikipage.content' ).add( init );
});

} ( mediaWiki, jQuery) );
