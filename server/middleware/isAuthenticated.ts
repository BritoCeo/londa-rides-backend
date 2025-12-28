import { NextFunction, Response } from "express";
import { FirestoreService } from "../utils/firestore-service";
import jwt from "jsonwebtoken";

export const isAuthenticated = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Please Log in to access this content!" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        const userData = await FirestoreService.getUserById(decoded.userId);
        // Attach the user data to the request object
        req.user = userData;
        next();
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const isAuthenticatedDriver = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Please Log in to access this content!" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      async (err: any, decoded: any) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        const driverData = await FirestoreService.getDriverById(decoded.userId);
        // Attach the user data to the request object
        req.driver = driverData;
        next();
      }
    );
  } catch (error) {
    console.log(error);
  }
};
