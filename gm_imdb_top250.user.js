// ==UserScript==
// @name           IMDB Top 250
// @namespace      imdbtop250
// @grant          none
// @description    Keep track of the movies you've seen in the IMDB top 250 !
// @include        http://www.imdb.com/chart/top
// @version        1.1.3
// ==/UserScript==

(function(window, document, undefined) {
	"use strict";
	var GmImdb = {
		localStorageName: 'IMDB_Movies',
		checked: 0,
		table: null,

		init: function() {
			this.table = this.getTable();
			if (this.table === null) {
				return;
			}
			this.run();
		},

		getTable: function() {
			var tables = document.getElementsByTagName('table');
			for (var i = 0; i < tables.length; i++) {
				if (tables[i].getElementsByTagName('tr').length === 251) {
					return tables[i];
				}
			}
			return null;
		},

		toggle: function() {
			if (this.checked) {
				this.Storage.add(this.id);
				this.checked++;
			} else {
				this.Storage.remove(this.id);
				this.checked--;
			}
			this.updateStats();
		},

		extractID: function(url) {
			return url.split('/')[4];
		},

		run: function() {
			var movies = this.getMovies();
			this.addCheckBoxes(movies);
			this.addStats();
		},

		getMovies: function() {
			if (!this.Storage.supported()) {
				alert('No Local Storage support');
				return;
			}
			return this.Storage.get();
		},

		addCheckBoxes: function(movies) {
			var rows = this.table.getElementsByTagName('tr');
			for (var i = 0; i < rows.length; i++) {
				var cols = rows[i].getElementsByTagName('td');
				var col = document.createElement('td');
				col.align = 'center';
				if (i === 0) {
					col.innerHTML = '<font size="-1" face="Arial, Helvetica, sans-serif"><b>Seen</b></font>';
					rows[i].appendChild(col);
				} else {
					var title = this.extractID(cols[2].getElementsByTagName('a')[0].href);
					var checked = '';
					if (movies.indexOf(title) !== -1) {
						this.checked++;
						checked = ' checked="checked"';
					}
					col.innerHTML = '<input type="checkbox" id="' + title + '" ' + checked + '/>';
					rows[i].appendChild(col);
					document.getElementById(title).addEventListener('click', GmImdb.toggle, true);
				}
			}
		},

		addStats: function() {
			var parent = this.table.parentNode;
			var stat = document.createElement('div');
			stat.id = 'GmImdbStats';
			stat.align = 'center';
			parent.insertBefore(stat, this.table);
			this.updateStats();
		},

		updateStats: function() {
			var element = document.getElementById('GmImdbStats');
			element.innerHTML = 'You have seen ' + this.checked + ' movie' + ((this.checked !== 1) ? "s" : "") + ' from the IMDb Top 250 (' + (this.checked * 100 / 250) + '%) !';
		},

		Storage: {
			supported: function() {
				try {
					return 'localStorage' in window && window.localStorage !== null;
				} catch (e) {
					return false;
				}
			},
			add: function(id) {
				var movies = this.get();
				movies.push(id);
				localStorage[GmImdb.localStorageName] = movies.join();
			},
			remove: function(id) {
				var movies = this.get();
				var index = movies.indexOf(id);
				if (index !== -1) {
					movies.splice(index, 1);
				}
				localStorage[GmImdb.localStorageName] = movies.join();
			},
			get: function() {
				var movies = localStorage[GmImdb.localStorageName];
				return (movies === undefined) ? [] : movies.split(',');
			}
		}
	};

	window.GmImdb = GmImdb;
	GmImdb.init();
})(window, window.document);