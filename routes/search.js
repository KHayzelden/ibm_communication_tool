const https = require('https');
module.exports = function(router, app){

	io.on('connection', (socket) => {
		socket.emit('message');
		// When the client emits 'search_keywords', this listens and executes
		socket.on('search keywords', (data) => {
			console.log("Received keywords!");
			let search = 'https://watson-twitter-communication.eu-gb.mybluemix.net/search?keyword=' + data.split(' ').join('+');

            https.get(search, (resp) => {
                let result = '';
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    result += chunk;
                });
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    socket.emit('show results', {
                        results: JSON.parse(result),
                        keyword: data
                    });
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
                socket.emit('show results', {
                    results: ["An error occureed, no results received"],
                    keyword: data
                });
            });
		});

		socket.on('get trending topics', () => {
			console.log('Received topic request!');
			// Get trending topics from the database

			
			var result = ['ChainedToTheRhythm', 'George Lopez', 'FelizMiercoles', 'Tara Palmer-Tomkinson',
			 'Leyla Zana', 'ValentinesDay', 'LoveBeyondFlags', 'Whatsapp'];

			 socket.emit('show trending topics', {
			 	trending_topics: result
			 });
		});

	});

	router.get('/search', function(req, res, next) {

		// // Get Data from database
		// // Transfomr data into JSON format
	 //    var searchResults = [];
	    var bookmarks1a = [];
	    var bookmarks2a = [];


	    var bookmarks1Json = [{"bookmarks1": ["Bookmark 1"]}, 
	               {"bookmarks1": ["Bookmark 2"]}, 
	               {"bookmarks1": ["Bookmark 3"]},
	               {"bookmarks1": ["Bookmark 4"]},
	               {"bookmarks1": ["Bookmark 5"]}];

	    for(var i = 0; i < bookmarks1Json.length; i++){
	       var books1Array = bookmarks1Json[i].bookmarks1;

	       for(var j = 0; j < books1Array.length; j++){
	        bookmarks1a.push(books1Array[j]);
	       
	       }
	    }

	    var bookmarks2Json = [{"bookmarks2": ["Bookmark 1"]}, 
	               {"bookmarks2": ["Bookmark 2"]}, 
	               {"bookmarks2": ["Bookmark 3"]},
	               {"bookmarks2": ["Bookmark 4"]},
	               {"bookmarks2": ["Bookmark 5"]},
	               {"bookmarks2": ["Bookmark 6"]},
	               {"bookmarks2": ["Bookmark 7"]},
	               {"bookmarks2": ["Bookmark 8"]},
	               {"bookmarks2": ["Bookmark 9"]},
	               {"bookmarks2": ["Bookmark 10"]}];

	    for(var i = 0; i < bookmarks2Json.length; i++){
	       var books2Array = bookmarks2Json[i].bookmarks2;

	       for(var j = 0; j < books2Array.length; j++){
	        bookmarks2a.push(books2Array[j]);

	       }
	    }

	 //    if(!app.db) {
	        res.render('search', {title: 'Watson Twitter Communication', page_name: 'search', name: 'HSmith', bookmarks1: bookmarks1a, bookmarks2: 
	        bookmarks2a, loggedIn: true});
	        return;
	 //    }
	});
}


