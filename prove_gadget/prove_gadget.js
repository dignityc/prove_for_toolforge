/**
* ProVe: UI extension for automated PROovenance VErification of knowledge graphs against textual sources
* Developers  : Jongmo Kim (jongmo.kim@kcl.ac.uk), Yiwen Xing (yiwen.xing@kcl.ac.uk), Odinaldo Rodrigues, Albert Merono Penuela, ...
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
function calculateStatementStats() {
    const totalStatements = $('.wikibase-statementview').length;
    const missingReferences = $('.wikibase-statementview-references-heading .ui-toggler-label:contains("0 references")').length;
    return {
        total: totalStatements,
        missing: missingReferences
    };
}

function displayStatementStats() {
    const stats = calculateStatementStats();
    console.log('Calculated stats:', stats);

    const $statsContainer = $('<div id="prove-stats"></div>').css({
        'margin-bottom': '10px',
        'font-weight': 'bold'
    });
    $statsContainer.text(`This item has ${stats.total-stats.missing} out of ${stats.total} (${(100*(1-stats.missing/stats.total)).toFixed(1)}%) statements supported with references. Currently, ${stats.missing} statements have no references and need your support.`);
    
    const $focusButton = $('<button>Start Adding reference to unreferenced statements</button>').css({
        'margin-left': '10px',
	    'padding': '5px 5px',
	    'font-size': '12px',
	    'font-weight': 'bold',
	    'color': 'black',
	    'background-color': 'lightgrey',
	    'border': 'none',
	    'border-radius': '5px',
	    'cursor': 'pointer',
	    'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
    }).hover(function() {
	    $(this).css({
	        'background-color': 'lightgrey',
	        'transform': 'scale(1.005)'
	    });
	}, function() {
	    $(this).css({
	        'background-color': 'lightgrey',
	        'transform': 'scale(1)'
	    });
	}).click(function() {
        console.log('Focus button clicked');
        const $firstMissing = $('.wikibase-statementview-references-heading .ui-toggler-label:contains("0 references")').first();
        console.log('First missing reference statement found:', $firstMissing.length > 0);

        if ($firstMissing.length) {
            $firstMissing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('Scrolled to first missing reference statement');
            const $addReferenceLink = $firstMissing.closest('.wikibase-statementview').find('.wikibase-statementview-references .wikibase-addtoolbar-container');
            console.log('Add reference link found:', $addReferenceLink.length > 0);

            if ($addReferenceLink.length) {
                const originalBackgroundColor = $addReferenceLink.css('background-color');
                const originalTransition = $addReferenceLink.css('transition');
                
                console.log('Original background color:', originalBackgroundColor);
                console.log('Original transition:', originalTransition);

                $addReferenceLink.css({
                    'background-color': 'yellow',
                    'transition': 'background-color 0.5s ease-in-out'
                });
                console.log('Applied yellow background to add reference link');
                
                setTimeout(() => {
                    $addReferenceLink.css({
                        'background-color': originalBackgroundColor,
                        'transition': originalTransition
                    });
                    console.log('Restored original styles after 4 seconds');
                }, 4000);
            } else {
                console.log('Add reference link not found');
            }
        } else {
            console.log('No statements missing references found');
            alert('No statements missing references found.');
        }
    });
    
    $statsContainer.append($focusButton);
    return $statsContainer;
}

function updateProveHealthIndicator(data, qid) {
    console.log(data);
    var $indicators = $('div.mw-indicators');
    var $existingLink = $indicators.find('a');
    var healthValue = data.health_value;
    
    if (typeof healthValue === 'number') {
        healthValue = healthValue.toFixed(2);
    } else if (healthValue === undefined || healthValue === null) {
        healthValue = 'N/A';
    } else if (healthValue === 'processing error') {
        healthValue = 'Not processed yet';
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

    var $healthIndicator = $('<span>').css({
        'margin-left': '10px',
        'cursor': 'pointer',
        'position': 'relative',
        'display': 'inline-flex',
    	'align-items': 'center'
    });
	$healthIndicator.append('Reference Score: ' + healthValue + ' ');
	
	if (imageUrl) {
	    var $image = $('<img>')
	        .attr('src', imageUrl)
	        .css({
	            'vertical-align': 'middle',
	            'margin-left': '5px',
	            'width': '20px',  
	            'height': 'auto'  
	        });
	    
	    $healthIndicator.append($image);
	}

    var totalCount = Object.values(data.SUPPORTS.result || {}).length +
                     Object.values(data.REFUTES.result || {}).length +
                     Object.values(data['NOT ENOUGH INFO'].result || {}).length;
    
    var supportsCount = Object.values(data.SUPPORTS.result || {}).length;
    var refutesCount = Object.values(data.REFUTES.result || {}).length;
    var notEnoughInfoCount = Object.values(data['NOT ENOUGH INFO'].result || {}).length;
    
    var hoverContent = `
        Supports: ${supportsCount} (${(supportsCount / totalCount * 100).toFixed(1)}%)<br>
        Refutes: ${refutesCount} (${(refutesCount / totalCount * 100).toFixed(1)}%)<br>
        Not Enough Info: ${notEnoughInfoCount} (${(notEnoughInfoCount / totalCount * 100).toFixed(1)}%)
    `;
    
    $healthIndicator.hover(
        function() {
            var $hoverBox = $('<div>')
                .html(hoverContent)
                .css({
                    position: 'absolute',
                    top: 'calc(100% + 5px)',  // Move it 5px below the indicator
	                left: '50%',
	                transform: 'translateX(-50%)',  // Center it horizontally
	                backgroundColor: 'white',
	                border: '1px solid black',
	                padding: '5px',
	                zIndex: 1000,
	                whiteSpace: 'nowrap',
	                fontSize: '0.9em',  // Make the text slightly smaller
	                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'  // Add a subtle shadow
                });
            $(this).append($hoverBox);
        },
        function() {
            $(this).find('div').remove();
        }
    );

    var $proveLink = $('<a>')
        .attr('href', 'https://www.wikidata.org/wiki/Wikidata:ProVe')
        .attr('target', '_blank')
        .attr('title', 'Click to visit Wikidata:ProVe page')
        .append($healthIndicator);

    $existingLink.after($proveLink);

    if (healthValue === 'Not processed yet' || healthValue ==='processing error') {
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
    const $statsContainer = displayStatementStats().hide();
    const $buttonContainer = $('<div id="prove-buttons"></div>');
    const $toggleButton = $('<button id="prove-toggle">Check Reference Quality</button>');
    const $tablesContainer = $('<div id="prove-tables" style="display: none;"></div>');
    
    

    $buttonContainer.append($toggleButton);
	
	// $container.append($statsContainer);
    $container.append($buttonContainer).append($statsContainer).append($tablesContainer);

    const categories = [
        { name: "REFUTES", label: "References to be checked", color: "#f9e6e6" },
        { name: "NOT ENOUGH INFO", label: "References to be checked", color: "#fff9e6" },
        { name: "SUPPORTS", label: "References possibly support the triple", color: "#e6f3e6" }
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
            $statsContainer.slideDown();
            $tablesContainer.slideDown();
            $tablesContainer.children().show();
        } else {
            $('.prove-category-toggle').hide().removeClass('active');
            $statsContainer.slideUp();
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
    
    const tbheaderMap = {
        "SUPPORTS": "Sentence in external URL found to possibly support the triple",
        "REFUTES": "Sentence in external URL to be checked, possibly not authoritative",
        "NOT ENOUGH INFO": "Sentence in external URL to be checked, possibly not relevant"
    };
	
	const resultHeader = tbheaderMap[title] || "ProVe Result Sentences";
	
    const $table = $(`
        <div class="expandable-table">
            <table data-category="${title}">
                <thead>
                    <tr>
                        <!--th class="sortable" data-sort="result">Results</th-->
                        <th class="sortable" data-sort="triple">Triple</th>
                        <th class="sortable" data-sort="result_sentence">${resultHeader}</th>
                        <th>URL</th>
                        <!--th>Modify</th-->
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
                <!--td>${item.result}</td-->
                <!--td>${item.triple}</td-->
                <td><a class="modify-btn">${item.triple}</a></td>
                <td>${item.result_sentence}</td>
                <td><a href="${item.url}" target="_blank">Link</a></td>
                <!--td><button class="modify-btn">edit</button></td-->
            </tr>
        `);
        $row.find('.modify-btn').click(() => handleModify(item));
        $row.find('.modify-btn').attr('title', 'Click to view triple and edit');
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
    console.log('Modifying:', item.pid, item.url);
    
    var pidElement = document.querySelector(`a[title="Property:${item.pid}"]`);
    
    if (!pidElement) {
        console.log(`Element with property ${item.pid} not found`);
        alert(`Property ${item.pid} not found on this page`);
        return;
    }

    pidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log('Scrolled to PID element');

    var statementGroupView = pidElement.closest('.wikibase-statementgroupview');
    if (!statementGroupView) {
        console.log('Statement group view not found');
        return;
    }

    var statementViews = statementGroupView.querySelectorAll('.wikibase-statementview');
    
    function processStatements(index) {
        if (index >= statementViews.length) {
            console.log('URL not found in any statement');
            return;
        }

        var statementView = statementViews[index];
        var referencesContainer = statementView.querySelector('.wikibase-statementview-references');
        var referencesHeading = statementView.querySelector('.wikibase-statementview-references-heading');

        if (referencesContainer && referencesHeading && referencesContainer.offsetParent === null) {
            var toggler = referencesHeading.querySelector('.ui-toggler');
            if (toggler) {
                toggler.click();
                console.log('Clicked toggler to expand references');
                setTimeout(() => checkForUrl(statementView, index), 300);
            } else {
                checkForUrl(statementView, index);
            }
        } else {
            checkForUrl(statementView, index);
        }
    }

    function checkForUrl(statementView, index) {
        var urlElement = statementView.querySelector(`a[href="${item.url}"]`);
        var previousEditLink = urlElement.closest('.wikibase-statementview').querySelector('.wikibase-edittoolbar-container');
		
		if (previousEditLink) {
		    highlightUrl(previousEditLink);
		    console.log('Found the edit link:', previousEditLink);
		} else {
		    console.log('No edit link found.');
		}
        
        if (urlElement) {
            highlightUrl(urlElement);
            
        } else {
            processStatements(index + 1);
        }
    }

    function highlightUrl(urlElement) {
        var originalStyle = urlElement.getAttribute('style') || '';
        
        urlElement.style.backgroundColor = 'yellow';
        urlElement.style.padding = '2px';
        urlElement.style.border = '1px solid #000';
        
        urlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log('Applied highlight style');

        setTimeout(() => {
            urlElement.setAttribute('style', originalStyle);
            console.log('Restored original style');
        }, 3000);
        
        console.log(`Highlighted URL: ${item.url}`);
    }

    processStatements(0);
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
                width: 160px;
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
                width: 95%;
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
            #prove-stats {
                width: 93%;
                background-color: #f8f9fa;
                padding: 5px 10px;
                border: 1px solid #a2a9b1;
                border-radius: 2px;
                margin-bottom: 10px;
                margin-right: 10px;
            }
            #prove-stats button {
                padding: 2px 5px;
                margin-left: 0px;
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
    var labelsParent = $('#wb-item-' + entityID + ' div.wikibase-entitytermsview-heading');
    if (labelsParent.length < 1) 
    {
        return;
    }
    var $link = $( '<a href="https://www.wikidata.org/wiki/Wikidata:ProVe">' );
    var $img = $( '<img>' ).css('margin-bottom', '15px');
    $link.append( $img ).prependTo( 'div.mw-indicators' );
   
    addStyles();
    
    // Check item api status
    fetch(`https://kclwqt.sites.er.kcl.ac.uk//api/items/checkItemStatus?qid=${entityID}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Status API Response:', data);
        const flatdata = Array.isArray(data) ? data[0] : data;
        const status = flatdata.status;
        console.log(status);
        let statusText = '';
        let imageUrl = '';
        let showPrioritiseButton = false;

        if (status !== 'completed') {
            if (status === 'in queue') {
                statusText = 'ProVe is processing this item';
                imageUrl = 'https://raw.githubusercontent.com/dignityc/prove_for_toolforge/main/pending.png';
            } else if (status === 'error' || status === 'Not processed yet') {
                statusText = 'ProVe has not processed this item yet';
                imageUrl = 'https://raw.githubusercontent.com/dignityc/prove_for_toolforge/main/warning.png';
                showPrioritiseButton = true;
            } else {
                statusText = 'Status: ' + status;
                imageUrl = 'https://raw.githubusercontent.com/dignityc/prove_for_toolforge/main/warning.png';
            }
            
            // Create status indicator
			var $statusIndicator = $('<a>')
			    .attr('href', 'https://www.wikidata.org/wiki/Wikidata:ProVe')
			    .attr('target', '_blank')
			    .css({
			        'margin-left': '10px',
			        'cursor': 'pointer',
			        'position': 'relative',
			        'display': 'inline-flex',
			        'align-items': 'center',
			        'text-decoration': 'none',
			        'color': 'inherit'
			    });
			
			// Add ProVe text
			$statusIndicator.append($('<span>').text('ProVe'));
			
			// Add image if available
			if (imageUrl) {
			    var $image = $('<img>')
			        .attr('src', imageUrl)
			        .css({
			            'vertical-align': 'middle',
			            'margin-left': '5px',
			            'width': '20px',  
			            'height': 'auto'  
			        });
			    
			    $statusIndicator.append($image);
			}
			
			// Add hover functionality
			$statusIndicator.hover(
			    function() {
			        var $hoverBox = $('<div>')
			            .text(statusText)
			            .css({
			                position: 'absolute',
			                top: 'calc(100% + 5px)',
			                left: '50%',
			                transform: 'translateX(-50%)',
			                backgroundColor: 'white',
			                border: '1px solid black',
			                padding: '5px',
			                zIndex: 1000,
			                whiteSpace: 'nowrap',
			                fontSize: '0.9em',
			                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
			            });
			        $(this).append($hoverBox);
			    },
			    function() {
			        $(this).find('div').remove();
			    }
			);
			
			// Add status text to labelsParent
			labelsParent.prepend($('<span>').text(statusText).css('margin-right', '10px'));
			
			// Append the combined element to mw-indicators
			$('div.mw-indicators').append($statusIndicator);
  
            // Add prioritise button if needed
            if (showPrioritiseButton) {
                const $button = $('<button id="prior-process-btn">Prioritise</button>');
                $button.click(() => {
                    const apiUrl = `https://kclwqt.sites.er.kcl.ac.uk/api/requests/requestItem?qid=${entityID}`;

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
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Failed to prioritise item. Please try again later.');
                        })
                        .finally(() => {
                            $button.prop('disabled', false).text('Prioritise');
                        });
                });
                $('div.mw-indicators').append($button);
            }
        } else {
            // If status is complete, fetch ProVe data and initialize main functionality
            fetch(`https://kclwqt.sites.er.kcl.ac.uk/api/items/CompResult?qid=${entityID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('CompResult API Response:', data);
                updateProveHealthIndicator(data, entityID);
                createProveTables(data, labelsParent);
            })
            .catch(error => {
                console.error('Error fetching CompResult:', error);
                alert('An error occurred while fetching ProVe data. Please try again later.');
            });
        }
    })
    .catch(error => {
        console.error('Error fetching item status:', error);
        var $errorIndicator = $('<span>').text('Error checking ProVe status').css({
            'margin-left': '10px',
            'cursor': 'default',
            'color': 'red'
        });
        $('div.mw-indicators').append($errorIndicator);
    });
}


$( function () {
    // init();
    mw.hook( 'wikipage.content' ).add( init );
});

} ( mediaWiki, jQuery) );
