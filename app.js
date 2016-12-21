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
	 * 
	 * @param  {int} index   The index of the "opinion".
	 * @param  {obj} opinion The opinion object to build markup for.
	 */
	module.buildSlider = function(index, opinion) {
		var extraClass = '';
		if (0 === index) {
			extraClass = 'opinion--current';
			module.buildDonePage();
		}
		var total = opinion.yes + opinion.no;
		var percentYes = Math.round(opinion.yes/total*100);
		var percentNo = Math.round(opinion.no/total*100);
		var markup = [ '<div class="opinion ' + extraClass + '" data-yes="' + opinion.yes + '" data-no="' + opinion.no + '" data-index="' + index + '">',
											'<div class="opinion__content">',
												'<p class="opinion__text">' + opinion.question + '</p>',
												'<input class="opinion__input" type="button" value="yes"/>',
												'<input class="opinion__input" type="button" value="no"/>',
												'<input class="opinion-next" type="button" value="next &raquo;"/>',
											'</div>',
											'<div class="opinion__percent-container">',
												'<p><div class="opinion__yes-percent">' + percentYes + '%</div></p>',
												'<p><div class="opinion__no-percent">' + percentNo + '%</div></p>',
											'</div>',
										'</div>'
									].join('');

		module.$opinionDeck.append(markup);
	};



	/**
	 * Builds a final slide for opinion deck.
	 */
	module.buildDonePage = function() {
		var markup =	[	'<div class="opinion-done">',
											'<p>Thanks, you are all done!</p>',
										'</div>'
									].join('');

		module.$opinionDeck.append(markup);
	};



	/**
	 * Updated the bar heights of an opinion's bar graph.
	 * 
	 * @param  {int} percentYes The percentage of "yes" votes.
	 * @param  {int} percentNo  The percentage of "no" votes.
	 */
	module.updateChart = function(opinion, data, percentYes, percentNo) {
		// Show bar graph after user has voted.
		$(module.currentClass)
			.find('.opinion__percent-container')
			.show();

		// Update 'yes' bar height and text.
		$(module.currentClass)
			.find('.opinion__yes-percent')
			.animate({'width': percentYes + '%'})
			.text(percentYes + '%');

		// Update 'no' bar height and text.
		$(module.currentClass)
			.find('.opinion__no-percent')
			.animate({'width': percentNo + '%'})
			.text(percentNo + '%');
	};



	/**
	 * Updated the count and percentages on an opinion.
	 */
	module.updateOpinion = function() {
		var data = $(this).parents('.opinion').data(),
								index = data.index,
								yesCount = data.yes,
								noCount = data.no,
								vote = this.value,
								total = yesCount + noCount,
								opinionRef = firebase.database().ref('opinions').child(index); // Reference to Firebase DB.

		// Update remote and local vote counts.
		if ('yes' === vote) {
			// Firebase updates.
			opinionRef.update({'yes': yesCount + 1});

			// Local front end updates.
			$(this).parents('.opinion').data(vote,	yesCount + 1);
			$(this).parents('.opinion').find('.opinion-yes-count').text(yesCount + 1);
			module.updateChart(this, data, Math.round((yesCount + 1)/total*100), Math.round(noCount/total*100));
		
		} else if ('no' === vote){
			// Firebase updates.
			opinionRef.update({'no': noCount + 1});

			// Local front end updates.
			$(this).parents('.opinion').data(vote,	noCount + 1);
			$(this).parents('.opinion').find('.opinion-no-count').text(noCount + 1);
			module.updateChart(this, data, Math.round(yesCount/total*100), Math.round((noCount + 1)/total*100));
		
		}
	};



	/**
	 * Cycles through opinions, displaying an ending message when done.
	 */
	module.showNextOpinion = function() {
		var curIndex = $(module.currentClass).data('index');
		
		// Hide current, show next.
		$(this).parents(module.currentClass).removeClass('opinion--current');
		$('.opinion[data-index="' + (curIndex + 1) + '"]').addClass('opinion--current');

		if (2 === curIndex) {
			$('.opinion-done').show();
		}
	};



	/**
	 * Set some events.
	 */
	module.eventHandlers = function() {
		$('body').on('click', module.$input, module.updateOpinion);
		$('body').on('click', '.opinion-next', module.showNextOpinion);
	};

	/**
	 * Initialize the module and cache some selectors.
	 */
	module.init = function() {
		module.$opinionDeck = $('.opinion__deck');
		module.$input = '.opinion__input';
		module.loadOpinions();
		module.eventHandlers();
		module.slideDelay = 1000;
		module.currentClass = '.opinion--current';
	};

	module.init();
});
