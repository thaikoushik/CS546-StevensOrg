const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuid = require("node-uuid");


const exportedMethods = {

    async createUser(newUser) {
        try {
            if (!newUser) throw "User object is empty";
            const userCollections = await users();
            const user = await userCollections.insertOne(newUser);

            return user;
        } catch (e) {
            return e;
        }
    },

    async findUserByUsername(username) {
        try {
            if (!username) throw "No username Provided";
            const userCollections = await users();
            const user = await userCollections.findOne({ username: username });
            return user;
        } catch (e) {
            return e;
        }
    },

    async findUserById(id) {
        try {
            if (!id) throw "No id Provided";
            const userCollections = await users();
            const user = await userCollections.findOne({ _id: id });
            return user;
        } catch (e) {
            return e;
        }
    },

    async getAllTicketDetails(id) {
        try {
            if (!id) throw "No id Provided";
            const userCollections = await users();
            const user = await userCollections.findOne({ _id: id });
            return user.events;

        } catch (e) {
            return e;
        }
    },

    async updateUser(id, updateExistingUser) {
        try {

            const userCollections = await users();

            await userCollections.update({
                _id: id
            }, {
                    $set: {

                        username: updateExistingUser.email,


                        firstname: updateExistingUser.firstname,

                        lastname: updateExistingUser.lastname,


                        address: updateExistingUser.address,


                        phone: updateExistingUser.phone,


                        department: updateExistingUser.department,
                    }
                });
            const userDetails = await userData.findUserById(id);
            return userDetails;

        } catch (e) {
            return e;
        }
    }

}


module.exports = exportedMethods;