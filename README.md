![Platform](https://img.shields.io/badge/platform-JavaScript-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)
# threadingText
threadingText is a JavaScript jQuery plugin to enable [thread text](http://blogs.adobe.com/indesignpost/2011/04/quick-tip-master-text-threading-in-adobe-indesign/) in HTML.
With a responsive web design and dynamic content using thread text is hard to achieve; here is where threadingText comes into play.

# Contents
- [What is threadingText?](#what-is-threadingtext)
- [Usage Example](#usage-example)
- [Donation](#donation)
- [TODO](#todo)
- [See also](#see-also)
  - [Multi-Column-Layout](#multi-column-layout)
  - [CSS Regions](#css-regions)

## What is threadingText?
The jQuery plugin threadingText provides a nice way of dynamically associate and fill HTML in pre-defined text containers and cut overlapping text with a specified ending symbol (default is " ...") or create new text containers according to a specified prototype text container if text would exceed provided space.

The implementation uses a binary text length search to divide the HTML among the text containers provided. While doing so it tries its best to repair any HTML tags beeing broken while threading the HTML in the text containers.

Additionally many code hooks are provided, where you can interfere in the layouting process and adjust the results in any way.
* startLayout
  * Global layout start.
* endLayout
  * Global layout finished.
* startLayoutTextElement
  * Start layout current text element.
* endLayoutTextElement
  * End layout current text element.
* createCloneTextElement
  * Text element cloned.

## Usage Example
    <script>
            var startTime;

            function startLayouting(textElements, text) {
                startTime = new Date().getTime();
            }

            function finishedLayouting(textElements, text) {
                console.log("Finished layouting in " + (new Date().getTime() - startTime)
                    + "ms.");
            }

            function doLayout() {
                // select all predefined text container
                $(".textContainers").threadingText( {
                    // listener function when starting
                    startLayout : startLayouting,
                    // listener function when finished
                    endLayout : finishedLayouting
                });
            }
    </script>

Check example1.html, example2.html and example3.html for further usage examples.

## Donation
If my code proved useful for you, you might want to consider to send a small [donation](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=X2DYTPJDKKR8N) via PayPal.

## TODO
* Separate test code from production code
* Make QUnit tests reliable
* More tests
* Integrate Travis CI for CI (see [Stackoverflow](http://stackoverflow.com/questions/13412211/using-travis-ci-for-client-side-javascript-libraries)).

## See also

### Multi-Column-Layout
There is a [multi column layout](http://www.css3.info/preview/multi-column-layout/) coming up with CSS3.

### CSS Regions
You may want to take a look on CSS regions, but the [browser support](http://caniuse.com/#feat=css-regions) is limited and many browser manufacturers [dropped the feature](http://arstechnica.com/information-technology/2014/01/google-plans-to-dump-adobe-css-tech-to-make-blink-fast-not-rich/) from their roadmap completly. Nevertheless there is a nice [CSS regions polyfill](http://webplatform.adobe.com/css-regions-polyfill/) lib from Adobe.