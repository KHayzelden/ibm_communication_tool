var socket = io();
socket.on('show results', (data) =>{

	var searchJson = data.results;
	var ul = document.getElementById("search_result_li");

	for(var i = 0; i < searchJson.length; i++){
		var searchArray = searchJson[i].searchRTest;

		for(var j = 0; j < searchArray.length; j++){
			var li = document.createElement('a');
			li.appendChild(document.createTextNode(searchArray[j]));
			li.className = "list-group-item  d-flex justify-content-between align-items-center";
			ul.appendChild(li);
		}
	}

   document.getElementById('searchResults').style.display = "block";
}); 


socket.on('message', function(data){
    console.log('Connection successful!');
});

function showResults(keywords) {
   socket.emit('search keywords', keywords);
}

function closeResults() {
   document.getElementById('searchResults').style.display = "none";
}