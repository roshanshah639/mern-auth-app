import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import MessageModel from "../models/message.models.js";
import ConversationModel from "../models/conversation.models.js";

const sendMessage = asyncHandler(async (req, res) => {
  // extract details from request body
  const { userId, receiverId, message } = req.body;

  // validations - All fileds are required
  if (!userId || !receiverId || !message) {
    throw new ApiError(
      400,
      `${!userId ? "Sender Id" : !receiverId ? "Receiver Id" : "Message"} is required`
    );
  }

  try {
    // create new message
    const newMessage = new MessageModel({
      userId: req.user?._id,
      message,
      createdAt: Date.now(),
    });

    // save new message
    const savedMessage = await newMessage.save();

    // find existing conversation
    let conversation = await ConversationModel.findOne({
      members: {
        $all: [userId, receiverId],
        $size: 2,
      },
    });

    // if conversation already exists
    if (conversation) {
      // add message id to conversation
      conversation = await ConversationModel.findByIdAndUpdate(
        conversation?._id,
        {
          $push: {
            message: savedMessage._id,
          },
        },
        {
          new: true,
        }
      );
    } else {
      // create new conversation
      conversation = await ConversationModel.create({
        members: [userId, receiverId],
        message: [savedMessage._id],
      });
    }

    // return the success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: savedMessage,
          conversation,
        },
        "Message sent successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while sending message. Please try again later"
    );
  }
});

const getMessage = asyncHandler(async (req, res) => {
  const { userId, receiverId } = req.body;

  // validations - All fileds are required
  if (!userId || !receiverId) {
    throw new ApiError(
      400,
      `${!userId ? "Sender Id" : "Receiver Id"} is required`
    );
  }

  // find conversation
  const conversation = await ConversationModel.findOne({
    members: {
      $all: [userId, receiverId],
      $size: 2,
    },
  }).populate("message");

  // if conversation is not found
  if (!conversation) {
    const newConversation = await ConversationModel.create({
      members: [userId, receiverId],
      message: [],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: [],
          conversation: newConversation,
        },
        "Conversation created successfully"
      )
    );
  }

  // return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, conversation, "Messages fetched successfully"));
});

export { sendMessage, getMessage };
