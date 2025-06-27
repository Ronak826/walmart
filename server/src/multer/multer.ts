import multer from "multer"

let storage=multer.diskStorage({
    destination:(req:any,file:any,cb:any)=>{
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload=multer({storage})

export default upload