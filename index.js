const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.json());
let ADMINS = [];
let USERS = [];
let COURSES = [];

//**admin routes**//

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
};

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    res.json({ message: "Admin created successfully" });
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ message: "Admin Logged in successfully" });
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  let course = req.body;
  let verified =(course.title != '' && course.description != '')
  if (verified) {
    course.id=Date.now();
    COURSES.push(course);
    res.status(200).json({ message: "course added in the list" });
  } else {
    res.status(411).json({ message: "All field sould be filled" });
  }
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  res.status(200).json({Courses: COURSES});
});
app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
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

let userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (a) => a.username === username && a.password === password
  );
  if (user) {
    req.user=user; // add usr object to the request
    next();
  } else {
    res.status(403).json({ message: "User authentication failed" });
  }
};

app.post("/users/signup", (req, res) => {
  const user = {...req.body,purchasedCourses: []};
  /*
  //  const user = {...req.body,purchasedCourses: []}; is same as below user syntax
  const user={
    username:req.body.username,
    password:req.body.password,
    purchasedCourse:[]
  }
  */
 
  const existingUser = USERS.find((a) => a.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: "User already exists" });
  } else {
    USERS.push(user);
    res.json({message:"user created Successfully"});  
  }
});

app.post("/users/login", userAuthentication, (req, res) => {
  res.json({ message: "User Logged in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  /*
==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
  let filteredCourses=[];
  for(let i=0;i<COURSES.length;i++){
    if(COURSES[i].published){
      filteredCourses.push(COURSES[i]);
    }
  }

// Above is same as below

  COURSES.filter(c=>c.published)
==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==
  */
  res.json({ Courses: COURSES.filter(c=>c.published) });
});
 
app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
    const courseId= Number(req.params.courseId);
    const course=COURSES.find(c=>c.id===courseId && c.published);
    if(course){
      req.user.purchasedCourses.push(courseId);
    res.json({message:'Course purchased Successfully'});
    }else{
      res.status(404).json({message:'Course could not found or not available'});
    }
});

app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  const purchasedCourses = COURSES.filter((c) =>req.user.purchasedCourses.includes(c.id));
  res.json({ purchasedCourses });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
