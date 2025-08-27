import NewProject from "../models/createProject.model.js";

// Create New Project
export const createNewProject = async (req, res) => {
  try {
    const {
      projectName,
      description,
      leadName,
      totalBudget,
      deadLine,
      projectDate,
      customerName,
      totalMembers,
      projectLocation,
      objective,
      payroll, // ✅ required at creation
    } = req.body;

    const documents = req.file ? req.file.path : null;

    // Ensure payroll is provided
    // if (!payroll || payroll.length === 0) {
    //   return res.status(400).json({ error: "Payroll must be provided when creating a project" });
    // }

    const newProject = new NewProject({
      projectName,
      description,
      leadName,
      totalBudget,
      deadLine,
      projectDate,
      customerName,
      totalMembers,
      projectLocation,
      objective,
      documents,
      payroll, // ✅ submitted at creation
      expenses: [], // ✅ always empty initially
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await NewProject.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await NewProject.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectsByFields = async (req, res) => {
  try {
    // Parse query param fields like: ?fields=projectName,totalBudget
    const fields = req.query.fields
      ? req.query.fields
          .split(",")
          .map((f) => f.trim())
          .join(" ")
      : "";

    // Fetch all projects but only with those fields
    const projects = await NewProject.find().select(fields);
    const total = await NewProject.countDocuments();
 const totalExpenseAgg = await NewProject.aggregate([
      { $unwind: "$expenses" }, // flatten expenses array
      { $group: { _id: null, total: { $sum: "$expenses.amount" } } }
    ]);

    const totalExpense = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].total : 0;
    const statusCounts = await NewProject.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Format counts
    const progressCount =
      statusCounts.find(s => s._id === "progress")?.count || 0;
    const completedCount =
      statusCounts.find(s => s._id === "completed")?.count || 0;

    res.json({
      progressCount,
      completedCount,
      totalExpense,
      total,
      projects,
    });
  } catch (err) {
    console.error("Error fetching projects by fields:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await NewProject.aggregate([
      { $unwind: "$expenses" },
      {
        $project: {
          _id: 0,
          projectName: 1,
          category: "$expenses.category",
          description: "$expenses.description",
          amount: "$expenses.amount",
          date: "$expenses.date",
        },
      },
    ]);

    // calculate total expenses
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ expenses, totalExpense });
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses", error: err });
  }
};

// Add Expense to a Project
export const addExpense = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, description, amount } = req.body;

    const validCategories = [
      "Daily",
      "Infrastructure",
      "Equipment",
      "Electrical",
      "Other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid expense category" });
    }

    const project = await NewProject.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Push the new expense
    project.expenses.push({
      category,
      description,
      amount,
      date: new Date(),
    });

    // 🔹 Calculate total expenses automatically
    const totalExpense = project.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // Optionally store it in project (if you have a field like totalExpenses in schema)
    project.totalExpenses = totalExpense;

    await project.save();

    res.status(200).json({
      message: "Expense added successfully",
      project,
      totalAmount: totalExpense, // returning computed value for frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Payroll (days worked for a role)
export const updatePayroll = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role, daysWorked } = req.body;

    const project = await NewProject.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const payrollEntry = project.payroll.find((p) => p.role === role);
    if (!payrollEntry) {
      return res.status(404).json({ error: "Payroll role not found" });
    }

    payrollEntry.daysWorked = daysWorked;

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
