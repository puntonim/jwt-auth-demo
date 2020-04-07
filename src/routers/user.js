const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();

// POST /users.
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
    } catch (e) {
        res.status(400).send(e);
    }
    // `generateAuthToken` is one User model `methods`.
    const token = await user.generateAuthToken();
    res.status(201).send({ user: user.getPublicProfile(), token });
});

// GET /users.
// Note: `auth` is the Express Middleware (see `middleware/auth.js`).
// router.get("/users", auth, async (req, res) => {
//     let users;
//     try {
//         users = await User.find({});
//     } catch (e) {
//         res.status(500).send();
//     }
//     res.send(users);
// });

// GET /users/me.
// Note: `auth` is the Express Middleware (see `middleware/auth.js`).
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user.getPublicProfile());
});

// // GET /users/:id.
// router.get("/users/:id", async (req, res) => {
//     const _id = req.params.id;
//     let user;
//     try {
//         user = await User.findById(_id);
//     } catch (e) {
//         res.status(500).send();
//     }

//     if (!user) {
//         return res.status(404).send();
//     }
//     res.send(user);
// });

// PATCH /users/me.
router.patch("/users/me", auth, async (req, res) => {
    // Ensure only valid keys are sent.
    const allowedUpdates = ["name", "email", "password", "age"];
    const updates = Object.keys(req.body);
    const isValidOp = updates.every(key => allowedUpdates.includes(key));
    if (!isValidOp) {
        return res.status(400).send({ error: "Invalid update keys" });
    }

    updates.forEach(key => (req.user[key] = req.body[key]));
    try {
        await req.user.save();
    } catch (e) {
        // Validation error.
        if (true) {
            // TODO: not sure how to catch this yet!
            return res.status(400).send(e);
        }
        // Generic error.
        res.status(500).send();
    }
    res.send(req.user.getPublicProfile());
});

// // DELETE /users/:id.
// router.delete("/users/:id", async (req, res) => {
//     let user;
//     try {
//         user = await User.findByIdAndDelete(req.params.id);
//     } catch (e) {
//         res.status(500).send();
//     }
//     if (!user) {
//         return res.status(404).send();
//     }
//     res.send(user);
// });

// DELETE /users/me.
router.delete("/users/me", auth, async (req, res) => {
    try {
        // user = await User.findByIdAndDelete(req.user._id);
        await req.user.remove();
    } catch (e) {
        res.status(500).send();
    }
    res.send(req.user.getPublicProfile());
});

// POST /users/login.
router.post("/users/login", async (req, res) => {
    let user;
    try {
        // `findByCredentials` is one User model `statics`.
        user = await User.findByCredentials(req.body.email, req.body.password);
    } catch (e) {
        return res.status(400).send();
    }
    // `generateAuthToken` is one User model `methods`.
    const token = await user.generateAuthToken();
    res.send({ user: user.getPublicProfile(), token });
});

// POST /users/logout.
router.post("/users/logout", auth, async (req, res) => {
    // Filter out the current token (stored in req.token).
    req.user.tokens = req.user.tokens.filter(
        token => token.token !== req.token
    );
    try {
        await req.user.save();
    } catch (e) {
        res.status(500).send();
    }
    res.send();
});

// POST /users/logout-all.
router.post("/users/logout-all", auth, async (req, res) => {
    // Clear all token.
    req.user.tokens = [];
    try {
        await req.user.save();
    } catch (e) {
        res.status(500).send();
    }
    res.send();
});

module.exports = router;
