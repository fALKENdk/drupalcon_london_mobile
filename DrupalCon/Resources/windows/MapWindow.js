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

(function() {

  var uiEnabled = true;

  DrupalCon.ui.createMapWindow = function(tabGroup) {
    var mapWindow = Titanium.UI.createWindow({
      id: 'mapWindow',
      title: 'Maps',
      backgroundColor: '#FFF',
      tabGroup: tabGroup,
      barColor: '#000'
    });
		var rows = [];
    // create table view data object
    var data = [
      {title: 'Fairfield ground floor', infodata:true, hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/groundfloor.png'},
      {title: 'Fairfield first floor', infodata:true, hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/firstfloor.png'},
      {title: 'Fairfield second floor', infodata:true, hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/secondfloor.png'},
      {title: 'Fairfield third floor', infodata:true, hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/thirdfloor.png'},
      {title: 'Fairfield fourth floor', infodata:true, hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/fourthfloor.png'}
      //{title: 'Croydon College', hasChild:true, backgroundSelectedColor:'#0779BE', color: '#000', image:'images/maps/croydoncollege.png'}
    ];
		
		for(var dataNum = 0, numData = data.length; dataNum < numData; dataNum++) {
			
			var row = Ti.UI.createTableViewRow({
				height:'auto', 
				backgroundColor: '#edeae6', 
				selectedBackgroundColor: '#e4e0dd',
				borderColor: '#e0e0e0', 
				borderWidth: 1, 
				hasChild: data[dataNum].hasChild,
				image: data[dataNum].image,
				windowTitle: data[dataNum].title,
				info: data[dataNum].infodata,
				className: 'maprow'
			});
			
	    var label = Ti.UI.createLabel({
	    	text: data[dataNum].title,
	    	top:14, bottom:14, left:15, right:19,
		    height:'auto',
		    font:{fontSize:14, fontWeight:'bold'},
		    color:'#333',
		    shadowColor:'#FAFAFA',
				shadowOffset:{x:0, y:1},
	    });
	    row.add(label);
	    rows.push(row);
		}
		
    // create table view
    var tableview = Titanium.UI.createTableView({
      data: rows,
      color: '#FFF',
      layout:'vertical',
      separatorColor: '#d6d6d6'
    });

    // add table view to the window
    mapWindow.add(tableview);

    mapWindow.addEventListener('focus', function() {
      uiEnabled = true;
    });

    // create table view event listener
    tableview.addEventListener('click', function(e) {
      var mapImage = Ti.UI.createImageView({
        image: e.rowData.image
      });

      var map = Ti.UI.createWindow({
        title: e.rowData.title
      });

      map.add(mapImage);
      if (uiEnabled) {
        uiEnabled = false;
        var currentTab = (Ti.Platform.name == 'android') ? Titanium.UI.currentTab : mapWindow.tabGroup.activeTab;
        currentTab.open(DrupalCon.ui.createMapDetailWindow({
          title: e.rowData.windowTitle,
          mapName: e.rowData.windowTitle,
          image: e.rowData.image,
          info: e.rowData.info,
          tabGroup: currentTab
        }), {animated:true});
      }
    });


    return mapWindow;
  };

})();
