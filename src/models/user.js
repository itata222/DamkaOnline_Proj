const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");

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
        }
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


UserScheme.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;

    return userObj;
};

const User = mongoose.model("User", UserScheme);

module.exports = User;