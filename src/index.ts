const express=require('express')
const dotenv=require("dotenv")
dotenv.config()
const app=express()
const port=process.env.PORT

app.get('/health',(req,res)=>{
    res.send("health check success")
})

app.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})