const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserScheme = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        score: {
            type: Number,
            default: 0
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]
    })

UserScheme.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

UserScheme.statics.findUserByUsernameAndPassword = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user)
        throw new Error({ error: 'Unable to login' })
    const isPassMatch = await bcrypt.compare(password, user.password)
    if (!isPassMatch)
        throw new Error({ error: 'Unable to login' })

    return user
}

UserScheme.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        {
            _id: user._id,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "6h"
        }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

UserScheme.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
};

const User = mongoose.model("User", UserScheme);

module.exports = User;