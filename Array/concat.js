const new_hero= ["Varun","kartik","rajkumar"];

const old_hero = ["salman","shahrukh","ajay"];

// new_hero.push(old_hero);

// console.log(new_hero);


// const Hero = new_hero.concat(old_hero);
// console.log(Hero);

const A = ["a","b", "c"];
const B = ["d", "e"];

const All = [...A,...B];
console.log(All);



const ar = [1,2,3,4,[33,444],[4,4,4,[4,5,6,]]];
const flatArray = ar.flat(Infinity);
console.log(flatArray);