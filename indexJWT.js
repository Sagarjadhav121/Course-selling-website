const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

//**admin routes**//

const secreteKey="YOUR_SECRETE_KEY";
const generateJwt=(user)=>{
  const payload={username:user.username};
  return jwt.sign(payload,secreteKey,{expiresIn:'1h'});
}

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secreteKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    const token=generateJwt(admin);
    res.json({ message: "Admin created successfully", token });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    const token=generateJwt(admin);
    res.json({ message: "Admin Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }  
});

app.post("/admin/courses", authenticateJwt, (req, res) => {
  let course = req.body;
  let verified =(course.title != '' && course.description != '')
  if (verified) {
//    course.id=Date.now(); 
    COURSES.push({...course, id: COURSES.length+1});
    res.status(200).json({ message: "course added in the list",courseId: COURSES.length });
  } else {
    res.status(411).json({ message: "All field sould be filled" });
  }
});

app.get("/admin/courses", authenticateJwt, (req, res) => {
  res.status(200).json({Courses: COURSES});
});
app.put("/admin/courses/:courseId", authenticateJwt, (req, res) => {
  let newId = parseInt(req.params.courseId);
  let updatedCourse = COURSES.find((a) => a.id === newId);

  if(updatedCourse){
    Object.assign(updatedCourse,req.body);
    res.status(200).json({message:'Course Updated successfully'})
  }else{
    res.status(404).json({message:'Course Not Found'})
  }

});

// User Routes


app.post("/users/signup", (req, res) => {
  const user = {...req.body,purchasedCourses: []};
   
  const existingUser = USERS.find((a) => a.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: "User already exists" });
  } else {
    USERS.push(user);
    const token=generateJwt(user);
    res.json({message:"user created Successfully",token});  
  }
});

app.post("/users/login", (req, res) => {

  const { username, password } = req.headers;
  const user = USERS.find((a) => a.username === username && a.password === password);
 
  if (user) {
    const token=generateJwt(user);
    res.json({ message: "User Logged in successfully", token });
  } else {
    res.status(403).json({ message: "User authentication failed" });
  }  
});

app.get("/users/courses", authenticateJwt, (req, res) => {
  res.json({ Courses: COURSES.filter(c=>c.published) });
});
 
app.post("/users/courses/:courseId", authenticateJwt, (req, res) => {
  const courseId= Number(req.params.courseId);
  const course=COURSES.find(c=>c.id===courseId);
  if (course) { 
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get("/users/purchasedCourses", authenticateJwt, (req, res) => {
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
