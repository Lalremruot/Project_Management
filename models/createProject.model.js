import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Daily", "Infrastructure", "Equipment", "Electrical", "Other"],
      required: true,
    },
    description: { type: String }, // e.g., "Bought 3 laptops"
    amount: { type: Number, required: true }, // how much spent
    // totalAmount: { type: Number, required: true }, // total amount
    date: { type: Date, default: Date.now }, // when it was spent
  },
  { timestamps: true }
);

const newProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    leadName: { type: String, required: true },
    totalBudget: { type: String, required: true },
    deadLine: { type: String, required: true },
    projectDate: { type: String, required: true },
    customerName: { type: String, required: true },
    objective: { type: String },
    expenses: [expenseSchema],
    status: {
      type: String,
      enum: ["progress", "completed"], // allowed values
      default: "progress", // default value
    },
    payroll: [
      {
        role: {
          type: String,
          enum: ["Lead", "Jugalis", "Support", "Other"],
          required: true,
        },
        dailyRate: { type: Number, required: true },
        // daysWorked: { type: Number, default: 0 },
      },
    ],
    totalMembers: { type: String, required: true },
    projectLocation: { type: String, required: true },
    startDate: { type: String },
    documents: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("NewProject", newProjectSchema);
