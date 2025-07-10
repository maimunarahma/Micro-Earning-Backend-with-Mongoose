import { model, Schema } from "mongoose";
import { user } from "../interfaces/userInterface";

const userSchema= new Schema<user>({
   name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        
    },
    coin:{
        type: Number,
        min: 0,

 default:function(this: any){
     return this.role==='Buyer'?50 : this.role==='Worker' ?10:0
 }
    },
    role:{
        type: String,
        required:true,
        enum: ["Buyer" , "Worker" , "Admin"]
    }
},{
    versionKey:false
})

export const User=model("User", userSchema)