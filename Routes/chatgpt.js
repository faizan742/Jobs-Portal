const axios = require('axios');
const express = require('express');

require('dotenv').config();
const apiKey = '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';
const apiUrl = 'https://api.openai.com/v1/engines/davinci/completions';
const Router = express.Router();
Router.use(express.json());
Router.use(express.urlencoded({ extended: true }));

const promptText = "WHY IT IS NOT WORKING.";

async function queryChatGPT(prompt) {
    try {
        const response = await axios.post(apiUrl, {
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7,
            stop: '\n'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 200) {
            return response.data.choices[0].text;
        } else {
            console.error(`Error: ${response.status} - ${response.data.error.message}`);
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
Router.route('/CHATGPT').post(async (req,res)=>{
        
    queryChatGPT(req.body.message)
    .then(completion => {
        if (completion) {
            console.log('Completion:', completion);
            res.json('Completion:', completion);
        } else {
            console.log('Failed to get completion.');
            return res.status(429).json({ error: ' NOT WORKING Becasue of Limit' });
        }
    })
    .catch(err =>{
        console.error('Error:', err);
        return res.status(429).json({ error: ' NOT WORKING Becasue of Limit' });

        
    } 
      
    );

});



module.exports=Router;