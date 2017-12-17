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

            const eventCollections = await events();
            let URLPath = newEvent.file.path;
            URLPath = URLPath.replace(/\\/g, "/");
            const contactInfo = {
                name: newEvent.body.contactName,
                phone: newEvent.body.contactPhone,
                email: newEvent.body.contactEmail
            };
            let rsvp = false;
            let restrictDeparment = false;

            if (newEvent.body.rsvp == 'yes') { rsvp = true; }
            if (newEvent.body.departmentRestriction == 'yes') { restrictDeparment = true; }

            const createNewEvent = {
                _id: uuid.v4(),
                name: newEvent.body.eventName,
                organizerId: newEvent.user._id,
                department: newEvent.user.department,
                tickets: newEvent.body.tickets,
                ticketPrice: newEvent.body.ticketPrice,
                eventDescription: newEvent.body.description,
                location: newEvent.body.location,
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

    async getEventById(id) {
        try {
            if (!id) throw "No Id is provided";
            const eventCollections = await events();
            const event = await eventCollections.findOne({ _id: id });
            return event;

        } catch (e) {
            return e;
        }
    },

    async getAllEvents() {
        try {
            const eventCollections = await events();
            var eventsList = [];
            eventsList = await eventCollections.find({}).toArray();
            for (i = 0; i < eventsList.length; i++) {
                if (eventsList[i].ticketPrice > 0) {
                    eventsList[i].payableEvent = true;
                } else {
                    eventsList[i].payableEvent = false;
                }
            }
            return eventsList;
        } catch (e) {
            return e;
        }
    },

    async getDeptAllEvents(dept) {

        try {
            const eventCollections = await events();
            var eventsList = [];
            var resList = [];
            eventsList = await eventCollections.find({}).toArray();

            for (i = 0; i < eventsList.length; i++) {
                if (eventsList[i].department == dept) {
                    if (eventsList[i].ticketPrice > 0) {
                        eventsList[i].payableEvent = true;
                    } else {
                        eventsList[i].payableEvent = false;
                    }
                    resList.push(eventsList[i]);
                }
            }
            return resList;
        } catch (e) {
            return e;
        }
    },

    async registerForEvent(id, userId, tr_id) {
        try {
            const userCollections = await users();
            const eventCollections = await events();
            const eventDetails = await this.getEventById(id);
            const organizerDetails = await userData.findUserById(eventDetails.organizerId);
            const organizerName = organizerDetails.firstname + " " + organizerDetails.lastname;
            const paymentDetails = {
                transactionId: tr_id,
                amountPaid: eventDetails.ticketPrice,
                datePaid: new Date()
            };

            if (eventDetails.tickets > 0 && eventDetails.availableTickets <= 0) {
                throw "No Tickets available";
            }

            const eventRegistered = {
                _id: uuid.v4(),
                eventId: eventDetails._id,
                eventName: eventDetails.name,
                eventOrganizer: organizerName,
                department: eventDetails.department,
                ticketPrice: eventDetails.ticketPrice,
                description: eventDetails.eventDescription,
                location: eventDetails.location,
                eventDate: eventDetails.eventDate,
                contactInfo: eventDetails.contactInfo,
                restrictDepartment: eventDetails.restrictDepartment,
                paymentInfo: paymentDetails
            };

            if (eventDetails.tickets > 0) {
                eventRegistered.availableTickets = eventDetails.availableTickets - 1;
            }

            // Updating user table
            const userCollectionsUpdated = await userCollections.update({ _id: userId }, {
                $addToSet: {
                    events: eventRegistered
                }
            });

            // Updating Event Table

            await eventCollections.update({ _id: eventDetails._id }, {
                $set: {
                    availableTickets: eventDetails.availableTickets - 1
                }
            });

            const userDetails = await userData.findUserById(userId);

            return userDetails.events;
        } catch (e) {
            return e;
            console.log(e);
        }
    },



    async getAllCreatedEvents(id) {
        try {
            if (!id) {
                throw "provide id";
            }
            const eventCollections = await events();
            const eventsCreated = await eventCollections.find({ 'organizerId': id }).toArray();
            return eventsCreated;

        } catch (e) {
            return e;
        }
    },

    async getRegisteredUsers(id) {
        try {
            if (!id) {
                throw "No id Provided";
            }
            const userCollections = await users();
            const registeredUsers = await userCollections.find({ "events": { $elemMatch: { eventId: id } } }).toArray();
            return registeredUsers;
        } catch (e) {
            return e;
        }

    }


}


module.exports = exportedMethods;