const express = require('express');
const PostRoute = require('./routes/posts');
const CommentRoute = require('./routes/comments');
const server = express();

server.use(express.json());

server.use('/api/posts', PostRoute);
server.use('/api/posts', CommentRoute);
server.use('/', (req, res) => res.send('Server up and running :)'));

server.listen(4000, () => {
    console.log('Server on 4000');
});
