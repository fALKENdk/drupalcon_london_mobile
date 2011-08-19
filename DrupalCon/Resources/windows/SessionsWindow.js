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

/*
 * This is the page of session listings.
 */
(function() {

  var uiEnabled = true;

  DrupalCon.ui.createSessionsWindow = function(settings) {
    Drupal.setDefaults(settings, {
      title: 'title here',
      start_date: '',
      end_date: '',
      tabGroup: undefined
    });

    var sessionsWindow = Titanium.UI.createWindow({
      id: 'sessionsWindow',
      title: settings.title,
      backgroundColor: '#FFF',
      tabGroup: settings.tabGroup,
      barColor: '#000'
    });

    var data = [];

    var conn = Drupal.db.getConnection('main');
    var rows = conn.query("SELECT nid FROM node WHERE start_date >= ? AND end_date <= ? ORDER BY start_date, nid", [settings.start_date, settings.end_date]);

    var nids = [];
    while(rows.isValidRow()) {
      nids.push(rows.fieldByName('nid'));
      rows.next();
    }
    rows.close();

    var sessions = Drupal.entity.db('main', 'node').loadMultiple(nids, ['start_date', 'title', 'nid']);
		var lastTime = '';
    for (var sessionNum = 0, numSessions = sessions.length; sessionNum < numSessions; sessionNum++) {
      if (DrupalCon.renderers[sessions[sessionNum].type]) {
      	if (lastTime == '' || sessions[sessionNum].start_date != lastTime) {
		      lastTime = sessions[sessionNum].start_date;

		      if (isAndroid()) {
	    			var timeSection = Ti.UI.createTableViewRow({height:'auto', backgroundColor: '#edeae6', borderColor: '#d6d6d6', borderWidth: 1, className: 'timesection'});
	    		}else{
	      		var timeSection = Ti.UI.createTableViewSection();
						var timeSectionView = Ti.UI.createView({height:'auto', backgroundColor: '#edeae6', borderColor: '#d6d6d6', borderWidth: 1});
					}
	      	
					var timeSectionLabel = Ti.UI.createLabel({
					    top:8, bottom:8, left:15, right:19,
					    height:'auto',
					    text: cleanTime(sessions[sessionNum].start_date) + ' - ' + cleanTime(sessions[sessionNum].end_date),
					    font:{fontSize:14, fontWeight:'bold'},
					    color:'#333',
					    shadowColor:'#FAFAFA',
					    shadowOffset:{x:0, y:1}
					});
					 
					if (isAndroid()) {
						timeSection.add(timeSectionLabel);
					}else{
						timeSectionView.add(timeSectionLabel);
						timeSection.headerView = timeSectionView;
					}
						
	      	data.push(timeSection);
		    }
        data.push(DrupalCon.renderers[sessions[sessionNum].type](sessions[sessionNum]));
      }
      else {
        Ti.API.info('Not rendering for node type: ' + sessions[sessionNum].type);
      }
    }

    // create table view
    var tableview = Titanium.UI.createTableView({
      data: data,
      backgroundColor: '#fff',
      layout:'vertical',
      separatorStyle: 0
    });

    // Add a menu or button for a track legend
    if (isAndroid()){
      // Android has a menu
      var buttons = [];
      sessionsWindow.activity.onCreateOptionsMenu = function(e) {
        var menu = e.menu;

        var m1 = menu.add({
          title : 'Track Legend'
        });
        m1.addEventListener('click', function(e) {
          var legendWin = Ti.UI.createWindow({ modal:true });
          var wv = Ti.UI.createWebView({url: '../pages/legend.html', title: 'Track Legend'});
          legendWin.add(wv);
          legendWin.open();
        });
      };
    }
    else {
      // iOS should only have the button.
      var button = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.INFO_LIGHT
      });
      var win = sessionsWindow;
      win.rightNavButton = button;
      button.addEventListener('click', function() {
        var currentTab = (Ti.Platform.name == 'android') ? currentTab = Titanium.UI.currentTab : sessionsWindow.tabGroup.activeTab;
          currentTab.open(DrupalCon.ui.createHtmlWindow({
            title: 'Track Legend',
            url: 'pages/legend.html',
            tabGroup: currentTab
        }), {animated:true});

      });
    }

    sessionsWindow.addEventListener('focus', function() {
      uiEnabled = true;
    });

    // Create table view event listener.
    tableview.addEventListener('click', function(e) {
      if (uiEnabled) {
      	if(e.rowData.sessionTitle){
	        uiEnabled = false;
	        var currentTab = (Ti.Platform.name == 'android') ? currentTab = Titanium.UI.currentTab : sessionsWindow.tabGroup.activeTab;
	        currentTab.open(DrupalCon.ui.createSessionDetailWindow({
	          title: e.rowData.sessionTitle,
	          nid: e.rowData.nid,
	          tabGroup: currentTab
	        }), {animated:true});
        }
      }
    });

    // add table view to the window
    sessionsWindow.add(tableview);

    return sessionsWindow;
  };

})();

