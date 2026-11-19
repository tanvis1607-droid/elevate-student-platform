import mongoose from "mongoose";

const options = { timestamps: true };
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, options);

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "Study" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: Date, default: null },
  completed: { type: Boolean, default: false }
}, options);

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },
  color: { type: String, default: "violet" }
}, options);

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  target: { type: Number, default: 10, min: 1 },
  progress: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: "sessions" }
}, options);

const skillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  level: { type: Number, default: 1, min: 1, max: 5 },
  category: { type: String, default: "Technical" }
}, options);

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, required: true, trim: true },
  minutes: { type: Number, required: true, min: 1 },
  studiedAt: { type: Date, default: Date.now }
}, options);

export const User = mongoose.model("User", userSchema);
export const Task = mongoose.model("Task", taskSchema);
export const Note = mongoose.model("Note", noteSchema);
export const Goal = mongoose.model("Goal", goalSchema);
export const Skill = mongoose.model("Skill", skillSchema);
export const StudySession = mongoose.model("StudySession", sessionSchema);
