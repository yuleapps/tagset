<template>
	<div id="app">
		<h2>Raw: 6544</h2>

		<h2>
			Prompts: {{ prompts.length }}
		</h2>
		<h2>Mapped Wrong!1!!</h2>
		<ul>
			<li v-for="i in badMapped">{{ i }}</li>
		</ul>
		<textarea>{{ prompts }}</textarea>
		<table v-if="false">
			<thead>
				<tr>
					<td>Username</td>
					<td>Fandom</td>
					<td>Characters</td>
					<td>Prompt</td>
				</tr>
			</thead>
			<tr v-for="(prompt, index) in prompts" :class="{odd: index % 2 !== 0 }">
				<td class="username">
					{{ prompt.username }} 
				</td>
				<td class="fandom">
					{{ prompt.fandom }}
				</td>
				<td class="characters">
					{{ prompt.characters }}
				</td>
				<td class="prompts">
					<span v-html="prompt.prompt"></span>
					<!-- {{ prompt.prompt }} -->
				</td>
			</tr>
		</table> 
	</div>
</template>

<script>
import _ from 'lodash';
import prompts from './data/prompts.js';
import fandoms from './data/fandoms.js';

export default {
	name: 'app',
	data() {
		return {
			prompts: null,
			badMapped: []
		};
	},
	beforeMount() {
		this.prompts = this.normalise(prompts);
	},
	methods: {
		normalise(prompts) {
			// dedupe
			let array = _.map(prompts, o => {
				let copy = { ...o };
				copy.username = copy.username.trim();
				copy.fandom = copy.fandom.trim();
				if (copy.prompt) {
					copy.prompt = copy.prompt.replace(/\n/, '<br>');
				}
				return copy;
			});

			array = _.groupBy(array, 'fandom');

			// array = _.mapValues(array, o => o.map(o2 => _.omit(o2, 'fandom')));

			array = _.mapKeys(array, (v, k) => {
				let newKey = k;

				let i = _.findIndex(fandoms, o => {

					if (o) {
						return o.name.toLowerCase() === k.toLowerCase();
					}
				});

				if (i > -1) {
					newKey = i;
				} else {
					this.badMapped.push(newKey);
				} 

				return newKey;
			});

			return array;
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

	.bookmark, button, .bookmark-letter {
		cursor: pointer;
		color: #fff;
		background-color: #34495e;
		border: 0;
		border-radius: 2px;
	}

	.bookmark-letter {
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
	}

	thead {
		font-weight: bold;

		tr > td {
			border-bottom: 1px solid #cfcfcf;
		}

	}

	tr.odd {
		background-color: rgba(0, 0, 0, 0.1);
	}

	td {
		padding: 10px 5px;
		vertical-align: top;
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
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

textarea {
	width: 700px;
	height: 500px;
}
</style>
