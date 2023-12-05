// const mongoose = require("mongoose") ;
// const plm = require("passport-local-mongoose");

// const expense = new mongoose.Schema({
//     username:String,
//     email:String,
//     Number:String,
//     password:String,
// });
// expense: [{ type: mongoose.Schema.Types.ObjectId, ref: "expense" }],
// expense.plugin(plm)
// module.exports = mongoose.model("expenses",expense)
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const expense = new mongoose.Schema(
    {
        username: String,
        password: String,
        email: String,
        token: {
            type: Number,
            default: -1,
        },
        expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "expense" }],
    },
    { timestamps: true }
);

expense.plugin(plm);
// userModel.plugin(plm, { usernameField: "email" });

module.exports = mongoose.model("expenses",expense );