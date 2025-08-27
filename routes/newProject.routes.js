import express from "express";
import {
  createNewProject,
  getAllProjects,
  addExpense,
  updatePayroll,
  getProjectById,
  getProjectsByFields,
  getAllExpenses
} from "../controllers/newProject.controller.js";

const router = express.Router();

router.post("/", createNewProject);         // create project with payroll
router.get("/", getAllProjects);   
router.get("/fields", getProjectsByFields);  
router.get("/expenses", getAllExpenses);  
router.get("/:projectId", getProjectById);         // get all projects
router.post("/:projectId/expenses", addExpense); // add expense later
router.patch("/:projectId/payroll", updatePayroll); // update daysWorked

export default router;
