const express = require("express");
// Db connection.
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT || 3000;

// Express middleware.
// Example of middleware.
app.use((req, res, next) => {
    console.log(req.method, req.path);
    if (req.method === "OPTION") {
        return res.send("OPTION disabled");
    }
    next(); // Go on processing the request.
});

// Automatically parse incoming JSON requests.
app.use(express.json());
// Register all routers.
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server up on port " + port);
});
