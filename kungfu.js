
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

  Meteor.startup(function(){
      Session.set("sort_by", {createdAt: 1});
      Session.set("detailModal", false);
      Session.set("modalMovie", '5 deadly venoms');
  });

  Template.body.helpers({
    tasks: function () {
      return Tasks.find({owner: Meteor.userId()}, {sort: Session.get("sort_by")} );
    },
    details: function() {
      return Tasks.findOne({name: Session.get("modalMovie")});
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    detailModal: function () {
      return Session.get("detailModal");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}).count();
    },
    isAdmin: function() {
      if(Meteor.user()){
        return (Meteor.user().username === 'admin');
      } else {
        return false;
      }

    }
  });

  Template.body.events({
    "submit .new-task": function (event) {

      var name = event.target.name.value;
      var rating = event.target.rating.value;
      var studio = event.target.studio.value;
      var poster = '';
      var backdrop = '';
      var year = event.target.year.value;

      Meteor.call("searchMovies", name, year, function(error, results) {
        Meteor.call("detailMovie", results.data.results[0].id, function(error, results) {

          Tasks.insert({
            name: name,
            owner: Meteor.userId(),
            rating: rating,
            studio: studio,
            overview: results.data.overview,
            release_date: results.data.release_date,
            runtime: results.data.runtime,
            poster: 'http://cf2.imgobject.com/t/p/w780' + results.data.poster_path,
            backdrop: 'http://cf2.imgobject.com/t/p/w780' + results.data.backdrop_path,
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

    'click .name' : function () {
      Session.set("modalMovie", event.target.outerText);
      Session.set("detailModal", true);
    },

    'click .detail-modal-close' : function () {
      Session.set("detailModal", false);
    },

    "click #toggle": function() {
      if( Session.get("sort_by").createdAt === 1) {
        Session.set("sort_by", {createdAt: -1});
      } else {
        Session.set("sort_by", {createdAt: 1});
      }
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