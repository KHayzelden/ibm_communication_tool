module.exports = function(router, app){
	io.on('connection', (socket) => {
		socket.emit('message');
		// When the client emits 'search history', this listens and executes
		socket.on('search history', (data) => {
			console.log("Received keywords!");
			
			 // History: 
		  //   [
		  //       _id: ,
		  //       type: , (sentence or search
		  //       time: ,
		  //       text: , (if search: the term, If sentence voiced without search:the sentence
		  //       response_time: , (n/a) if sentence
		  //       results: (n/a if sentence)
		  //       [
		  //           rank: ,
		  //           text: ,
		  //           spoken:
				// ]
		  //   ],

			var history = [{"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "World cup", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]}, 
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "World ", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]},
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "ibm", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]},
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "communication", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]},
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "tool", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]},
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "hello world", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]},
				               {"id": 10086, "type": "search", "time": "28 Feb 2019", "text": "deadline", "response_time": "3s", "results": [{"rank": 1, "text": "Hello world"}, {"rank": 2, "text": "Hello world"} ]}];

			socket.emit('show history', {
				results: history
			});
		});
	});

	router.get('/search_history', function(req, res, next) {
	    res.render('search_history', {title: 'Watson Titter Communication', page_name: 'search_history', name: 'HSmith', loggedIn: true});

	});
}