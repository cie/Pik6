// This file triggers **prining** if there is reason to assume that's what the user wants.

/*jshint browser:true, mootools:true */

(function(){


// The following conditions indicate printing:
//
//  * The window must not be framed
//  * The window's hash must be `#print`
var framed     = (window.top !== window.self),
    print_hash = window.location.href.substr(-6);
if(!framed && print_hash === '#print'){

// Add footnotes for links for each slide
window.addEvent('domready', function(){
	var slides = $$('.pik-slide'),
	    num_foonotes = 0;
	slides.each(function(slide){
		var links = slide.getElements('a[href]');
		if(links.length > 0){
			var footnotes    = new Element('ul', { 'class': 'pik-print-footnotes' });
			links.each(function(link){

				// Increment footnote number and add it to original link
				num_foonotes++;
				var footnote_number = new Element('sup', {
					'text': ' [' + num_foonotes + '] '
				}).inject(link, 'after');

				// Create footnote item
				var new_footnote = new Element('li', {
					'text': '[' + num_foonotes + '] '
				});

				// Create footnote link
				var new_link = new Element('a', {
					'href': link.get('href'),
					'text': link.get('href')
				});

				// Add footnote to document
				new_link.inject(new_footnote);
				new_footnote.inject(footnotes);

			});
			footnotes.inject(slide);
		}
	});
});

// Automatic printing
window.addEvent('load', function(){
	setTimeout(function(){
		window.print();
	}, 1000);
});

}

})();