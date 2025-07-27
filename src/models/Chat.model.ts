import mongoose, { models, model, Schema } from "mongoose";

export interface IMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface IChat {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = models?.chat || model<IChat>("chat", chatSchema);

export default Chat;
