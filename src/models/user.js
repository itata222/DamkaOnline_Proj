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
            trim: true,
            validate(value) {
                const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
                if (!passRegex.test(value)) {
                    throw new Error("Password must contain big and small characters so as numbers");
                }
            }
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

userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.statics.findUserByUsernameAndPassword = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user)
        throw new Error({ error: 'Unable to login' })
    const isPassMatch = await bcrypt.compare(user.password, password)
    if (!isPassMatch)
        throw new Error({ error: 'Unable to login' })
    return user
}

userSchema.methods.generateAuthToken = async function () {
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

userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
};

const User = mongoose.model("User", UserScheme);

module.exports = User;