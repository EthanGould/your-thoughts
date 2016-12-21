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
			extraClass = 'opinion--display';
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
		$('.opinion--display')
			.find('.opinion__percent-container')
			.show();

		// Update 'yes' bar height and text.
		$('.opinion--display')
			.find('.opinion__yes-percent')
			.css('width', percentYes + '%')
			.text(percentYes + '%');

		// Update 'no' bar height and text.
		$('.opinion--display')
			.find('.opinion__no-percent')
			.css('width', percentNo + '%')
			.text(percentNo + '%');
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

		// Update chart
		module.updateChart(this, data, Math.round(yes/total*100), Math.round(no/total*100));
	};



	/**
	 * Cycles through opinions, displaying an ending message when done.
	 */
	module.showNextOpinion = function() {
		var curIndex = $('.opinion--display').data('index');
		$(this).parents('.opinion--display').removeClass('opinion--display');
		setTimeout(function() {
			$('.opinion[data-index="' + (curIndex + 1) + '"]').addClass('opinion--display');
		}, module.slideDelay);

		if (2 === curIndex) {
			setTimeout(function() {
				$('.opinion-done').show();
			}, module.slideDelay);
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
		module.slideDelay = 250;
	};

	module.init();
});
