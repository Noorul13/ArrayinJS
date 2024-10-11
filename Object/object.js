const user = {
    name: "hitesh",
    "full name" : "hitesh chodhary",
    age: 22,
    location: "Lucknow",
    email: "example.com"
}

// console.log(user.name);
// console.log(user["name"]);
// console.log(user["full name"]);

//user.email = "google.com";
// Object.freeze(user);
//user.email="amazon.com";
// console.log(user);

user.greeting = function(){
    console.log("hello JS user")
}

user.greeting1 = function(){
    console.log(`hello JS user ${this.name}`)
}

console.log(user.greeting());
console.log(user.greeting1());