const userRoutes = require("./users/users");

const constructorMethod = (app) => {
  app.use("/user", userRoutes);

    app.use("*", (req, res) => {
        //app.use("/", userRoutes);
        res.status(404);
    })
};

module.exports = constructorMethod;