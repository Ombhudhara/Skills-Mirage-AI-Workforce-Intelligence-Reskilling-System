import 'dotenv/config';
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Database Connection Promise
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO dp connection failed !!! ", err);
    });
