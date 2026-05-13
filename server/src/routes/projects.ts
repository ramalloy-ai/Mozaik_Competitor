import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1),
  data: z.unknown(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  data: z.unknown().optional(),
});

projectsRouter.get("/", async (req, res, next) => {
  try {
    const list = await prisma.project.findMany({
      where: { ownerId: req.user!.sub },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const { name, data } = createSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        ownerId: req.user!.sub,
        name,
        data: JSON.stringify(data ?? {}),
      },
    });
    res.json(serialize(project));
  } catch (e) {
    next(e);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project || project.ownerId !== req.user!.sub)
      throw new HttpError(404, "not found");
    res.json(serialize(project));
  } catch (e) {
    next(e);
  }
});

projectsRouter.put("/:id", async (req, res, next) => {
  try {
    const { name, data } = updateSchema.parse(req.body);
    const existing = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.ownerId !== req.user!.sub)
      throw new HttpError(404, "not found");
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(data !== undefined && { data: JSON.stringify(data) }),
      },
    });
    res.json(serialize(project));
  } catch (e) {
    next(e);
  }
});

projectsRouter.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.ownerId !== req.user!.sub)
      throw new HttpError(404, "not found");
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

function serialize(p: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  data: string;
}) {
  return {
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    data: JSON.parse(p.data),
  };
}
