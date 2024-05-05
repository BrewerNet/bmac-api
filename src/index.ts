import express from "express";
import dotenv from "dotenv";
import userRouter from "./routers";
import { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { AllExceptionMiddleware } from "./middlewares/AllExceptionMiddleware";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

//Limit the access rate of request
const rateLimit = 50;
const interval = 60 * 1000;
const reqCounts = {}
const blacklist = []
const whitelist = []

const checkBlackList = (req,res,next) => {
  if (blacklist.includes(req.ip)){
    return res.status(400).json({
      code: 400,
      status: "Error",
      message: "Bad Request.",
    })
  }

  next();
}

// Reset interval for every IP address
setInterval(() => {
  Object.keys(reqCounts).forEach((ip) => {
    if (reqCounts[ip] > 0) {
      reqCounts[ip] = 0;
    }
  });
}, interval);

const rateLimitAndTimeout = (req,res,next) => {
  const ip = req.ip;
  reqCounts[ip] = (reqCounts[ip] || 0) + 1;

  if (reqCounts[ip] > rateLimit) {
    // Respond with a 429 Too Many Requests status code
    if(!whitelist.includes(ip)){
      blacklist.push(ip);
    }
    return res.status(429).json({
      code: 429,
      status: "Error",
      message: "Rate limit exceeded.",
      data: null,
    });
  }
  next();
}

app.use(checkBlackList);
app.use(rateLimitAndTimeout);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/health", (req: Request, res: Response) => {
  res.send("health check success");
});
app.use("/api/v1", userRouter);

app.use(AllExceptionMiddleware);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
