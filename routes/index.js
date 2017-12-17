const userRoutes = require("./users/users");
const adminRoutes = require("./users/admin");
const eventRoutes = require('./events/events')

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/admin", adminRoutes);
  app.use("/event", eventRoutes);

    app.use("*", (req, res) => {
        res.status(404);
    })
};

module.exports = constructorMethod;