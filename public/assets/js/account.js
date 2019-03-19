
$(window).on('load', function(){
	db.allDocs({include_docs: true},function(err, docs) {
		 if (err) {
		    return console.log(err);
		 } else {
		    console.log(docs.rows);
		    var search_number = 0;
		    var keywords = 0;
		    var sentences = 0;
		    for(var i = 0; i < docs.rows.length; i++){
		  		if(docs.rows[i].doc.type == 'history'){
		    		search_number += 1;
		   		}else if(docs.rows[i].doc.type == 'search'){
		   			keywords += 1;
		   		}else if(docs.rows[i].doc.type == 'sentence'){
		   			sentences += 1;
		   		}
		  	}
		  	document.getElementById("search_number").innerText = search_number;
		  	document.getElementById("keyword_number").innerText = keywords;
		  	document.getElementById("sentence_number").innerText = sentences;

		}
	});

});
