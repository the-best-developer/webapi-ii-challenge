
const express = require('express');
const router = express.Router();
const db = require('../data/db');

//  ##########
//  ##########
//     GET
//  ##########
//  ##########

// /api/posts/ database GET
router.get('/', (req, res) => {
    db.find()
    .then(postList => {
        res.status(200).json(postList);
    })
    .catch(_ => {
        res.status(500).json({ error: "The posts information could not be retrieved." });
    })
})

// ##################################################

// /api/posts/:id database GET
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.findById(id)
    .then(post => {
        (post != "")
        ?
            res.status(200).json(post)
        :
            res.status(404).json({ message: "The post with the specified ID does not exist." })
    })
    .catch(_ => {
        res.status(500).json({ error: "The post information could not be retrieved." });
    })
})

//  ##########
//  ##########
//     POST
//  ##########
//  ##########

//  /api/posts database POST
router.post('/', (req, res) => {
    const post = req.body;

    (!post.title || !post.contents) &&
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });

    // Add post object from request.body to database
    db.insert(post)
    .then(dbResponse => {
         // db.insert returns an object containing an id of the newly added object
        db.findById(dbResponse.id)
        .then(newPost => {
            // Pull the newly added post from the database using the returned id and return the post
            (newPost != "")
            ?
                res.status(200).json(newPost)
            :
                // If it wasn't found, something went wrong
                res.status(500).json({ error: "There was an error while saving the post to the database" })
        })
        .catch(_ => {
            // Error from db.findById
            res.status(500).json({ error: "There was an error while saving the post to the database" })
        })
    })
    .catch(_ => {
        // Error from db.insert
        res.status(500).json({ error: "There was an error while saving the post to the database" });
    })
})

//  ##########
//  ##########
//    DELETE
//  ##########
//  ##########

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.findById(id)
    .then(post => {
        (post != "")
        ?
            db.remove(id)
            .then(_ => {
                    res.status(201).json({ message: `post ${id} has been removed` }).end();
            })
            .catch(_ => {
                res.status(500).json({ error: "The post could not be removed" })
            })
        :
            res.status(404).json({ message: "The post with the specified ID does not exist." })
    })
    .catch(_ => {
        res.status(404).json({ message: "The post with the specified ID does not exist." })
    })
})

//  ##########
//  ##########
//     PUT
//  ##########
//  ##########

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const postData = req.body;

    // If missing title or contents return
    (!postData.title || !postData.contents) &&
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });

    db.findById(id)
    .then(post => {
        // check if post exists
        if(post != "") {
            // Update database with postData object
            db.update(id, postData)
            .then(_ => {
                // If added, find the newly updated post and return it
                db.findById(id)
                .then(post => {
                    (post != "")
                    ?
                        // If post exists return it
                        res.status(200).json(post)
                    :
                        // If not, return not found error
                        res.status(404).json({ message: "The post with the specified ID does not exist." });
                })
                .catch(_ => {
                    res.status(404).json({ message: "The post with the specified ID does not exist." });
                })
            })
            .catch(_=> {
                    res.status(500).json({ error: "The post information could not be modified." });
            })
        }
        else {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        }
    })
    .catch(_ => {
        res.status(404).json({ message: "The post with the specified ID does not exist." });
    })
})

module.exports = router;