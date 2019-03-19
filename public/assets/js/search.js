var socket = io();

/**
 * Display the results from server
 */
socket.on('show results', (data) =>{
	if(data == null){
	return;
	}
	var searchJson = data.results;
	var ul = document.getElementById("search_result_li");
	push_to_db(data, searchJson);

	ul.innerText = "";

	for(var i = 0; i < searchJson.length; i++){
		var sentence = decodeURI(searchJson[i].tweet);
		var li = document.createElement('a');
		li.setAttribute("id", "result_list");
		li.appendChild(document.createTextNode(sentence));
		li.className = "list-group-item d-flex justify-content-between align-items-center result";
		ul.appendChild(li);
	}
    document.getElementById('card-title').innerText = "Search Results for " + data.keyword;
    document.getElementById('loader_container').style.display = 'none';
    document.getElementById('speak_btn').disabled=false;
    document.getElementById('search_btn').disabled=false;

 let trends = document.getElementsByClassName("topic");
    for ( var i = 0; i < trends.length; i++ ) (function(i){
        trends[i].onclick = function() {
            // do something
            showResults(trends[i].innerText);
        }
    })(i);

    let voiceMessage = document.getElementsByClassName("list-group-item d-flex justify-content-between align-items-center result");
    for ( var i = 0; i < voiceMessage.length; i++ ) (function(i){
        voiceMessage[i].onclick = function() {
            // do something
            responsiveVoice.speak(voiceMessage[i].innerText);
            voiceMessage[i].style.color = "red";
        }
    })(i);

});

socket.on('message', function(data){
    console.log('Connection successful!');
});

/**
 * Load the trend topic from twitter API
 */
$(window).on('load', function(){
    socket.emit('get trending topics');
    socket.on('show trending topics', (data) =>{
    
    var topics = data.trending_topics;
    var div = document.getElementById("trending topics");

    for(var i = 0; i < topics.length; i++){
        let trend = topics[i].name;
    var a = document.createElement('a');
    a.setAttribute("id", trend);
    a.setAttribute("class", "topic");
    a.appendChild(document.createTextNode(trend));
    div.appendChild(a);
    }
    let trends = document.getElementsByClassName("topic");
    console.log(trends);

        for ( var i = 0; i < trends.length; i++ ) (function(i){
            trends[i].onclick = function() {
                // do something
                showResults(trends[i].innerText);
                document.getElementById("searchbar1").value = trends[i].innerText;
                document.getElementById("searchbarsmall").value = trends[i].innerText;
            }
        })(i);
    });
});

/**
 * Push search results into the database
 * @param {String} data Search keyword
 * @param {*} searchJson Search results
 */
function push_to_db(data, searchJson){
	 var user = $("#userEmail").val();
	 var time = Date.now();

	 if(user == null){
	  return;
	 }
	 db.post({
	   user: user,
	   keywords: data.keyword,
	   type: 'history',
	   time: time,
	   result: searchJson
	 }, function (err, res) {
	  if (err) {
	     throw new Error(err)
	    }
	 });
}

/**
 * Send to keyword to the server
 * @param {*} keywords 
 */
function showResults(keywords) {
    console.log("Showing results");
    var ul = document.getElementById("search_result_li");
        ul.innerText = "";
    document.getElementById('loader_container').style.display = 'block';
    document.getElementById('searchResults').style.display = "block";
    document.getElementById('speak_btn').disabled=true;
    document.getElementById('search_btn').disabled=true;
    let trends = document.getElementsByClassName("topic");
        for ( var i = 0; i < trends.length; i++ ) (function(i){
            trends[i].onclick = null;
        })(i);

    socket.emit('search keywords', keywords);
}

/**
 * Close the search results
 */
function closeResults() {
   document.getElementById('searchResults').style.display = "none";
}

/**
 * Voice the selected result
 * @param {*} message selected results
 */
function voice(message) {
 responsiveVoice.speak(message);
}

/**
 * Listen to the database change to display bookmark info
 */
db.changes({ 
    live: true,
    include_docs: true
}).on('change', function (change) {

        var boxType = null;
        var listType = null;
        if(change.doc.type == "sentence"){
            boxType = "input1";
            listType = "#list-sentences1";
        }
        else if(change.doc.type == "search"){
            boxType = "input";
            listType = "#list-searches1";
        }
        var HTMLString = 
            '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '" class="list-group-item' +
            ' d-flex justify-content-between align-items-center draggable="true" " href="#list-item-1">' +
                '<div>' + change.doc.term + '</div>' +
                '<span class="'+ boxType +'" style = "display:none">' +
                    '<div class="form-check">' + 
                        '<label class="form-check-label">' + 
                            '<input class="form-check-input" type="checkbox" value=""\>' + 
                            '<span class="form-check-sign"></span>' + 
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</a>';
        var item = $.parseHTML(HTMLString);
        $(listType).append(item);
});

/* click to search */
$('#list-sentences1').on("click", "a", function(){
    voice($(this).children(':first').text());
});

/* click to voice */
$('#list-searches1').on("click", "a", function(){
    showResults($(this).children(':first').text());
});