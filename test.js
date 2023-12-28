'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding("ascii");
let inputString = "";
let currentLine = 0;

process.stdin.on("data", function (chunk) {
    inputString += chunk;
});
process.stdin.on("end", function () {
    inputString = inputString.split('\n');
    main();
});

function readLine() {
  return inputString[currentLine++];
}
    
function Employee(title) {
    this.title = title;
    //Employee.prototype.setTitle(title);
};
Engineer.prototype = Object.create(Employee.prototype);
Engineer.prototype.constructor = Engineer;
Employee.prototype.setTitle= function (title){
        this.title=title;
    };
    
Employee.prototype.getTitle=function (){
        return this.title;
    };



function Engineer(title, isManager)   {
    //super(this,title)
    Employee.call(this,title);
    this.isManager=isManager
    //console.log(Engineer.getTitle());
}
Engineer.prototype.setlsManager= function (title){
        this.isManager=title;
    };
    
Engineer.prototype.getlsManager=function (){
        return this.isManager;
    };




function main() {
    
     var engineerObject = new Engineer('ALI', true);
    
     //engineerObject.setIsManager(readLine().toLowerCase() === 'true');
    
     console.log(`Final Employee Profile - Title is ${engineerObject.getTitle()}. ${engineerObject.getIsManager() ? 'Is' : 'Is not'} a Manager\n`)
    
    console.log(`Engineer.prototype has property setTitle: ${Engineer.prototype.hasOwnProperty('setTitle')}\n`);
    console.log(`Engineer.prototype has property getTitle: ${Engineer.prototype.hasOwnProperty('getTitle')}\n`);
    console.log(`Engineer.prototype has property setIsManager: ${Engineer.prototype.hasOwnProperty('setIsManager')}\n`);
    console.log(`Engineer.prototype has property getIsManager: ${Engineer.prototype.hasOwnProperty('getIsManager')}\n`);
}
main();
