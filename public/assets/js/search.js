var socket = io();
socket.on('show results', (data) =>{

	var searchJson = data.results;
	var ul = document.getElementById("search_result_li");

	while(document.getElementById("result_list") != null){
	    var item = document.getElementById("result_list");
	    ul.removeChild(item);
	}

	for(var i = 0; i < searchJson.length; i++){
		var searchArray = searchJson[i].searchRTest;

		for(var j = 0; j < searchArray.length; j++){
			var li = document.createElement('a');
			li.setAttribute("id", "result_list");
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