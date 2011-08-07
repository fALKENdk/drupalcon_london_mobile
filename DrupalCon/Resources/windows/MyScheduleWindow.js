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
 * This is the page of My Schedule session listings.
 */
(function() {
	var uiEnabled = true;
	
	DrupalCon.ui.createMyScheduleWindow = function(settings) {
		Drupal.setDefaults(settings, {
			title: 'title here',
			start_date: '',
			end_date: '',
			tabGroup: undefined
		});
		
		var myScheduleWindow = Titanium.UI.createWindow({
			id: 'myScheduleWindow',
			title: settings.title,
			backgroundColor: '#FFF',
			tabGroup: settings.tabGroup,
			barColor: '#000'
		});
		
		var data = [];
		
		var conn = Drupal.db.getConnection('main');
		var rows = conn.query("SELECT nid FROM schedule ORDER BY start_date, nid");
		
		var nids = [];
    while(rows.isValidRow()) {
      nids.push(rows.fieldByName('nid'));
      rows.next();
    }
    rows.close();

		var sessions = Drupal.entity.db('main', 'node').loadMultiple(nids, ['start_date', 'nid']);
		var dayName;
		
    for (var sessionNum = 0, numSessions = sessions.length; sessionNum < numSessions; sessionNum++) {
      if (DrupalCon.renderers[sessions[sessionNum].type]) {
      	sessions[sessionNum].type = 'myschedule';
      	
      	if(dayName = '' || dayName != DrupalCon.util.getDayName(sessions[sessionNum].start_date)) {
      		dayName = DrupalCon.util.getDayName(sessions[sessionNum].start_date);
      		
      		if (isAndroid()) {
      			var dateSection = Ti.UI.createTableViewRow({height:'auto', backgroundColor: '#e4e0dd', borderColor: '#bfbcba', borderWidth: 1});
      		}else{
	      		var dateSection = Ti.UI.createTableViewSection();
						var dateSectionView = Ti.UI.createView({height:'auto', backgroundColor: '#e4e0dd', borderColor: '#bfbcba', borderWidth: 1});
 					}
 					
					var dateSectionLabel = Ti.UI.createLabel({
					    top:8, bottom:8, left:15, right:19,
					    height:'auto',
					    text:dayName,
					    font:{fontSize:14, fontWeight:'bold'},
					    color:'#333',
					    shadowColor:'#FAFAFA',
					    shadowOffset:{x:0, y:1},
					});
					
					if (isAndroid()) {
						dateSection.add(dateSectionLabel);
					}else{
						dateSectionView.add(dateSectionLabel);
						dateSection.headerView = dateSectionView;
					}
					
    			data.push(dateSection);
      	}
      	
      	var timeSection = Ti.UI.createTableViewSection();
				var timeSectionView = Ti.UI.createView({height:'auto', backgroundColor: '#fbf7f3', borderColor: '#e0e0e0', borderWidth: 1});
 
				var timeSectionLabel = Ti.UI.createLabel({
				    top:8, bottom:8, left:15, right:19,
				    height:'auto',
				    text: cleanTime(sessions[sessionNum].start_date) + ' - ' + cleanTime(sessions[sessionNum].end_date),
				    font:{fontSize:14, fontWeight:'bold'},
				    color:'#333',
				    shadowColor:'#FAFAFA',
				    shadowOffset:{x:0, y:1},
				});
				 
				timeSectionView.add(timeSectionLabel);
				timeSection.headerView = timeSectionView;
					
      	data.push(timeSection);
        data.push(DrupalCon.renderers['myschedule'](sessions[sessionNum]));
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
      borderWidth: 0,
      separatorStyle: 0,
    });
    
    myScheduleWindow.addEventListener('focus', function() {
      uiEnabled = true;
    });

    // Create table view event listener.
    tableview.addEventListener('click', function(e) {
      if (uiEnabled) {
        uiEnabled = false;
        var currentTab = (Ti.Platform.name == 'android') ? currentTab = Titanium.UI.currentTab : myScheduleWindow.tabGroup.activeTab;
        currentTab.open(DrupalCon.ui.createSessionDetailWindow({
          title: e.rowData.sessionTitle,
          nid: e.rowData.nid,
          tabGroup: currentTab
        }), {animated:true});
      }
    });

    myScheduleWindow.add(tableview);
		
		return myScheduleWindow;
	};
})();