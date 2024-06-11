import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080/api/v1/google/callback';
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function getGoogleAuthUrl(): Promise<string> {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
  });
}

export async function getGoogleUser(code: string): Promise<any> {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: client,
    version: 'v2'
  });
  const userinfo = await oauth2.userinfo.get();
  return userinfo.data;
}

export async function googleLogin(userInfo: any) : Promise<User>{
  
  const user = await prisma.user.findFirst({
    where: {
      email:userInfo.email
    },
  });
  if(!user){
    //register user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userInfo.email, salt);
    const newUser = await prisma.user.create({
      data: {
        username: userInfo.name,
        email: userInfo.email,
        first_name: " ",
        last_name: " ",
        middle_name:"",
        password: hashedPassword,
        verify_token: null,
        mobile_number: "",
        active: true,
      },
    });
    return newUser;
  }
  return user;

  
  /* FIX THE LOGIC of this part */
  //check database status, if registered -> set status to be active and send cookie with timer, if not registered -> register it and set it active
  //redirect this to homepage with successful login msg
  // res.status(200).json({
  //   message: "Logged in successfully!",
  //   token: token,
  // });
}