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
		event.imageURL = event.imageURL.replace('.jpg',"");
    	res.render('categories/eventDetail',{user: req.user, event: event});	
	} catch(e){
		res.send(e);
	}
	
});

router.get('/uploaded/files/:id', async (req, res) => {
	const id = req.params.id;
	try{
		res.sendFile(path.resolve('./../../uploaded/files/'+id+'/.jpg'));
	} catch(e){
		res.send(e);
	}
});

module.exports = router;