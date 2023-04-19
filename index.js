const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notfound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const port = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRoute")
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const prodCategory = require("./routes/prodcategoryRouter");
const blogCategory = require("./routes/blogcategoryRouter");
const brand = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog",blogRouter);
app.use("/api/prodCategory", prodCategory);
app.use("/api/blogcategory", blogCategory);
app.use("/api/brand", brand);
app.use("/api/coupon", couponRouter);
app.use(notfound);
app.use(errorHandler);

app.listen(port,()=>{

    console.log(`server is listining to port at ${port}`);
});

