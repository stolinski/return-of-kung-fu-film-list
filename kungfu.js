// simple-todos.js
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {


  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
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

      Tasks.insert({
        name: name,
        owner: Meteor.userId(),
        rating: rating,
        studio: studio,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.name.value = "";

      // Prevent default form submit
      return false;
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
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