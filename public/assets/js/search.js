var socket = io();

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
		li.className = "list-group-item d-flex justify-content-between align-items-center";
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

    let voiceMessage = document.getElementsByClassName("list-group-item d-flex justify-content-between align-items-center");
    for ( var i = 0; i < voiceMessage.length; i++ ) (function(i){
        voiceMessage[i].onclick = function() {
            // do something
            responsiveVoice.speak(voiceMessage[i].innerText);
        }
    })(i);

});


socket.on('message', function(data){
    console.log('Connection successful!');
});

$(window).on('load', function(){
 socket.emit('get trending topics');

 socket.on('show trending topics', (data) =>{
  console.log('Get topics!');

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
                document.getElementById("searchbar").value = trends[i].innerText;
                document.getElementById("searchbarsmall").value = trends[i].innerText;
            }
        })(i);
 });

})

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

function closeResults() {
   document.getElementById('searchResults').style.display = "none";
}

function voice(message) {
 responsiveVoice.speak(message);
}