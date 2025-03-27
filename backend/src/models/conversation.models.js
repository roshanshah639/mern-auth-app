import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    message: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        required: true,
      },
    ],
  },

  { timestamps: true }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export default ConversationModel;
