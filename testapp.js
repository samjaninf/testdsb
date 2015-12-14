Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // filter based on completed
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // return all tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();

    }
  });

  Template.body.events({
    "submit .new-task": function(event){
       // Prevent Def
       event.preventDefault();

       var text = event.target.text.value;

       // Insert task
       Meteor.call("addTask", text);

       // Clear text field
       event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){
       // Set checked opposite
       Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text){
    if (! Meteor.userId()) {
      throw Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, {$set:{ checked: setChecked } });
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    // truncate tasks on boot
    Tasks.remove({});
    Users.remove({});

    if (Meteor.users.find().count() < 20) {
      _.each(_range(20), function(){
        var userObject = {
          username: faker.internet.userName(),
          email: faker.internet.email(),
          profile: {
            name: faker.name.findName(),
          },
          password: 'password'
        };

        Accounts.createUser(userObject);
      });
    }

    if (Tasks.find({}).count() === 0) {
      _(15).times(function(n){

      });
    }

  });

  // publish tasks Collection
  Meteor.publish("tasks", function(){
    return Tasks.find();
  });
}
