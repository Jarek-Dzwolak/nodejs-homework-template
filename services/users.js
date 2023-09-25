const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gravatar = require("gravatar");

const usersSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    avatarURL: String,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

usersSchema.methods.generateAvatarUrl = function () {
  return gravatar.url(this.email, { s: "200", r: "pg", d: "identicon" });
};

const User = mongoose.model("User", usersSchema);

module.exports = User;
