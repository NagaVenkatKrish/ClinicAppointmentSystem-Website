import { getAll, getById } from "../services/dataService.js";

const COLLECTION = "users";

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAll(COLLECTION);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getById(COLLECTION, req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Clinic user not found." });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
