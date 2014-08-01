window.addEvent('domready', function() {
	window.loadinganim = new Element('span', {'html':'Loading<span class="one">.</span><span class="two">.</span><span class="three">.</span>'});
	
	Date.prototype.yyyymmdd = function() {
		var yyyy = this.getFullYear().toString();
		var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
		var dd  = this.getDate().toString();
		return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
	};

	searchRequest = function () {
		var search_url, grabber, query = document.location.search;
		if (query.length>0) {
			if (query.substring(0,7) == "?entity") {
				var info = query.substring(8,query.length-1).split(',');
				search_url = info[0]+'/'+info[1];
				grabber = function (response) {showEntity(info[0], response)};
			} else {
				search_url = 'search'+query.substring(0,query.length-1);
				grabber = showSearchResults;
			};
		} else {
			search_url = 'search?q=';
			grabber = showSearchResults;
		};
		if ($('table')) {$('table').empty()};
		$('subtitle').setStyle('display', 'none');
		$('loading').setStyle('display', 'inline');
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status == 200) {
				grabber(xhr.response);
			};
		};
		xhr.open('GET', 'http://api.whelp.gg/'+search_url);
		xhr.responseType = 'json';
		xhr.send()
	};
	
	
	showSearchResults = function(results) {
		table = $('table');
		Object.each(results, function(list, key) {
			if (!list.length)
				return;
			var div = new Element('div').grab(
				new Element('b', {html: key[0].toUpperCase() + key.substr(1)})
			);
			div.grab( new Element('br') );
			var key_singular = key.substr(0, key.length-1)
			var name_key = key_singular + '_name';
			var id_key = key_singular + '_id';
			list.each(function(entity) {
				if (entity[name_key]!="") {
					div.adopt(
						new Element('a', {
							'href': '/?entity='+key_singular+','+entity[id_key],
							'html': entity[name_key],
							'styles': {color: '#00f'},
						}),
						new Element('br')
					);
				};
			});
			table.grab(div);
		});
		$('loading').setStyle('display', 'none');
		$('subtitle').setStyle('display', 'inline');
		$('subtitle').set('html', 'Search Results:');
	};
	
	showTopTen = function (name, toptenobj) {
		var sortable = [];
		Object.each(toptenobj, function(value, key) {
			sortable.push([key, value]);
		});
		sortable.sort(function(a, b) {return b[1]-a[1]});
		var sorted = sortable.slice(0,10);
		
		var table = new Element('table');
		table.adopt( new Element('th', {'html':name}) );
		sorted.each( function (row) {
			table.adopt( new Element('tr').adopt(
				new Element('td', {'html':row[0]}),
				new Element('td', {'html':row[1]})
			));
		});
		return table;
	};
	
	showEntity = function (entity_key, response) {
		console.log(response);
	
		var table = $('table');
		
		var chart_data = {};
		var killer_corps = {};
		var killed_corps = {};
		var flown_ships = {};
		var destroyed_ships = {};
		var top_pilots = {};
		/* var solo_pilots = {}; */
		var active_systems = {};
		
		var inlineDivStyle = {'display': 'inline',
							  'float':'right',
							  'padding': '0',
							  'color': '#bbb',
							  'border': 'none',
							  'margin': '0px 8px 0px'};

		var recentKills = new Element('div', {id: 'recentKills'});
		recentKills.grab( new Element('b', {html: 'recent kills:'}) );
		recentKills.grab( new Element('div', {styles: inlineDivStyle, html: 'corporation \\\\ alliance'}) );
		
		response['kills'].each( function(kill) {
			var row = new Element('div', {styles: {'padding':'0px'}});
			var victim = kill['victim'], finalblow = kill['final_blow'];
			var victimColor = '#f00', finalblowColor = '#093';
			
			var rowheader = new Element('div', {
				'class': 'unselectable unselectedKill',
				styles: {'margin':'0px', 'padding':'4px'}
			});
			
			rowheader.grab( new Element('span', {styles:{color:'#06f'}, html: kill['kill_time']}) );
			rowheader.appendText(' :: ');
			
			var killdatestr = new Date(kill['kill_time']).yyyymmdd();
			if (typeof(chart_data[killdatestr]) == 'undefined') {chart_data[killdatestr] = {'kill':0, 'loss':0}};
			
			if (victim['character_name']!="") {var victimname=victim['character_name']} else {var victimname='???'};
			if (finalblow['character_name']!="") {var finalblowname=finalblow['character_name']} else {var finalblowname='???'};
			
			if (victim[entity_key+'_name']!=response['stats'][entity_key+'_name']) {
				rowheader.grab( new Element('span', {styles: {color: finalblowColor}, html: finalblowname}) );
				rowheader.appendText(' > ');
				rowheader.grab( new Element('span', {styles: {color: victimColor}, html: victimname}) );
				rowheader.grab( new Element('div', 
					{styles: {display: 'inline',
							  'float': 'right',
							  'margin': '0',
							  'padding': '0'},
					 html: victim['corporation_name'] + ( (victim['alliance_name']!="") ? ' \\\\ '+victim['alliance_name'] : '' )
					})
				);
				chart_data[killdatestr]['kill'] += 1;
				if (top_pilots[finalblow['character_name']]) {top_pilots[finalblow['character_name']] += 1} else {top_pilots[finalblow['character_name']] = 1};
				
			} else {
				rowheader.grab( new Element('span', {styles: {color: victimColor}, html: victimname}) );
				rowheader.appendText(' < ');
				rowheader.grab( new Element('span', {styles: {color: finalblowColor}, html: finalblowname}) );
				rowheader.grab( new Element('div', 
					{styles: {display: 'inline',
							  'float': 'right',
							  'margin': '0',
							  'padding': '0'},
					 html: finalblow['corporation_name'] + ( (finalblow['alliance_name']!="") ? ' \\\\ '+finalblow['alliance_name'] : '' )
					})
				);
				chart_data[killdatestr]['loss'] += 1;		
			};
			row.grab(rowheader);
			
			/* collect data on top things */
			if (killer_corps[finalblow['corporation_name']]) {killer_corps[finalblow['corporation_name']] += 1} else {killer_corps[finalblow['corporation_name']] = 1};
			if (killed_corps[victim['corporation_name']]) {killed_corps[victim['corporation_name']] += 1} else {killed_corps[victim['corporation_name']] = 1};
			if (flown_ships[victim['ship name']]) {flown_ships[victim['ship name']] += 1} else {flown_ships[victim['ship name']] = 1};
			if (flown_ships[finalblow['ship_name']]) {flown_ships[finalblow['ship_name']] += 1} else {flown_ships[finalblow['ship_name']] = 1};
			if (destroyed_ships[victim['ship_name']]) {destroyed_ships[victim['ship_name']] += 1} else {destroyed_ships[victim['ship_name']] = 1};
			if (active_systems[kill['system_name']]) {active_systems[kill['system_name']] += 1} else {active_systems[kill['system_name']] = 1};
			
			/* kill info */
			var info = new Element('div', {styles: {'display': 'none'}});
			info.appendText('TEST');
			row.adopt(info);
			rowheader.addEvent('click', function(event) {
				if (info.getStyle('display')=='none') {
					info.setStyle('display', 'block');
				} else {
					/* add ajax req here from func attached to window, also show window.loadinganim */
					info.setStyle('display', 'none');
				};
			});
			
			
			recentKills.grab(row);
		});
		
		/* make tables of top things */
		
		var tablecontainer = new Element('div', {'id':'tablecontainer'});
		tablecontainer.grab( new Element('b', {'html': entity_key+" stats:"}) );
		tablecontainer.grab( new Element('br') );
		
		var statstable1 = new Element('table');
		statstable1.adopt( new Element('tr').adopt(
								new Element('td', {'html': "killed"}),
								new Element('td', {'html': numeral(response['stats']['killed']).format('0.0a')})),
						   new Element('tr').adopt(
								new Element('td', {'html': "lost"}),
								new Element('td', {'html': numeral(response['stats']['lost']).format('0.0a')}))					
		);
		var table2 = showTopTen('Top Killer Corps', killer_corps);
		var table3 = showTopTen('Top Killed Corps', killed_corps);
		var table4 = showTopTen('Top Flown Ships', flown_ships);
		var table5 = showTopTen('Top Destroyed Ships', destroyed_ships);
		var table6 = showTopTen('Top Pilots', top_pilots);
		var table7 = showTopTen('Most Active Systems', active_systems);
		
		tablecontainer.grab(statstable1);
		tablecontainer.grab( new Element('br') );
		tablecontainer.grab(table2);
		tablecontainer.grab(table3);
		tablecontainer.grab(table4);
		tablecontainer.grab(table5);
		tablecontainer.grab(table6);
		tablecontainer.grab(table7);
		
		table.grab(tablecontainer);
		table.grab(recentKills);
		
		$('loading').setStyle('display', 'none');
		$('subtitle').setStyle('display', 'inline');
		$('subtitle').set('html', response['stats'][entity_key+'_name']);
	};
	
	
	(function () {
		searchRequest();
	})();
	

});


