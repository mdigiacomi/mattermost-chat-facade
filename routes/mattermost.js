var express = require('express');
var router = express.Router();
var request = require('request');

var returnVal = {posts: [{}]};
var token = "";

/* GET home page. */
router.get('/:chatroomid/:chatroomname/:username/:password', function(req, res, next) {
  
  request({ method: 'POST',
            uri: 'https://chat.digitaladrenalin.net/api/v1/users/login',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({name:req.params.chatroomname,email:req.params.username,password:req.params.password})
          },
    function (error, response, body) {
    if (!error && response.statusCode == 200) {
      
      token = response.headers.token;
      
      request({ method: 'GET',
                uri: 'https://chat.digitaladrenalin.net/api/v1/channels/' + req.params.chatroomid + '/posts/0/100',
                headers: {Authorization: "Bearer " + token }
      }, function(error, response, body){
        
        var parsebody = JSON.parse(body);

        var posts = parsebody.posts;
        var order = parsebody.order;
        
        request({ method: 'GET',
                uri: 'https://chat.digitaladrenalin.net/api/v1/channels/' + req.params.chatroomid + '/extra_info',
                headers: {Authorization: "Bearer " + token }
        }, function(error, response, body){
          
          var members = JSON.parse(body);
          
          console.log(order.length);
          console.log(members);

          for(var i = 0; i < order.length; i++)
          {
            var post = {};
            
            post.message = posts[order[i]].message
            
            if(posts[order[i]].props.length > 1)
            {
              post.user = posts[order[i]].props.override_username;
            }
            else
            {
              for(var x = 0; x < members.members.length; x++)
              {
                if(posts[order[i]].user_id === members.members[x].id)
                {
                  post.user = members.members[x].username;
                }
              }
            }
            returnVal.posts.push(post);
          }
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(returnVal);
        });
      });
    }
    else
    {
      console.log(error);
      console.log(body);
      console.log(next);
      res.sendStatus(404);
    }
  });
});

module.exports = router;
