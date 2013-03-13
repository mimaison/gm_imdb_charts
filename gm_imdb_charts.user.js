// ==UserScript==
// @name            IMDb Top 250 & Bottom 100
// @version         2.0
// @description     Keep track of the movies you've seen in the IMDb Top 250 and Bottom 100 !
// @namespace       https://github.com/mimaison/gm_imdb_charts
// @grant           none
// @updateURL       https://github.com/mimaison/gm_imdb_charts/blob/master/gm_imdb_top250.meta.js
// @downloadURL     https://github.com/mimaison/gm_imdb_charts/blob/master/gm_imdb_top250.user.js
// @match           http://www.imdb.com/chart/top*
// @match           http://www.imdb.com/chart/bottom*
// ==/UserScript==

(function(window, document, undefined) {
	'use strict';
	var GmImdb = {
		localStorageName: 'IMDB_Movies',
		localStorageTop: 'mm_movies_top',
		localStorageBottom: 'mm_movies_bottom',
		checked: 0,
		table: null,

		init: function() {
			// Migration from pre 2.0 versions
			localStorage[GmImdb.localStorageTop] = localStorage[GmImdb.localStorageName].slice(0);

			if (!this.supported()) {
				this.message('Your browser does not support LocalStorage');
				return;
			}
			this.table = this.getTable();
			if (this.table === null) {
				return;
			}
			
			this.run();
		},

		isTop: function() {
			var url = window.location.href.toLowerCase();
			return url.match(/^https?:\/\/www\.imdb\.com\/chart\/top/);
		},

		message: function(message) {
			var element = document.getElementById('GmImdbStats');
			element.innerHTML = message;
		},

		getTable: function() {
			var len = (GmImdb.isTop()) ? 251 : 101;
			var tables = document.getElementsByTagName('table');
			for (var i = 0; i < tables.length; i++) {
				if (tables[i].getElementsByTagName('tr').length === len) {
					return tables[i];
				}
			}
			return null;
		},

		toggle: function() {
			if (this.checked) {
				GmImdb.add(this.id);
				GmImdb.checked++;
			} else {
				GmImdb.remove(this.id);
				GmImdb.checked--;
			}
			GmImdb.updateStats();
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
			var movies = (GmImdb.isTop()) ? localStorage[GmImdb.localStorageTop] : localStorage[GmImdb.localStorageBottom];
			return (movies === undefined) ? [] : movies.split(',');
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
					document.getElementById(title).addEventListener('click', this.toggle, true);
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
			var message = 'You have seen ' + this.checked + ' movie' + ((this.checked !== 1) ? "s" : "") + ' of the IMDb ';
			if (GmImdb.isTop()) {
				message += 'Top 250 (' + (this.checked * 100 / 250) + '%) !';
			} else {
				message += 'Bottom 100 (' + this.checked + '%) !';
			}
			GmImdb.message(message);
		},

		supported: function() {
			try {
				return 'localStorage' in window && window.localStorage !== null;
			} catch (e) {
				return false;
			}
		},

		add: function(id) {
			var movies = GmImdb.getMovies();
			movies.push(id);
			if (GmImdb.isTop()) {
				localStorage[GmImdb.localStorageTop] = movies.join();
			} else {
				localStorage[GmImdb.localStorageBottom] = movies.join();
			}
		},

		remove: function(id) {
			var movies = GmImdb.getMovies();
			var index = movies.indexOf(id);
			if (index !== -1) {
				movies.splice(index, 1);
			}
			if (GmImdb.isTop()) {
				localStorage[GmImdb.localStorageTop] = movies.join();
			} else {
				localStorage[GmImdb.localStorageBottom] = movies.join();
			}
		}

	};

	window.GmImdb = GmImdb;
	GmImdb.init();
})(window, window.document);