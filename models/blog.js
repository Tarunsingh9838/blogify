const {Schema,model}=require("mongoose");

const blogSchema=new Schema({
    title:{
        type:String,
        required:true,

    },
    body:{
        type:String,
        required:true,
    },
    coverImageURL:{
        type:String,
        required:false,
    },
    createdBy:{
          type:Schema.Types.ObjectId,
          ref:"user",
    },
    viewCount:{
        type:Number,
        default:0,
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending",
    },
    approvedBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        default:null,
    },
    rejectionReason:{
        type:String,
        default:null,
    },
    scheduledAt:{
        type:Date,
        default:null,
    },
    isPublished:{
        type:Boolean,
        default:false,
    },
},
{timestamps:true}

)
const Blog=model('blog',blogSchema);
module.exports=Blog;