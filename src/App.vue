<template>
	<div id="app">
		<h1>Yuletide 2018 Tagset</h1>

		<maintenance v-if="maintenance"></maintenance>

		<template v-else>
			<div class="modal" v-if="show">
				<div class="modal-content">
					<p>
						Add A Letter To <strong>{{ this.selectedFandom.name }}</strong>
					</p>
					<p>
						<small class="warn">Warning: update and delete functionality pending. Check before you add!</small><br>
					</p>
					
					<div class="input">
						<label for="username">Username:</label>
						<input v-focus="show" ref="username" id="username" type="text" v-model="username" placeholder="Username"> 
					</div>

					<div class="input">
						<label for="letter">Letter Link:</label>
						<input type="text" id="letter" v-model="url" placeholder="Letter link">
					</div>

					<div class="input" v-if="mods">
						<label for="pinchhitter">Pinch hitter?</label>
						<input type="checkbox" v-model="pinchhitter">
					</div>
					
					
					<button class="add-letter" @click="addLetter">Add!</button>  
					<button class="cancel" @click="cancel">(Cancel)</button>
				</div>
			</div>

			<easter-eggs 
				class="modal" 
				v-if="showEggHelp"
				:enabled="showEasterEggs"
				:fandoms="fandoms"
				@hide="showEggHelp = false"
			></easter-eggs>

			<div v-if="!loaded"><div class="loader">Loading...</div></div>

			<template v-else>
				<bookmarks
					@getPrompts="getPrompts"
					:showEasterEggs="showEasterEggs"
					:data="bookmarksData"
					:prompts="prompts"
					:promptmarks="promptmarks"
					:lettermarks="lettermarks"
					:bookmarks="bookmarks"
					:unlock="unlock"
					:hideCategory="hideCategory"
					:hideCharacters="hideCharacters"
				>
				</bookmarks>

				<div class="scroll-top" @click="scrollToTop">(^)</div>

				

				<div class="meta">
					Feedback/problems/donate: <a href="https://yuletide.dreamwidth.org/97965.html" target="_blank">here</a>
				</div>

				<user-lookup
					:user="user"
					:userPrompts="userPrompts"
					:promptmarks="promptmarks"
					@addPrompt="addPromptmark"
					@close="user = null; userPrompts = null"
				>
				</user-lookup>

				<table class="main">
					<thead>
						<tr>
							<th class="fandom">Fandom</th>
							<th class="category" v-if="!hideCategory">Category</th>
							<th class="characters" v-if="!hideCharacters">Characters</th>
							<th class="letters">Letters</th>
							<th v-if="unlock" class="prompts">Prompts</th>
						</tr>
					</thead>
					<tr v-for="(fandom, index) in filtered" v-if="loadAll || index <= scrollPosition" :class="{odd: index % 2 !== 0 }">
						<td class="fandom">
							{{ fandom.name }} 
							<div class="hide">
								{{ fandom['.key'] }}
							</div>
							<button class="bookmark" v-if="!hasBookmark(fandom)" @click="add(fandom)">Bookmark</button>
						</td>
						<td class="category" v-if="!hideCategory">{{fandom.category}}</td>
						<td class="characters" v-if="!hideCharacters">
							<ul>
								<li v-for="char in fandom.characters">{{char}}</li>
							</ul>
						</td>
						<td class="letters">
								<ul v-for="letter in fandom.letters">
									<li>
										<template v-if="letter.isPinchhitter">(</template>
										<a :href="formatUrl(letter.url)" target="_blank">{{ letter.username }}</a>

										<span v-if="isProlific(letter.username)">*</span>
										<sup v-if="showEasterEggs">{{ challenges(letter.username).join(' ') }}</sup>
										<template v-if="letter.isPinchhitter">)</template>
										<button class="bookmark-letter" v-if="!hasLettermark(letter, fandom)" @click="addLettermark(letter, fandom)">&hearts;</button>
									</li>
								</ul>
							<button class="add" @click="showModal(fandom)">Add</button>
						</td>
						<td v-if="unlock" class="prompts">
							<button v-if="!prompts[fandom['.key']] && hasPrompts[fandom['.key']]" @click="getPrompts(fandom['.key'])">Get Prompts</button>
							<div v-if="prompts[fandom['.key']] === 'loading'">Loading...</div>
							<template v-if="prompts[fandom['.key']] && prompts[fandom['.key']].length && prompts[fandom['.key']] !== 'loading'">
								<a href="javascript:void(0);" @click="collapse">Collapse</a>	
								<table class="prompts">
									<thead>
										<tr>
											<th class="fave">&hearts;</th>
											<th class="username">Username</th>
											<th class="characters">Characters</th>
											<th class="prompts">Prompts</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="prompt in prompts[fandom['.key']]">
											<td>
												<button 
													class="bookmark-prompt" 
													v-if="!hasPromptmark(prompt)"
													@click="addPromptmark(prompt)">&hearts;
												</button>
											</td>
											<td>
												{{ prompt.username }}
												<span v-if="isProlific(prompt.username)">*</span>
												<sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
												<a @click="getUserPrompts(prompt.username)"> (see all)</a>
											</td>
											<td>
												<ul v-if="prompt.characters">
													<li v-for="c in prompt.characters.split(',')">{{ c }}</li>
												</ul>
											</td>
											<td class="prompt" v-html="prompt.prompt"></td>
										</tr>
									</tbody>
								</table>
							</template>
							<span v-else-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
						</td>
					</tr>
				</table>
			</template>

			<caveats></caveats>
		</template>

	</div>
</template>

<script>
// components
import Bookmarks from './components/bookmarks.vue';
import Caveats from './components/caveats.vue';
import EasterEggs from './components/easter-eggs.vue';
import Maintenance from './components/maintenance.vue';
import Options from './components/options.vue';
import UserLookup from './components/user-lookup.vue';
// bookmarks
// expand narrow down to and expand only all bookmarks
import _ from 'lodash';
import config from './config';
import Firebase from 'firebase';
import { mapGetters } from 'vuex'

// Our stuff
import { PROLIFIC_WRITERS, CRUELTIDE, YULEPORN, FESTIVUS } from './data/lists';
import hasPrompts from './data/prompts.js';

let firebaseApp;
if (!Firebase.apps.length) {
	firebaseApp = Firebase.initializeApp(config);
} else {
	firebaseApp = Firebase.app();
}

let db = firebaseApp.database();
let fandomsRef = db.ref('/fandoms');
let metaRef = db.ref('/meta');

export default {
	name: 'app',
	components: {
		Bookmarks,
		Caveats,
		EasterEggs,
		Maintenance,
		UserLookup
	},
	firebase: {
		fandoms: {
			source: fandomsRef,
			readyCallback() {
				this.loaded = true;
			}
		},
		meta: {
			source: metaRef
		}
	},
	directives: {
		focus: {
			inserted(el) {
				el.focus();
			}
		}
	},
	created() {
		document.addEventListener('keydown', this.easterEggs);
		document.addEventListener('keydown', this.unlockModTools);
		document.addEventListener('keyup', this.unlockModTools);
		window.addEventListener('scroll', this.lazyload);

	},
	beforeDestroy() {
		document.removeEventListener('keydown', this.easterEggs);
		document.removeEventListener('keydown', this.unlockModTools);
		document.removeEventListener('keyup', this.unlockModTools);
		window.removeEventListener('scroll', this.lazyload);

	},
	data() {
		let bookmarks = [];
		const bookmarksJson = this.$localStorage.get('bookmarks');
		if (bookmarksJson) {
			bookmarks = JSON.parse(bookmarksJson);
		}

		let lettermarks = [];
		const lettermarksJson = this.$localStorage.get('lettermarks');
		if (lettermarksJson) {
			lettermarks = JSON.parse(lettermarksJson);
		}

		let promptmarks = []
		const promptmarksJson = this.$localStorage.get('promptmarks');
		if (promptmarksJson) {
			this.$store.commit('setPromptmarks',JSON.parse(promptmarksJson));
		}

		return {
			maintenance: false,
			loaded: false,
			filterTerm: '',
			categoryTerm: '',
			expand: false,
			bookmarks,
			lettermarks,
			onlyLetters: false,
			onlyPHs: false,
			hideCharacters: false,
			hideCategory: true,
			show: false,
			selectedFandom: null,
			username: '',
			url: '',
			pinchhitter: false,
			destyle: false,
			showEasterEggs: false,
			showEggHelp: false,
			PROLIFIC_WRITERS,
			yuleporn: YULEPORN,
			crueltide: CRUELTIDE,
			festivus: FESTIVUS,
			prompts: {},
			hasPrompts,
			down: {},
			unlock: true,
			mods: false,
			largeBookmarks: false,
			scrollPosition: 100,
			loadAll: false,
			user: null,
			userPrompts: null,
			onlyPrompts: true,
			onlyBookmarks: false
		};
	},
	computed: {
		filtered() {

			if (!this.onlyLetters && 
				!this.onlyPrompts &&
				!this.filterTerm.length && 
				!this.onlyBookmarks &&
				!this.onlyPHs &&
				!this.categoryTerm.length) {
				return _.sortBy(this.fandoms, ['category', removeArticlesCompare]);
			}

			let arr = this.fandoms;

			if (this.onlyPrompts) {
				arr = _.filter(arr, o => {
					return this.hasPrompts[o['.key']];
				});
			}

			if (this.onlyLetters) {
				arr = _.filter(arr, o => {
					return o.letters !== undefined;
				});
			}

			if (this.onlyBookmarks) {
				const bookmarkedFandoms = [];
				_.each(this.bookmarks, b => {
					bookmarkedFandoms.push(b['.key']);
				});

				arr = _.filter(arr, o => {
					return _.includes(bookmarkedFandoms, o['.key']);
				});
			}

			if (this.onlyPHs) {
				arr = _.filter(arr, o => {
					return _.filter(o.letters, l => {
						return l.isPinchhitter; 
					}).length;
				})
			}

			if (this.categoryTerm.length) {
				arr = _.filter(arr, o => {
					return o.category === this.categoryTerm;
				});
			}

			if (this.filterTerm.length) {
				arr = _.filter(arr, o => {
					return o.name.toLowerCase().indexOf(this.filterTerm.toLowerCase()) > -1;
				});
			}

			return _.sortBy(arr, ['category', removeArticlesCompare]);
		},
		bookmarksData() {
			const data = [];
			_.each(this.bookmarks, o => {
				const fandom = _.find(this.fandoms, fandom => {
					return fandom['.key'] === o['.key'];
				});

				if (fandom) {
					data.push(fandom);
				}

			});

			return data;
		},
		categories() {
			return _.uniq(_.map(this.fandoms, o => { return o.category; }));
		},
		lastUpdated() {

			const data = _.find(this.meta, { '.key': 'lastUpdated'});

			if (!data) {
				return '';
			}

			return new Date(data['.value']).toString();
		},
		...mapGetters([
			'promptmarks'
			// 'prompts'
		])
	},
	methods: {
		lazyload() {
			const y = window.scrollY;
			const totalHeight = document.body.scrollHeight;

			if (totalHeight - y - (document.documentElement.scrollTop || document.body.scrollTop) < 50) {
				if (this.scrollPosition < this.fandoms.length) {
					this.scrollPosition += 100;
				}
			}
		},
		collapse(e) {
			e.target.innerText = e.target.innerText === 'Expand' 
				? 'Collapse'
				: 'Expand'; 
			e.target.nextElementSibling.classList.toggle('hide');
		},
		getUserPrompts(username) {
			this.$store.commit('setUser', 'Loading');

			db.ref('/users/' + username).once('value').then(snapshot => {
				let results = snapshot.val();

				this.$store.commit('setUser', username);
				this.user = username;
				
				if (results && results.length) {
					this.$store.commit('setUserPrompts', results);
				} else {
					this.$store.commit('setUserPrompts', []);
				}
			});
		},
		getPrompts(fandomKey) {
			this.prompts[fandomKey] = 'loading';
			this.prompts = { ...this.prompts };

			db.ref('/prompts/' + fandomKey).once('value').then(snapshot => {
				let results = snapshot.val();

				if (results && results.length) {
					results = _.sortBy(results, o => o.username.toLowerCase());
					this.prompts[fandomKey] = results;
				} else {
					this.prompts[fandomKey] = [];
				}

				this.prompts = { ...this.prompts };
			});
		},
		
		unlockModTools(e) {
			if (e.type === 'keydown') {
				this.down[e.keyCode] = true;

				// shift + 1 + 2
				if (this.down[16] && this.down[49] && this.down[50]) {
					this.mods = !this.mods;
				}
			} 

			if (e.type === 'keyup') {
				this.down[e.keyCode] = false;
			}

		},
		// show easter eggs on F1
		easterEggs(e) {

			if (e.keyCode !== 112) {
				return;
			}

			this.showEasterEggs = !this.showEasterEggs;
			this.showEggHelp = true;
		},
		// EE: * marker for prolific writers
		isProlific(name) {
			if (!this.showEasterEggs) {
				return false;
			}

			if (_.includes(this.PROLIFIC_WRITERS, name.trim().toLowerCase())) {
				return true;
			}

			return false;
		},
		// EE: superscripts for challenge uses
		challenges(name) {
			if (!this.showEasterEggs) {
				return false;
			}

			const data = [];

			_.includes(this.crueltide, name.trim().toLowerCase()) ? 
				data.push('C') : null;
			_.includes(this.yuleporn, name.trim().toLowerCase()) ? 
				data.push('P') : null;
			_.includes(this.festivus, name.trim().toLowerCase()) ? 
				data.push('F') : null;

			return data;
		},
		// add letter modal
		showModal(fandom) {
			this.show = true;
			this.selectedFandom = fandom;
		},
		cancel() {
			this.show = false;
			this.selectedFandom = null;
			this.username = null;
			this.url = null;
			this.pinchhitter = false;
		},
		addLetter(key) {
			if (!this.selectedFandom || !this.username || !this.url) {
				return;
			}

			this.$firebaseRefs.fandoms.child(this.selectedFandom['.key']).child('letters').push({
				username: this.username,
				url: this.url,
				isPinchhitter: this.pinchhitter
			});

			this.$firebaseRefs.meta.child('lastUpdated').set(new Date().toJSON());

			this.cancel();
		},
		// bookmark checks
		hasBookmark(fandom) {
			return _.find(this.bookmarks, o => { return o['.key'] === fandom['.key']; });
		},
		hasLettermark(letter, fandom) {
			return _.find(this.lettermarks, o => { 
				return o.username === letter.username && o.key === fandom['.key']; 
			});
		},
		hasPromptmark(prompt) {
			return _.find(this.promptmarks, o => { 
				return o.username === prompt.username && o.fandom === prompt.fandom; 
			});
		},
		// remove bookmarks
		remove(fandom) {
			this.bookmarks = _.filter(this.bookmarks, o => {
				return o['.key'] !== fandom['.key'];
			});
			this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
		},
		removeLettermark(letter) {
			this.lettermarks = _.filter(this.lettermarks, o => {
				return o.username !== letter.username && o.key !== letter.key;
			});
			this.$localStorage.set('lettermarks', JSON.stringify(this.lettermarks));
		},
		removePromptmark(prompt) {
			this.promptmarks = _.filter(this.promptmarks, o => {
				return (o.username !== prompt.username && o.fandom === prompt.fandom) 
				|| o.fandom !== prompt.fandom;
			});
			this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
		},
		// add bookmarks
		add(fandom) {
			if (_.includes(this.bookmarks, fandom)) {
				return false;
			}
			this.bookmarks.push(fandom);
			this.$localStorage.set('bookmarks', JSON.stringify(this.bookmarks));
		},
		addLettermark(letter, fandom) {
			if (_.find(this.lettermarks, o => {
				return o.username === letter.username && o.key === fandom['.key'];  
			})) {
				return false;
			}

			this.lettermarks.push({ 
				...letter, 
				name: fandom.name, 
				key: fandom['.key'] 
			});

			this.$localStorage.set('lettermarks', JSON.stringify(this.lettermarks));
		},
		addPromptmark(prompt) {
			if (_.find(this.promptmarks, o => {
				return o.username === prompt.username && o.fandom === prompt.fandom;  
			})) {
				return false;
			}

			this.promptmarks.push({ 
				...prompt 
			});

			this.$localStorage.set('promptmarks', JSON.stringify(this.promptmarks));
		},
		// utilities
		scrollToTop() {
			document.body.scrollTop = 0; 
			document.documentElement.scrollTop = 0; 
		},
		formatUrl(url) {
			if (!this.destyle || !url) {
				return url;
			}

			url = url.trim();

			const isDW = url.indexOf('dreamwidth.org') > -1;
			const isLJ = url.indexOf('livejournal.com') > -1;
			const isTumblr = url.indexOf('tumblr.com') > -1;
			const isDocs = url.indexOf('docs.google') > -1;

			if (isDW) {

				if (url.indexOf('?style=') === -1 && url.indexOf('&style=') === -1) {
					if (url.indexOf('?') > -1) {
						return `${url}&style=site`;
					}

					return `${url}?style=site`;

				}
			}

			if (isLJ) {

				if (url.indexOf('?style=') === -1 && url.indexOf('&style=') === -1 && url.indexOf('format=') === -1) {
					if (url.indexOf('?') > -1) {
						return `${url}&format=light`;
					}

					return `${url}?format=light`;

				}
			}

			if (isTumblr) {

				if (url.indexOf('/mobile') === -1) {			
					return `${url}/mobile`;
				}
			}

			if (isDocs) {
				if (url.indexOf('/mobilebasic') === -1) {
					return `${url.replace(/\/edit.*$/, '')}/mobilebasic`;
				}
			}

			return url;
		}
	}
}

// Remove english articles from fandom names
function removeArticlesCompare(o) {
	const regex = /^(the\s|a\s|an\s)/i;
	if (!o.name) {
		return o;  
	}
	return o.name.toLowerCase().replace(regex, '');
}
</script>

<style lang="scss">
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: left;
	color: #2c3e50;

	a,
	.cancel {
		cursor: pointer;
		color: #e74c3c;
	}

	.cancel {
		border: 0;
		background-color: transparent;
		position: absolute;
		bottom: 10px;
		right: 10px;
		font-size: 14px;
	}

	.options {
		overflow: hidden;

		.option {
			float: left;
			width: 250px;
		}

		.clear {
			max-width: 750px;
			color: rgba(0,0,0, 0.5);
			line-height: 14px;
			margin-bottom: 3px;
		}
	}

	.clear {
		clear: both;
	}

	.scroll-top {
		position: fixed; 
		z-index: 1;
		right: 10px;
		bottom: 5px;
		background-color: #fff;
		color: #e74c3c;
		cursor: pointer;
		padding: 5px;
		font-weight: bold;
		border: 1px solid #cfcfcf;
	}

	.meta {
		font-size: smaller;
	}

	.modal {
			position: fixed; /* Stay in place */
			z-index: 1; /* Sit on top */
			left: 0;
			top: 0;
			width: 100%; /* Full width */
			height: 100%; /* Full height */
			overflow: auto; /* Enable scroll if needed */
			background-color: rgb(0,0,0); /* Fallback color */
			background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
	}

	/* Modal Content/Box */
	.modal-content {
			background-color: #fefefe;
			margin: 25% auto; /* 15% from the top and centered */
			padding: 20px;
			padding-bottom: 30px;
			border: 1px solid #888;
			width: 500px; /* Could be more or less, depending on screen size */
			position: relative;

			.input {
				margin-bottom: 5px;
			}
	}

	input {
		line-height: 20px;
		padding: 0 3px;
	}

	.user-lookup {
		position: fixed;
		top: 40px;
		left: 0;
		background: #fff;
		width: 40%;
		border: 1px solid #cfcfcf;
		max-height: 600px;
		overflow-y: auto;
		padding: 10px;

		.heading {
			margin-bottom: 10px;
		}

		&.collapsed {
			display: none;
		}

		.close-lookup {
			position: absolute;
			top: 10px;
			right: 15px;
		}
	}

	.bookmarks {
		position: fixed; 
		top: 40px;
		padding: 10px;
		right: 0;
		background: #fff;
		width: 60%;
		border: 1px solid #cfcfcf;
		max-height: 600px;
		overflow-y: auto;

		h4 {
			margin: 0;
		}

		&.large {
			width: 95%;
		}

		&.collapsed {
			width: 100px;
		}
	}

	.warn {
		margin-bottom: 10px;
	}

	.input {
		label {
			display: inline-block;
			width: 90px;
		}
	}

	.add {
		margin-top: 15px;
	}

	.add-letter {
		padding: 7px 20px;
		font-weight: bold;
		font-size: 14px;
	}

	.bookmark, button, .bookmark-letter, .bookmark-prompt {
		cursor: pointer;
		color: #fff;
		background-color: #34495e;
		border: 0;
		border-radius: 2px;
	}

	.bookmark-letter,
	.bookmark-prompt,
	.remove-prompt {
		color: #d63939;
		font-size: 14px;
		background-color: transparent;
		padding: 0;

		&:hover{
			color: #e4a6a6;
		}
	}

	table {
		border-collapse: collapse;
		border-spacing: 0;
		width: 100%;
		table-layout: fixed;

		&.prompts {
			font-size: smaller;

			th.username,
			th.characters {
				width: 20%;				
			}

			td {

				&.prompt {
					word-break: break-word;
				}
			}
		}

		th.fave {
			width: 20px;
		}

		th.fandom {
			width: 20%;
		}

		th.category,
		th.characters,
		th.letters {
			width: 15%;
		}
	}

	thead {
		font-weight: bold;

		tr > th {
			border-bottom: 1px solid #cfcfcf;
		}

	}

	tr.odd {
		background-color: rgba(0, 0, 0, 0.1);
	}

	td {
		word-break: break-word;
		padding: 10px 5px;
		vertical-align: top;

		.characters {
			max-width: 300px;
		}
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;

		li {
			margin-bottom: 3px;
		}
	}

	.caveats {
		text-decoration: italic;
		margin-bottom: 10px;
	}

	/* https://projects.lukehaas.me/css-loaders/ */
	.loader,
	.loader:before,
	.loader:after {
		border-radius: 50%;
		width: 2.5em;
		height: 2.5em;
		-webkit-animation-fill-mode: both;
		animation-fill-mode: both;
		-webkit-animation: load7 1.8s infinite ease-in-out;
		animation: load7 1.8s infinite ease-in-out;
	}
	.loader {
		color: #c90d14;
		font-size: 10px;
		margin: 80px auto;
		position: relative;
		text-indent: -9999em;
		-webkit-transform: translateZ(0);
		-ms-transform: translateZ(0);
		transform: translateZ(0);
		-webkit-animation-delay: -0.16s;
		animation-delay: -0.16s;
	}
	.loader:before,
	.loader:after {
		content: '';
		position: absolute;
		top: 0;
	}
	.loader:before {
		left: -3.5em;
		-webkit-animation-delay: -0.32s;
		animation-delay: -0.32s;
	}
	.loader:after {
		left: 3.5em;
	}
	@-webkit-keyframes load7 {
		0%,
		80%,
		100% {
			box-shadow: 0 2.5em 0 -1.3em;
		}
		40% {
			box-shadow: 0 2.5em 0 0;
		}
	}
	@keyframes load7 {
		0%,
		80%,
		100% {
			box-shadow: 0 2.5em 0 -1.3em;
		}
		40% {
			box-shadow: 0 2.5em 0 0;
		}
	}

	.hide {
		display: none;
		font-size: 10px;
		color: rgba(0,0,0,0.35);
	}

}
</style>
