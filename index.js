const express = require('express');
const PostRoute = require('./routes/posts');
const CommentRoute = require('./routes/comments');
const server = express();
const cors = require('cors');

const corsOptions = {
    origin: function (origin, callback) {
        // Only allow 127.0.0.1:4000 Origin
        const isAllowed = (origin === "127.0.0.1:4000");
        callback(isAllowed ? null : "This origin is not allowed", isAllowed);
    }
};

server.use(express.json());
server.use(cors(corsOptions));

server.use('/api/posts', PostRoute);
server.use('/api/posts', CommentRoute);
server.use('/', (req, res) => { 
    res.send('Server up and rudnning :)')
});

server.listen(4000, () => {
    console.log('Server on 4000');
});
