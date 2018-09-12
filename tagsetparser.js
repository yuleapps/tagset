// ol.index.group is the whole table
//     li.media.listbox.group = category section
//         h3.expander_parent heading = category name (222)
//         ol.tags.index.group = category tags section
//             li.fandom = one fandom
//                 h3.heading = fandom name (222)
//                 ol.tags = fandom characters
//                     li = char

var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js';
document.getElementsByTagName('head')[0].appendChild(script);
var el = document.createElement('script');
el.src = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.min.js';
el.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(el);

var categories = [];
var fandomsOnly = [];
var charactersOnly = [];
var fandoms = [];

var $categories = $('.media.group');

$.each($categories, function(i, category) {
	var categoryName = parseTitle(category);
	categories.push(categoryName);

	var $fandoms = $(category).find('.fandom.listbox.group');

	$.each($fandoms, function(i, fandom) {
		var fandomName = parseTitle(fandom);
		// check fandoms for dupes
		var exists = _.find(fandomsOnly, function(f) {
			return f.name === fandomName;
		});
		var extantCategories = [];

		if (exists !== undefined) {
			exists.category.push(categoryName);
			extantCategories = exists.category;
			return;
		}

		fandomsOnly.push({
			name: fandomName,
			category: [categoryName]
		});

		var $characters = $(fandom).find('ol.tags li');
		var charArray = [];
		$.each($characters, function(i, char) {
			var charName = $(char)
				.text()
				.trim();
			charArray.push(charName);
		});
		charactersOnly.push(charArray);

		fandoms.push({
			name: fandomName,
			category: exists ? extantCategories : [categoryName],
			characters: charArray
		});
	});
});

console.log(fandoms.length);
console.log({ fandoms: fandoms, charactersOnly: charactersOnly, fandomsOnly: fandomsOnly });

function parseTitle(node) {
	var $heading = $($(node).find('h3.heading')[0]).clone();
	$heading.find('span').remove();
	var name = $heading.text().trim();
	name = name.substring(0, name.lastIndexOf('(')).trim();

	return name;
}
