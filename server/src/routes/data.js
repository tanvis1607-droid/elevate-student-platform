import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { Task, Note, Goal, Skill, StudySession } from "../models.js";

const router = Router();
router.use(protect);

const models = { tasks: Task, notes: Note, goals: Goal, skills: Skill };
const allowed = new Set(Object.keys(models));

for (const key of allowed) {
  const Model = models[key];
  router.get(`/${key}`, async (req, res, next) => {
    try { res.json(await Model.find({ user: req.userId }).sort({ createdAt: -1 })); }
    catch (e) { next(e); }
  });
  router.post(`/${key}`, async (req, res, next) => {
    try {
      const payload = { ...req.body, user: req.userId, _id: undefined };
      if (key === "tasks" && !payload.dueDate) payload.dueDate = null;
      res.status(201).json(await Model.create(payload));
    }
    catch (e) { next(e); }
  });
  router.patch(`/${key}/:id`, async (req, res, next) => {
    try {
      const updates = { ...req.body };
      if (key === "tasks" && updates.dueDate === "") updates.dueDate = null;
      const item = await Model.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: updates }, { new: true, runValidators: true }
      );
      if (!item) return res.status(404).json({ message: "Item not found." });
      res.json(item);
    } catch (e) { next(e); }
  });
  router.delete(`/${key}/:id`, async (req, res, next) => {
    try {
      const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.userId });
      if (!item) return res.status(404).json({ message: "Item not found." });
      res.json({ message: "Deleted successfully." });
    } catch (e) { next(e); }
  });
}

router.get("/sessions", async (req, res, next) => {
  try { res.json(await StudySession.find({ user: req.userId }).sort({ studiedAt: -1 }).limit(100)); }
  catch (e) { next(e); }
});
router.post("/sessions", async (req, res, next) => {
  try {
    const minutes = Number(req.body.minutes);
    if (!req.body.subject?.trim() || !Number.isFinite(minutes) || minutes < 1)
      return res.status(400).json({ message: "Enter a subject and a valid number of minutes." });
    res.status(201).json(await StudySession.create({ subject: req.body.subject, minutes, user: req.userId }));
  } catch (e) { next(e); }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const user = req.userId;
    const [tasks, notes, goals, skills, sessions] = await Promise.all([
      Task.find({ user }), Note.countDocuments({ user }), Goal.find({ user }), Skill.find({ user }),
      StudySession.find({ user, studiedAt: { $gte: new Date(Date.now() - 6 * 86400000) } })
    ]);
    const completed = tasks.filter(t => t.completed).length;
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(); day.setHours(0,0,0,0); day.setDate(day.getDate() - (6 - i));
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const minutes = sessions.filter(s => s.studiedAt >= day && s.studiedAt < next).reduce((a,s) => a + s.minutes, 0);
      return { day: day.toLocaleDateString("en-US", { weekday: "short" }), minutes };
    });
    res.json({
      stats: { totalTasks: tasks.length, completedTasks: completed, pendingTasks: tasks.length - completed,
        notes, goals: goals.length, skills: skills.length,
        studyMinutes: sessions.reduce((a,s) => a + s.minutes, 0) },
      weekly,
      recentTasks: tasks.sort((a,b) => b.createdAt - a.createdAt).slice(0,5),
      goals: goals.slice(0,4)
    });
  } catch (e) { next(e); }
});
export default router;
