import express from 'express';
import dotenv from "dotenv";
// import userRouter from './routers';
import { Request, Response } from 'express';
import morgan from 'morgan';
import cors from "cors";
import { AllExceptionMiddleware } from './middlewares/AllExceptionMiddleware';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';


dotenv.config()
const app=express()
const port=process.env.PORT || 8080
app.use(morgan("dev"));
app.use(cors());
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health',(req:Request,res:Response)=>{
    res.send("health check success")
})

// app.use('/api/v1',userRouter)

app.use(AllExceptionMiddleware);

app.listen(port,()=>{
    console.log(`[server]: Server is running at http://localhost:${port}`)
})