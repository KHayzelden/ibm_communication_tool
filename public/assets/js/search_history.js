var socket = io();
socket.on('show history', (data) =>{
	var searchJson = data.results;
	refresh_history_list(searchJson);
}); 

// $( window ).load(function() {
// 	// new the history list
// });


function refresh_history_list(data){
	var container = document.getElementById("history_list");
	
	while(document.getElementById("result_list") != null){
	    var item = document.getElementById("result_list");
	    container.removeChild(item);
	}

	for(var i = 0; i < data.length; i++){
		// time, keyword, result
		var time = data[i].time;
		var keyword = data[i].text;
		var result = data[i].results;

		var li = document.createElement('li');
		li.className = "mdui-subheader"
		li.setAttribute("id", "result_list");
		li.appendChild(document.createTextNode(time));

		var div = document.createElement('div');
		div.setAttribute("id", "result_list");
		div.className = "mdui-panel-item";

		var div2 = document.createElement('div');
		div2.className = "mdui-panel-item-header";
		div2.appendChild(document.createTextNode(keyword));
		div.appendChild(div2);

		var div3 = document.createElement('div');
		div3.className = "mdui-panel-item-body"
		var ul = document.createElement('ul');
		ul.className = "mdui-list-dense";
		div3.appendChild(ul);

		for(var j = 0; j < result.length; j++){
			var l = document.createElement('li');
			l.className = "mdui-list-item mdui-ripple";
			l.appendChild(document.createTextNode(result[j].text));
			ul.appendChild(l);
		}
		div.appendChild(div3);
		container.appendChild(li);
		container.appendChild(div);
	}

};

socket.on('message', function(data){
    console.log('Connection successful!');
});

function show_history(keywords) {
   socket.emit('search history', keywords);
};

/* clear history function */
$('#clearButton').click(function(){
	console.log("work");
    if($(this).html() == "Clear History")
    {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                swal("Successfully Deleted!", {
                icon: "success",
                });
            } else 
            {
                swal("Your History is safe!");
            }
        });
    }
    else if($(this).html() == "Back")
    {
        $("#showdate").text("History");
        $("#clearButton").text("Clear History");
    }
})
