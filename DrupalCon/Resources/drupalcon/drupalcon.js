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
	
	DrupalCon.util.getDayName = function(date) {
		date = date.split('T',1);
		
		switch(date[0]){
			case '2011-08-22':
				date = 'Monday 22nd August'
				break;
			case '2011-08-23':
				date = 'Tuesday 23rd August'
				break;
			case '2011-08-24':
				date = 'Wednesday 24th August'
				break;
			case '2011-08-25':
				date = 'Thursday 25th August'
				break;
			case '2011-08-26':
				date = 'Friday 26th August'
				break;
			default:
				date = ''
				break;
		}
		
		return date;
	};
	
	DrupalCon.util.myScheduleIsAdded = function(nid) {
		isAdded = false;
		var rows = Drupal.db.getConnection('main').query('SELECT nid FROM schedule WHERE nid = ' + nid);
		
    while (rows.isValidRow()) {
      isAdded = true;
      rows.next();
    }
    rows.close();
    
    return isAdded;
	};
	
	DrupalCon.util.myScheduleIsBooked = function(start_date) {
		var isBooked = false;
		var rows = Drupal.db.getConnection('main').query('SELECT nid FROM schedule WHERE start_date = "'+start_date+'"');
		
		while (rows.isValidRow()) {
      isBooked = true;
      rows.next();
    }
    rows.close();
    
    return isBooked;
	};
	
	DrupalCon.util.myScheduleSessionName = function(start_date) {
		var sessionName;
		var rows = Drupal.db.getConnection('main').query('SELECT nid FROM schedule WHERE start_date LIKE "'+start_date+'%"');

    while (rows.isValidRow()) {
    	var nid = rows.fieldByName('nid');
    	var nodeRows = Drupal.db.getConnection('main').query('SELECT title FROM node WHERE nid = "' + nid + '"');
     	while (nodeRows.isValidRow()){
     		var sessionName = nodeRows.fieldByName('title');
     		nodeRows.next();
     	}
     	nodeRows.close();
      rows.next();
    }
    rows.close();
    
    return sessionName;
	};
	
  var lastTime = '';
	
  DrupalCon.renderers.session = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);

    var sessionRow = Ti.UI.createTableViewRow({
      selectedBackgroundColor: '#e4e0dd',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false,
      className: 'session',
      id: 'session'+session.nid
    });
		
		if(isAndroid()){
			sessionRow.rightImage = 'images/rightArrow.png';
		}else{
			sessionRow.hasChild = true;
		}
		
    var leftSpace = (Ti.Platform.name == 'android') ? 15 : 25;
    var titleColor = '#333';
    switch (session.track) {
      case "":
        sessionRow.backgroundImage = 'images/bgs/default.png';
        break;
      case "Site Building and Environment Set-up":
        sessionRow.backgroundImage = 'images/bgs/sitebuilding.png';
        break;
      case "Design, UX and Theming":
        sessionRow.backgroundImage =  'images/bgs/design.png';
        break;
      case "Day Stage":
        sessionRow.backgroundImage = 'images/bgs/day.png';
        break;
      case "Business and Best Practices":
        sessionRow.backgroundImage =  'images/bgs/business.png';
        break;
      case "Ecosystem":
        sessionRow.backgroundImage =  'images/bgs/ecosystem.png';
        break;
      case "Business Day":
        sessionRow.backgroundImage =  'images/bgs/businessday.png';
        break;
      case "Code &amp; Coders":
        sessionRow.backgroundImage =  'images/bgs/code.png';
        break;
      case "Core Conversations":
        sessionRow.backgroundImage =  'images/bgs/core.png';
        break;
      default:
        sessionRow.backgroundImage = 'images/bgs/default.png';
        break;
    }

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 8,
      height: 'auto'
    });

    // Some sessions have multiple presenters
    var presLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.instructors.map(DrupalCon.util.getPresenterName).join(', ')),
      font: {fontSize:13, fontWeight:'bold'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: fixLocation(session.room.map(cleanSpecialChars).join(', ')),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 10,
      right: 10,
      height: 'auto'
    });

    sessionRow.add(titleLabel);
    if(session.instructors.join(', ')) { sessionRow.add(presLabel); }
    if(session.room.map(cleanSpecialChars).join(', ')) { sessionRow.add(roomLabel); }

    return sessionRow;
  };

  DrupalCon.renderers.coreconversation = function(session) {
    var sessionTitle = cleanSpecialChars(session.title);

    var sessionRow = Ti.UI.createTableViewRow({
      selectedBackgroundColor: '#e4e0dd',
      backgroundColor: '#fff',
      backgroundImage: 'images/bgs/core.png',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      className: 'coreconversation',
      id: 'coreconversation'+session.nid
    });
		
		if(isAndroid()){
			sessionRow.rightImage = 'images/rightArrow.png';
		}else{
			sessionRow.hasChild = true;
		}
		
    var leftSpace = (Ti.Platform.name == 'android') ? 15 : 25;
    var titleColor = '#333';

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 8,
      height: 'auto'
    });

    // Some sessions have multiple presenters
    var presLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.instructors.map(DrupalCon.util.getPresenterName).join(', ')),
      font: {fontSize:13, fontWeight:'bold'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: fixLocation(session.room.map(cleanSpecialChars).join(', ')),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
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
      selectedBackgroundColor: '#e4e0dd',
      backgroundColor: '#fff',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false,
      className: 'daystage',
      id: 'day_stage'+session.nid
    });
		
		if(isAndroid()){
			sessionRow.rightImage = 'images/rightArrow.png';
		}else{
			sessionRow.hasChild = true;
		}
		
    var titleColor = '#ab7d66';

    if (session.start_date.substr(8,2) == '10') {
      sessionRow.leftImage = 'images/dmb.png';
      titleColor = '#269477';
    }
    var leftSpace = (Ti.Platform.name == 'android') ? 15 : 25;

    var titleLabel = Ti.UI.createLabel({
      text: sessionTitle,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 8,
      height: 'auto'
    });

    // Some sessions have multiple presenters
    var presLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.instructors.map(DrupalCon.util.getPresenterName).join(', ')),
      font: {fontSize:13, fontWeight:'bold'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: fixLocation(session.room.map(cleanSpecialChars).join(', ')),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 10,
      right: 10,
      height: 'auto'
    });
    
    sessionRow.add(titleLabel);
    sessionRow.add(presLabel);
    sessionRow.add(roomLabel);
    
    sessionRow.height = 'auto';

    return sessionRow;
  };
	
	DrupalCon.renderers.myschedule = function(session) {
		var sessionRow = Ti.UI.createTableViewRow({
      backgroundColor: '#fff',
      color: '#333',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: 'sessionTitle',
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : true,
      borderWidth: 0,
      backgroundSelectedImage: 'images/bgs/sitebuildingActive.png',
      className: 'myschedule',
      id: 'myschedule'+session.nid
      //headerView : cleanTime(session.start_date) + ' - ' + cleanTime(session.end_date)
    });
		
		if(isAndroid()){
			sessionRow.rightImage = 'images/rightArrow.png';
		}else{
			sessionRow.hasChild = true;
		}
		
		var leftSpace = (Ti.Platform.name == 'android') ? 15 : 25;
    var titleColor = '#333';
    var sessionColor;

   switch (session.track) {
      case "":
        sessionRow.backgroundImage = 'images/bgs/default.png';
        break;
      case "Site Building and Environment Set-up":
        sessionRow.backgroundImage = 'images/bgs/sitebuilding.png';
        break;
      case "Design, UX and Theming":
        sessionRow.backgroundImage =  'images/bgs/design.png';
        break;
      case "Day Stage":
        sessionRow.backgroundImage = 'images/bgs/day.png';
        break;
      case "Business and Best Practices":
        sessionRow.backgroundImage =  'images/bgs/business.png';
        break;
      case "Ecosystem":
        sessionRow.backgroundImage =  'images/bgs/ecosystem.png';
        break;
      case "Business Day":
        sessionRow.backgroundImage =  'images/bgs/businessday.png';
        break;
      case "Code &amp; Coders":
        sessionRow.backgroundImage =  'images/bgs/code.png';
        break;
      case "Core Conversations":
        sessionRow.backgroundImage =  'images/bgs/core.png';
        break;
      default:
        sessionRow.backgroundImage = 'images/bgs/default.png';
        break;
    }
		
		var titleLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.title),
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 8,
      height: 'auto'
    });

    // Some sessions have multiple presenters
    var presLabel = Ti.UI.createLabel({
      text: cleanSpecialChars(session.instructors.map(DrupalCon.util.getPresenterName).join(', ')),
      font: {fontSize:13, fontWeight:'bold'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
      bottom: 2,
      right: 10,
      height: 'auto'
    });

    // Some things, like keynote, have multiple rooms
    var roomLabel = Ti.UI.createLabel({
      text: fixLocation(session.room.map(cleanSpecialChars).join(', ')),
      font: {fontSize:13, fontWeight:'normal', fontStyle:'italic'},
      color: '#7e7e7e',
      left: leftSpace,
      top: 0,
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
      selectedBackgroundColor: '#e4e0dd',
      backgroundColor: '#fff',
      backgroundImage: 'images/bgs/default.png',
      color: '#000',
      start_date: session.start_date,
      end_date: session.end_date,
      nid: session.nid,
      sessionTitle: sessionTitle,
      itemType: session.type,
      height: 'auto',
      layout: 'vertical',
      focusable : false,
      className: 'scheduleitem',
      id: 'schedule_item'+session.nid
    });

    var leftSpace = (Ti.Platform.name == 'android') ? 15 : 25;
    var titleColor = '#333';

    var titleLabel = Ti.UI.createLabel({
      text: session.title,
      font: {fontSize:16, fontWeight:'bold'},
      color: titleColor,
      left: leftSpace,
      top: 10,
      right: 10,
      bottom: 10,
      height: 'auto'
    });
    
    if(specificRoom){
    	
    	if(isAndroid()){
				sessionRow.rightImage = 'images/rightArrow.png';
			}else{
				sessionRow.hasChild = true;
			}
    	
	    // Some things, like keynote, have multiple rooms
	    var roomLabel = Ti.UI.createLabel({
	      text: fixLocation(session.room.map(cleanSpecialChars).join(', ')),
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
