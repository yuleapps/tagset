<template>
	<div id="app">
		<h1>Yuletide 2017 Tagset</h1>

		<div v-if="maintenance">
			Currently undergoing maintenance!
		</div>

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

			<div class="modal" v-if="showEggHelp">
				<div class="modal-content">
					<p>You've {{ showEasterEggs ? 'enabled' : 'disabled' }} easter eggs! Press F1 again to toggle.</p> 
					

					<strong>Stats:</strong>
					<p>
						* next to a username indicates an author has been crowdsourced as prolific (3+ fics in the main collection) over the years 2014, 2015, 2016. There may be inaccuracies!
					</p>
					<p>
						Superscripts indicate that the user has signed up for an optional challenge. <strong>It may not apply to the fandom you're looking at</strong>. C = Crueltide, P = Yuleporn, F = Festivus. (N.B. Unlike letters, these challenge lists are updated only once a day or so.)
					</p>
					<p>
						Users with letters: {{ totalLetters }}
					</p>
					<p>
						Who shares the most fandoms with <input type="text" v-model="findPal" placeholder="Enter username">?
						<button @click="getFandomPal()">Go!</button>
						<p v-if="pal && pal.length">
							<ul>
								<li v-for="p in pal">
									<a :href="p.url" target="_blank">{{p.username}} ({{p.count}})</a>
								</li>
							</ul>
						</p>
						<p v-else-if="pal && !pal.length">): No results!</p>
					</p>
					<button class="cancel" @click="showEggHelp = false">(Got it)</button>
				</div>
			</div>

			<div v-if="!loaded"><div class="loader">Loading...</div></div>

			<template v-else>
				<div :class="['bookmarks', { collapsed: !expand, large: largeBookmarks }]">
					<h4>Bookmarks (L: {{ lettermarks.length }}, F: {{ bookmarks.length }}<template v-if="unlock">, P: {{ promptmarks.length }}</template>)
						<a @click="expand = !expand">
							{{ expand ? '(Collapse)' : '(Expand)' }}
						</a>
					</h4>
					<div v-show="expand">
						<div class="option">
							<input type="checkbox" id="expand-bookmarks" v-model="largeBookmarks">
							<label for="expand-bookmarks">Make this wider</label>  
						</div>

						<div>
							<strong>Letters:</strong>
							<ul>
								<li v-for="letter in lettermarks">
									<template v-if="letter.isPinchhitter">(</template>
									<a :href="formatUrl(letter.url)" target="_blank">{{ letter.username }}</a> ({{ letter.name }}) 
									<template v-if="letter.isPinchhitter">)</template>

									(<a @click="removeLettermark(letter)">x</a>)
								</li>
							</ul>
						</div>

						<hr />

						<table>
							<thead>
								<tr>
									<th class="fandom">Fandom</th>
									<th class="category"  v-if="!hideCategory">Category</th>
									<th class="characters" v-if="!hideCharacters">Characters</th>
									<th class="letters">Letters</th>
									<th class="prompts" v-if="unlock">Prompts</th>
								</tr>
							</thead>
							<tr v-for="(fandom, index) in bookmarksTable" :class="{odd: index % 2 !== 0 }">
								<td class="fandom">
									{{ fandom.name }}
									<a @click="remove(fandom)">(Remove)</a>
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
										<template v-if="letter.isPinchhitter">)</template>

											<button class="bookmark-letter" v-if="!hasLettermark(letter, fandom)" @click="addLettermark(letter, fandom)">&hearts;</button>
										</li>
									</ul>
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
									<span v-if="!hasPrompts[fandom['.key']]">No prompts ):</span>
								</td>
							</tr>
						</table>

						<hr />

						<div v-if="unlock && promptmarks.length">
							<strong>Prompts:</strong>

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
										<tr v-for="prompt in promptmarks">
											<td>
												<button 
													class="remove-prompt" 
													@click="removePromptmark(prompt)">x
												</button>
											</td>
											<td>
												{{ prompt.username }}
												<span v-if="isProlific(prompt.username)">*</span>
												<sup v-if="showEasterEggs">{{ challenges(prompt.username).join(' ') }}</sup>
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
						</div>
					</div>  
				</div>

				<div class="scroll-top" @click="scrollToTop">(^)</div>

				<div class="filters">				
					<label for="fandom-filter">Filter By Fandom:</label>
					<input id="fandom-filter" type="text" v-model='filterTerm'>

					<label for="category-filter">Filter By Category:</label>

					<select id="category-filter" v-model="categoryTerm">
						<option value=''>All</option>
						<option v-for="category in categories">{{ category }}</option> 
					</select>
				</div>

				<div class="options">
					<div class="option" v-if="unlock">
						<input type="checkbox" id="prompts-fandoms" v-model="onlyPrompts">
						<label for="prompts-fandoms">Only fandoms with prompts</label>  
					</div>
					<div class="option">
						<input type="checkbox" id="bookmarked-fandoms" v-model="onlyBookmarks">
						<label for="bookmarked-fandoms">Only bookmarked fandoms</label>  
					</div>
					<div class="option">
						<input type="checkbox" id="letters-fandoms" v-model="onlyLetters">
						<label for="letters-fandoms">Only fandoms with letters<span v-if="unlock">*</span></label>  
					</div>
					<div class="option">
						<input type="checkbox" id="ph" v-model="onlyPHs">
						<label for="ph">Only fandoms with pinch hitters (brackets around username)</label>  
					</div>
					<div class="option">
						<input type="checkbox" id="journal-style" v-model="destyle">
						<label for="journal-style">Gimme mobile/readable URLs<span v-if="unlock">*</span></label> 
					</div>
					<div class="clear" v-if="unlock">
						<small>* these apply only to the letters column, not to prompts</small>
					</div>
				</div>

				<div class="options">
					<div class="option">
						<input type="checkbox" id="load-all" v-model="loadAll">
						<label for="load-all">Load everything!**</label> 
					</div>

					<div class="option">
						<input type="checkbox" id="hide-chars" v-model="hideCharacters">
						<label for="hide-chars">Hide characters</label> 
					</div>
					<div class="option">
						<input type="checkbox" id="hide-cat" v-model="hideCategory">
						<label for="hide-chars">Hide category</label> 
					</div>
					<div class="clear">
						<small>** <strong :style="{ color: 'red'}">fandoms are now loaded in increments of 100 as you scroll.</strong> <BR/>If you want to load everything (the old app experience), check this box and give your browser some time.</small>
					</div>
				</div>

				<div class="meta">
					Feedback/problems/donate: <a href="https://yuletide.dreamwidth.org/97965.html" target="_blank">here</a>
				</div>

				<div :class="['user-lookup', { collapsed: !user }]">
					<div class="heading"><strong>{{ user }}'s</strong> prompts</div>
					<a @click="user = null; userPrompts = null" class="close-lookup">(x)</a>
					<table class="prompts">
						<thead>
							<tr>
								<th class="fave">&hearts;</th>
								<th class="username">Fandom</th>
								<th class="characters">Characters</th>
								<th class="prompts">Prompts</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="prompt in userPrompts">
								<td>
									<button 
										class="bookmark-prompt" 
										v-if="!hasPromptmark(prompt)"
										@click="addPromptmark(prompt)">&hearts;
									</button>
								</td>
								<td>
									{{ prompt.fandom }}
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
					
				</div>

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

			<div class="caveats">
				<small>Caveats: human error may result in missing data; always go to yuletide-admin for the source of truth. <strong>The app now loads 100 fandoms at a time as you scroll for speed purposes.</strong> If you want to see everything at once (e.g. to CTRL-F search), check the Load All option.</small>
			</div>
		</template>

	</div>
</template>

<script>
// bookmarks
// expand narrow down to and expand only all bookmarks
import _ from 'lodash';
import config from './config';
import Firebase from 'firebase';
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
			promptmarks = JSON.parse(promptmarksJson);
		}

		return {
			maintenance: false,
			loaded: false,
			filterTerm: '',
			categoryTerm: '',
			expand: false,
			bookmarks,
			lettermarks,
			promptmarks,
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
			findPal: '',
			pal: null,
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
		totalLetters() {

			if (!this.fandoms) {
				return 'No data - database error!';
			}

			const users = [];

			_.each(this.fandoms, fandom => {
				_.each(fandom.letters, l => {
					users.push(l.username.toLowerCase());
				});
			});

			return _.uniq(users).length;

		},
		bookmarksTable() {
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
		}
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
			this.user = 'Loading';

			db.ref('/users/' + username).once('value').then(snapshot => {
				let results = snapshot.val();

				this.user = username;
				if (results && results.length) {
					this.userPrompts = results;
				} else {
					this.userPrompts = [];
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
		// i r good at names
		getFandomPal() {
			const fandoms = _.filter(this.fandoms, fandom => {
				return _.find(fandom.letters, { username: this.findPal });
			});

			const users = [];

			_.each(fandoms, fandom => {
				_.each(fandom.letters, letter => {
					const otherUser = letter.username.toLowerCase();
					if (otherUser !== this.findPal.toLowerCase()) {
						users.push(letter);
					}
				})
			});

			this.pal = [];

			if (users.length) {
				const counts = _.chain(users).countBy(o => o.username).value();

				_.each(counts, (n, key) => {
					this.pal.push({... _.find(users, user => user.username.toLowerCase() === key.toLowerCase()),
						count: n }); 
				});
			}
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
