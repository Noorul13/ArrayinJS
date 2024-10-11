// function first (){
//     console.log("hello");
// }

// first();
// first();

/*
function add (num1, num2){
    return num1 + num2;
}

const result = add(5,23);
console.log(result);
*/

/*
function user(username){
    return (` ${username} just login`)
}

console.log(user());
console.log(user("hitesh"));
*/

/*
function user(username = "shami"){
    return (` ${username} just login`)
}

console.log(user());
console.log(user("hitesh"));
*/

/*
function calculate(val1, val2,...num){
    console.log(val1);
    console.log(val2);
    return num;
}

console.log(calculate(30,40,50,60,70));
*/

const user = {
    name: "faraj",
    price: 300
}

function detials(anyobjects){
    return `Username is ${anyobjects.name} and price is ${anyobjects.price}`;
}

console.log(detials(user));
