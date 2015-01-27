var apikey = 'e14d30d8866462614fa0b5a19b45e26f';
var baseUrl = 'http://api.themoviedb.org/';
var movieSearchUrl = baseUrl + '3/search/movie?api_key=' + apikey;
var movieLookUp = baseUrl + '3/movie/';
var query = "Human Lanterns";
var year = "1982";
var url = movieSearchUrl + "&query=" + query + "&year=" + year;

// http://api.themoviedb.org/3/search/movie?api_key=e14d30d8866462614fa0b5a19b45e26f&query=Human Lanterns&year=1982


if (Meteor.isServer) {
    Meteor.methods({
        searchMovies: function (title, year) {
            url = movieSearchUrl + "&query=" + title + "&year=" + year;
            console.log(url);
            this.unblock();
            return Meteor.http.call("GET", url);
        },
        detailMovie: function (id) {
            url = movieLookUp + id + '?api_key=' + apikey;
            console.log(url);
            this.unblock();
            return Meteor.http.call("GET", url);
        }
    });
}

Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {


  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({owner: Meteor.userId()}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}).count();
    },
    isAdmin: function() {
      return (Meteor.user().username === 'admin');
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {

      console.log(event.target);
      var name = event.target.name.value;
      var rating = event.target.rating.value;
      var studio = event.target.studio.value;
      var poster = '';
      var backdrop = '';
      var year = event.target.year.value;

      Meteor.call("searchMovies", name, year, function(error, results) {
        Meteor.call("detailMovie", results.data.results[0].id, function(error, results) {

          poster = 'http://cf2.imgobject.com/t/p/w780' + results.data.poster_path;
          backdrop = 'http://cf2.imgobject.com/t/p/w780' + results.data.backdrop_path;

          Tasks.insert({
            name: name,
            owner: Meteor.userId(),
            rating: rating,
            studio: studio,
            poster: poster,
            backdrop: backdrop,
            createdAt: new Date()
          });

        });
      });

      // Clear form
      event.target.name.value = "";

      // Prevent default form submit
      return false;
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    },

    'click #fetchButton' : function () {
      Meteor.call("checkTwitter", function(error, results) {
        console.log(results.data.results[0]);
      });
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {$set: {checked: ! this.checked}});
    },
    "click .delete": function () {
      Tasks.remove(this._id);
    }
  });

  // At the bottom of the client code
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}