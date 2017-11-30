const mongoCollections = require("../config/mongoCollections");
const path = require('path');
const fs = require('fs');
const users = mongoCollections.users;
const events = mongoCollections.events;
const uuid = require("node-uuid");

const exportedMethods = {

    async createEvent(newEvent) {
        try {
            if (!newEvent) throw "Event object is empty";
            //const userCollections = await users();
            const eventCollections = await events();
            let URLPath = newEvent.file.path;
            URLPath = URLPath.replace(/\\/g,"/");//  ("\\\\", "/");

            const createNewEvent = {
                _id: uuid.v4(),
                name: newEvent.body.eventName,
                organizerId: newEvent.user._id,
                department: newEvent.user.department,
                tickets: newEvent.body.tickets,
                ticketPrice: newEvent.body.ticketPrice,
                imageURL: URLPath,
            };
            const event = eventCollections.insertOne(createNewEvent);
            return event;
        } catch (e) {
            return e;
        }
    },

    async getEventById(id){
        try{
            if(!id) throw "No Id is provided";
            const eventCollections = await events();
            const event = await eventCollections.findOne({_id: id});
            return event;

        } catch(e){
            return e;
        }
    }
}


module.exports = exportedMethods;