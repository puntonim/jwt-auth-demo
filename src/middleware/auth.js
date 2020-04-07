const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    /*
    Get the JWT from the Auth header, validate it, fetch the user and
    store user and token it in req.user|token.
    */
    console.log("Auth middleware");
    let user, token;
    try {
        token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, "mysecret");
        user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token
        });
        if (!user) {
            throw new Error();
        }
    } catch (e) {
        return res.status(401).send({ error: "Please authenticate" });
    }
    req.user = user;
    req.token = token;
    next(); // Go on processing the request.
};

module.exports = auth;
