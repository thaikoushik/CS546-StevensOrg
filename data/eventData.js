const mongoCollections = require("../config/mongoCollections");
const userData = require("./userData");
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
            URLPath = URLPath.replace(/\\/g,"/");
            const contactInfo = {
                name: newEvent.body.contactName,
                phone: newEvent.body.contactPhone,
                email: newEvent.body.contactEmail
            };
            let rsvp = false;
            let restrictDeparment = false;

            if(newEvent.body.rsvp == 'yes'){rsvp= true;}
            if(newEvent.body.departmentRestriction == 'yes') {restrictDeparment = true;}
 
            const createNewEvent = {
                _id: uuid.v4(),
                name: newEvent.body.eventName,
                organizerId: newEvent.user._id,
                department: newEvent.user.department,
                tickets: newEvent.body.tickets,
                ticketPrice: newEvent.body.ticketPrice,
                eventDescription: newEvent.body.description,
                location:newEvent.body.location,
                availableTickets: newEvent.body.tickets,
                eventDate: newEvent.body.eventDate,
                contactInfo: contactInfo,
                imageURL: URLPath,
                RSVP: rsvp,
                restrictDeparment: restrictDeparment
            };

            const event = await eventCollections.insertOne(createNewEvent);
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
    },

    async getAllEvents(){
        try{
            console.log("herer too ");
            const eventCollections = await events();
            const eventsList = [];
            eventsList = await eventCollections.find({}).toArray();
            console.log(eventsList);
            return eventsList;
        } catch(e){
            return e;
        }
    },

    async registerForEvent(id, userId){
        try{
            const userCollections = await users();
            const eventDetails = await this.getEventById(id);
            const organizerDetails = await userData.findUserById(eventDetails.organizerId);
            const organizerName = organizerDetails.firstname + " " + organizerDetails.lastname;
            const eventRegistered = {
                _id:  uuid.v4(),
                eventId: eventDetails._id,
                eventName: eventDetails.name,
                eventOrganizer: organizerName,
                department: eventDetails.department,ticketPrice: eventDetails.ticketPrice,
                description: eventDetails.eventDescription,
                location: eventDetails.location,
                eventDate: eventDetails.eventDate,
                contactInfo: eventDetails.contactInfo,
                restrictDepartment: eventDetails.restrictDepartment

            };
        await userCollections.update({_id: userId}, { $addToSet: {
            events:eventRegistered
        } });

        const userDetails = await userData.findUserById(userId);
        //req.app.user.events = eventsList;

        return userDetails.events;
        } catch(e){
            return e;
        }
    },


}


module.exports = exportedMethods;