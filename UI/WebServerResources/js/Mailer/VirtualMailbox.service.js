/* -*- Mode: javascript; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

(function() {
  'use strict';

  /**
   * @name VirtualMailbox
   * @constructor
   * @param {object} account - the mail account associated with the virtual search
   */
  function VirtualMailbox(account) {
    this.$account = account;
  }

  /**
   * @memberof VirtualMailbox
   * @desc The factory we'll use to register with Angular
   * @returns the VirtualMailbox constructor
   */
  VirtualMailbox.$factory = ['$q', '$timeout', '$log', 'sgSettings', 'Message', 'Mailbox', 'sgMailbox_PRELOAD', function($q, $timeout, $log, Settings, Mailbox, Message, PRELOAD) {
    angular.extend(VirtualMailbox, {
      $q: $q,
      $timeout: $timeout,
      $log: $log,
      $Message: Message,
      selectedFolder: null,
      PRELOAD: PRELOAD
    });

    return VirtualMailbox; // return constructor
  }];

  /**
   * @module SOGo.MailerUI
   * @desc Factory registration of VirtualMailbox in Angular module.
   */
  try {
    angular.module('SOGo.MailerUI');
  }
  catch(e) {
    angular.module('SOGo.MailerUI', ['SOGo.Common']);
  }
  angular.module('SOGo.MailerUI')
    .constant('sgMailbox_PRELOAD', {
      LOOKAHEAD: 50,
      SIZE: 100
    })
    .factory('VirtualMailbox', VirtualMailbox.$factory);

  /**
   * @memberof VirtualMailbox
   * @desc Build the path of the virtual mailbox (or account only).
   * @param {string} accountId - the account ID
   * @returns a string representing the path relative to the mail module
   */
  VirtualMailbox.$absolutePath = function(accountId) {
    return [accountId, "virtual"].join('/');
  };

  /**
   * @function init
   * @memberof Mailbox.prototype
   * @desc Extend instance with new data and compute additional attributes.
   * @param {object} data - attributes of mailbox
   */
  VirtualMailbox.prototype.init = function(data) {
    this.$isLoading = false;
    this.$mailboxes = [];
    this.uidsMap = {};
    angular.extend(this, data);
    this.id = this.$id();
  };

  VirtualMailbox.prototype.setMailboxes = function(data) {
    this.$mailboxes = data;

    _.each(this.$mailboxes, function(mailbox) {
      mailbox.$messages = [];
      mailbox.uidsMap = {};
    });
  };

  VirtualMailbox.prototype.startSearch = function(match, params) {    
    var _this = this,
        search = VirtualMailbox.$q.when();

    this.$isLoading = true;

    _.each(this.$mailboxes, function(mailbox) {
      search = search.then(function() {
        if (_this.$isLoading) {
          console.log("searching mailbox " + mailbox.path);
          return mailbox.$filter( {sort: "date", asc: false, match: match}, params);
        }
      });
    });
    
    search.finally(function() { _this.$isLoading = false; });
  };

  VirtualMailbox.prototype.stopSearch = function() {
    console.log("stopping search...");
    this.$isLoading = false;
  };
  
  /**
   * @function getLength
   * @memberof Mailbox.prototype
   * @desc Used by md-virtual-repeat / md-on-demand
   * @returns the number of items in the mailbox
   */
  VirtualMailbox.prototype.getLength = function() {
    var len = 0;

    if (!angular.isDefined(this.$mailboxes))
      return len;
    
    _.each(this.$mailboxes, function(mailbox) {
      len += mailbox.$messages.length;
    });

    return len;
  };

  /**
   * @function getItemAtIndex
   * @memberof Mailbox.prototype
   * @desc Used by md-virtual-repeat / md-on-demand
   * @returns the message as the specified index
   */
  VirtualMailbox.prototype.getItemAtIndex = function(index) {
    var i, j, k, mailbox, message;
    
    if (angular.isDefined(this.$mailboxes) && index >= 0) {
      i = 0;
      for (j = 0; j < this.$mailboxes.length; j++) {
        mailbox = this.$mailboxes[j];
        for (k = 0; k < mailbox.$messages.length; i++, k++) {
          message = mailbox.$messages[k];
          if (i == index) {
            return message;
          }
        }
      }
    }

    return null;
  };

  /**
   * @function $id
   * @memberof VirtualMailbox.prototype
   * @desc Build the unique ID to identified the mailbox.
   * @returns a string representing the path relative to the mail module
   */
  VirtualMailbox.prototype.$id = function() {
    return VirtualMailbox.$absolutePath(this.$account.id);
  };

  /**
   * @function $selectedCount
   * @memberof VirtualMailbox.prototype
   * @desc Return the number of messages selected by the user.
   * @returns the number of selected messages
   */
  VirtualMailbox.prototype.$selectedCount = function() {
    // TODO
    return 0;
  };

  /**
   * @function $flagMessages
   * @memberof VirtualMailbox.prototype
   * @desc Add or remove a flag on a message set
   * @returns a promise of the HTTP operation
   */
  VirtualMailbox.prototype.$flagMessages = function(uids, flags, operation) {
    // TODO
    // var data = {msgUIDs: uids,
    //             flags: flags,
    //             operation: operation};

    // return VirtualMailbox.$$resource.post(this.id, 'addOrRemoveLabel', data);
  };

  /**
   * @function $deleteMessages
   * @memberof VirtualMailbox.prototype
   * @desc Delete multiple messages from mailbox.
   * @return a promise of the HTTP operation
   */
  VirtualMailbox.prototype.$deleteMessages = function(uids) {
    // TODO
    //return VirtualMailbox.$$resource.post(this.id, 'batchDelete', {uids: uids});
  };

  /**
   * @function $copyMessages
   * @memberof VirtualMailbox.prototype
   * @desc Copy multiple messages from the current mailbox to a target one
   * @return a promise of the HTTP operation
   */
  VirtualMailbox.prototype.$copyMessages = function(uids, folder) {
    // TODO
    //return VirtualMailbox.$$resource.post(this.id, 'copyMessages', {uids: uids, folder: folder});
  };

  /**
   * @function $moveMessages
   * @memberof VirtualMailbox.prototype
   * @desc Move multiple messages from the current mailbox to a target one
   * @return a promise of the HTTP operation
   */
  VirtualMailbox.prototype.$moveMessages = function(uids, folder) {
    // TODO
    //return VirtualMailbox.$$resource.post(this.id, 'moveMessages', {uids: uids, folder: folder});
  };

})();
