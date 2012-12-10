// ==UserScript==
// @name           IMDB Top 250
// @namespace      imdbtop250
// @grant          none
// @description    Keep track of the movies you've seen in the IMDB top 250 !
// @include        http://www.imdb.com/chart/top
// ==/UserScript==

(function(window, document, undefined) {

	var GmImdb = {
		localStorageName: 'IMDB_Movies',
		checked: 0,
		table: null,

		init: function() {
			GmImdb.table = GmImdb.getTable();
			if (GmImdb.table === null) return;
			GmImdb.run();
		},

		getTable: function() {
			var tables = document.getElementsByTagName('table');
			for (var i = 0; i < tables.length; i++) {
				if (tables[i].getElementsByTagName('tr').length == 251) {
					return tables[i];
				}
			}
			return null;
		},

		toggle: function(event) {
			if (this.checked) {
				GmImdb.Storage.add(this.id);
				GmImdb.checked++;
			} else {
				GmImdb.Storage.remove(this.id);
				GmImdb.checked--;
			}
			GmImdb.updateStats();
		},

		extractID: function(url) {
			return url.split('/')[4];
		},

		run: function() {
			var movies = GmImdb.getMovies();
			GmImdb.addCheckBoxes(movies);
			GmImdb.addStats();
		},

		getMovies: function() {
			if (!GmImdb.Storage.supported()) {
				alert('No Local Storage support');
				return;
			}
			return GmImdb.Storage.get();
		},

		addCheckBoxes: function(movies) {
			var rows = GmImdb.table.getElementsByTagName('tr');
			for (var i = 0; i < rows.length; i++) {
				var cols = rows[i].getElementsByTagName('td');
				var col = document.createElement('td');
				col.align = 'center';
				if (i == 0) {
					col.innerHTML = '<font size="-1" face="Arial, Helvetica, sans-serif"><b>Seen</b></font>';
					rows[i].appendChild(col);
				} else {
					var title = GmImdb.extractID(cols[2].getElementsByTagName('a')[0].href);
					var checked = '';
					if (movies.indexOf(title) != -1) {
						GmImdb.checked++;
						checked = ' checked="checked"';
					}
					col.innerHTML = '<input type="checkbox" id="' + title + '" ' + checked + '/>';
					rows[i].appendChild(col);
					document.getElementById(title).addEventListener('click', GmImdb.toggle, true);
				}
			}
		},

		addStats: function() {
			var parent = GmImdb.table.parentNode;
			var stat = document.createElement('div');
			stat.id = 'GmImdbStats';
			stat.align = 'center';
			parent.insertBefore(stat, GmImdb.table);
			GmImdb.updateStats();
		},

		updateStats: function() {
			var element = document.getElementById('GmImdbStats');
			element.innerHTML = 'You have seen ' + GmImdb.checked + ' movie' + ((GmImdb.checked != 1) ? "s" : "") + ' of the IMDb Top 250 (' + (GmImdb.checked * 100 / 250) + '%) !';
		},

		Storage: {
			supported: function() {
				try {
					return 'localStorage' in window && window['localStorage'] !== null;
				} catch (e) {
					return false;
				}
			},
			add: function(id) {
				var movies = GmImdb.Storage.get();
				movies.push(id);
				localStorage[GmImdb.localStorageName] = movies.join();
			},
			remove: function(id) {
				var movies = GmImdb.Storage.get();
				var index = movies.indexOf(id);
				if (index != -1) movies.splice(index, 1);
				localStorage[GmImdb.localStorageName] = movies.join();
			},
			get: function() {
				var movies = localStorage[GmImdb.localStorageName];
				return (movies == undefined) ? [] : movies.split(',');
			}
		}
	};

	window.GmImdb = GmImdb;
	GmImdb.init();
})(window, window.document);