import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: "epicode-users",
    timestamps: true,
  }
);

export default model("User", userSchema);
