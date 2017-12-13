const express = require('express');
const router = express.Router();
const userData = require("../../data/userData");
const eventData = require("../../data/eventData");
const path = require('path');

router.get('/eventdetail/:id', async (req, res) => {
	const id = req.params.id;
	try{
		const event = await eventData.getEventById(id);
		if(!event){
			throw "There is no event created with this id";
		}
		res.app.locals.isRegistered = false;
		if(req.user !== undefined){
			console.log('safsdfds');
			let eventsRegistered = req.user.events; 
			for(let i=0;i<eventsRegistered.length;i++){
				console.log(eventsRegistered[i].eventId);	
			}
			
			for(let i=0;i<eventsRegistered.length;i++){
				console.log('asdfasdsdfdfdvbv fdfv ');
				if(eventsRegistered[i].eventId === id){
					console.log("is it herere");
					res.app.locals.isRegistered = true;
					break;
				} 
			}
		}

		event.imageURL = event.imageURL.replace('.jpg',"");
    	res.render('categories/eventDetail',{user: req.user, event: event});	
	} catch(e){
		res.send(e);
	}
	
});

router.post('/registerEvent/:id', async(req,res) => {
	const id = req.params.id;
	console.log(req.user);
	try{
		const eventsList = await eventData.registerForEvent(id, req.user._id);
		req.user.events = eventsList;
		console.log('------------------------------------------------');
		let userObj = req.user;
		let eventsLists = userObj.events; 
		for(let i=0;i<eventsLists.length;i++){
			console.log(eventsLists[i].eventId);	
		}
		

		if(!event){
			throw "There is no event created with this id";
		}
		
		res.status(201);
	} catch(e){
		res.send(e);
	}

});


module.exports = router;

