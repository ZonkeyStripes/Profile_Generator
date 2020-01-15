const inquirer = require("inquirer");
const fs = require("fs");
const axios = require('axios');
const generateHTML = require("./generateHTML.js");
const convertFactory = require('electron-html-to');
const conversion = convertFactory({
    converterPath: convertFactory.converters.PDF
});

const questions = [
    {
        type: "list",
        name: "color",
        message: "Choose a color to style your page around: ",
        choices: ["red", "blue", "green", "pink"]
    },
    {
        type: "input",
        name: "gitname",
        message: "Provide your github profile username: "
    },
]

init();

const profObj = {};

function init() {

    inquirer.prompt(questions)
        .then(function (answers) {
            const url = "https://api.github.com/users/" + answers.gitname;
            const starUrl = "https://api.github.com/users/" + answers.gitname + "/starred";
            profObj.color = answers.color;

            axios.get(url).then(function(response){

                profObj.pfp = response.data.avatar_url;
                profObj.name = response.data.name;
                profObj.company = response.data.company;
                profObj.location = response.data.location;
                profObj.gitURL = response.data.html_url;
                profObj.blog = response.data.blog;
                profObj.bio = response.data.bio;
                profObj.repos = response.data.public_repos;
                profObj.followers = response.data.followers;
                profObj.following = response.data.following;                
                axios.get(starUrl).then(function(response){
                    profObj.starred = response.data.length;
                    makesPDF(profObj);
                })
            })
        })
    };
function makesPDF(){
    const profPage = generateHTML(profObj);
    conversion(
        {html: profPage} ,
        function(err, result) {
            if(err){
                return console.error(err);
            }
            result.stream.pipe(fs.createWriteStream('./generatedProf.pdf'));
                        conversion.kill();
                        console.log("Success!")
        }
    )}