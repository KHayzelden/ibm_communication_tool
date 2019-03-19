$(window).on('load', function(){
	// new the history list
	show_history(null);
});

function refresh_history_list(needRefresh, data, types){
	var container = document.getElementById("history_list");

	if(needRefresh == true){
		container.innerText = "";
		if(data == null){
			return;
		}
		for(var i = 0; i < data.length; i++){
			// time, keyword, result
			var time = Date(data[i].time).toString();
			var element = time.split(" ");
			var simple_time = element[2] + ' ' + element[1] + ' ' + element[3]; 

			var keyword = data[i].keywords;
			var result = data[i].result;

			var li = document.createElement('li');
			li.className = "mdui-subheader";
			li.appendChild(document.createTextNode(simple_time));
			li.setAttribute("id", keyword);

			var div = document.createElement('div');
			div.className = "mdui-panel-item";
			div.setAttribute("id", keyword);

			var div2 = document.createElement('div');
			div2.className = "mdui-panel-item-header";
			div2.appendChild(document.createTextNode(keyword));
			div.appendChild(div2);

			var div3 = document.createElement('div');
			div3.className = "mdui-panel-item-body";
			var ul = document.createElement('ul');
			ul.className = "mdui-list-dense";
			div3.appendChild(ul);

			for(var j = 0; j < result.length; j++)
				(function(j){
					var l = document.createElement('li');
					var content = result[j].tweet;
					l.appendChild(document.createTextNode(content));
					l.className = "mdui-list-item mdui-ripple";
					// l.setAttribute("id", );
					l.onclick = function(){
						responsiveVoice.speak(l.innerText);
						l.style.color = "red";
					};
					ul.appendChild(l);
				})(j);
				
			
			div.appendChild(div3);
			container.appendChild(li);
			container.appendChild(div);
		}
	}else{
		if(types == 'key')
		{
			var result_list = document.querySelector('#history_list').children;
			for(var i = 0; i < result_list.length; i++){
				if(!result_list[i].getAttribute('id').toLowerCase().includes(data)){
					result_list[i].style.display = 'none';
				}else{
					result_list[i].style.display = 'block';
				}
			}
		}
		else if(types = 'time')
		{
			var result_list = document.getElementsByClassName("mdui-subheader");
			for (var i = 0; i < result_list.length; i++) {
				if(result_list[i].innerText == data)
				{
					result_list[i].style.display = 'block';
					result_list[i].nextElementSibling.style.display = 'block';
				}
				else
				{
					result_list[i].style.display = 'none';
					result_list[i].nextElementSibling.style.display = 'none';
				}
			}
		}
	}
}

function show_history(keywords) {
	if(keywords == null){
		db.allDocs({include_docs:true}, function(err, doc){
			var docs = doc.rows;
			var history = [];

			for(var i = 0; i < docs.length; i++){
				if(docs[i].doc.type === 'history'){
					history.push(docs[i].doc);
				}
			}
			refresh_history_list(true, history, 'all');
		});
	}else{
		refresh_history_list(false ,keywords, 'key');
	}
}

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
                db.allDocs({include_docs: true},function(err, docs) {
					if (err) {
					   return console.log(err);
					} else {
					   console.log(docs.rows);
					   for(var i = 0; i < docs.rows.length; i++)
						{
							if(docs.rows[i].doc.type == 'history')
							{
								db.remove({"_id":docs.rows[i].doc._id, "_rev":docs.rows[i].doc._rev})
							}
						}
					}
				});
				 
				swal("Successfully Deleted!", {
				icon: "success",
				});
				refresh_history_list(true, null, "clean histoy")

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
		show_history(null);
	}
})

	db.changes({ 
		live: true,
		include_docs: true
	}).on('change', function (change) {
		if(change.deleted){
			var deleteItem = $('#'+change.id);
			console.log(change.id);
			if(deleteItem.length) {
				deleteItem.remove();
			}
		}
	});