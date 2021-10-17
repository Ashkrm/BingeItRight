module.exports = function(req, res) {
    if (req.isAuthenticated()) {
      let present = false;
      for (var i = 0; i < req.user.wishList.length; i++) {
        if (req.user.wishList[i].title == req.body.title) {
          present = true;
          const h = "This movie is already present in your Watch list";
          const pm = "Search for other movies with the help of search box provided above";
          res.render("respond", {
            h: h,
            pm: pm,
            auth: req.authCustom.auth,
            user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
            username: req.authCustom.username
          });
          break;
        }
      }
      if (present === false) {
        req.user.wishList.push({
          title: req.body.title,
          rating: req.body.rating,
          titleType: req.body.titleType,
          url: req.body.image,
        });
        req.user.save();
        console.log(req.user);
        const h = "Movie Added To Your Watch List";
        const pm = "";
        res.render("respond", {
          h: h,
          pm: pm,
          auth: req.authCustom.auth,
          user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
          username: req.authCustom.username
        });
      }
    } else {
      const h = "Hi,You need to login first";
      const pm = "Click On 'Sign In' Provided In The Navigation Bar Above.";
      res.render("respond", {
        h: h,
        pm: pm,
        auth: req.authCustom.auth,
        user: {firstName : req.authCustom.firstName,lastName : req.authCustom.lastName},
        username: req.authCustom.username
      });
    }
  }
  