// JS used to handle the navbar dropdowns and search bar
    $(document).ready(function(){
        function searchItems(query) {    
            $("#searchInput").on("input", function() {
                var query = $(this).val();
                console.log(query);
                if(query.length > 0) {
                    $.get("/search", { query: query }, function(data) {
                        $("#searchDropdown").empty();
                        if(data.length > 0) {
                            $("#searchDropdown").show();
                            data.forEach(function(item) {
                                $("#searchDropdown").append(`<a class="dropdown-item" href="#">${item}</a>`);
                            });
                        } else {
                            $("#searchDropdown").hide();
                        }
                    });
                } else {
                    $("#searchDropdown").hide();
                }
            });
        }
        searchItems();
        function selectItem() {
            $("#searchDropdown").on("click", ".dropdown-item", function() {
                var label = $(this).text();
                console.log(label);
                if(label.length > 0) {
                    $.get("/get_data", {label: label}, function(data){
                        //console.log(data)
                        $("#data-display").html(data.html_content);
                        $("#title").text(data.pair);
                        updateCharts(data.statics);
                        updateDescription('donut1', ['Total: '+ data.statics.Claims_tot, 'Referenced: '+data.statics.Claims_ref, 'Completeness: '+data.statics.Claims_ref_ratio+'%']);
                        updateDescription('donut2', ['Total: '+ data.statics.Property_tot, 'Referenced: '+data.statics.Property_ref, 'Completeness: '+data.statics.Property_ref_ratio+'%']);
                        updateDescription('donut3', ['Supportive: '+ data.statics.Ref_support+'%', 'Unsupportive: '+data.statics.Ref_unsupport+'%', 'Lacking Evidence: '+data.statics.Ref_noinfo+'%']);
                    });
                }
                $("#searchInput").val(label);
                //$("#searchInput").val('');
                $("#searchDropdown").hide();

            });
        }
        selectItem();

        function randomSelect() {
            $("#shuffle").on("click", function() {
                // Change background color on click
                //$(this).css('background-color', '#adb5bd');
                $.get("/random", function(data) {
                    $("#data-display").html(data.html_content);
                    $("#searchInput").val(data.pair);
                    $("#title").text(data.pair);
                    updateCharts(data.statics);
                    updateDescription('donut1', ['Total: '+ data.statics.Claims_tot, 'Referenced: '+data.statics.Claims_ref, 'Completeness: '+data.statics.Claims_ref_ratio+'%']);
                    updateDescription('donut2', ['Total: '+ data.statics.Property_tot, 'Referenced: '+data.statics.Property_ref, 'Completeness: '+data.statics.Property_ref_ratio+'%']);
                    updateDescription('donut3', ['Supportive: '+ data.statics.Ref_support+'%', 'Unsupportive: '+data.statics.Ref_unsupport+'%', 'Lacking Evidence: '+data.statics.Ref_noinfo+'%']);
                });
            }).hover(
                // Change font color and cursor on hover in
                function() {
                    $(this).css({
                        'color': '#0d6efd',
                        'cursor': 'pointer'
                    });
                },
                // Revert font color and cursor on hover out
                function() {
                    $(this).css({
                        'color': '',
                        'cursor': ''
                    });
                }
            );
        }
        randomSelect();

        function directWikiPage(){
            $("#wikisearch").on("click", function() {
                var label = $("#searchInput").val();
                if(label.length > 0) {
                    $.get("/toWikiPage", {label: label}, function(data){
                        //console.log(data)
                        window.open("https://www.wikidata.org/wiki/"+data, '_blank');
                    });
                }else{
                    alert("Please enter a valid label or Q code in the search bar!");
                }
            }).hover(
                // Change font color and cursor on hover in
                function() {
                    $(this).css({
                        'color': '#0d6efd',
                        'cursor': 'pointer'
                    });
                },
                // Revert font color and cursor on hover out
                function() {
                    $(this).css({
                        'color': '',
                        'cursor': ''
                    });
                }
            );
        }
        directWikiPage();
    });
