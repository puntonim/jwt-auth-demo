const mongoose = require("mongoose");

// Connect to the DB.
mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
    // See all warning: https://mongoosejs.com/docs/deprecations.html
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
