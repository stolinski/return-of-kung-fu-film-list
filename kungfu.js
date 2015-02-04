var apikey = 'e14d30d8866462614fa0b5a19b45e26f';
var baseUrl = 'http://api.themoviedb.org/';
var movieSearchUrl = baseUrl + '3/search/movie?api_key=' + apikey;
var movieLookUp = baseUrl + '3/movie/';
var query = 'Human Lanterns';
var year = '1982';
var url = movieSearchUrl + '&query=' + query + '&year=' + year;

if (Meteor.isServer) {
    Meteor.methods({
        searchMovies: function(title, year) {
            url = movieSearchUrl + '&query=' + title + '&year=' + year;
            console.log(url);
            this.unblock();
            return Meteor.http.call('GET', url);
        },
        detailMovie: function(id) {
            url = movieLookUp + id + '?api_key=' + apikey;
            console.log(url);
            this.unblock();
            return Meteor.http.call('GET', url);
        }
    });
}

Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

    Meteor.startup(function() {
        Session.set('sort_by', {year: 1});
        Session.set('detailModal', false);
        Session.set('editModal', false);
        Session.set('modalMovie', '5 deadly venoms');
        Session.set('editId', {});
    });

    Template.registerHelper('isAdmin', function() {
        if (Meteor.user()) {
            return (Meteor.user().username === 'admin');
        } else {
            return false;
        }
    });

    Template.body.helpers({
        tasks: function() {
            return Tasks.find({}, {sort: Session.get('sort_by')});
        },
        details: function() {
            return Tasks.findOne({name: Session.get('modalMovie')});
        },
        hideCompleted: function() {
            return Session.get('hideCompleted');
        },
        detailModal: function() {
            return Session.get('detailModal');
        },
        editModal: function() {
            return Session.get('editModal');
        },
        editFilm: function() {
            return Session.get('editId');
        }
    });

    Template.body.events({
        'submit .new-task': function(event) {

            var name = event.target.name.value;
            var rating = event.target.rating.value;
            var studio = event.target.studio.value;
            var clip = event.target.clip.value;
            var director = event.target.director.value;
            var poster = '';
            var backdrop = '';
            var year = event.target.year.value;

            Meteor.call('searchMovies', name, year, function(error, results) {
                Meteor.call('detailMovie', results.data.results[0].id, function(error, results) {

                    Tasks.insert({
                        name: name,
                        year: year,
                        owner: Meteor.userId(),
                        rating: rating,
                        studio: studio,
                        clip: clip,
                        director: director,
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
            event.target.name.value = '';

            // Prevent default form submit
            return false;
        },

        'click .name' : function() {
            Session.set('modalMovie', event.target.outerText);
            Session.set('detailModal', true);
        },

        'click .detail-modal-close' : function() {
            Session.set('detailModal', false);
        },

        'click .edit-modal-close' : function() {
            Session.set('editModal', false);
        },

        'click .year' : function() {
            if (Session.get('sort_by').year === 1) {
                Session.set('sort_by', {year: -1});
            } else {
                Session.set('sort_by', {year: 1});
            }
        },

        'click #edit-toggle' : function() {
            Session.set('editModal', true);
            Session.set('editId', this);
        },
        // Submits edit form
        'submit .film-edit': function(event) {
            Tasks.update(event.target.id.value, {$set: {
                name: event.target.name.value,
                rating: event.target.rating.value,
                studio: event.target.studio.value,
                director: event.target.director.value
            }});
            Session.set('editModal', false);
            // Prevent default form submit
            return false;
        }
    });

    Template.task.helpers({
        isAdmin: function() {
            if (Meteor.user()) {
                return (Meteor.user().username === 'admin');
            } else {
                return false;
            }
        }
    });

    Template.task.events({
        'click .delete': function() {
            Tasks.remove(this._id);
        }
    });

    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_ONLY'
    });

}
