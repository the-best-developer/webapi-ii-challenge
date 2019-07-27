const express = require('express');
const server = express();
const db = require('./data/db');

server.use(express.json());

server.listen(4000, () => {
    console.log('Server is listening on port 4000');
})

// page /
server.get('/', (req, res) => {
    res.status(200).send("Hello from /");
})

//  ##########
//  ##########
//     GET
//  ##########
//  ##########

// /api/posts/ database GET
server.get('/api/posts', (req, res) => {
    db.find()
        .then(postList => {
            res.status(200).json(postList);
        })
        .catch(err => {
            res.status(500).json({ error: "The posts information could not be retrieved." });
        })
})

// ##################################################

// /api/posts/:id database GET
server.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;

    db.findById(id)
        .then(post => {
            (post != "")
            ?
                res.status(200).json(post)
            :
                res.status(404).json({ message: "The post with the specified ID does not exist." })
        })
        .catch(err => {
            res.status(500).json({ message: "The post with the specified ID does not exist." });
        })
})

// ##################################################

// /api/posts/:id/comments database GET
server.get('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;

    db.findPostComments(id)
        .then(comments => {
            (comments != "")
            ?
                res.status(200).json(comments)
            :
                res.status(404).json({ message: "The post with the specified ID does not exist." })
        })
        .catch(err => {
            res.status(500).json({ error: "The comments information could not be retrieved." });
        })
})

//  ##########
//  ##########
//     POST
//  ##########
//  ##########

//  /api/posts database POST
server.post('/api/posts', (req, res) => {
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
                .catch(err => {
                    // Error from db.findById
                    res.status(500).json({ error: "There was an error while saving the post to the database" })
                })
        })
        .catch(dberr => {
            // Error from db.insert
            res.status(500).json({ error: "There was an error while saving the post to the database" });
    })
})

// ##################################################

//  /api/posts/:id/comments database POST
server.post('/api/posts/:id/comments', (req, res) => {
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
                        console.log(addedComment)
                    })
                    .catch(err => {
                        // Error from db.findCommentById
                        res.status(500).json({ error: "There was an error while saving the comment to the database" })
                    })
            })
            .catch(dberr => {
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

//  ##########
//  ##########
//    DELETE
//  ##########
//  ##########

server.delete('/api/posts/:id', (req, res) => {
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

server.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const postData = req.body;

    // If missing title or contents return
    (!postData.title || !postData.contents) &&
        res.status(400).json({ message: "The post with the specified ID does not exist." });

    db.findById(id)
    .then(post => {
        // check if post exists
        if(post != "") {
            // Update database with postData object
            db.update(id, postData)
            .then(updateRes => {
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
                .catch(err => {
                    res.status(404).json({ message: "The post with the specified ID does not exist." });
                })
            })
            .catch(err => {
                    res.status(500).json({ error: "The post information could not be modified." });
            })
        }
        else {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        }
    })
    .catch(err => {
        res.status(404).json({ message: "The post with the specified ID does not exist." });
    })
})