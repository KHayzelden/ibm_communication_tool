var socket = io();
socket.on('show results', (data) =>{

	var searchJson = data.results;
	var ul = document.getElementById("search_result_li");

	while(document.getElementById("result_list") != null){
	    var item = document.getElementById("result_list");
	    ul.removeChild(item);
	}

	for(var i = 0; i < searchJson.length; i++){
		var sentence = searchJson[i].tweet;
		var li = document.createElement('a');
		li.setAttribute("id", "result_list");
		li.appendChild(document.createTextNode(sentence));
		li.className = "list-group-item  d-flex justify-content-between align-items-center";
		ul.appendChild(li);
	}
   document.getElementById('searchResults').style.display = "block";
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
			var a = document.createElement('a');
			a.setAttribute("id", "topic");
			a.appendChild(document.createTextNode(topics[i]));
			a.onclick = function(){
				showResults(topics[i]);
			};
			div.appendChild(a);
		}
	});

})


function showResults(keywords) {
   socket.emit('search keywords', keywords);
}

function closeResults() {
   document.getElementById('searchResults').style.display = "none";
}