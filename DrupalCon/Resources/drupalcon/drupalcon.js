/**
 * This file is part of DrupalCon Mobile.
 *
 * DrupalCon Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DrupalCon Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DrupalCon Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

var DrupalCon = {
  ui: {},
  util: {},
  renderers: {}
};


(function() {
  var verticalPadding = 2;
  var presenterList = {};

  DrupalCon.util.getPresenterList = function() {
    if (!Object.keys(presenterList).length) {
        var rows = Drupal.db.getConnection('main').query('SELECT name, full_name FROM user');
        while (rows.isValidRow()) {
          presenterList[rows.fieldByName('name')] = rows.fieldByName('full_name');
          rows.next();
        }
        rows.close();
      }
      return presenterList;
  };

  DrupalCon.util.getPresenterName = function(name) {
    var list = DrupalCon.util.getPresenterList();
    return list[name] || '';
  };

  // Clear the presenter list cache when we update data.
  Ti.addEventListener('drupal:entity:datastore:update_completed', function(e) {
    presenterList = {};
  });


  var lastTime = '';

  DrupalCon.renderers.session = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);

    var sessionRow = Ti.UI.createTableViewRow({
      hasChild:true,
      selectedBackgroundColor: '#f3f3f3',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false
    });

    var leftSpace = (Ti.Platform.name == 'android') ? 8 : 16;
    var titleColor = '';
    switch (session.track) {
      case "":
        leftSpace = 10;
        titleColor = '#d32101';
        break;
      case "Site Building and Environment Set-up":
        //sessionRow.leftImage = 'images/uxdesign.png';
        titleColor = '#004a8b';
        break;
      case "Design, UX and Theming":
        //sessionRow.leftImage = 'images/coder.png';
        titleColor = '#ff1600';
        break;
      case "Day Stage":
        //sessionRow.leftImage = 'images/business.png';
        titleColor = '#a1dec4';
        break;
      case "Business and Best Practices":
       // sessionRow.leftImage = 'images/config.png';
        titleColor = '#f3d23c';
        break;
      case "Ecosystem":
        //sessionRow.leftImage = 'images/community.png';
        titleColor = '#ffa22a';
        break;
      case "Business Day":
        //sessionRow.leftImage = 'images/coreconv.png';
        titleColor = '#aaaaaa';
        break;
      case "Code &amp; Coders":
        //sessionRow.leftImage = 'images/theming.png';
        titleColor = '#0098cd';
        break;
      case "Core Conversations":
        //sessionRow.leftImage = 'images/theming.png';
        titleColor = '#a4632b';
        break;
      default:
        //leftSpace = 10;
        titleColor = '#d32101';
        break;
    }

    // If there is a new session time, insert a header in the table.
    if (lastTime == '' || session.start_date != lastTime) {
      lastTime = session.start_date;
      sessionRow.header = cleanTime(lastTime) + " - " + cleanTime(session.end_date);
    }

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      height: 'auto'
    });

    // Some sessions have multiple presenters
    var presLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.instructors.map(DrupalCon.util.getPresenterName).join(', ')),
      font: {fontSize:14, fontWeight:'normal'},
      color: '#000',
      left: leftSpace,
      top: 4,
      bottom: 0,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: session.room.map(cleanSpecialChars).join(', '),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#666',
      left: leftSpace,
      top: 1,
      bottom: 10,
      right: 10,
      height: 'auto'
    });

    sessionRow.add(titleLabel);
    sessionRow.add(presLabel);
    sessionRow.add(roomLabel);

    return sessionRow;
  };

  DrupalCon.renderers.coreconversation = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);

    var sessionRow = Ti.UI.createTableViewRow({
      hasChild:true,
      selectedBackgroundColor: '#f3f3f3',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical'
    });

    var leftSpace = (Ti.Platform.name == 'android') ? 8 : 16;
    var titleColor = '#a4632b';

    // If there is a new session time, insert a header in the table.
    if (lastTime == '' || session.start_date != lastTime) {
      lastTime = session.start_date;
      sessionRow.header = cleanTime(lastTime) + " - " + cleanTime(session.end_date);
    }

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Some sessions have multiple presenters.
    var presLabel = Ti.UI.createLabel({
      text: session.instructors.map(DrupalCon.util.getPresenterName).join(', '),
      font: {fontSize:14, fontWeight:'normal'},
      color: '#000',
      left: leftSpace,
      top: 2,
      bottom: 0,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: session.room.map(cleanSpecialChars).join(', '),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#666',
      left: leftSpace,
      top: 1,
      bottom: 10,
      right: 10,
      height: 'auto'
    });

    sessionRow.add(titleLabel);
    sessionRow.add(presLabel);
    sessionRow.add(roomLabel);

    return sessionRow;
  };

  DrupalCon.renderers.day_stage = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);
    
    var sessionRow = Ti.UI.createTableViewRow({
      hasChild:true,
      selectedBackgroundColor: '#f3f3f3',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false
    });

    var titleColor = '#ab7d66';

    if (session.start_date.substr(8,2) == '10') {
      sessionRow.leftImage = 'images/dmb.png';
      titleColor = '#269477';
    }
    var leftSpace = (Ti.Platform.name == 'android') ? 30 : 40;

    // If there is a new session time, insert a header in the table.
    if (lastTime == '' || session.start_date != lastTime) {
      lastTime = session.start_date;
      sessionRow.header = cleanTime(lastTime) + " - " + cleanTime(session.end_date);
    }

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Day Stage entries may not have presenters, because the sponsors didn't
    // get their information submitted in time. Sigh.
    if (session.instructors) {
      var presLabel = Ti.UI.createLabel({
        text: session.instructors.map(DrupalCon.util.getPresenterName).join(', '),
        font: {fontSize:14, fontWeight:'normal'},
        color: '#000',
        left: leftSpace,
        top: 2,
        bottom: 0,
        right: 10,
        height: 'auto'
      });
    }

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: session.room.map(cleanSpecialChars).join(', '),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#666',
      left: leftSpace,
      top: 1,
      bottom: 10,
      right: 10,
      height: 'auto'
    });

    sessionRow.add(titleLabel);
    sessionRow.add(presLabel);
    sessionRow.add(roomLabel);

    return sessionRow;
  };

  DrupalCon.renderers.schedule_item = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);
		var specificRoom = (session.room.map(cleanSpecialChars).join(', ') != '') ? true : false;
		
    var sessionRow = Ti.UI.createTableViewRow({
      hasChild:false,
      selectedBackgroundColor: '#f3f3f3',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false
    });

    var leftSpace = (Ti.Platform.name == 'android') ? 8 : 16;
    var titleColor = '#333';

    // If there is a new session time, insert a header in the table.
    if (lastTime == '' || session.start_date != lastTime) {
      lastTime = session.start_date;
      sessionRow.header = cleanTime(lastTime) + " - " + cleanTime(session.end_date);
    }

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 10,
      height: 'auto'
    });
    
    if(specificRoom){
    	sessionRow.hasChild = true;
    	
	    // Some things, like keynote, have multiple rooms
	    var roomLabel = Ti.UI.createLabel({
	      text: session.room.map(cleanSpecialChars).join(', '),
	      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
	      color: '#666',
	      left: leftSpace,
	      top: 1,
	      bottom: 10,
	      right: 10,
	      height: 'auto'
	    });
    }

    sessionRow.add(titleLabel);
		(specificRoom) ? sessionRow.add(roomLabel) : '';
		
    return sessionRow;
  };

})();
