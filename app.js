$(document).ready(function() {

	var module = {};

	/**
	 * Grab the opinions for this page.
	 */
	module.loadOpinions = function() {
		$.get('https://your-thoughts-312e1.firebaseio.com/opinions.json', function(data) {
			$(data).each(function(index, opinion) {
				module.buildSlider(index, opinion);
			});
		});
	};

	/**
	 * Build markup for each "opinion".
	 * @param  {int} index   The index of the "opinion"
	 * @param  {obj} opinion The opinion object to build markup for.
	 */
	module.buildSlider = function(index, opinion) {
		var total = opinion.yes + opinion.no;
		var markup = [ '<div class="opinion" data-yes="' + opinion.yes + '" data-no="' + opinion.no + '" data-index="' + index + '">',
											'Yes Count: <span class="opinion-yes-count">' + opinion.yes + '</span>',
											'<br>',
											'No Count: <span class="opinion-no-count">' + opinion.no + '</span>',
											'<br>',
											'<br>',
											'Yes Percent: <span class="opinion-yes-percent">' + Math.round(opinion.yes/total*100) + '</span>',
											'<br>',
											'No Percent: <span class="opinion-no-percent">' + Math.round(opinion.no/total*100) + '</span>',
											'<p>' + opinion.question + '</p>',
											'<input class="opinion-input" type="button" value="yes"/>',
											'<input class="opinion-input" type="button" value="no"/>',
										'</div>'
									].join('');

		module.$opinionDeck.append(markup);
	};

	/**
	 * Updated the count and percentages on an opinion.
	 */
	module.updateOpinion = function() {
		var data = $(this).parents('.opinion').data(),
								index = data.index,
								yes = data.yes,
								no = data.no,
								vote = this.value,
								total = yes + no,
								opinionRef = firebase.database().ref('opinions').child(index); // Reference to Firebase DB.

		// Update remote and local vote counts.
		if ('yes' === vote) {
			opinionRef.update({'yes': yes + 1});
			$(this).parents('.opinion').data(vote,	yes + 1);
			$(this).parents('.opinion').find('.opinion-yes-count').text(yes + 1);
		} else if ('no' === vote){
			opinionRef.update({'no': no + 1});
			$(this).parents('.opinion').data(vote,	no + 1);
			$(this).parents('.opinion').find('.opinion-no-count').text(no + 1);
		}

		// Update local percentages
		$(this).parents('.opinion').find('.opinion-yes-percent').text(Math.round(yes/total*100));
		$(this).parents('.opinion').find('.opinion-no-percent').text(Math.round(no/total*100));

	};

	/**
	 * Set some events.
	 */
	module.eventHandlers = function() {
		$('body').on('click', module.$input, module.updateOpinion);
	};

	/**
	 * Initialize the module and cache some selectors.
	 */
	module.init = function() {
		module.$opinionDeck = $('.opinion-deck');
		module.$input = '.opinion-input';
		module.loadOpinions();
		module.eventHandlers();
	};

	module.init();
});
























