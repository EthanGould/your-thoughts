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
											'<div class="opinion__chart">',
												'<span id="no" class="opinion__chart-bar"></span>',
												'<span id="yes" class="opinion__chart-bar"></span>',
											'</div>',
											'Yes Count: <span class="opinion-yes-count">' + opinion.yes + '</span>',
											'<br>',
											'No Count: <span class="opinion-no-count">' + opinion.no + '</span>',
											'<br>',
											'<br>',
											'Yes Percent: <span class="opinion-yes-percent">' + percentYes + '%</span>',
											'<br>',
											'No Percent: <span class="opinion-no-percent">' + percentNo + '%</span>',
											'<p>' + opinion.question + '</p>',
											'<input class="opinion__input" type="button" value="yes"/>',
											'<input class="opinion__input" type="button" value="no"/>',
											'<input class="opinion-next" type="button" value="next"/>',
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
	module.updateChart = function(percentYes, percentNo) {
		$('.opinion__chart').show();
		$('.opinion--display').find('#yes.opinion__chart-bar').css('height', percentYes);
		$('.opinion--display').find('#no.opinion__chart-bar').css('height', percentNo);
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
		$(this).parents('.opinion').find('.opinion-yes-percent').text(Math.round(yes/total*100) + '%');
		$(this).parents('.opinion').find('.opinion-no-percent').text(Math.round(no/total*100) + '%');

		// Update chart
		module.updateChart(Math.round(yes/total*100), Math.round(no/total*100));
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
		module.$opinionDeck = $('.opinion-deck');
		module.$input = '.opinion__input';
		module.loadOpinions();
		module.eventHandlers();
		module.slideDelay = 250;
	};

	module.init();
});
