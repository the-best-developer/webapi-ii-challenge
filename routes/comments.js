
const express = require('express');
const router = express.Router();
const db = require('../data/db');

//  ##########
//  ##########
//     GET
//  ##########
//  ##########

// /api/posts/:id/comments database GET
router.get('/:id/comments', (req, res) => {
    const { id } = req.params;

    db.findPostComments(id)
        .then(comments => {
            (comments != "")
            ?
                res.status(200).json(comments)
            :
                res.status(404).json({ message: "The post with the specified ID does not exist." })
        })
        .catch(_ => {
            res.status(500).json({ error: "The comments information could not be retrieved." });
        })
})

//  ##########
//  ##########
//     POST
//  ##########
//  ##########

//  /api/posts/:id/comments database POST
router.post('/:id/comments', (req, res) => {
    let comment = req.body;
    const { id } = req.params;
    
    (!comment.text) &&
        res.status(400).json({ errorMessage: "Please provide text for the comment." });

    db.findById(id)
    .then(post => {
        // check if post exists
        if(post != "") {
            // If post exists then...
            const newComment = {
                text: comment.text,
                post_id: id
            }
            
            // Insert comment object
            db.insertComment(newComment)
            .then(dbResponse => {
                // db.insertComment returns an object containing an id of the newly added object
                db.findCommentById(dbResponse.id)
                    .then(addedComment => {
                        res.status(201).json(addedComment)
                    })
                    .catch(err => {
                        // Error from db.findCommentById
                        res.status(500).json({ error: "There was an error while saving the comment to the database" })
                    })
            })
            .catch(_ => {
                // Error adding comment to datatbase
                res.status(500).json({ error: "There was an error while saving the comment to the database" });
            })
        }
        else {
            // If post not found
            res.status(500).json({ message: "The post with the specified ID does not exist." });
        }
    })
    
})

module.exports = router;