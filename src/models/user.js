const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

// ********** SCHEMA **********
// Define a schema first (so we can also later define a middleware and other stuff).
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            // Sanitization.
            trim: true
        },
        age: {
            type: Number,
            default: 0,
            // Validation as method.
            // For a more advanced validation, check out npm lib `validator`.
            validate(value) {
                if (value < 0) {
                    throw new Error("Age must be positive");
                }
            }
        },
        email: {
            type: String,
            required: true,
            unique: true,
            // Sanitization.
            trim: true,
            lowercase: true,
            // Advanced validation with `validator`.
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Not an email");
                }
            }
        },
        password: {
            type: String,
            required: true,
            // Sanitization.
            trim: true,
            // Validation.
            minlength: 6,
            validate(value) {
                // Word "password" not allowed.
                if (value.toLowerCase().includes("password")) {
                    throw new Error('Do not include word "password"!');
                }
            }
        },
        tokens: [
            // This is a sub-document.
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    // OPTIONS.
    {
        // Add `createdAt` and `updatedAt`.
        timestamps: true
    }
);

// ********** STATICS **********
// Custom static methods on the model class.
// Eg.: User.findByCredentials("foo@bar.com", "MyPass")
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};

// ********** METHODS **********
// Custom instance methods on the model.
// Eg.: user.generateAuthToken()
userSchema.methods.generateAuthToken = async function() {
    // Note1: do not use an arrow func because we want this func to be BOUND!
    // Note2: `this` is the user instance.
    const token = jwt.sign(
        { _id: this._id.toString() }, // (public) data in the token (anyone can read it, only we can ensure its hash matches)
        "mysecret", // Secret used to sign the token.
        { expiresIn: "7 days" } // Options.
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
};

/**
 * Output serializer: this is the same concept as output serializer in my typical
 * setup of Django REST Framework.
 * Thus it is being used in the `POST /users/login` route to serialize the user.
 * Note: by calling this func `toJSON` we would have achieved the same result, without
 * even explicitly calling this func in the route. But that would have overriden any JSON
 * serialization (`JSON.stringify(user)`) of the user object.
 */
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};

// ********** VIRTUAL PROPERTIES **********
/**
 * Virtual properties are not actual data stored in the DB, but
 * a relationship between 2 entities.
 * Perfect for modeling a inverse DB relationship between models.
 */
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});

// ********** MIDDLEWARE **********
/**
 * Hash password on user save.
 * This gets triggered with: `User.save()`.
 * IMPORTANT: `User.findByIdAndUpdate` does not call `save` (but `findOneAndUpdate`).
 * Src: https://mongoosejs.com/docs/middleware.html#notes
 * Thus this will NOT be triggered. You should register `.pre("findOneAndUpdate",...` which
 * unfortunately makes things more complicated as you can NOT rely on `this.isModified(...)` logic
 */
userSchema.pre("save", async function() {
    // Note1: do not use an arrow func because we want this func to be BOUND!
    // Note2: `this` is the user instance.
    // Note3: no need to accept and call `next` if this func is async.

    // Hash the password before saving.
    // But only if has been modified.
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
});

/**
 * Cascade delete on user save (delete all user's tasks).
 * This gets triggered with: `User.remove()`.
 */
userSchema.pre("remove", async function() {
    // Note1: do not use an arrow func because we want this func to be BOUND!
    // Note2: `this` is the user instance.
    // Note3: no need to accept and call `next` if this func is async.
    await Task.deleteMany({ owner: this._id });
});

// ********** MODEL **********
const User = mongoose.model("User", userSchema);

module.exports = User;
