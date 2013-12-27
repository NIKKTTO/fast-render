if(!Package['iron-router']) return;

//track whether inside the ironRouter or not
//useful for identifying this inside the Meteor.subscribe
var insideIronRouter = false;
var RouteController = Package['iron-router'].RouteController;

var superRun = RouteController.prototype.run;
FastRender.RouteController = RouteController.extend({
  run: function() {
    if(FastRender.enabled) {
      insideIronRouter = true;
      superRun.call(this);
      insideIronRouter = false;
    } else {
      superRun.call(this);
    }
  }
});

var originalSubscribe = Meteor.subscribe;
Meteor.subscribe = function(subscription) {
  var condition = 
    FastRender.enabled &&
    //need to inside the ironRouter
    insideIronRouter &&
    //path loaded from the server and the local Router path should be the same
    Router.current().path == __fast_render_config.serverRoutePath &&
    //subscription not yet actually loaded (this may call multiple times)
    !__fast_render_config.loadedSubscriptions[subscription]

  if(condition) {
    originalSubscribe.apply(this, arguments);

    //ironRouter call .ready() and and if it's true he think subscription is completed
    return {
      ready: function() {
        return true;
      }
    }
  } else {
    return originalSubscribe.apply(this, arguments);
  }
};