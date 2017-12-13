const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuid = require("node-uuid");


const exportedMethods = {
    
    async createUser(newUser) {
        try {
            if (!newUser) throw "User object is empty";
            const userCollections = await users();
            const user = await userCollections.insertOne(newUser);
            //if (!user) throw "No user found";
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
           // if (!user) throw "No user found";
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
            //if (!user) throw "No user found";
            return user;
        } catch (e) {
            return e;
        }
    },

}


module.exports = exportedMethods;