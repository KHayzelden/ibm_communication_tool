const getBearerToken = require('get-twitter-bearer-token');
const https = require('https');
var cfenv = require('cfenv');
var oauth;

try {
    oauth = require("../env_custom.json").OAUTH;
} catch (e) {
    console.log(e)}

module.exports = function(router, app){
	io.on('connection', (socket) => {
		socket.emit('message');
		// When the client emits 'search_keywords', this listens and executes
		socket.on('search keywords', (data) => {
		    let keyword = data.replace('#','');
			console.log("Received keywords!");
			let search = 'https://watson-twitter-communication.eu-gb.mybluemix.net/search?keyword=' + keyword.split(' ').join('+');

            let request = https.get(search, (resp) => {
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

            });
            request.on("error", (err) => {
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
            var token = "";
            if(oauth.access_token === undefined){
                getBearerToken(oauth.encoded_consumer_key, oauth.encoded_consumer_secret, (err, res) => {
                    if (err) {
                        console.log(err)
                    } else {
                        // bearer token
                        token = res.body.access_token;
                        // console.log(res.body.access_token);
                    }
                });
            }
            const options = {
                'hostname': 'api.twitter.com',
                'method': 'GET',
                'headers': {
                    'Authorization': 'Bearer ' + oauth.access_token || token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                'path': '/1.1/trends/place.json?id=23424975'
            };
            let result = '';
            const request = https.request(options, (res) => {
                res.on('data', (chunk) => {
                    result += chunk;
                });
                res.on('end', () => {
                    var filtered = JSON.parse(result)[0].trends.filter(trend => trend.tweet_volume !== null);
                    socket.emit('show trending topics', {
                        trending_topics: filtered.slice(0,11)
                    });
                });
            });
            request.on('error', (err) => {
                console.log("Error: " + err.message);
            });
            request.end();
		});
	});

	router.get('/search', function(req, res, next) {
		// Get Data from database
		// Transfomr data into JSON format
	    // var searchResults = [];
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
        res.render('search', {title: 'Watson Twitter Communication', page_name: 'search', bookmarks1: bookmarks1a, bookmarks2:
        bookmarks2a});
	 //    }
	});
};


