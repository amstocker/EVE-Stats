window.addEvent('domready', function() {
	/* lookup table for item ids */
	var ITEM_LOOKUP = {};
	
	/* load item lookup table */
	(function () {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status == 200) {
				var typeids = xhr.responseText.split(/\n/g);
				typeids.each( function(line) {
					line = line.split(/[^\S\r\n]{2,}/);
					var item_id = line[0], item_name = line[1];
					ITEM_LOOKUP[item_id] = item_name;
				});
			};
		};
		xhr.open('GET', '/js/typeid.txt')
		xhr.send()
	})();
	
	/* load kills list from zkillboard */
	(function () {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.status == 200) {
				var response = xhr.response;
				console.log(response)
				
				makeTable(response);
				
			};
		};
		xhr.open('GET', 'https://zkillboard.com/api/kills/solo/')
		xhr.responseType = 'json';
		xhr.send()
	})();
	
	/* make table of kill info */
	var makeTable = function (XHRresponse) {
		table = $('table')
		XHRresponse.each(function(kill) {
			var row = new Element('div');
			var victim = kill['victim'];
			row.appendText(victim['characterName']+" ("+victim['corporationName']+"//"+victim['allianceName']+")");
			row.grab( new Element('span', {styles:{color:'#06f'}, html:' @ '+kill['killTime']}) );
			
			var attackersTable = new Element('div'), attackers = kill['attackers'];
			attackersTable.grab( new Element('u', {styles:{color:'#f00'}, html:'Attacker(s)'}) );
			attackersTable.grab( new Element('br') );
			attackers.each( function(attacker) {
			
				var attackerdiv = new Element('div'), infodiv = new Element('div');
				attackerdiv.appendText( attacker['characterName']+" ("+attacker['corporationName']+"//"+attacker['allianceName']+")" );
				infodiv.appendText( 'Ship:        '+ITEM_LOOKUP[attacker['shipTypeID']] );
				infodiv.grab( new Element('br') );
				infodiv.appendText( 'Weapon:      '+ITEM_LOOKUP[attacker['weaponTypeID']] );
				infodiv.grab( new Element('br') );
				infodiv.appendText( 'Damage Done: '+attacker['damageDone'] );
				infodiv.grab( new Element('br') );
				
				attackerdiv.grab(infodiv);
				attackersTable.grab(attackerdiv);
			});
			row.grab(attackersTable);
			
			
			var itemsTable = new Element('div'), items = kill['items'];
			itemsTable.grab( new Element('u', {styles:{color:'#093'}, html:'Items'}) );
			itemsTable.grab( new Element('br') );
			
			var droppedTable = new Element('div');
			droppedTable.grab( new Element('b', {html:'Dropped Items'}) );
			droppedTable.grab( new Element('br') );
			var destroyedTable = new Element('div');
			destroyedTable.grab( new Element('b', {html:'Destroyed Items'}) );
			destroyedTable.grab( new Element('br') );
			
			var t1=false, t2=false;
			items.each( function(item) {
				if (item['qtyDropped'] > 0) {
					var table = droppedTable;
					var qty = item['qtyDropped'];
					t1 = true;
				} else {
					var table = destroyedTable;
					var qty = item['qtyDestroyed'];
					t2 = true;
				};
				table.appendText( '('+qty.toString()+')'+ITEM_LOOKUP[item['typeID']]+' [flag:'+item['flag']+']');
				table.grab( new Element('br') );
				
			});
			if (t1) {itemsTable.grab(droppedTable)};
			if (t2) {itemsTable.grab(destroyedTable)};
			if (t1||t2) {row.grab(itemsTable)};
			
			
			table.grab(row);
		});
		$('loading').setStyle('display', 'none');
	};
});


